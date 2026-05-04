import fs from 'fs';

const [,, corePath, extractOut, verifyOut, candidatesOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2D5R1_ROUTE_DISPATCHER_NO_NEW_FETCH';
const routePrefix = 'r8z-mgr-major-card-route-';

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function findOpenBrace(text, fromIndex) {
  let state = 'normal';
  let escape = false;

  for (let i = fromIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
      }
      continue;
    }
    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = 'single';
      continue;
    }
    if (ch === '"') {
      state = 'double';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') return i;
  }

  return -1;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = 'normal';
  let escape = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
      }
      continue;
    }
    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = 'single';
      continue;
    }
    if (ch === '"') {
      state = 'double';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function allFunctionRanges(text) {
  const ranges = [];
  const re = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let m;

  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const start = m.index;
    const open = findOpenBrace(text, start);
    if (open < 0) continue;
    const close = findMatchingBrace(text, open);
    if (close < 0) continue;

    ranges.push({
      name,
      start,
      open,
      close,
      startLine: lineNoAt(text, start),
      endLine: lineNoAt(text, close),
      text: text.slice(start, close + 1)
    });
  }

  return ranges;
}

function scoreCandidate(fn) {
  if (fn.name === 'aicmR8zMgrMajorCardHandleAction') return -9999;

  const t = fn.text;
  let score = 0;

  if (t.includes('aicmR8zMgrMajorCardHandleAction')) score += 120;
  if (t.includes('data-core-action')) score += 50;
  if (t.includes(routePrefix)) score += 40;
  if (t.includes('r8z-mgr-major-card')) score += 30;
  if (t.includes('closest')) score += 20;
  if (t.includes('addEventListener')) score += 20;
  if (t.includes('click')) score += 15;
  if (t.includes('getAttribute("data-core-action")') || t.includes("getAttribute('data-core-action')")) score += 15;
  if (t.includes('dataset.coreAction')) score += 10;

  // Prefer smaller and no-fetch dispatchers, but allow existing fetch if that is the real dispatcher.
  if (t.includes('fetch(')) score -= 25;
  if (t.length > 30000) score -= 20;

  return score;
}

if (count(src, marker) > 0) {
  throw new Error('C2D5R1_MARKER_ALREADY_EXISTS');
}

const functions = allFunctionRanges(src);

const candidates = functions
  .map(fn => ({ fn, score: scoreCandidate(fn), size: fn.close - fn.start }))
  .filter(x => x.score > 0)
  .sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.size - b.size;
  });

const candidateLines = [];
candidateLines.push('AICompanyManager V10L-C2D5R1 dispatcher candidate ranking');
candidateLines.push('DB_WRITE=NO');
candidateLines.push('API_POST=NO');
candidateLines.push('CORE_PATCH=YES');
candidateLines.push('SERVER_PATCH=NO');
candidateLines.push('');

for (const c of candidates.slice(0, 20)) {
  candidateLines.push([
    'score=' + c.score,
    'function=' + c.fn.name,
    'lines=' + c.fn.startLine + '-' + c.fn.endLine,
    'size=' + c.size,
    'fetchCount=' + count(c.fn.text, 'fetch('),
    'hasHandlerCall=' + c.fn.text.includes('aicmR8zMgrMajorCardHandleAction'),
    'hasRoutePrefix=' + c.fn.text.includes(routePrefix),
    'hasMgrMajorCard=' + c.fn.text.includes('r8z-mgr-major-card'),
    'hasDataCoreAction=' + c.fn.text.includes('data-core-action'),
    'hasClosest=' + c.fn.text.includes('closest'),
    'hasClick=' + c.fn.text.includes('click')
  ].join('; '));
}

fs.writeFileSync(candidatesOut, candidateLines.join('\n') + '\n');

const target = candidates.find(c =>
  c.fn.text.includes('aicmR8zMgrMajorCardHandleAction') &&
  c.fn.text.includes('data-core-action') &&
  (c.fn.text.includes(routePrefix) || c.fn.text.includes('r8z-mgr-major-card'))
);

if (!target) {
  throw new Error('TARGET_DISPATCHER_FUNCTION_NOT_FOUND');
}

const originalFn = target.fn;
const originalFetchCount = count(originalFn.text, 'fetch(');
const originalXmlHttpCount = count(originalFn.text, 'XMLHttpRequest');

