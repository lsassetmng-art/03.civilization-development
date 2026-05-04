import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2D9_BRIDGE_CLICK_CALLBACK_ROUTE_ACTION_FIX';
const bridgeName = 'aicmInstallLeaderHandoffConfirmCardBridgeR8SV9F4B';

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

function findFunctionRange(text, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + escRe(name) + '\\s*\\(', 'm');
  const m = re.exec(text);
  if (!m) throw new Error('FUNCTION_NOT_FOUND: ' + name);

  const start = m.index;
  const open = findOpenBrace(text, start);
  if (open < 0) throw new Error('OPEN_BRACE_NOT_FOUND: ' + name);

  const close = findMatchingBrace(text, open);
  if (close < 0) throw new Error('CLOSE_BRACE_NOT_FOUND: ' + name);

  return {
    name,
    start,
    open,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

function replaceFunction(text, fn, nextText) {
  return text.slice(0, fn.start) + nextText + text.slice(fn.close + 1);
}

function findClickCallbackInBridge(fnText) {
  const candidates = [];
  const re = /addEventListener\s*\(\s*["']click["']\s*,/g;
  let m;

  while ((m = re.exec(fnText)) !== null) {
    const addIndex = m.index;
    const functionIndex = fnText.indexOf('function', addIndex);

    if (functionIndex < 0) continue;
    if (functionIndex - addIndex > 500) continue;

    const open = findOpenBrace(fnText, functionIndex);
    if (open < 0) continue;

    const close = findMatchingBrace(fnText, open);
    if (close < 0) continue;

    const callbackText = fnText.slice(functionIndex, close + 1);

    let score = 0;
    const reasons = [];

    if (callbackText.includes('data-core-action')) {
      score += 40;
      reasons.push('HAS_DATA_CORE_ACTION');
    }
    if (callbackText.includes('closest')) {
      score += 20;
      reasons.push('HAS_CLOSEST');
    }
    if (callbackText.includes('aicmR8zMgrMajorCardHandleAction')) {
      score += 70;
      reasons.push('CALLS_CARD_HANDLER');
    }
    if (callbackText.includes('r8z-mgr-major-card-open-handoff-confirm')) {
      score += 80;
      reasons.push('HAS_OPEN_CONFIRM_ACTION');
    }
    if (callbackText.includes('open-handoff-confirm')) {
      score += 40;
      reasons.push('HAS_OPEN_CONFIRM_TEXT');
    }
    if (callbackText.includes('preventDefault')) {
      score += 10;
      reasons.push('HAS_PREVENT_DEFAULT');
    }

    candidates.push({
      addIndex,
      functionIndex,
      open,
      close,
      callbackText,
      score,
      reasons
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

if (count(src, marker) > 0) {
  throw new Error('C2D9_MARKER_ALREADY_EXISTS');
}

const bridgeFn = findFunctionRange(src, bridgeName);
let bridgeText = bridgeFn.text;

const callback = findClickCallbackInBridge(bridgeText);
if (!callback) {
  throw new Error('CLICK_CALLBACK_NOT_FOUND_IN_BRIDGE');
}

if (callback.score < 80) {
  throw new Error('CLICK_CALLBACK_SCORE_TOO_LOW_' + callback.score);
}

const gate = `
        // ${marker}_START
        // Route picker action gate inside existing bridge click callback.
        // This fixes dynamic confirm-panel controls that are not reaching the card handler.
        // No DB write. No API POST. No fetch.
        try {
          var aicmR8zC2d9Event = arguments && arguments.length ? arguments[0] : null;
          var aicmR8zC2d9Target = null;
          var aicmR8zC2d9Action = "";

          if (aicmR8zC2d9Event && aicmR8zC2d9Event.target) {
            if (aicmR8zC2d9Event.target.closest) {
              aicmR8zC2d9Target = aicmR8zC2d9Event.target.closest("[data-core-action]");
            } else if (aicmR8zC2d9Event.target.getAttribute) {
              aicmR8zC2d9Target = aicmR8zC2d9Event.target;
            }
          }

          if (aicmR8zC2d9Target && aicmR8zC2d9Target.getAttribute) {
            aicmR8zC2d9Action = String(aicmR8zC2d9Target.getAttribute("data-core-action") || "").trim();
          }

          if (!aicmR8zC2d9Action && aicmR8zC2d9Target && aicmR8zC2d9Target.dataset) {
            aicmR8zC2d9Action = String(aicmR8zC2d9Target.dataset.coreAction || "").trim();
          }

          if (
            aicmR8zC2d9Action &&
            aicmR8zC2d9Action.indexOf("r8z-mgr-major-card-route-") === 0 &&
            typeof aicmR8zMgrMajorCardHandleAction === "function"
          ) {
            if (aicmR8zC2d9Event && aicmR8zC2d9Event.preventDefault) {
              aicmR8zC2d9Event.preventDefault();
            }
            if (aicmR8zC2d9Event && aicmR8zC2d9Event.stopPropagation) {
              aicmR8zC2d9Event.stopPropagation();
            }

            aicmR8zMgrMajorCardHandleAction(
              aicmR8zC2d9Event,
              aicmR8zC2d9Target,
              aicmR8zC2d9Action
            );
            return;
          }
        } catch (aicmR8zC2d9Error) {
          if (typeof console !== "undefined" && console.warn) {
            console.warn("C2D9 bridge route action gate failed", aicmR8zC2d9Error);
          }
        }
        // ${marker}_END

`;

bridgeText = bridgeText.slice(0, callback.open + 1) + gate + bridgeText.slice(callback.open + 1);
src = replaceFunction(src, bridgeFn, bridgeText);

fs.writeFileSync(corePath, src);

const patchedBridge = findFunctionRange(src, bridgeName);
const insertedBlock = gate;

const extract = [];
extract.push('AICompanyManager V10L-C2D9 bridge click callback route action fix extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=YES');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('BRIDGE_FUNCTION=' + bridgeName);
extract.push('BRIDGE_LINES=' + patchedBridge.startLine + '-' + patchedBridge.endLine);
extract.push('CALLBACK_SCORE=' + callback.score);
extract.push('CALLBACK_REASONS=' + callback.reasons.join(','));
extract.push('');
extract.push('============================================================');
extract.push(patchedBridge.text);
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2D9 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('BRIDGE_FUNCTION=' + bridgeName);
verify.push('BRIDGE_LINES=' + patchedBridge.startLine + '-' + patchedBridge.endLine);
verify.push('CALLBACK_SCORE=' + callback.score);
verify.push('CALLBACK_REASONS=' + callback.reasons.join(','));
verify.push('C2D9_MARKER_COUNT=' + count(src, marker));
verify.push('C2D9_START_COUNT=' + count(src, marker + '_START'));
verify.push('C2D9_END_COUNT=' + count(src, marker + '_END'));
verify.push('ROUTE_PREFIX_GATE_COUNT=' + count(patchedBridge.text, 'aicmR8zC2d9Action.indexOf("r8z-mgr-major-card-route-") === 0'));
verify.push('HANDLER_CALL_COUNT_IN_BRIDGE=' + count(patchedBridge.text, 'aicmR8zMgrMajorCardHandleAction('));
verify.push('FETCH_IN_INSERTED_BLOCK=' + count(insertedBlock, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_BLOCK=' + count(insertedBlock, 'XMLHttpRequest'));
verify.push('EXTRACT_OUT=' + extractOut);

if (count(src, marker) !== 2) throw new Error('C2D9_MARKER_COUNT_NOT_2');
if (count(src, marker + '_START') !== 1) throw new Error('C2D9_START_COUNT_NOT_1');
if (count(src, marker + '_END') !== 1) throw new Error('C2D9_END_COUNT_NOT_1');
if (count(patchedBridge.text, 'aicmR8zC2d9Action.indexOf("r8z-mgr-major-card-route-") === 0') !== 1) {
  throw new Error('ROUTE_PREFIX_GATE_NOT_1');
}
if (count(insertedBlock, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_INSERTED_BLOCK');
if (count(insertedBlock, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_FOUND_IN_INSERTED_BLOCK');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
