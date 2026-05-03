import fs from 'node:fs';

const file = process.env.CORE;
let src = fs.readFileSync(file, 'utf8');
const before = src;

const marker = 'AICM_TASK_LEDGER_FRESH_CONTEXT_NAV_CANONICAL_V1';

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

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
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
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
    if (depth === 0) return i;
  }
  return -1;
}

function findFunction(source, name) {
  const re = new RegExp('function\\s+' + name + '\\s*\\(');
  const m = re.exec(source);
  if (!m) return null;
  const start = m.index;
  const open = source.indexOf('{', start);
  if (open < 0) return null;
  const close = findMatchingBrace(source, open);
  if (close < 0) return null;
  return { start, end: close + 1, text: source.slice(start, close + 1) };
}

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

let goRange = findFunction(src, 'go');
if (!goRange) {
  console.error('function go not found');
  process.exit(1);
}

const newGo = `function go(screen) {
    // ${marker}
    var nextScreen = String(screen || "dashboard");

    state.screen = nextScreen;
    state.errorMessage = "";

    if (nextScreen !== "task-ledger") {
      render();
      return;
    }

    render();

    if (state.__taskLedgerContextRefreshing) {
      return;
    }

    if (typeof loadContext !== "function") {
      render();
      return;
    }

    state.__taskLedgerContextRefreshing = true;

    Promise.resolve()
      .then(function () {
        return loadContext();
      })
      .catch(function (error) {
        state.errorMessage = error && error.message ? error.message : "部門別タスク台帳の最新情報取得に失敗しました。";
      })
      .then(function () {
        state.__taskLedgerContextRefreshing = false;
        state.screen = "task-ledger";
        render();
      });
  }`;

src = src.slice(0, goRange.start) + newGo + src.slice(goRange.end);

fs.writeFileSync(file, src, 'utf8');

const after = fs.readFileSync(file, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('markerCount=' + countText(after, marker));
console.log('goFunctionCount=' + (after.match(/function\s+go\s*\(/g) || []).length);
console.log('loadContextRefCount=' + countText(after, 'loadContext()'));
console.log('taskLedgerRefreshFlagCount=' + countText(after, '__taskLedgerContextRefreshing'));
console.log('legacyR10HelperCount=' + (after.match(/function\s+aicmAxuCsvR10RenderPmlwMajorRows\s*\(/g) || []).length);
console.log('rowsHelperCount=' + (after.match(/function\s+aicmGetManagerMajorRowsForSelectedCompany\s*\(/g) || []).length);
console.log('renderHelperCount=' + (after.match(/function\s+aicmRenderManagerMajorRows\s*\(/g) || []).length);
console.log('tokenLeakCountCore=' + countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN'));
console.log('asyncAsyncCountCore=' + countText(after, 'async async function'));
