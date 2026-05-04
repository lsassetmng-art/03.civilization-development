import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;

let src = fs.readFileSync(corePath, 'utf8');

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function findOpenBrace(text, fromIndex) {
  let state = 'normal';
  let escape = false;

  for (let i = fromIndex; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i++;
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
      i++;
      continue;
    }

    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i++;
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

  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i++;
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
      i++;
      continue;
    }

    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i++;
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

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
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

const marker = 'AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_PATCH';

if (!src.includes('AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_HELPER_START')) {
  throw new Error('C1B_HELPER_NOT_FOUND: run/keep V10L-C1B helper patch first');
}

if (!src.includes('AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_ACTION_ROUTE_START')) {
  throw new Error('C1B_ACTION_ROUTE_NOT_FOUND: route for selection actions is missing');
}

let fn = findFunctionRange(src, 'aicmRenderManagerMajorRows');

if (fn.text.includes(marker)) {
  fs.writeFileSync(extractOut, fn.text + '\n');
  fs.writeFileSync(verifyOut, [
    'AICompanyManager V10L-C1E verify',
    'STATUS=ALREADY_PATCHED',
    'DB_WRITE=NO',
    'API_POST=NO',
    'SERVER_PATCH=NO',
    'TARGET_FUNCTION=aicmRenderManagerMajorRows',
    'TARGET_FUNCTION_LINES=' + fn.startLine + '-' + fn.endLine,
    'MARKER_COUNT=' + count(fn.text, marker),
    'OLD_HANDOFF_ACTION_IN_TARGET=' + count(fn.text, 'data-core-action="pmlw-major-leader-handoff"'),
    'CARD_CHECKBOX_COUNT=' + count(fn.text, 'type="checkbox"'),
    'OPERATION_PANEL_ACTION_COUNT=' + count(fn.text, 'v10l-c1b-major-open-handoff-confirm')
  ].join('\n') + '\n');
  process.exit(0);
}

let body = fn.text;
const originalBody = body;
let lines = body.split(/\r?\n/);

function findLineIndex(predicate) {
  for (let i = 0; i < lines.length; i += 1) {
    if (predicate(lines[i], i)) return i;
  }
  return -1;
}

const registeredIdx = findLineIndex(line => line.includes('登録済み大項目'));
if (registeredIdx < 0) throw new Error('REGISTERED_MAJOR_TITLE_LINE_NOT_FOUND');

