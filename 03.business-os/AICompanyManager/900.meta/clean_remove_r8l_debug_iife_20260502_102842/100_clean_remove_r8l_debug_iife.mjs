import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

const marker = 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1';
const keepMarker = 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1';
const debugVar = 'aicmR8lDebug';

let src = fs.readFileSync(corePath, 'utf8');

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countToken(text, token) {
  return (text.match(new RegExp(escapeRegExp(token), 'g')) || []).length;
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
      if (ch === quote) quote = null;
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

function findIifeEnd(text, afterCloseBraceIdx) {
  const tail = text.slice(afterCloseBraceIdx, afterCloseBraceIdx + 1200);
  const m = tail.match(/^\s*\)\s*\(\s*\)\s*;/);
  if (!m) return -1;
  return afterCloseBraceIdx + m[0].length;
}

function removeR8lIife(text) {
  const markerIdx = text.indexOf(marker);
  const debugVarIdx = text.indexOf(debugVar);

  if (markerIdx < 0 && debugVarIdx < 0) {
    return {
      text,
      removed: false,
      reason: 'no marker/debug var'
    };
  }

  const searchNeedleIdx = markerIdx >= 0 ? markerIdx : debugVarIdx;
  const searchStart = Math.max(0, searchNeedleIdx - 50000);
  const searchText = text.slice(searchStart, searchNeedleIdx + 1);

  const declRe = /\b(?:var|let|const)\s+aicmR8lDebug\s*=\s*\(\s*function\s*\([^)]*\)\s*\{/g;
  let match;
  let last = null;

  while ((match = declRe.exec(searchText)) !== null) {
    last = {
      index: searchStart + match.index,
      raw: match[0]
    };
  }

  if (!last) {
    return {
      text,
      removed: false,
      reason: 'iife declaration not found'
    };
  }

  const start = last.index;
  const openBrace = text.indexOf('{', start);
  const closeBrace = findMatchingBrace(text, openBrace);

  if (openBrace < 0 || closeBrace < 0 || closeBrace < start) {
    return {
      text,
      removed: false,
      reason: 'iife brace not found',
      start,
      openBrace,
      closeBrace
    };
  }

  const end = findIifeEnd(text, closeBrace + 1);
  if (end < 0) {
    return {
      text,
      removed: false,
      reason: 'iife end not found',
      start,
      closeBrace,
      afterClose: text.slice(closeBrace, closeBrace + 500)
    };
  }

  const chunk = text.slice(start, end);

  if (!chunk.includes(debugVar)) {
    return {
      text,
      removed: false,
      reason: 'chunk does not contain debug var'
    };
  }

  if (markerIdx >= 0 && !chunk.includes(marker)) {
    return {
      text,
      removed: false,
      reason: 'chunk does not contain marker'
    };
  }

  if (chunk.includes(keepMarker)) {
    return {
      text,
      removed: false,
      reason: 'refuse chunk containing R8M keep marker'
    };
  }

  if (chunk.length > 50000) {
    return {
      text,
      removed: false,
      reason: 'refuse too large chunk',
      chars: chunk.length
    };
  }

  return {
    text: text.slice(0, start) + text.slice(end),
    removed: true,
    reason: 'removed R8L debug IIFE',
    removedChars: chunk.length,
    preview: chunk.slice(0, 300).replace(/\s+/g, ' ')
  };
}

const before = {
  marker: countToken(src, marker),
  keep: countToken(src, keepMarker),
  debugVar: countToken(src, debugVar),
  diagnosticTitle: countToken(src, '表示診断ログ'),
  debugCard: countToken(src, 'aicm-debug-card')
};

const removals = [];

const iifeResult = removeR8lIife(src);
if (!iifeResult.removed && before.marker > 0) {
  console.error(JSON.stringify({
    status: 'FAILED_IIFE_NOT_REMOVED',
    before,
    reason: iifeResult.reason,
    detail: iifeResult
  }, null, 2));
  process.exit(2);
}
if (iifeResult.removed) {
  src = iifeResult.text;
  removals.push(iifeResult);
}

/*
  If a previous neutralize patch was applied, clean the dummy variable too.
  This keeps the final code free of dead debug variables.
*/
src = src.replace(
  /^[ \t]*(?:var|let|const)\s+aicmR8lDebug\s*=\s*\{\s*html\s*:\s*(?:""|''|``)\s*\}\s*;\s*\n?/gm,
  (m) => {
    removals.push({
      removed: true,
      reason: 'removed prior dummy aicmR8lDebug variable',
      removedChars: m.length,
      preview: m.slice(0, 200).replace(/\s+/g, ' ')
    });
    return '';
  }
);

/*
  Clean renderShell array entry:
    aicmR8lDebug.html,
  No dummy, no dead reference.
*/
src = src.replace(
  /^[ \t]*aicmR8lDebug\.html\s*,\s*\n?/gm,
  (m) => {
    removals.push({
      removed: true,
      reason: 'removed renderShell debug html entry',
      removedChars: m.length,
      preview: m.slice(0, 200).replace(/\s+/g, ' ')
    });
    return '';
  }
);

const after = {
  marker: countToken(src, marker),
  keep: countToken(src, keepMarker),
  debugVar: countToken(src, debugVar),
  diagnosticTitle: countToken(src, '表示診断ログ'),
  debugCard: countToken(src, 'aicm-debug-card')
};

if (after.marker !== 0) {
  console.error(JSON.stringify({
    status: 'FAILED_R8L_MARKER_STILL_PRESENT',
    before,
    after,
    removals
  }, null, 2));
  process.exit(3);
}

if (before.keep > 0 && after.keep !== before.keep) {
  console.error(JSON.stringify({
    status: 'FAILED_R8M_KEEP_MARKER_CHANGED',
    before,
    after,
    removals
  }, null, 2));
  process.exit(4);
}

if (after.debugVar !== 0) {
  console.error(JSON.stringify({
    status: 'FAILED_DEBUG_VAR_REFERENCE_STILL_PRESENT',
    before,
    after,
    removals
  }, null, 2));
  process.exit(5);
}

if (after.diagnosticTitle !== 0 || after.debugCard !== 0) {
  console.error(JSON.stringify({
    status: 'FAILED_VISIBLE_DEBUG_STRINGS_STILL_PRESENT',
    before,
    after,
    removals
  }, null, 2));
  process.exit(6);
}

if (removals.length === 0) {
  console.log(JSON.stringify({
    status: 'NOOP_NOTHING_TO_REMOVE',
    before,
    after
  }, null, 2));
  process.exit(0);
}

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED_CLEAN_REMOVE',
  before,
  after,
  removalCount: removals.length,
  removals
}, null, 2));
