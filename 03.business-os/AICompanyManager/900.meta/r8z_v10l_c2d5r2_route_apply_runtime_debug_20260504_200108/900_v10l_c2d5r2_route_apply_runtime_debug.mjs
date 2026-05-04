import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2D5R2_ROUTE_APPLY_RUNTIME_DEBUG';

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

function findIfBlockByAction(fnText, actionText) {
  const actionIndex = fnText.indexOf(actionText);
  if (actionIndex < 0) throw new Error('ACTION_BRANCH_NOT_FOUND: ' + actionText);

  const ifIndex = fnText.lastIndexOf('if', actionIndex);
  if (ifIndex < 0) throw new Error('IF_BEFORE_ACTION_NOT_FOUND');

  const open = findOpenBrace(fnText, actionIndex);
  if (open < 0) throw new Error('ACTION_BRANCH_OPEN_BRACE_NOT_FOUND');

  const close = findMatchingBrace(fnText, open);
  if (close < 0) throw new Error('ACTION_BRANCH_CLOSE_BRACE_NOT_FOUND');

  return { ifIndex, open, close };
}

if (count(src, marker) > 0) {
  throw new Error('C2D5R2_MARKER_ALREADY_EXISTS');
}

const handleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
let handleText = handleFn.text;

const actionText = 'r8z-mgr-major-card-route-apply-section';
const branch = findIfBlockByAction(handleText, actionText);

const startDebugBlock = `
        // ${marker}_BRANCH_ENTER_START
        var aicmR8zC2d5r2Debug = {
          marker: "${marker}",
          phase: "branch-enter",
          at: (new Date()).toISOString(),
          action: String(action || ""),
          targetTag: target && target.tagName ? String(target.tagName) : "",
          targetAction: target && target.getAttribute ? String(target.getAttribute("data-core-action") || "") : "",
          targetId: target && target.id ? String(target.id) : "",
          targetClass: target && target.className ? String(target.className) : ""
        };

        try {
          if (state && typeof state === "object") {
            state.r8zMgrMajorCardRouteApplyDebug = aicmR8zC2d5r2Debug;
          }
          if (typeof console !== "undefined" && console.info) {
            console.info("AICM C2D5R2 route apply debug", aicmR8zC2d5r2Debug);
          }
        } catch (_) {}
        // ${marker}_BRANCH_ENTER_END
`;

handleText = handleText.slice(0, branch.open + 1) + startDebugBlock + handleText.slice(branch.open + 1);

const sectionIdPattern = /var\s+sectionId\s*=\s*sectionSelect\s*\?\s*String\(sectionSelect\.value\s*\|\|\s*""\)\.trim\(\)\s*:\s*""\s*;/;
const sectionIdMatch = sectionIdPattern.exec(handleText);
if (!sectionIdMatch) throw new Error('SECTION_ID_LINE_NOT_FOUND');

const afterSelectBlock = `
        // ${marker}_AFTER_SELECT_READ_START
        try {
          aicmR8zC2d5r2Debug.phase = "after-select-read";
          aicmR8zC2d5r2Debug.routeRootFound = !!routeRoot;
          aicmR8zC2d5r2Debug.sectionSelectFound = !!sectionSelect;
          aicmR8zC2d5r2Debug.optionFound = !!option;
          aicmR8zC2d5r2Debug.selectedIndex = sectionSelect ? sectionSelect.selectedIndex : null;
          aicmR8zC2d5r2Debug.sectionId = sectionId;
          aicmR8zC2d5r2Debug.optionText = option ? String(option.textContent || "").trim() : "";
          aicmR8zC2d5r2Debug.optionSectionId = option && option.getAttribute ? String(option.getAttribute("data-section-id") || "") : "";
          aicmR8zC2d5r2Debug.optionSectionLabel = option && option.getAttribute ? String(option.getAttribute("data-section-label") || "") : "";
          aicmR8zC2d5r2Debug.optionDepartmentId = option && option.getAttribute ? String(option.getAttribute("data-department-id") || "") : "";
          aicmR8zC2d5r2Debug.optionDepartmentLabel = option && option.getAttribute ? String(option.getAttribute("data-department-label") || "") : "";

          if (state && typeof state === "object") {
            state.r8zMgrMajorCardRouteApplyDebug = aicmR8zC2d5r2Debug;
          }
          if (typeof console !== "undefined" && console.info) {
            console.info("AICM C2D5R2 route apply after select", aicmR8zC2d5r2Debug);
          }
        } catch (_) {}
        // ${marker}_AFTER_SELECT_READ_END
`;

handleText = handleText.slice(0, sectionIdMatch.index + sectionIdMatch[0].length) +
  afterSelectBlock +
  handleText.slice(sectionIdMatch.index + sectionIdMatch[0].length);

const applyPattern = /var\s+appliedRoute\s*=\s*aicmR8zC2cApplySectionChoice\(sectionId,\s*sectionSnapshot\)\s*;/;
const applyMatch = applyPattern.exec(handleText);
if (!applyMatch) throw new Error('APPLIED_ROUTE_LINE_NOT_FOUND');

