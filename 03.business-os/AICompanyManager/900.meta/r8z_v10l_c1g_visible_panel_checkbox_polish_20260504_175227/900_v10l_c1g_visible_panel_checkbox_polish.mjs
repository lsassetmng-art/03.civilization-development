import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

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
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_SELECTION_C1G_VISIBLE_PANEL_POLISH';

if (!src.includes('AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_HELPER_START')) {
  throw new Error('C1F_HELPER_NOT_FOUND');
}

let fn = findFunctionRange(src, 'aicmRenderManagerMajorRows');
let body = fn.text;

if (!body.includes('aicmR8zMgrMajorCardRenderCheckbox')) {
  throw new Error('C1F_CHECKBOX_RENDER_CALL_NOT_FOUND');
}

if (!body.includes(marker)) {
  let lines = body.split(/\r?\n/);

  function findLineIndex(predicate, from = 0) {
    for (let i = from; i < lines.length; i += 1) {
      if (predicate(lines[i], i)) return i;
    }
    return -1;
  }

  // 既存の誤位置パネル呼び出しを一旦削除して、実表示されるページング直前へ入れ直す
  lines = lines.filter(function (line) {
    return !line.includes('aicmR8zMgrMajorCardRenderOperationPanel(rows),') &&
      !line.includes('AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_RENDERER_PANEL') &&
      !line.includes('AICM_R8Z_MGR_MAJOR_CARD_SELECTION_C1G_VISIBLE_PANEL_POLISH_PANEL');
  });

  const registeredIdx = findLineIndex(function (line) {
    return line.includes('登録済み大項目');
  });

  if (registeredIdx < 0) throw new Error('REGISTERED_MAJOR_TITLE_LINE_NOT_FOUND');

  let pagingIdx = -1;
  for (let i = registeredIdx; i < lines.length; i += 1) {
    if (lines[i].includes('前ページ') || lines[i].includes('ページ 1') || lines[i].includes('次ページ')) {
      pagingIdx = i;
      break;
    }
  }

  // ページングが見つかればその直前、なければタイトル直後
  const insertIdx = pagingIdx >= 0 ? pagingIdx : registeredIdx + 1;
  const indent = (lines[insertIdx].match(/^(\s*)/) || ['', ''])[1];

  lines.splice(
    insertIdx,
    0,
    indent + '\'<!-- ' + marker + '_PANEL -->\',',
    indent + 'aicmR8zMgrMajorCardRenderOperationPanel(rows),'
  );

  body = lines.join('\n');
}

// checkboxの見た目を調整。helper側のHTMLを置換する。
let helperStart = src.indexOf('function aicmR8zMgrMajorCardRenderCheckbox');
if (helperStart < 0) throw new Error('CHECKBOX_HELPER_NOT_FOUND');

let helperOpen = findOpenBrace(src, helperStart);
let helperClose = findMatchingBrace(src, helperOpen);
if (helperOpen < 0 || helperClose < 0) throw new Error('CHECKBOX_HELPER_BOUNDARY_NOT_FOUND');

let checkboxHelper = src.slice(helperStart, helperClose + 1);

checkboxHelper = checkboxHelper.replace(
  /'<label class="aicm-selected-note" style="display:inline-flex;align-items:center;gap:8px;margin-top:12px;">'/,
  '\'<label class="aicm-selected-note" style="display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 12px;border:1px solid #dbe3f0;border-radius:12px;background:#f8fafc;font-size:14px;line-height:1;white-space:nowrap;">\''
);

checkboxHelper = checkboxHelper.replace(
  /'<input type="checkbox" data-core-action="r8z-mgr-major-card-toggle" data-r8z-mgr-major-id="' \+ escapeHtml\(id\) \+ '"' \+ checked \+ disabled \+ '>'/,
  '\'<input type="checkbox" style="width:18px;height:18px;min-width:18px;margin:0;" data-core-action="r8z-mgr-major-card-toggle" data-r8z-mgr-major-id="\' + escapeHtml(id) + \'"\' + checked + disabled + \'>\''
);

src = src.slice(0, helperStart) + checkboxHelper + src.slice(helperClose + 1);

// renderer body を反映
fn = findFunctionRange(src, 'aicmRenderManagerMajorRows');
src = src.slice(0, fn.start) + body + src.slice(fn.close + 1);
fn = findFunctionRange(src, 'aicmRenderManagerMajorRows');

const verify = [];
verify.push('AICompanyManager V10L-C1G verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=NO');
verify.push('');
verify.push('TARGET_FUNCTION=aicmRenderManagerMajorRows');
verify.push('TARGET_FUNCTION_LINES=' + fn.startLine + '-' + fn.endLine);
verify.push('C1G_MARKER_COUNT=' + count(fn.text, marker));
verify.push('OPERATION_PANEL_CALL_IN_TARGET=' + count(fn.text, 'aicmR8zMgrMajorCardRenderOperationPanel(rows)'));
verify.push('CHECKBOX_RENDER_CALL_IN_TARGET=' + count(fn.text, 'aicmR8zMgrMajorCardRenderCheckbox'));
verify.push('OLD_HANDOFF_ACTION_IN_TARGET=' + count(fn.text, 'data-core-action="pmlw-major-leader-handoff"'));
verify.push('CHECKBOX_HELPER_STYLE_POLISHED=' + count(src, 'white-space:nowrap'));
verify.push('CHECKBOX_INPUT_STYLE_POLISHED=' + count(src, 'width:18px;height:18px'));

if (count(fn.text, marker) < 1) throw new Error('C1G_MARKER_MISSING');
if (count(fn.text, 'aicmR8zMgrMajorCardRenderOperationPanel(rows)') !== 1) throw new Error('OPERATION_PANEL_CALL_NOT_EXACTLY_1');
if (count(fn.text, 'aicmR8zMgrMajorCardRenderCheckbox') < 1) throw new Error('CHECKBOX_RENDER_CALL_MISSING');
if (count(fn.text, 'data-core-action="pmlw-major-leader-handoff"') !== 0) throw new Error('OLD_HANDOFF_ACTION_STILL_IN_TARGET');
if (count(src, 'white-space:nowrap') < 1) throw new Error('CHECKBOX_LABEL_STYLE_NOT_POLISHED');
if (count(src, 'width:18px;height:18px') < 1) throw new Error('CHECKBOX_INPUT_STYLE_NOT_POLISHED');

fs.writeFileSync(extractOut, fn.text + '\n');
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
