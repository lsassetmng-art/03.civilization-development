import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

const marker = 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1';
const keepMarker = 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1';

let src = fs.readFileSync(corePath, 'utf8');
const original = src;

function countToken(text, token) {
  return (text.match(new RegExp(token, 'g')) || []).length;
}

function skipWs(text, i) {
  while (i < text.length && /\s/.test(text[i])) i++;
  return i;
}

function findMatchingBrace(text, openIdx) {
  if (text[openIdx] !== '{') return -1;

  let depth = 0;
  let quote = null;
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
        continue;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findEnclosingTryCatch(text, idx) {
  const windowStart = Math.max(0, idx - 30000);
  const segment = text.slice(windowStart, idx + 1);
  const candidates = [];
  const re = /\btry\s*\{/g;
  let m;

  while ((m = re.exec(segment)) !== null) {
    candidates.push(windowStart + m.index);
  }

  for (let c = candidates.length - 1; c >= 0; c--) {
    const tryIdx = candidates[c];
    const tryOpen = text.indexOf('{', tryIdx);
    if (tryOpen < 0 || tryOpen > idx + 5000) continue;

    const tryClose = findMatchingBrace(text, tryOpen);
    if (tryClose < 0) continue;
    if (!(tryIdx <= idx && idx <= tryClose)) continue;

    let p = skipWs(text, tryClose + 1);
    if (!text.startsWith('catch', p)) continue;

    const catchOpen = text.indexOf('{', p);
    if (catchOpen < 0) continue;

    const catchClose = findMatchingBrace(text, catchOpen);
    if (catchClose < 0) continue;

    let end = catchClose + 1;
    let q = skipWs(text, end);

    if (text.startsWith('finally', q)) {
      const finallyOpen = text.indexOf('{', q);
      if (finallyOpen >= 0) {
        const finallyClose = findMatchingBrace(text, finallyOpen);
        if (finallyClose >= 0) end = finallyClose + 1;
      }
    }

    return { start: tryIdx, end };
  }

  return null;
}

const beforeMarkerCount = countToken(src, marker);
const beforeKeepCount = countToken(src, keepMarker);
const removals = [];

if (beforeMarkerCount === 0) {
  console.log(JSON.stringify({
    status: 'NOOP_MARKER_NOT_FOUND',
    beforeMarkerCount,
    beforeKeepCount
  }, null, 2));
  process.exit(0);
}

/* standalone R8L comment lines are safe to remove */
src = src.replace(/^[ \t]*\/\/[^\n]*AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1[^\n]*\n?/gm, (m) => {
  removals.push({
    label: 'standalone R8L comment line',
    chars: m.length,
    preview: m.slice(0, 220).replace(/\s+/g, ' ')
  });
  return '';
});

/*
  The real visible diagnostic is inside a local try/catch block.
  Remove the whole try/catch block containing the marker.
  Refuse if the block contains the R8M hydration marker.
*/
let guard = 0;
while (src.includes(marker) && guard < 20) {
  guard++;
  const idx = src.indexOf(marker);
  const span = findEnclosingTryCatch(src, idx);

  if (!span) {
    console.error(JSON.stringify({
      status: 'FAILED_NO_ENCLOSING_TRYCATCH_FOR_R8L_MARKER',
      markerIndex: idx,
      context: src.slice(Math.max(0, idx - 500), Math.min(src.length, idx + 1000))
    }, null, 2));
    process.exit(2);
  }

  const chunk = src.slice(span.start, span.end);

  if (chunk.includes(keepMarker)) {
    console.error(JSON.stringify({
      status: 'FAILED_REFUSE_REMOVING_R8M_HYDRATION_BLOCK',
      markerIndex: idx,
      spanStart: span.start,
      spanEnd: span.end
    }, null, 2));
    process.exit(3);
  }

  if (chunk.length > 25000) {
    console.error(JSON.stringify({
      status: 'FAILED_REFUSE_TOO_LARGE_TRYCATCH_REMOVAL',
      chars: chunk.length,
      markerIndex: idx,
      preview: chunk.slice(0, 1200)
    }, null, 2));
    process.exit(4);
  }

  removals.push({
    label: 'R8L diagnostic try/catch block',
    chars: chunk.length,
    preview: chunk.slice(0, 260).replace(/\s+/g, ' ')
  });

  src = src.slice(0, span.start) + '\n' + src.slice(span.end);
}

const afterMarkerCount = countToken(src, marker);
const afterKeepCount = countToken(src, keepMarker);

if (afterMarkerCount !== 0) {
  console.error(JSON.stringify({
    status: 'FAILED_MARKER_STILL_PRESENT',
    beforeMarkerCount,
    afterMarkerCount,
    beforeKeepCount,
    afterKeepCount,
    removals
  }, null, 2));
  process.exit(5);
}

if (beforeKeepCount > 0 && afterKeepCount !== beforeKeepCount) {
  console.error(JSON.stringify({
    status: 'FAILED_KEEP_MARKER_CHANGED',
    beforeMarkerCount,
    afterMarkerCount,
    beforeKeepCount,
    afterKeepCount,
    removals
  }, null, 2));
  process.exit(6);
}

if (src === original) {
  console.error(JSON.stringify({
    status: 'FAILED_NO_CHANGE',
    beforeMarkerCount,
    afterMarkerCount,
    beforeKeepCount,
    afterKeepCount,
    removals
  }, null, 2));
  process.exit(7);
}

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  beforeMarkerCount,
  afterMarkerCount,
  beforeKeepCount,
  afterKeepCount,
  removalCount: removals.length,
  removals
}, null, 2));