const gate = `
    // ${marker}_START
    // Normalize browser click target for manager-major-card route actions.
    // Scope: existing dispatcher only. No DB write. No API POST. No new fetch.
    try {
      var aicmR8zC2d5r1Event = null;
      var aicmR8zC2d5r1Target = null;
      var aicmR8zC2d5r1Action = "";

      for (var aicmR8zC2d5r1I = 0; aicmR8zC2d5r1I < arguments.length; aicmR8zC2d5r1I += 1) {
        var aicmR8zC2d5r1Arg = arguments[aicmR8zC2d5r1I];

        if (!aicmR8zC2d5r1Event && aicmR8zC2d5r1Arg && aicmR8zC2d5r1Arg.preventDefault) {
          aicmR8zC2d5r1Event = aicmR8zC2d5r1Arg;
        }

        if (!aicmR8zC2d5r1Action && typeof aicmR8zC2d5r1Arg === "string") {
          aicmR8zC2d5r1Action = String(aicmR8zC2d5r1Arg || "").trim();
        }

        if (!aicmR8zC2d5r1Target && aicmR8zC2d5r1Arg && aicmR8zC2d5r1Arg.target) {
          if (aicmR8zC2d5r1Arg.target.closest) {
            aicmR8zC2d5r1Target = aicmR8zC2d5r1Arg.target.closest("[data-core-action]");
          } else if (aicmR8zC2d5r1Arg.target.getAttribute) {
            aicmR8zC2d5r1Target = aicmR8zC2d5r1Arg.target;
          }
        }

        if (!aicmR8zC2d5r1Target && aicmR8zC2d5r1Arg && aicmR8zC2d5r1Arg.closest) {
          aicmR8zC2d5r1Target = aicmR8zC2d5r1Arg.closest("[data-core-action]");
        }

        if (!aicmR8zC2d5r1Target && aicmR8zC2d5r1Arg && aicmR8zC2d5r1Arg.getAttribute) {
          aicmR8zC2d5r1Target = aicmR8zC2d5r1Arg;
        }
      }

      if (!aicmR8zC2d5r1Action && aicmR8zC2d5r1Target && aicmR8zC2d5r1Target.getAttribute) {
        aicmR8zC2d5r1Action = String(aicmR8zC2d5r1Target.getAttribute("data-core-action") || "").trim();
      }

      if (!aicmR8zC2d5r1Action && aicmR8zC2d5r1Target && aicmR8zC2d5r1Target.dataset) {
        aicmR8zC2d5r1Action = String(aicmR8zC2d5r1Target.dataset.coreAction || "").trim();
      }

      if (
        aicmR8zC2d5r1Action &&
        aicmR8zC2d5r1Action.indexOf("r8z-mgr-major-card-route-") === 0 &&
        typeof aicmR8zMgrMajorCardHandleAction === "function"
      ) {
        if (aicmR8zC2d5r1Event && aicmR8zC2d5r1Event.preventDefault) {
          aicmR8zC2d5r1Event.preventDefault();
        }
        if (aicmR8zC2d5r1Event && aicmR8zC2d5r1Event.stopPropagation) {
          aicmR8zC2d5r1Event.stopPropagation();
        }

        aicmR8zMgrMajorCardHandleAction(
          aicmR8zC2d5r1Event,
          aicmR8zC2d5r1Target,
          aicmR8zC2d5r1Action
        );
        return;
      }
    } catch (aicmR8zC2d5r1Error) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("C2D5R1 route dispatcher target fix skipped", aicmR8zC2d5r1Error);
      }
    }
    // ${marker}_END

`;

const insertAt = originalFn.open + 1;
src = src.slice(0, insertAt) + '\n' + gate + src.slice(insertAt);

const patchedFunctions = allFunctionRanges(src);
const patchedTarget = patchedFunctions.find(x => x.name === originalFn.name && x.text.includes(marker));
if (!patchedTarget) {
  throw new Error('PATCHED_TARGET_NOT_FOUND');
}

const blockStart = patchedTarget.text.indexOf(marker + '_START');
const blockEnd = patchedTarget.text.indexOf(marker + '_END');
if (blockStart < 0 || blockEnd < 0 || blockEnd < blockStart) {
  throw new Error('PATCH_BLOCK_NOT_FOUND');
}
const patchedBlock = patchedTarget.text.slice(blockStart, blockEnd);

