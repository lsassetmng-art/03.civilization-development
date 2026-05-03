import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const repairMarker = 'AICM_WORKER_RUNTIME_UI_NAV_AXT_R1_V1';
const screenCode = 'worker-runtime-request';

function countText(needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionRange(functionName) {
  const start = src.indexOf(`function ${functionName}(`);
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

    if (depth === 0) return { start, open, end: i + 1 };
  }

  return null;
}

function replaceFunction(functionName, replacementBody) {
  const range = findFunctionRange(functionName);
  if (!range) return false;
  src = src.slice(0, range.start) + replacementBody + src.slice(range.end);
  return true;
}

function insertIntoFunction(functionName, mutator) {
  const range = findFunctionRange(functionName);
  if (!range) return false;

  const fn = src.slice(range.start, range.end);
  const next = mutator(fn);

  if (!next || next === fn) return false;

  src = src.slice(0, range.start) + next + src.slice(range.end);
  return true;
}

function workerRuntimeButtonLine(indent) {
  return indent + `'  <button type="button" data-core-action="go" data-screen="worker-runtime-request">Worker実行依頼</button>',`;
}

let navInserted = src.includes('data-screen="worker-runtime-request"');

if (!src.includes(repairMarker)) {
  const renderShellIdx = src.indexOf('function renderShell(');
  if (renderShellIdx >= 0) {
    src = src.slice(0, renderShellIdx) + '// ' + repairMarker + '\n' + src.slice(renderShellIdx);
  }
}

// Strategy 1: insert into renderShell nav before </nav>.
if (!navInserted) {
  navInserted = insertIntoFunction('renderShell', (fn) => {
    if (fn.includes('data-screen="worker-runtime-request"')) return fn;

    const navCloseRegex = /(\n[ \t]*['"`][ \t]*<\/nav>[ \t]*['"`][ \t]*,?)/;
    if (!navCloseRegex.test(fn)) return fn;

    return fn.replace(navCloseRegex, '\n' + workerRuntimeButtonLine('      ') + '$1');
  });
}

// Strategy 2: insert near existing Worker配置 / placement-new button anywhere.
if (!src.includes('data-screen="worker-runtime-request"')) {
  const placementLineRegex = /(\n[^\n]*data-screen="placement-new"[^\n]*\n)/;
  if (placementLineRegex.test(src)) {
    src = src.replace(placementLineRegex, '$1' + workerRuntimeButtonLine('      ') + '\n');
    navInserted = true;
  }
}

// Strategy 3: add a dashboard card by replacing renderDashboard if function exists and no entry exists.
// This is not a wrapper/postprocess; it is normal render output.
if (!src.includes('data-screen="worker-runtime-request"')) {
  insertIntoFunction('renderDashboard', (fn) => {
    if (fn.includes('data-screen="worker-runtime-request"')) return fn;

    const shellRegex = /return renderShell\(\[/;
    if (!shellRegex.test(fn)) return fn;

    return fn.replace(shellRegex, [
      'return renderShell([',
      "      '<section class=\"aicm-core-card aicm-operation-card\">',",
      "      '  <p class=\"aicm-eyebrow\">Worker実行</p>',",
      "      '  <h2>配置済みWorkerに作業依頼</h2>',",
      "      '  <p class=\"aicm-selected-note\">AIWorkerOS Runtime Executionへ確認画面経由で依頼します。</p>',",
      "      '  <div class=\"aicm-dashboard-action-row\">',",
      "      '    <button type=\"button\" data-core-action=\"go\" data-screen=\"worker-runtime-request\">Worker実行依頼</button>',",
      "      '  </div>',",
      "      '</section>',"
    ].join('\n'));
  });
}

fs.writeFileSync(coreFile, src, 'utf8');

console.log('coreChanged=' + String(src !== before));
console.log('repairMarkerCount=' + String(countText(repairMarker)));
console.log('axtMarkerCount=' + String(countText('AICM_WORKER_RUNTIME_UI_AXT_V1')));
console.log('screenBranchCount=' + String(countText('state.screen === "worker-runtime-request"')));
console.log('renderFunctionCount=' + String(countText('function renderWorkerRuntimeRequest')));
console.log('confirmFunctionCount=' + String(countText('function renderWorkerRuntimeConfirm')));
console.log('executeFunctionCount=' + String(countText('async function executeWorkerRuntimeConfirm')));
console.log('endpointRefCount=' + String(countText('/api/aicm/v2/worker-runtime/request')));
console.log('navButtonCount=' + String(countText('data-screen="worker-runtime-request"')));
console.log('tokenLeakCount=' + String(countText('PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCount=' + String(countText('async async function')));
