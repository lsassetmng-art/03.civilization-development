import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

const marker = 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1';
const keepMarker = 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1';

let src = fs.readFileSync(corePath, 'utf8');

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

function findTryCatchAt(text, tryIdx) {
  if (!text.startsWith('try', tryIdx)) return null;

  const tryOpen = text.indexOf('{', tryIdx);
  if (tryOpen < 0) return null;

  const tryClose = findMatchingBrace(text, tryOpen);
  if (tryClose < 0) return null;

  let p = skipWs(text, tryClose + 1);
  if (!text.startsWith('catch', p)) return null;

  const catchOpen = text.indexOf('{', p);
  if (catchOpen < 0) return null;

  const catchClose = findMatchingBrace(text, catchOpen);
  if (catchClose < 0) return null;

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

function findStatementEnd(text, fromIdx) {
  let i = fromIdx;
  while (i < text.length && /\s/.test(text[i])) i++;
  if (text[i] === ';') return i + 1;
  return fromIdx;
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

/* R8L marker comment line only */
src = src.replace(/^[ \t]*\/\/[^\n]*AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1[^\n]*\n?/gm, (m) => {
  removals.push({
    label: 'R8L marker comment line',
    chars: m.length,
    preview: m.slice(0, 220).replace(/\s+/g, ' ')
  });
  return '';
});

/*
  R8L diagnostic object:
    var snapshot = {
      marker: "AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1",
      ...
    };
  Remove the whole snapshot object and the immediate following try/catch
  that renders/logs the snapshot.
*/
let guard = 0;
while (src.includes(marker) && guard < 10) {
  guard += 1;

  const idx = src.indexOf(marker);

  const declMatches = [];
  const declRe = /\b(?:var|let|const)\s+snapshot\s*=\s*\{/g;
  let m;
  while ((m = declRe.exec(src.slice(Math.max(0, idx - 15000), idx + 1))) !== null) {
    declMatches.push(Math.max(0, idx - 15000) + m.index);
  }

  if (declMatches.length === 0) {
    console.error(JSON.stringify({
      status: 'FAILED_SNAPSHOT_DECL_NOT_FOUND',
      markerIndex: idx,
      context: src.slice(Math.max(0, idx - 900), Math.min(src.length, idx + 1400))
    }, null, 2));
    process.exit(2);
  }

  const snapshotStart = declMatches[declMatches.length - 1];
  const openBrace = src.indexOf('{', snapshotStart);
  const closeBrace = findMatchingBrace(src, openBrace);

  if (openBrace < 0 || closeBrace < 0 || closeBrace < idx) {
    console.error(JSON.stringify({
      status: 'FAILED_SNAPSHOT_OBJECT_BRACE_NOT_FOUND',
      markerIndex: idx,
      snapshotStart,
      openBrace,
      closeBrace
    }, null, 2));
    process.exit(3);
  }

  let removeStart = snapshotStart;
  let removeEnd = findStatementEnd(src, closeBrace + 1);

  let p = skipWs(src, removeEnd);

  if (src.startsWith('try', p)) {
    const tc = findTryCatchAt(src, p);
    if (tc) {
      const chunk = src.slice(tc.start, tc.end);
      if (chunk.includes('snapshot') || chunk.includes('ContextRows') || chunk.includes('diagnostic') || chunk.includes('DEBUG') || chunk.includes('console')) {
        removeEnd = tc.end;
      }
    }
  }

  const chunk = src.slice(removeStart, removeEnd);

  if (chunk.includes(keepMarker)) {
    console.error(JSON.stringify({
      status: 'FAILED_REFUSE_REMOVING_R8M_MARKER',
      removeStart,
      removeEnd
    }, null, 2));
    process.exit(4);
  }

  if (chunk.length > 30000) {
    console.error(JSON.stringify({
      status: 'FAILED_REFUSE_TOO_LARGE_REMOVAL',
      chars: chunk.length,
      preview: chunk.slice(0, 1200)
    }, null, 2));
    process.exit(5);
  }

  removals.push({
    label: 'R8L snapshot object plus immediate diagnostic try/catch',
    chars: chunk.length,
    preview: chunk.slice(0, 320).replace(/\s+/g, ' ')
  });

  src = src.slice(0, removeStart) + '\n      /* R8L visible diagnostic removed; R8M hydration remains active. */\n' + src.slice(removeEnd);

  const post = src.slice(removeStart, removeStart + 2500);
  if (post.includes('snapshot')) {
    console.error(JSON.stringify({
      status: 'FAILED_SNAPSHOT_REFERENCE_REMAINS_NEAR_REMOVAL',
      context: post
    }, null, 2));
    process.exit(6);
  }
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
  process.exit(7);
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
  process.exit(8);
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