let returnIdx = -1;
for (let i = registeredIdx; i >= 0; i -= 1) {
  if (/^\s*return\s+\[/.test(lines[i])) {
    returnIdx = i;
    break;
  }
}
if (returnIdx < 0) throw new Error('RETURN_ARRAY_BEFORE_REGISTERED_TITLE_NOT_FOUND');

let mapIdx = -1;
for (let i = registeredIdx; i < lines.length; i += 1) {
  if (/\.map\s*\(\s*function\s*\(\s*row/.test(lines[i]) || /rows\s*\.\s*map\s*\(\s*function\s*\(\s*row/.test(lines[i])) {
    mapIdx = i;
    break;
  }
}
if (mapIdx < 0) {
  for (let i = registeredIdx; i >= 0; i -= 1) {
    if (/\.map\s*\(\s*function\s*\(\s*row/.test(lines[i]) || /rows\s*\.\s*map\s*\(\s*function\s*\(\s*row/.test(lines[i])) {
      mapIdx = i;
      break;
    }
  }
}
if (mapIdx < 0) throw new Error('CARD_ROWS_MAP_LINE_NOT_FOUND');

let firstOldButtonIdx = -1;
const oldButtonIdxs = [];

for (let i = mapIdx; i < lines.length; i += 1) {
  const line = lines[i];

  const isOldHandoff = line.includes('data-core-action="pmlw-major-leader-handoff"') || (line.includes('<button') && line.includes('課長へ送る'));
  const isOldDelete = (
    line.includes('managerMajorDeleteConfirm') ||
    line.includes('data-core-action="pmlw-major-delete"') ||
    line.includes('data-core-action="manager-major-delete"') ||
    line.includes('data-core-action="major-item-delete"') ||
    line.includes('data-core-action="manager-major-delete-open"') ||
    (line.includes('<button') && line.includes('削除'))
  );

  const isNewPanel = line.includes('v10l-c1b-major-open-delete-confirm') || line.includes('v10l-c1b-major-open-handoff-confirm');

  if (!isNewPanel && (isOldHandoff || isOldDelete)) {
    if (firstOldButtonIdx < 0) firstOldButtonIdx = i;
    oldButtonIdxs.push(i);
  }

  if (i > mapIdx + 180) break;
}

if (firstOldButtonIdx < 0) throw new Error('OLD_CARD_BUTTON_LINES_NOT_FOUND');

const returnIndent = (lines[returnIdx].match(/^(\s*)/) || ['', ''])[1];
const mapIndent = (lines[mapIdx].match(/^(\s*)/) || ['', ''])[1] + '  ';
const arrayItemIndent = (lines[registeredIdx].match(/^(\s*)/) || ['', ''])[1];

const preReturnBlock = [
  returnIndent + '// ' + marker + '_STATE_START',
  returnIndent + 'var r8zCardSelectionState = typeof aicmV10lC1bMajorSelectionState === "function"',
  returnIndent + '  ? aicmV10lC1bMajorSelectionState()',
  returnIndent + '  : { selectedIds: {}, confirm: null };',
  returnIndent + 'var r8zCardSelectedIds = r8zCardSelectionState.selectedIds || {};',
  returnIndent + 'var r8zCardAllRows = Array.isArray(rows) ? rows : [];',
  returnIndent + 'var r8zCardEligibleCount = r8zCardAllRows.filter(function (row) {',
  returnIndent + '  return typeof aicmV10lC1bIsPendingMajorRow === "function" ? aicmV10lC1bIsPendingMajorRow(row) : true;',
  returnIndent + '}).length;',
  returnIndent + 'var r8zCardSelectedCount = r8zCardAllRows.filter(function (row) {',
  returnIndent + '  var id = typeof aicmV10lC1bMajorId === "function" ? aicmV10lC1bMajorId(row) : "";',
  returnIndent + '  return !!(id && r8zCardSelectedIds[id]);',
  returnIndent + '}).length;',
  returnIndent + 'var r8zCardConfirm = r8zCardSelectionState.confirm || null;',
  returnIndent + 'var r8zCardConfirmHtml = "";',
  returnIndent + 'if (r8zCardConfirm && Array.isArray(r8zCardConfirm.items) && r8zCardConfirm.items.length) {',
  returnIndent + '  r8zCardConfirmHtml = [',
  returnIndent + '    \'<div class="aicm-core-card" data-r8z-card-confirm="1" style="margin-top:12px;border:1px solid #f59e0b;">\',',
  returnIndent + '    \'  <p class="aicm-eyebrow">確認</p>\',',
  returnIndent + '    \'  <h3>\' + escapeHtml(r8zCardConfirm.title || "確認") + \'</h3>\',',
  returnIndent + '    \'  <ul class="aicm-selected-note">\' + r8zCardConfirm.items.map(function (item) { return \'<li>\' + escapeHtml(item.title || item.id || "Manager大項目") + \'</li>\'; }).join("") + \'</ul>\',',
  returnIndent + '    \'  <div class="aicm-dashboard-action-row">\',',
  returnIndent + '    \'    <button type="button" data-core-action="v10l-c1b-major-confirm-yes">Yes</button>\',',
  returnIndent + '    \'    <button type="button" data-core-action="v10l-c1b-major-confirm-no">No</button>\',',
  returnIndent + '    \'  </div>\',',
  returnIndent + '    \'  <p class="aicm-selected-note">V10L-C1EではYes押下時もDB更新/API POSTは実行しません。</p>\',',
  returnIndent + '    \'</div>\'',
  returnIndent + '  ].join("");',
  returnIndent + '}',
  returnIndent + 'var r8zCardOperationPanelHtml = [',
  returnIndent + '  \'<!-- ' + marker + '_PANEL -->\',',
  returnIndent + '  \'<div class="aicm-core-card" data-r8z-manager-major-card-operation-panel="1" style="margin:12px 0;">\',',
  returnIndent + '  \'  <p class="aicm-eyebrow">登録済み大項目 操作</p>\',',
  returnIndent + '  \'  <h3>選択操作</h3>\',',
  returnIndent + '  \'  <p class="aicm-selected-note">選択 \' + String(r8zCardSelectedCount) + \' / 未送信 \' + String(r8zCardEligibleCount) + \' / 全件 \' + String(r8zCardAllRows.length) + \'</p>\',',
  returnIndent + '  \'  <div class="aicm-dashboard-action-row">\',',
  returnIndent + '  \'    <button type="button" data-core-action="v10l-c1b-major-open-handoff-confirm">課長へ送る</button>\',',
  returnIndent + '  \'    <button type="button" data-core-action="v10l-c1b-major-open-delete-confirm">削除</button>\',',
  returnIndent + '  \'    <button type="button" data-core-action="v10l-c1b-major-select-all">全件選択</button>\',',
  returnIndent + '  \'    <button type="button" data-core-action="v10l-c1b-major-clear">解除</button>\',',
  returnIndent + '  \'  </div>\',',
  returnIndent + '  r8zCardConfirmHtml,',
  returnIndent + '  \'</div>\'',
  returnIndent + '].join("");',
  returnIndent + '// ' + marker + '_STATE_END'
];

lines.splice(returnIdx, 0, ...preReturnBlock);

if (registeredIdx >= returnIdx) {
  mapIdx += preReturnBlock.length;
  firstOldButtonIdx += preReturnBlock.length;
  for (let i = 0; i < oldButtonIdxs.length; i += 1) oldButtonIdxs[i] += preReturnBlock.length;
}

const titleIdxAfterInsert = findLineIndex(line => line.includes('登録済み大項目'));
if (titleIdxAfterInsert < 0) throw new Error('REGISTERED_MAJOR_TITLE_LINE_NOT_FOUND_AFTER_INSERT');

lines.splice(
  titleIdxAfterInsert + 1,
  0,
  arrayItemIndent + 'r8zCardOperationPanelHtml,'
);

if (mapIdx > titleIdxAfterInsert) mapIdx += 1;
if (firstOldButtonIdx > titleIdxAfterInsert) firstOldButtonIdx += 1;
for (let i = 0; i < oldButtonIdxs.length; i += 1) {
  if (oldButtonIdxs[i] > titleIdxAfterInsert) oldButtonIdxs[i] += 1;
}

const mapInitBlock = [
  mapIndent + '// ' + marker + '_CARD_ROW_START',
  mapIndent + 'var r8zCardMajorId = typeof aicmV10lC1bMajorId === "function" ? aicmV10lC1bMajorId(row) : "";',
  mapIndent + 'var r8zCardSelectable = typeof aicmV10lC1bIsPendingMajorRow === "function" ? aicmV10lC1bIsPendingMajorRow(row) : true;',
  mapIndent + 'var r8zCardCheckedAttr = r8zCardMajorId && r8zCardSelectedIds[r8zCardMajorId] ? " checked" : "";',
  mapIndent + 'var r8zCardDisabledAttr = r8zCardSelectable ? "" : " disabled";',
  mapIndent + '// ' + marker + '_CARD_ROW_END'
];

lines.splice(mapIdx + 1, 0, ...mapInitBlock);

if (firstOldButtonIdx > mapIdx) firstOldButtonIdx += mapInitBlock.length;
for (let i = 0; i < oldButtonIdxs.length; i += 1) {
  if (oldButtonIdxs[i] > mapIdx) oldButtonIdxs[i] += mapInitBlock.length;
}

const oldSet = new Set(oldButtonIdxs);
const patchedLines = [];
let insertedCheckbox = false;
let removedOldButtonLines = 0;

for (let i = 0; i < lines.length; i += 1) {
  if (oldSet.has(i)) {
    removedOldButtonLines += 1;

    if (!insertedCheckbox) {
      patchedLines.push(
        arrayItemIndent + '\'    <label class="aicm-selected-note" style="display:inline-flex;align-items:center;gap:8px;"><input type="checkbox" data-core-action="v10l-c1b-major-toggle" data-pmlw-major-id="\' + escapeHtml(r8zCardMajorId) + \'"\' + r8zCardCheckedAttr + r8zCardDisabledAttr + \'> 選択</label>\','
      );
      insertedCheckbox = true;
    }

    continue;
  }

  patchedLines.push(lines[i]);
}

lines = patchedLines;
body = lines.join('\n');

if (!insertedCheckbox) throw new Error('CHECKBOX_LINE_NOT_INSERTED');
if (removedOldButtonLines < 1) throw new Error('NO_OLD_CARD_BUTTON_LINES_REMOVED');
if (body === originalBody) throw new Error('TARGET_FUNCTION_BODY_UNCHANGED');

src = src.slice(0, fn.start) + body + src.slice(fn.close + 1);

fn = findFunctionRange(src, 'aicmRenderManagerMajorRows');

const verify = [];
verify.push('AICompanyManager V10L-C1E verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=NO');
verify.push('');
verify.push('TARGET_FUNCTION=aicmRenderManagerMajorRows');
verify.push('TARGET_FUNCTION_LINES=' + fn.startLine + '-' + fn.endLine);
verify.push('PATCH_MARKER_COUNT=' + count(fn.text, marker));
verify.push('REMOVED_OLD_CARD_BUTTON_LINES=' + removedOldButtonLines);
verify.push('OLD_HANDOFF_ACTION_IN_TARGET=' + count(fn.text, 'data-core-action="pmlw-major-leader-handoff"'));
verify.push('CARD_CHECKBOX_COUNT=' + count(fn.text, 'type="checkbox"'));
verify.push('OPERATION_PANEL_ACTION_COUNT=' + count(fn.text, 'v10l-c1b-major-open-handoff-confirm'));
verify.push('DELETE_PANEL_ACTION_COUNT=' + count(fn.text, 'v10l-c1b-major-open-delete-confirm'));
verify.push('SELECT_ALL_ACTION_COUNT=' + count(fn.text, 'v10l-c1b-major-select-all'));
verify.push('CLEAR_ACTION_COUNT=' + count(fn.text, 'v10l-c1b-major-clear'));
verify.push('HELPER_MARKER_COUNT=' + count(src, 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_HELPER_START'));
verify.push('ROUTE_MARKER_COUNT=' + count(src, 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_ACTION_ROUTE_START'));

if (count(fn.text, marker) < 1) throw new Error('PATCH_MARKER_MISSING');
if (count(fn.text, 'data-core-action="pmlw-major-leader-handoff"') !== 0) throw new Error('OLD_HANDOFF_ACTION_STILL_IN_TARGET');
if (count(fn.text, 'type="checkbox"') < 1) throw new Error('CARD_CHECKBOX_MISSING');
if (count(fn.text, 'v10l-c1b-major-open-handoff-confirm') < 1) throw new Error('OPERATION_PANEL_HANDOFF_ACTION_MISSING');
if (count(fn.text, 'v10l-c1b-major-open-delete-confirm') < 1) throw new Error('OPERATION_PANEL_DELETE_ACTION_MISSING');

fs.writeFileSync(extractOut, fn.text + '\n');
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