const afterApplyBlock = `
        // ${marker}_AFTER_APPLY_START
        try {
          aicmR8zC2d5r2Debug.phase = "after-apply";
          aicmR8zC2d5r2Debug.appliedRouteOk = !!appliedRoute;
          aicmR8zC2d5r2Debug.appliedRoute = appliedRoute || null;
          aicmR8zC2d5r2Debug.choiceAfterApply = typeof aicmR8zC2cChoice === "function" ? aicmR8zC2cChoice() : null;
          aicmR8zC2d5r2Debug.stateSelectionAfterApply = state && state.r8zMgrMajorCardSelection ? state.r8zMgrMajorCardSelection : null;
          aicmR8zC2d5r2Debug.confirmAfterApply = state && state.r8zMgrMajorCardSelection ? state.r8zMgrMajorCardSelection.confirm || null : null;

          if (state && typeof state === "object") {
            state.r8zMgrMajorCardRouteApplyDebug = aicmR8zC2d5r2Debug;
          }
          if (typeof console !== "undefined" && console.info) {
            console.info("AICM C2D5R2 route apply after apply", aicmR8zC2d5r2Debug);
          }
        } catch (_) {}
        // ${marker}_AFTER_APPLY_END
`;

handleText = handleText.slice(0, applyMatch.index + applyMatch[0].length) +
  afterApplyBlock +
  handleText.slice(applyMatch.index + applyMatch[0].length);

src = replaceFunction(src, handleFn, handleText);

const confirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');
let confirmText = confirmFn.text;

const summaryAnchor = '    var summaryHtml = [';
if (!confirmText.includes(summaryAnchor)) {
  throw new Error('SUMMARY_HTML_ANCHOR_NOT_FOUND');
}

const debugHtmlBlock = `
    // ${marker}_RENDER_DEBUG_PANEL_START
    var routeApplyDebugData = state && state.r8zMgrMajorCardRouteApplyDebug
      ? state.r8zMgrMajorCardRouteApplyDebug
      : null;

    var routeApplyDebugHtml = routeApplyDebugData
      ? [
          '<details class="aicm-selected-note" open style="margin:12px 0;border:1px dashed #64748b;padding:10px;border-radius:10px;background:#f8fafc;">',
          '<summary>C2D5R2 課を適用 debug</summary>',
          '<pre style="white-space:pre-wrap;max-height:280px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(JSON.stringify(routeApplyDebugData, null, 2)) + '</pre>',
          '</details>'
        ].join("")
      : [
          '<details class="aicm-selected-note" style="margin:12px 0;border:1px dashed #cbd5e1;padding:10px;border-radius:10px;">',
          '<summary>C2D5R2 課を適用 debug</summary>',
          '<p>まだ「課を適用」branchは記録されていません。</p>',
          '</details>'
        ].join("");
    // ${marker}_RENDER_DEBUG_PANEL_END

`;

confirmText = confirmText.replace(summaryAnchor, debugHtmlBlock + summaryAnchor);

const routePickerSummaryPattern = /routePickerHtml,\s*\n\s*summaryHtml,/;
if (!routePickerSummaryPattern.test(confirmText)) {
  throw new Error('ROUTE_PICKER_SUMMARY_ARRAY_ANCHOR_NOT_FOUND');
}

confirmText = confirmText.replace(routePickerSummaryPattern, 'routePickerHtml,\n      routeApplyDebugHtml,\n      summaryHtml,');

src = replaceFunction(src, confirmFn, confirmText);

fs.writeFileSync(corePath, src);

const patchedHandle = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
const patchedConfirm = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');

const extract = [];
extract.push('AICompanyManager V10L-C2D5R2 debug patch extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=YES');
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

const insertedBlocksText = [
  startDebugBlock,
  afterSelectBlock,
  afterApplyBlock,
  debugHtmlBlock
].join('\n');

const verify = [];
verify.push('AICompanyManager V10L-C2D5R2 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('MARKER_COUNT=' + count(src, marker));
verify.push('HANDLE_DEBUG_BRANCH_ENTER_COUNT=' + count(patchedHandle.text, marker + '_BRANCH_ENTER_START'));
verify.push('HANDLE_DEBUG_AFTER_SELECT_COUNT=' + count(patchedHandle.text, marker + '_AFTER_SELECT_READ_START'));
verify.push('HANDLE_DEBUG_AFTER_APPLY_COUNT=' + count(patchedHandle.text, marker + '_AFTER_APPLY_START'));
verify.push('RENDER_DEBUG_PANEL_COUNT=' + count(patchedConfirm.text, marker + '_RENDER_DEBUG_PANEL_START'));
verify.push('STATE_DEBUG_WRITE_COUNT=' + count(src, 'state.r8zMgrMajorCardRouteApplyDebug'));
verify.push('CONSOLE_INFO_COUNT=' + count(src, 'AICM C2D5R2 route apply'));
verify.push('DEBUG_PANEL_TEXT_COUNT=' + count(src, 'C2D5R2 課を適用 debug'));
verify.push('FETCH_IN_INSERTED_BLOCKS=' + count(insertedBlocksText, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_BLOCKS=' + count(insertedBlocksText, 'XMLHttpRequest'));
verify.push('EXTRACT_OUT=' + extractOut);

if (count(patchedHandle.text, marker + '_BRANCH_ENTER_START') !== 1) throw new Error('BRANCH_ENTER_DEBUG_NOT_1');
if (count(patchedHandle.text, marker + '_AFTER_SELECT_READ_START') !== 1) throw new Error('AFTER_SELECT_DEBUG_NOT_1');
if (count(patchedHandle.text, marker + '_AFTER_APPLY_START') !== 1) throw new Error('AFTER_APPLY_DEBUG_NOT_1');
if (count(patchedConfirm.text, marker + '_RENDER_DEBUG_PANEL_START') !== 1) throw new Error('RENDER_DEBUG_PANEL_NOT_1');
if (count(insertedBlocksText, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_INSERTED_DEBUG_BLOCKS');
if (count(insertedBlocksText, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_FOUND_IN_INSERTED_DEBUG_BLOCKS');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
