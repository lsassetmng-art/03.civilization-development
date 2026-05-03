import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.argv[2];
const corePath = process.argv[3];
const serverPath = process.argv[4];
const cacheTag = process.argv[5];

if (!appRoot || !corePath || !serverPath || !cacheTag) {
  console.error('ERROR: args missing');
  process.exit(1);
}

let core = fs.readFileSync(corePath, 'utf8');
let server = fs.readFileSync(serverPath, 'utf8');

const OLD_R8O = 'AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_ACTION_HANDLER';
const OLD_V7 = 'AICM_R8_V7_CLEAN_DELETE_ACTION_HANDLER';
const MARK = 'AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER';

const OLD_R8O_START = '// ' + OLD_R8O + '_START';
const OLD_R8O_END = '// ' + OLD_R8O + '_END';
const OLD_V7_START = '// ' + OLD_V7 + '_START';
const OLD_V7_END = '// ' + OLD_V7 + '_END';

const HELPER_START = '// ' + MARK + '_HELPER_START';
const HELPER_END = '// ' + MARK + '_HELPER_END';
const HANDLER_START = '// ' + MARK + '_ACTION_HANDLER_START';
const HANDLER_END = '// ' + MARK + '_ACTION_HANDLER_END';

function count(text, needle) {
  return text.split(needle).length - 1;
}

function removeMarkedBlock(text, startMarker, endMarker) {
  const s = text.indexOf(startMarker);
  if (s < 0) return text;

  const e = text.indexOf(endMarker, s);
  if (e < 0) throw new Error('marked block end not found: ' + startMarker);

  return text.slice(0, s) + text.slice(e + endMarker.length);
}

function insertBeforeNeedle(text, needle, block, indent) {
  const idx = text.indexOf(needle);
  if (idx < 0) throw new Error('insert anchor not found: ' + needle);
  return text.slice(0, idx) + block.trimEnd() + '\n\n' + (indent || '') + text.slice(idx);
}

function lineIndexOf(text, re) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (re.test(lines[i])) return i + 1;
  }
  return 0;
}

