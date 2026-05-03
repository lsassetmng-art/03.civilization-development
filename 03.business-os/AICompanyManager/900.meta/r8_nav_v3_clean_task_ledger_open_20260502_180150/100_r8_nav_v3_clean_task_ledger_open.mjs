import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let src = fs.readFileSync(corePath, 'utf8');

const OLD_V1 = 'AICM_R8_NAV_TASK_LEDGER_EXPLICIT_GO_V1';
const OLD_V2 = 'AICM_R8_NAV_TASK_LEDGER_EXPLICIT_GO_V2';
const OLD_V3 = 'AICM_R8_NAV_TASK_LEDGER_DEDICATED_OPEN_V3';
const CLEAN = 'AICM_R8_NAV_TASK_LEDGER_V3_CLEAN';

const OLD_V1_START = '// ' + OLD_V1 + '_START';
const OLD_V1_END = '// ' + OLD_V1 + '_END';
const OLD_V2_START = '// ' + OLD_V2 + '_START';
const OLD_V2_END = '// ' + OLD_V2 + '_END';
const OLD_V3_START = '// ' + OLD_V3 + '_START';
const OLD_V3_END = '// ' + OLD_V3 + '_END';

const CLEAN_HELPER_START = '// ' + CLEAN + '_HELPER_START';
const CLEAN_HELPER_END = '// ' + CLEAN + '_HELPER_END';
const CLEAN_HANDLER_START = '// ' + CLEAN + '_ACTION_HANDLER_START';
const CLEAN_HANDLER_END = '// ' + CLEAN + '_ACTION_HANDLER_END';

function count(text, needle) {
  return text.split(needle).length - 1;
}

function removeMarkedBlock(text, startMarker, endMarker) {
  const s = text.indexOf(startMarker);
  if (s < 0) return text;

  const e = text.indexOf(endMarker, s);
  if (e < 0) {
    throw new Error('marked block end not found: ' + startMarker);
  }

  return text.slice(0, s) + text.slice(e + endMarker.length);
}

function insertBeforeNeedle(text, needle, block) {
  const idx = text.indexOf(needle);
  if (idx < 0) {
    throw new Error('insert anchor not found: ' + needle);
  }

  return text.slice(0, idx) + block.trimEnd() + '\n\n  ' + text.slice(idx);
}