const patchedFetchCount = count(patchedTarget.text, 'fetch(');
const patchedXmlHttpCount = count(patchedTarget.text, 'XMLHttpRequest');
const fetchDelta = patchedFetchCount - originalFetchCount;
const xmlHttpDelta = patchedXmlHttpCount - originalXmlHttpCount;

fs.writeFileSync(corePath, src);

const extract = [];
extract.push('AICompanyManager V10L-C2D5R1 patched dispatcher extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=YES');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('PATCHED_FUNCTION=' + patchedTarget.name);
extract.push('PATCHED_FUNCTION_LINES=' + patchedTarget.startLine + '-' + patchedTarget.endLine);
extract.push('ORIGINAL_FETCH_COUNT=' + originalFetchCount);
extract.push('PATCHED_FETCH_COUNT=' + patchedFetchCount);
extract.push('FETCH_DELTA=' + fetchDelta);
extract.push('');
extract.push(patchedTarget.text);
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2D5R1 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('PATCHED_FUNCTION=' + patchedTarget.name);
verify.push('PATCHED_FUNCTION_LINES=' + patchedTarget.startLine + '-' + patchedTarget.endLine);
verify.push('C2D5R1_MARKER_COUNT=' + count(src, marker));
verify.push('C2D5R1_START_COUNT=' + count(src, marker + '_START'));
verify.push('C2D5R1_END_COUNT=' + count(src, marker + '_END'));
verify.push('C2D5R1_MARKER_IN_PATCHED_FUNCTION=' + count(patchedTarget.text, marker));
verify.push('ROUTE_PREFIX_GATE_IN_PATCHED_FUNCTION=' + count(patchedTarget.text, 'aicmR8zC2d5r1Action.indexOf("r8z-mgr-major-card-route-") === 0'));
verify.push('CLOSEST_DATA_CORE_ACTION_IN_PATCHED_FUNCTION=' + count(patchedTarget.text, 'closest("[data-core-action]")'));
verify.push('HANDLER_CALL_IN_PATCHED_FUNCTION=' + count(patchedTarget.text, 'aicmR8zMgrMajorCardHandleAction('));
verify.push('ORIGINAL_FETCH_COUNT_IN_PATCHED_FUNCTION=' + originalFetchCount);
verify.push('PATCHED_FETCH_COUNT_IN_PATCHED_FUNCTION=' + patchedFetchCount);
verify.push('FETCH_DELTA_IN_PATCHED_FUNCTION=' + fetchDelta);
verify.push('ORIGINAL_XMLHTTP_COUNT_IN_PATCHED_FUNCTION=' + originalXmlHttpCount);
verify.push('PATCHED_XMLHTTP_COUNT_IN_PATCHED_FUNCTION=' + patchedXmlHttpCount);
verify.push('XMLHTTP_DELTA_IN_PATCHED_FUNCTION=' + xmlHttpDelta);
verify.push('FETCH_IN_INSERTED_BLOCK=' + count(patchedBlock, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_BLOCK=' + count(patchedBlock, 'XMLHttpRequest'));
verify.push('CANDIDATES_OUT=' + candidatesOut);
verify.push('EXTRACT_OUT=' + extractOut);

if (count(src, marker) !== 2) throw new Error('C2D5R1_MARKER_COUNT_NOT_2_START_END');
if (count(src, marker + '_START') !== 1) throw new Error('C2D5R1_START_COUNT_NOT_1');
if (count(src, marker + '_END') !== 1) throw new Error('C2D5R1_END_COUNT_NOT_1');
if (count(patchedTarget.text, marker) !== 2) throw new Error('C2D5R1_MARKER_NOT_IN_ONE_PATCHED_FUNCTION');
if (count(patchedTarget.text, 'aicmR8zC2d5r1Action.indexOf("r8z-mgr-major-card-route-") === 0') !== 1) throw new Error('ROUTE_PREFIX_GATE_NOT_1');
if (count(patchedTarget.text, 'closest("[data-core-action]")') < 1) throw new Error('CLOSEST_DATA_CORE_ACTION_MISSING');
if (fetchDelta !== 0) throw new Error('FETCH_DELTA_NOT_ZERO');
if (xmlHttpDelta !== 0) throw new Error('XMLHTTP_DELTA_NOT_ZERO');
if (count(patchedBlock, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_INSERTED_BLOCK');
if (count(patchedBlock, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_FOUND_IN_INSERTED_BLOCK');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