const before = {
  oldR8O: count(core, OLD_R8O),
  oldV7: count(core, OLD_V7),
  clean2: count(core, MARK),
  helperResolve: count(core, 'function aicmResolveMajorDeleteActionTargetR8V7C2'),
  helperOpen: count(core, 'function aicmOpenMajorDeleteConfirmFromActionR8V7C2'),
  helperCancel: count(core, 'function aicmCancelMajorDeleteConfirmFromActionR8V7C2'),
  helperExecute: count(core, 'function aicmExecuteMajorDeleteConfirmFromActionR8V7C2'),
  deleteOpenText: count(core, 'pmlw-major-delete-open'),
  deleteCancelText: count(core, 'pmlw-major-delete-cancel'),
  deleteExecuteText: count(core, 'pmlw-major-delete-execute'),
  unsafeTargetCall: count(core, 'aicmOpenMajorItemDeleteConfirmR8P(target)'),
  openHelper: count(core, 'function aicmOpenMajorItemDeleteConfirmR8P'),
  cancelHelper: count(core, 'function aicmCancelMajorItemDeleteConfirmR8P'),
  executeHelper: count(core, 'async function aicmExecuteMajorItemDeleteConfirmR8P'),
  archiveRoute: count(core, '/api/aicm/v2/manager-major/archive'),
  v6cHelper: count(core, 'function aicmIsPendingManagerMajorRowR8V6'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, OLD_R8O_START, OLD_R8O_END);
core = removeMarkedBlock(core, OLD_V7_START, OLD_V7_END);
core = removeMarkedBlock(core, HELPER_START, HELPER_END);
core = removeMarkedBlock(core, HANDLER_START, HANDLER_END);

if (count(core, 'function aicmResolveMajorDeleteActionTargetR8V7C2') > 0) {
  throw new Error('unmarked V7-clean2 delete helper already exists; review required');
}

const helperBlock = `
${HELPER_START}
  function aicmResolveMajorDeleteActionTargetR8V7C2(ev, btn) {
    if (typeof aicmActionTargetSafe === "function") {
      var safeTarget = aicmActionTargetSafe(ev, btn);
      if (safeTarget && safeTarget.getAttribute) return safeTarget;
    }

    if (btn && btn.getAttribute) return btn;

    if (ev && ev.target) {
      if (ev.target.closest) {
        var closest = ev.target.closest("[data-core-action]");
        if (closest && closest.getAttribute) return closest;
      }

      if (ev.target.getAttribute) return ev.target;
    }

    return null;
  }

  function aicmOpenMajorDeleteConfirmFromActionR8V7C2(ev, btn) {
    var deleteTarget = aicmResolveMajorDeleteActionTargetR8V7C2(ev, btn);

    if (!deleteTarget || !deleteTarget.getAttribute) {
      setMessage("error", "削除対象のボタンを特定できません。");
      render();
      return;
    }

    if (typeof aicmOpenMajorItemDeleteConfirmR8P !== "function") {
      setMessage("error", "削除確認処理が見つかりません。");
      render();
      return;
    }

    aicmOpenMajorItemDeleteConfirmR8P(deleteTarget);
  }

  function aicmCancelMajorDeleteConfirmFromActionR8V7C2() {
    if (typeof aicmCancelMajorItemDeleteConfirmR8P === "function") {
      aicmCancelMajorItemDeleteConfirmR8P();
      return;
    }

    if (state) {
      state.managerMajorDeleteConfirm = null;
      state.screen = "task-ledger";
    }

    setMessage("ok", "削除をキャンセルしました。");
    render();
  }

  function aicmExecuteMajorDeleteConfirmFromActionR8V7C2() {
    if (typeof aicmExecuteMajorItemDeleteConfirmR8P === "function") {
      aicmExecuteMajorItemDeleteConfirmR8P();
      return;
    }

    setMessage("error", "削除確定処理が見つかりません。");
    render();
  }

  function aicmMoveMajorItemPageFromActionR8V7C2(delta) {
    if (typeof aicmMajorItemSetPageR8O === "function") {
      aicmMajorItemSetPageR8O(delta);
      return;
    }

    var current = Number(state.managerMajorPage || 1);
    if (!Number.isFinite(current) || current < 1) current = 1;
    state.managerMajorPage = Math.max(1, current + Number(delta || 0));
    render();
  }
${HELPER_END}
`;

const handlerBlock = `
${HANDLER_START}
    if (action === "pmlw-major-page-prev") {
      aicmMoveMajorItemPageFromActionR8V7C2(-1);
      return;
    }

    if (action === "pmlw-major-page-next") {
      aicmMoveMajorItemPageFromActionR8V7C2(1);
      return;
    }

    if (action === "pmlw-major-delete-open") {
      aicmOpenMajorDeleteConfirmFromActionR8V7C2(event, button);
      return;
    }

    if (action === "pmlw-major-delete-cancel") {
      aicmCancelMajorDeleteConfirmFromActionR8V7C2();
      return;
    }

    if (action === "pmlw-major-delete-execute") {
      aicmExecuteMajorDeleteConfirmFromActionR8V7C2();
      return;
    }
${HANDLER_END}
`;

core = insertBeforeNeedle(core, 'function handleRootChange', helperBlock, '');
core = insertBeforeNeedle(core, 'if (action === "task-ledger-refresh")', handlerBlock, '    ');

const newScriptRef = 'aicm-production-core.js?v=' + cacheTag;
server = server.replace(/aicm-production-core\.js\?v=[A-Za-z0-9_.:-]+/g, newScriptRef);

const htmlUpdates = [];
for (const name of fs.readdirSync(appRoot)) {
  if (!name.endsWith('.html') && !name.endsWith('.htm')) continue;

  const htmlPath = path.join(appRoot, name);
  let html = fs.readFileSync(htmlPath, 'utf8');
  const beforeHtml = html;

  html = html.replace(/aicm-production-core\.js\?v=[A-Za-z0-9_.:-]+/g, newScriptRef);

  if (html !== beforeHtml) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    htmlUpdates.push(htmlPath);
  }
}

