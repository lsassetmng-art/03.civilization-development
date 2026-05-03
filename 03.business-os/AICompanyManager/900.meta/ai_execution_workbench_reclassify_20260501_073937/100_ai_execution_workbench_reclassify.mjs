import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_AI_EXECUTION_WORKBENCH_AXT_R2W_V1';

function countText(needle) {
  return String(src || '').split(needle).length - 1;
}

function replaceAllText(from, to) {
  src = src.split(from).join(to);
}

/*
 * Keep screen code and function names stable for maintainability.
 * Only reclassify user-facing labels and add a canon marker.
 */
if (!src.includes(marker)) {
  const anchor = 'function renderWorkerRuntimeRequest';
  const idx = src.indexOf(anchor);
  if (idx >= 0) {
    src = src.slice(0, idx) +
      '// ' + marker + '\n' +
      '// AICompanyManager normal execution is ledger/PMLW based.\n' +
      '// This screen remains as AI Execution Workbench for exception handling, smoke testing, and future AI Operation Desk reuse.\n' +
      src.slice(idx);
  }
}

/*
 * User-facing rename.
 * Endpoint and internal names intentionally remain worker-runtime/request.
 */
replaceAllText('Worker実行依頼', 'AI実行Workbench');
replaceAllText('WORKER実行依頼', 'AI実行Workbench');
replaceAllText('配置済みWorkerに作業を依頼', '配置済みAI/Workerに作業を依頼');
replaceAllText('配置済みWorkerに作業依頼', '配置済みAI/Workerに作業依頼');
replaceAllText('Worker実行', 'AI実行');
replaceAllText('実行Worker', '実行AI/Worker');
replaceAllText('Workerを選択', 'AI/Workerを選択');
replaceAllText('配置済みWorkerがありません', '配置済みAI/Workerがありません');
replaceAllText('この会社に配置済みWorkerがありません。先に課変更で従業員Workerを配置してください。', 'この会社に配置済みAI/Workerがありません。先に課変更で従業員Workerを配置してください。');
replaceAllText('Worker実行依頼を確定しますか？', 'AI実行Workbenchから実行依頼を確定しますか？');
replaceAllText('Worker実行依頼を作成しました。', 'AI実行Workbenchから実行依頼を作成しました。');
replaceAllText('Worker実行依頼に失敗しました。', 'AI実行依頼に失敗しました。');

/*
 * Add explanatory copy near token sentence if the old sentence exists.
 */
const tokenLine = 'AIWorkerOS tokenはブラウザには出しません。確定後、AICompanyManager serverが中継します。';
const workbenchLine = 'AIWorkerOS tokenはブラウザには出しません。確定後、AICompanyManager serverが中継します。通常業務は部門別タスク台帳から連続実行し、この画面は補助/例外/検証用Workbenchです。';
if (src.includes(tokenLine)) {
  replaceAllText(tokenLine, workbenchLine);
}

fs.writeFileSync(coreFile, src, 'utf8');

console.log('coreChanged=' + String(src !== before));
console.log('markerCount=' + String(countText(marker)));
console.log('workbenchLabelCount=' + String(countText('AI実行Workbench')));
console.log('oldWorkerRuntimeLabelCount=' + String(countText('Worker実行依頼')));
console.log('screenCodeCount=' + String(countText('worker-runtime-request')));
console.log('endpointRefCount=' + String(countText('/api/aicm/v2/worker-runtime/request')));
console.log('renderFunctionCount=' + String(countText('function renderWorkerRuntimeRequest')));
console.log('confirmFunctionCount=' + String(countText('function renderWorkerRuntimeConfirm')));
console.log('executeFunctionCount=' + String(countText('async function executeWorkerRuntimeConfirm')));
console.log('tokenLeakCount=' + String(countText('PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCount=' + String(countText('async async function')));
