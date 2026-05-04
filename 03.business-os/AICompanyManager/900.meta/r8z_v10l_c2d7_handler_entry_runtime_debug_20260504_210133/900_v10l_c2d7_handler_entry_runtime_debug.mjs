import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2D7_HANDLER_ENTRY_RUNTIME_DEBUG';

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

if (count(src, marker) > 0) {
  throw new Error('C2D7_MARKER_ALREADY_EXISTS');
}

const handleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
let handleText = handleFn.text;

const entryBlock = `
      // ${marker}_ENTRY_START
      try {
        var aicmR8zC2d7Args = [];
        for (var aicmR8zC2d7I = 0; aicmR8zC2d7I < arguments.length; aicmR8zC2d7I += 1) {
          var aicmR8zC2d7Arg = arguments[aicmR8zC2d7I];
          var aicmR8zC2d7Item = {
            index: aicmR8zC2d7I,
            type: typeof aicmR8zC2d7Arg,
            stringValue: typeof aicmR8zC2d7Arg === "string" ? String(aicmR8zC2d7Arg) : "",
            hasTarget: !!(aicmR8zC2d7Arg && aicmR8zC2d7Arg.target),
            tagName: aicmR8zC2d7Arg && aicmR8zC2d7Arg.tagName ? String(aicmR8zC2d7Arg.tagName) : "",
            id: aicmR8zC2d7Arg && aicmR8zC2d7Arg.id ? String(aicmR8zC2d7Arg.id) : "",
            className: aicmR8zC2d7Arg && aicmR8zC2d7Arg.className ? String(aicmR8zC2d7Arg.className) : "",
            dataCoreAction: aicmR8zC2d7Arg && aicmR8zC2d7Arg.getAttribute ? String(aicmR8zC2d7Arg.getAttribute("data-core-action") || "") : "",
            targetDataCoreAction: aicmR8zC2d7Arg && aicmR8zC2d7Arg.target && aicmR8zC2d7Arg.target.getAttribute
              ? String(aicmR8zC2d7Arg.target.getAttribute("data-core-action") || "")
              : "",
            closestDataCoreAction: aicmR8zC2d7Arg && aicmR8zC2d7Arg.target && aicmR8zC2d7Arg.target.closest
              ? String((aicmR8zC2d7Arg.target.closest("[data-core-action]") || {}).getAttribute ? aicmR8zC2d7Arg.target.closest("[data-core-action]").getAttribute("data-core-action") || "" : "")
              : ""
          };
          aicmR8zC2d7Args.push(aicmR8zC2d7Item);
        }

        if (state && typeof state === "object") {
          state.r8zMgrMajorCardHandlerEntryDebug = {
            marker: "${marker}",
            at: (new Date()).toISOString(),
            phase: "handler-entry",
            args: aicmR8zC2d7Args,
            actionVar: typeof action !== "undefined" ? String(action || "") : "__ACTION_VAR_UNDEFINED__",
            targetVarTag: typeof target !== "undefined" && target && target.tagName ? String(target.tagName) : "",
            targetVarAction: typeof target !== "undefined" && target && target.getAttribute ? String(target.getAttribute("data-core-action") || "") : ""
          };
        }

        if (typeof console !== "undefined" && console.info) {
          console.info("AICM C2D7 handler entry debug", state && state.r8zMgrMajorCardHandlerEntryDebug);
        }
      } catch (aicmR8zC2d7Error) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("AICM C2D7 handler entry debug failed", aicmR8zC2d7Error);
        }
      }
      // ${marker}_ENTRY_END

`;

handleText = handleText.slice(0, handleFn.open - handleFn.start + 1) +
  entryBlock +
  handleText.slice(handleFn.open - handleFn.start + 1);

src = replaceFunction(src, handleFn, handleText);

const confirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');
let confirmText = confirmFn.text;

const summaryAnchor = '    var summaryHtml = [';
if (!confirmText.includes(summaryAnchor)) {
  throw new Error('SUMMARY_HTML_ANCHOR_NOT_FOUND');
}