const helperLine = lineIndexOf(core, /^\s*function\s+aicmResolveMajorDeleteActionTargetR8V7C2\s*\(/);
const handlerLine = lineIndexOf(core, /^\s*if\s*\(\s*action\s*===\s*"pmlw-major-delete-open"\s*\)/);
const refreshLine = lineIndexOf(core, /^\s*if\s*\(\s*action\s*===\s*"task-ledger-refresh"\s*\)/);

const after = {
  oldR8O: count(core, OLD_R8O),
  oldV7: count(core, OLD_V7),
  clean2: count(core, MARK),
  helperResolve: count(core, 'function aicmResolveMajorDeleteActionTargetR8V7C2'),
  helperOpen: count(core, 'function aicmOpenMajorDeleteConfirmFromActionR8V7C2'),
  helperCancel: count(core, 'function aicmCancelMajorDeleteConfirmFromActionR8V7C2'),
  helperExecute: count(core, 'function aicmExecuteMajorDeleteConfirmFromActionR8V7C2'),
  helperPage: count(core, 'function aicmMoveMajorItemPageFromActionR8V7C2'),
  openHandler: count(core, 'if (action === "pmlw-major-delete-open")'),
  cancelHandler: count(core, 'if (action === "pmlw-major-delete-cancel")'),
  executeHandler: count(core, 'if (action === "pmlw-major-delete-execute")'),
  pagePrevHandler: count(core, 'if (action === "pmlw-major-page-prev")'),
  pageNextHandler: count(core, 'if (action === "pmlw-major-page-next")'),
  refreshHandler: count(core, 'if (action === "task-ledger-refresh")'),
  unsafeTargetCall: count(core, 'aicmOpenMajorItemDeleteConfirmR8P(target)'),
  openHelper: count(core, 'function aicmOpenMajorItemDeleteConfirmR8P'),
  cancelHelper: count(core, 'function aicmCancelMajorItemDeleteConfirmR8P'),
  executeHelper: count(core, 'async function aicmExecuteMajorItemDeleteConfirmR8P'),
  archiveRoute: count(core, '/api/aicm/v2/manager-major/archive'),
  v6cHelper: count(core, 'function aicmIsPendingManagerMajorRowR8V6'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverNewVersion: count(server, newScriptRef),
  helperLine,
  handlerLine,
  refreshLine,
  htmlUpdates
};

if (after.oldR8O !== 0) throw new Error('old R8O action handler marker still present');
if (after.oldV7 !== 0) throw new Error('old V7 action handler marker still present');
if (after.clean2 < 4) throw new Error('V7-clean2 markers missing');
if (after.helperResolve !== 1) throw new Error('resolve helper count invalid: ' + after.helperResolve);
if (after.helperOpen !== 1) throw new Error('open wrapper count invalid: ' + after.helperOpen);
if (after.helperCancel !== 1) throw new Error('cancel wrapper count invalid: ' + after.helperCancel);
if (after.helperExecute !== 1) throw new Error('execute wrapper count invalid: ' + after.helperExecute);
if (after.helperPage !== 1) throw new Error('page wrapper count invalid: ' + after.helperPage);
if (after.openHandler !== 1) throw new Error('delete open handler count invalid: ' + after.openHandler);
if (after.cancelHandler !== 1) throw new Error('delete cancel handler count invalid: ' + after.cancelHandler);
if (after.executeHandler !== 1) throw new Error('delete execute handler count invalid: ' + after.executeHandler);
if (after.pagePrevHandler !== 1 || after.pageNextHandler !== 1) throw new Error('paging handler count invalid');
if (after.refreshHandler !== 1) throw new Error('task-ledger-refresh handler count invalid: ' + after.refreshHandler);
if (after.unsafeTargetCall !== 0) throw new Error('unsafe target call remains');
if (after.openHelper !== 1) throw new Error('existing delete open helper count invalid: ' + after.openHelper);
if (after.cancelHelper !== 1) throw new Error('existing delete cancel helper count invalid: ' + after.cancelHelper);
if (after.executeHelper !== 1) throw new Error('existing delete execute helper count invalid: ' + after.executeHelper);
if (after.archiveRoute < 1) throw new Error('archive route reference missing');
if (after.v6cHelper !== 1) throw new Error('V6C pending helper missing');
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (after.handlerLine <= 0 || after.refreshLine <= 0 || after.handlerLine >= after.refreshLine) {
  throw new Error('delete handler must be before task-ledger-refresh handler');
}
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'V7-clean2 helperized delete action flow',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
