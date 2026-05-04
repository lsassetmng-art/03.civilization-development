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
    open,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

const marker = 'AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_REPAIR1_SAFE_SELECTED_IDS';

let fn = findFunctionRange(src, 'aicmRenderManagerMajorRows');
let body = fn.text;

if (!body.includes('AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_PATCH')) {
  throw new Error('C1E_CARD_PATCH_MARKER_NOT_FOUND');
}

if (!body.includes(marker)) {
  const oldSelectedLine = /var r8zCardSelectedIds = r8zCardSelectionState\.selectedIds \|\| \{\};/;
  const newSelectedLine = [
    'var r8zCardSelectedIds = r8zCardSelectionState && r8zCardSelectionState.selectedIds && typeof r8zCardSelectionState.selectedIds === "object"',
    '  ? r8zCardSelectionState.selectedIds',
    '  : {};',
    '// ' + marker,
    'function r8zCardIsSelectedMajorId(id) {',
    '  return !!(r8zCardSelectedIds && typeof r8zCardSelectedIds === "object" && id && r8zCardSelectedIds[id]);',
    '}'
  ].join('\n');

  if (oldSelectedLine.test(body)) {
    body = body.replace(oldSelectedLine, newSelectedLine);
  } else {
    const fallbackLine = /var r8zCardSelectedIds\s*=.*?;/;
    if (!fallbackLine.test(body)) {
      throw new Error('R8Z_CARD_SELECTED_IDS_DECLARATION_NOT_FOUND');
    }
    body = body.replace(fallbackLine, newSelectedLine);
  }
}

body = body.replace(
  /return !!\(id && r8zCardSelectedIds\[id\]\);/g,
  'return r8zCardIsSelectedMajorId(id);'
);

body = body.replace(
  /var r8zCardCheckedAttr = r8zCardMajorId && r8zCardSelectedIds\[r8zCardMajorId\] \? " checked" : "";/g,
  'var r8zCardCheckedAttr = r8zCardIsSelectedMajorId(r8zCardMajorId) ? " checked" : "";'
);

body = body.replace(
  /r8zCardMajorId && r8zCardSelectedIds\[r8zCardMajorId\]/g,
  'r8zCardIsSelectedMajorId(r8zCardMajorId)'
);

if (!body.includes('function r8zCardIsSelectedMajorId(id)')) {
  throw new Error('SAFE_SELECTED_HELPER_NOT_INSERTED');
}

if (body.includes('return !!(id && r8zCardSelectedIds[id]);')) {
  throw new Error('UNSAFE_SELECTED_ID_LOOKUP_REMAINS_IN_SELECTED_COUNT');
}

if (body.includes('r8zCardMajorId && r8zCardSelectedIds[r8zCardMajorId]')) {
  throw new Error('UNSAFE_SELECTED_ID_LOOKUP_REMAINS_IN_CHECKED_ATTR');
}

src = src.slice(0, fn.start) + body + src.slice(fn.close + 1);
fn = findFunctionRange(src, 'aicmRenderManagerMajorRows');

const verify = [];
verify.push('AICompanyManager V10L-C1E repair1 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=NO');
verify.push('');
verify.push('TARGET_FUNCTION=aicmRenderManagerMajorRows');
verify.push('TARGET_FUNCTION_LINES=' + fn.startLine + '-' + fn.endLine);
verify.push('REPAIR_MARKER_COUNT=' + count(fn.text, marker));
verify.push('SAFE_HELPER_COUNT=' + count(fn.text, 'function r8zCardIsSelectedMajorId(id)'));
verify.push('UNSAFE_SELECTED_COUNT_LOOKUP=' + count(fn.text, 'return !!(id && r8zCardSelectedIds[id]);'));
verify.push('UNSAFE_CHECKED_ATTR_LOOKUP=' + count(fn.text, 'r8zCardMajorId && r8zCardSelectedIds[r8zCardMajorId]'));
verify.push('OLD_HANDOFF_ACTION_IN_TARGET=' + count(fn.text, 'data-core-action="pmlw-major-leader-handoff"'));
verify.push('CARD_CHECKBOX_COUNT=' + count(fn.text, 'type="checkbox"'));
verify.push('OPERATION_PANEL_ACTION_COUNT=' + count(fn.text, 'v10l-c1b-major-open-handoff-confirm'));
verify.push('DELETE_PANEL_ACTION_COUNT=' + count(fn.text, 'v10l-c1b-major-open-delete-confirm'));

if (count(fn.text, marker) < 1) throw new Error('REPAIR_MARKER_MISSING');
if (count(fn.text, 'function r8zCardIsSelectedMajorId(id)') !== 1) throw new Error('SAFE_HELPER_COUNT_NOT_1');
if (count(fn.text, 'return !!(id && r8zCardSelectedIds[id]);') !== 0) throw new Error('UNSAFE_SELECTED_COUNT_LOOKUP_REMAINS');
if (count(fn.text, 'r8zCardMajorId && r8zCardSelectedIds[r8zCardMajorId]') !== 0) throw new Error('UNSAFE_CHECKED_ATTR_LOOKUP_REMAINS');
if (count(fn.text, 'type="checkbox"') < 1) throw new Error('CARD_CHECKBOX_MISSING');
if (count(fn.text, 'v10l-c1b-major-open-handoff-confirm') < 1) throw new Error('OPERATION_PANEL_HANDOFF_ACTION_MISSING');
if (count(fn.text, 'v10l-c1b-major-open-delete-confirm') < 1) throw new Error('OPERATION_PANEL_DELETE_ACTION_MISSING');

fs.writeFileSync(extractOut, fn.text + '\n');
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
