import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let core = fs.readFileSync(coreFile, 'utf8');
const before = core;

const marker = 'AICM_AXU_MAINT_R2_PMLW_ROWS_PARAM_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionStart(src, name) {
  const targets = [
    'function ' + name + '(',
    'function ' + name + ' (',
    'async function ' + name + '(',
    'async function ' + name + ' ('
  ];
  let best = -1;
  for (const t of targets) {
    const i = src.indexOf(t);
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }
  return best;
}

function findFunctionRange(src, name) {
  const start = findFunctionStart(src, name);
  if (start < 0) return null;

  const open = src.indexOf('{', start);
  if (open < 0) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) {
      return { start, end: i + 1, text: src.slice(start, i + 1) };
    }
  }

  return null;
}

const range = findFunctionRange(core, 'renderPmlwMajorRows');

if (!range) {
  console.error('renderPmlwMajorRows function not found');
  process.exit(1);
}

if (!range.text.includes('renderPmlwMajorRowsBaseAxuR1B')) {
  console.error('renderPmlwMajorRows wrapper does not call renderPmlwMajorRowsBaseAxuR1B');
  process.exit(1);
}

// 保守性優先:
// - wrapperは rows を受け取り base へ渡すだけ
// - fallback panelや文字列ナビは使わない
// - 既存base内の「課長へ送る」列を正本表示とする
const replacement = [
  'function renderPmlwMajorRows(rows) {',
  '    // ' + marker,
  '    var safeRows = Array.isArray(rows) ? rows : [];',
  '    return renderPmlwMajorRowsBaseAxuR1B(safeRows);',
  '  }'
].join('\n');

core = core.slice(0, range.start) + replacement + core.slice(range.end);

fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== before));
console.log('markerCount=' + String(countText(core, marker)));
console.log('wrapperSignatureCount=' + String(countText(core, 'function renderPmlwMajorRows(rows)')));
console.log('baseCallWithRowsCount=' + String(countText(core, 'renderPmlwMajorRowsBaseAxuR1B(safeRows)')));
console.log('baseFunctionCount=' + String(countText(core, 'function renderPmlwMajorRowsBaseAxuR1B')));
console.log('taskLedgerRouteCount=' + String(countText(core, 'state.screen === "task-ledger"')));
console.log('canonicalNavButtonCount=' + String(countText(core, 'data-core-action="go" data-screen="task-ledger"')));
console.log('leaderHandoffButtonCount=' + String(countText(core, 'pmlw-major-leader-handoff')));
console.log('standalonePanelCount=' + String(countText(core, 'aicmAxuR1BLeaderHandoffStandalonePanel')));
console.log('broadClickMarkerCount=' + String(countText(core, 'AICM_AXU_R1D_BROAD_CLICK_TARGET')));
console.log('textNavMarkerCount=' + String(countText(core, 'AICM_AXU_R1D_TASK_LEDGER_TEXT_NAV')));
console.log('badLiteralNewlineCount=' + String(
  countText(core, ",\\n      '") +
  countText(core, ",\\n        '") +
  countText(core, ",\\n          '") +
  countText(core, ",\\n            '")
));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