const renderDebugBlock = `
    // ${marker}_RENDER_PANEL_START
    var handlerEntryDebugData = state && state.r8zMgrMajorCardHandlerEntryDebug
      ? state.r8zMgrMajorCardHandlerEntryDebug
      : null;

    var handlerEntryDebugHtml = handlerEntryDebugData
      ? [
          '<details class="aicm-selected-note" open style="margin:12px 0;border:1px dashed #334155;padding:10px;border-radius:10px;background:#f8fafc;">',
          '<summary>C2D7 handler entry debug</summary>',
          '<pre style="white-space:pre-wrap;max-height:340px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(JSON.stringify(handlerEntryDebugData, null, 2)) + '</pre>',
          '</details>'
        ].join("")
      : [
          '<details class="aicm-selected-note" open style="margin:12px 0;border:1px dashed #cbd5e1;padding:10px;border-radius:10px;">',
          '<summary>C2D7 handler entry debug</summary>',
          '<p>まだ aicmR8zMgrMajorCardHandleAction は呼ばれていません。</p>',
          '</details>'
        ].join("");
    // ${marker}_RENDER_PANEL_END

`;

confirmText = confirmText.replace(summaryAnchor, renderDebugBlock + summaryAnchor);

if (confirmText.includes('routeApplyDebugHtml,') && /routeApplyDebugHtml,\s*\n\s*summaryHtml,/.test(confirmText)) {
  confirmText = confirmText.replace(/routeApplyDebugHtml,\s*\n\s*summaryHtml,/, 'routeApplyDebugHtml,\n      handlerEntryDebugHtml,\n      summaryHtml,');
} else if (/routePickerHtml,\s*\n\s*summaryHtml,/.test(confirmText)) {
  confirmText = confirmText.replace(/routePickerHtml,\s*\n\s*summaryHtml,/, 'routePickerHtml,\n      handlerEntryDebugHtml,\n      summaryHtml,');
} else {
  throw new Error('CONFIRM_RENDER_ARRAY_ANCHOR_NOT_FOUND');
}

src = replaceFunction(src, confirmFn, confirmText);

fs.writeFileSync(corePath, src);

const patchedHandle = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
const patchedConfirm = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');

const insertedBlocks = entryBlock + '\n' + renderDebugBlock;

const extract = [];
extract.push('AICompanyManager V10L-C2D7 handler entry debug extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=YES_DIAGNOSTIC_ONLY');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zMgrMajorCardHandleAction L' + patchedHandle.startLine + '-L' + patchedHandle.endLine);
extract.push(patchedHandle.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zMgrMajorCardRenderConfirm L' + patchedConfirm.startLine + '-L' + patchedConfirm.endLine);
extract.push(patchedConfirm.text);
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2D7 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('MARKER_COUNT=' + count(src, marker));
verify.push('ENTRY_START_COUNT=' + count(src, marker + '_ENTRY_START'));
verify.push('ENTRY_END_COUNT=' + count(src, marker + '_ENTRY_END'));
verify.push('RENDER_PANEL_START_COUNT=' + count(src, marker + '_RENDER_PANEL_START'));
verify.push('HANDLER_ENTRY_STATE_WRITE_COUNT=' + count(src, 'state.r8zMgrMajorCardHandlerEntryDebug'));
verify.push('HANDLER_ENTRY_PANEL_TEXT_COUNT=' + count(src, 'C2D7 handler entry debug'));
verify.push('FETCH_IN_INSERTED_BLOCKS=' + count(insertedBlocks, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_BLOCKS=' + count(insertedBlocks, 'XMLHttpRequest'));
verify.push('EXTRACT_OUT=' + extractOut);

if (count(src, marker + '_ENTRY_START') !== 1) throw new Error('ENTRY_START_NOT_1');
if (count(src, marker + '_ENTRY_END') !== 1) throw new Error('ENTRY_END_NOT_1');
if (count(src, marker + '_RENDER_PANEL_START') !== 1) throw new Error('RENDER_PANEL_NOT_1');
if (count(insertedBlocks, 'fetch(') !== 0) throw new Error('FETCH_IN_INSERTED_BLOCKS');
if (count(insertedBlocks, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_IN_INSERTED_BLOCKS');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