const before = {
  oldV1: count(src, OLD_V1),
  oldV2: count(src, OLD_V2),
  oldV3: count(src, OLD_V3),
  clean: count(src, CLEAN),
  genericTaskLedgerGoButtons: count(src, 'data-core-action="go" data-screen="task-ledger"'),
  dedicatedTaskLedgerButtons: count(src, 'data-core-action="task-ledger-open"'),
  genericGoHandler: count(src, 'if (action === "go")'),
  dedicatedOpenHandler: count(src, 'if (action === "task-ledger-open")'),
  refreshHandler: count(src, 'if (action === "task-ledger-refresh")'),
  helper: count(src, 'function aicmOpenTaskLedgerScreenR8V3Clean'),
  reloadTaskLedger: count(src, 'async function aicmReloadTaskLedgerContext'),
  renderTaskLedger: count(src, 'function renderTaskLedgerPlaceholder'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

src = removeMarkedBlock(src, OLD_V1_START, OLD_V1_END);
src = removeMarkedBlock(src, OLD_V2_START, OLD_V2_END);
src = removeMarkedBlock(src, OLD_V3_START, OLD_V3_END);
src = removeMarkedBlock(src, CLEAN_HELPER_START, CLEAN_HELPER_END);
src = removeMarkedBlock(src, CLEAN_HANDLER_START, CLEAN_HANDLER_END);

/*
  task-ledger only:
  Do not use generic go because task-ledger requires reload/hydrate/render.
*/
src = src.replace(
  /data-core-action="go"\s+data-screen="task-ledger"/g,
  'data-core-action="task-ledger-open"'
);

src = src.replace(
  /data-screen="task-ledger"\s+data-core-action="go"/g,
  'data-core-action="task-ledger-open"'
);

const helperBlock = `
${CLEAN_HELPER_START}
  function aicmOpenTaskLedgerScreenR8V3Clean() {
    state.screen = "task-ledger";
    state.managerMajorDeleteConfirm = null;

    if (typeof setMessage === "function") {
      setMessage("ok", "部門別タスク台帳を表示します。");
    }

    render();

    Promise.resolve()
      .then(function () {
        if (typeof aicmReloadTaskLedgerContext === "function") {
          return aicmReloadTaskLedgerContext();
        }
        return null;
      })
      .then(function () {
        state.screen = "task-ledger";
        render();
      })
      .catch(function (error) {
        state.screen = "task-ledger";

        if (typeof setMessage === "function") {
          setMessage("error", error && error.message ? error.message : "部門別タスク台帳の読込に失敗しました。");
        }

        render();
      });
  }
${CLEAN_HELPER_END}
`;

const handlerBlock = `
${CLEAN_HANDLER_START}
    if (action === "task-ledger-open") {
      aicmOpenTaskLedgerScreenR8V3Clean();
      return;
    }
${CLEAN_HANDLER_END}
`;

src = insertBeforeNeedle(src, 'async function aicmReloadTaskLedgerContext', helperBlock);

const refreshIdx = src.indexOf('if (action === "task-ledger-refresh")');
if (refreshIdx < 0) {
  throw new Error('task-ledger-refresh handler not found');
}
src = src.slice(0, refreshIdx) + handlerBlock + '\n    ' + src.slice(refreshIdx);

const after = {
  oldV1: count(src, OLD_V1),
  oldV2: count(src, OLD_V2),
  oldV3: count(src, OLD_V3),
  clean: count(src, CLEAN),
  genericTaskLedgerGoButtons: count(src, 'data-core-action="go" data-screen="task-ledger"'),
  dedicatedTaskLedgerButtons: count(src, 'data-core-action="task-ledger-open"'),
  genericGoHandler: count(src, 'if (action === "go")'),
  dedicatedOpenHandler: count(src, 'if (action === "task-ledger-open")'),
  refreshHandler: count(src, 'if (action === "task-ledger-refresh")'),
  helper: count(src, 'function aicmOpenTaskLedgerScreenR8V3Clean'),
  reloadTaskLedger: count(src, 'async function aicmReloadTaskLedgerContext'),
  renderTaskLedger: count(src, 'function renderTaskLedgerPlaceholder'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

if (after.oldV1 !== 0) throw new Error('old V1 nav marker still present');
if (after.oldV2 !== 0) throw new Error('old V2 nav marker still present');
if (after.oldV3 !== 0) throw new Error('old V3 nav marker still present');
if (after.clean < 4) throw new Error('V3-clean markers missing');
if (after.genericTaskLedgerGoButtons !== 0) throw new Error('task-ledger generic go buttons still present');
if (after.dedicatedTaskLedgerButtons < 1) throw new Error('task-ledger-open buttons missing');
if (after.genericGoHandler !== 1) throw new Error('generic go handler count invalid: ' + after.genericGoHandler);
if (after.dedicatedOpenHandler !== 1) throw new Error('task-ledger-open handler count invalid: ' + after.dedicatedOpenHandler);
if (after.refreshHandler !== 1) throw new Error('task-ledger-refresh handler count invalid: ' + after.refreshHandler);
if (after.helper !== 1) throw new Error('helper count invalid: ' + after.helper);
if (after.reloadTaskLedger !== 1) throw new Error('reloadTaskLedger count invalid: ' + after.reloadTaskLedger);
if (after.renderTaskLedger !== 1) throw new Error('renderTaskLedger count invalid: ' + after.renderTaskLedger);
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'V3-clean dedicated task-ledger action with helper',
  maintainability: {
    generic_go_touched: false,
    handler_body_short: true,
    task_ledger_open_logic_in_helper: true,
    r8m_hydration_kept: true,
    db_write: 'NO',
    api_post: 'NO',
    delete_executed: 'NO'
  },
  before,
  after
}, null, 2));
