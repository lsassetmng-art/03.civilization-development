import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1';

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

    if (depth === 0) return { start, end: i + 1 };
  }

  return null;
}

function replaceFunction(functionName, replacement) {
  const range = findFunctionRange(functionName);
  if (!range) {
    console.error('Function not found: ' + functionName);
    process.exit(1);
  }

  src = src.slice(0, range.start) + replacement + src.slice(range.end);
}

/*
 * 1. State-driven confirmation transition.
 */
replaceFunction('confirmWorkerRuntimeRequestFromForm', `function confirmWorkerRuntimeRequestFromForm() {
    // ${marker}
    try {
      state.pendingWorkerRuntimeRequest = buildWorkerRuntimePendingPayload();
      state.screen = "worker-runtime-confirm";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "確認画面を表示できません。");
      if (typeof render === "function") render();
    }
  }`);

/*
 * 2. Cancel returns to Workbench input screen.
 */
replaceFunction('cancelWorkerRuntimeConfirm', `function cancelWorkerRuntimeConfirm() {
    // ${marker}
    state.pendingWorkerRuntimeRequest = null;
    state.screen = "worker-runtime-request";
    if (typeof render === "function") render();
  }`);

/*
 * 3. Ensure render branch for confirmation screen exists.
 */
if (!src.includes('state.screen === "worker-runtime-confirm"')) {
  const anchor = '} else if (state.screen === "worker-runtime-request") {';

  if (src.includes(anchor)) {
    src = src.replace(
      anchor,
      `} else if (state.screen === "worker-runtime-confirm") {
      // ${marker}
      html = renderWorkerRuntimeConfirm();
    ` + anchor
    );
  } else {
    const fallbackAnchor = '} else if (state.screen === "task-ledger") {';
    if (!src.includes(fallbackAnchor)) {
      console.error('Render branch anchor not found');
      process.exit(1);
    }

    src = src.replace(
      fallbackAnchor,
      `} else if (state.screen === "worker-runtime-confirm") {
      // ${marker}
      html = renderWorkerRuntimeConfirm();
    ` + fallbackAnchor
    );
  }
}

/*
 * 4. Ensure click action branches exist.
 */
if (!src.includes('action === "worker-runtime-confirm"')) {
  const actionNeedle = '    var action = button.getAttribute("data-core-action") || "";';
  if (!src.includes(actionNeedle)) {
    console.error('Action variable anchor not found');
    process.exit(1);
  }

  src = src.replace(actionNeedle, actionNeedle + `

    // ${marker}
    if (action === "worker-runtime-confirm") {
      confirmWorkerRuntimeRequestFromForm();
      return;
    }

    if (action === "worker-runtime-execute") {
      executeWorkerRuntimeConfirm();
      return;
    }

    if (action === "worker-runtime-cancel") {
      cancelWorkerRuntimeConfirm();
      return;
    }`);
}

/*
 * 5. Ensure confirm button exists in workbench input screen.
 */
if (!src.includes('data-core-action="worker-runtime-confirm"')) {
  console.error('Confirm button data-core-action missing');
  process.exit(1);
}

fs.writeFileSync(coreFile, src, 'utf8');

console.log('coreChanged=' + String(src !== before));
console.log('markerCount=' + String(countText(marker)));
console.log('confirmScreenBranchCount=' + String(countText('state.screen === "worker-runtime-confirm"')));
console.log('inputScreenBranchCount=' + String(countText('state.screen === "worker-runtime-request"')));
console.log('confirmActionCount=' + String(countText('action === "worker-runtime-confirm"')));
console.log('executeActionCount=' + String(countText('action === "worker-runtime-execute"')));
console.log('cancelActionCount=' + String(countText('action === "worker-runtime-cancel"')));
console.log('confirmButtonCount=' + String(countText('data-core-action="worker-runtime-confirm"')));
console.log('renderConfirmFunctionCount=' + String(countText('function renderWorkerRuntimeConfirm')));
console.log('pendingStateCount=' + String(countText('state.pendingWorkerRuntimeRequest')));
console.log('tokenLeakCount=' + String(countText('PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCount=' + String(countText('async async function')));
