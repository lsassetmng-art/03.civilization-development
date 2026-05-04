import fs from 'fs';

const [,, corePath, verifyOut, extractOut, marker, bridgeFunction] = process.argv;
const src = fs.readFileSync(corePath, 'utf8');

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

const markerCount = count(src, marker);
const startCount = count(src, marker + '_START');
const endCount = count(src, marker + '_END');

const bridge = findFunctionRange(src, bridgeFunction);

const markerStart = bridge.text.indexOf(marker + '_START');
const markerEnd = bridge.text.indexOf(marker + '_END');

let insertedBlock = '';
if (markerStart >= 0 && markerEnd > markerStart) {
  insertedBlock = bridge.text.slice(markerStart, markerEnd);
}

const verify = [];
verify.push('AICompanyManager V10L-C2D9R1 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('CORE_PATCH=NO_NEW_PATCH');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('BRIDGE_FUNCTION=' + bridgeFunction);
verify.push('BRIDGE_LINES=' + bridge.startLine + '-' + bridge.endLine);
verify.push('C2D9_MARKER_COUNT=' + markerCount);
verify.push('C2D9_START_COUNT=' + startCount);
verify.push('C2D9_END_COUNT=' + endCount);
verify.push('ROUTE_PREFIX_GATE_COUNT=' + count(bridge.text, 'aicmR8zC2d9Action.indexOf("r8z-mgr-major-card-route-") === 0'));
verify.push('HANDLER_CALL_COUNT_IN_BRIDGE=' + count(bridge.text, 'aicmR8zMgrMajorCardHandleAction('));
verify.push('FETCH_IN_INSERTED_BLOCK=' + count(insertedBlock, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_BLOCK=' + count(insertedBlock, 'XMLHttpRequest'));
verify.push('C2D5R2A_DEBUG_MARKER_COUNT=' + count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D5R2A_ROUTE_APPLY_RUNTIME_DEBUG_RETRY'));
verify.push('C2D7_HANDLER_DEBUG_MARKER_COUNT=' + count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D7_HANDLER_ENTRY_RUNTIME_DEBUG'));
verify.push('EXTRACT_OUT=' + extractOut);

if (markerCount !== 2) throw new Error('C2D9_MARKER_COUNT_NOT_2_PATCH_NOT_CONFIRMED');
if (startCount !== 1) throw new Error('C2D9_START_COUNT_NOT_1');
if (endCount !== 1) throw new Error('C2D9_END_COUNT_NOT_1');
if (count(bridge.text, 'aicmR8zC2d9Action.indexOf("r8z-mgr-major-card-route-") === 0') !== 1) {
  throw new Error('ROUTE_PREFIX_GATE_NOT_1');
}
if (count(insertedBlock, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_INSERTED_BLOCK');
if (count(insertedBlock, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_FOUND_IN_INSERTED_BLOCK');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');

const extract = [];
extract.push('AICompanyManager V10L-C2D9R1 bridge callback extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=NO_NEW_PATCH');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('BRIDGE_FUNCTION=' + bridgeFunction);
extract.push('BRIDGE_LINES=' + bridge.startLine + '-' + bridge.endLine);
extract.push('');
extract.push(bridge.text);
fs.writeFileSync(extractOut, extract.join('\n') + '\n');
