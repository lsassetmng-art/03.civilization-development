import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let src = fs.readFileSync(corePath, 'utf8');

const V1 = 'AICM_R8_NAV_TASK_LEDGER_EXPLICIT_GO_V1';
const V2 = 'AICM_R8_NAV_TASK_LEDGER_EXPLICIT_GO_V2';
const V1_START = '// ' + V1 + '_START';
const V1_END = '// ' + V1 + '_END';
const V2_START = '// ' + V2 + '_START';
const V2_END = '// ' + V2 + '_END';

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

const before = {
  v1: count(src, V1),
  v2: count(src, V2),
  genericGo: count(src, 'if (action === "go")'),
  unsafeTargetGo: count(src, 'action === "go" && target'),
  unsafeEventPrevent: count(src, 'event && event.preventDefault'),
  taskLedgerGoButtons: count(src, 'data-core-action="go" data-screen="task-ledger"'),
  r8o: count(src, 'AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

src = removeMarkedBlock(src, V1_START, V1_END);
src = removeMarkedBlock(src, V2_START, V2_END);

const navBlock = `
${V2_START}
    var aicmNavTargetR8V2 = null;
    var aicmNavEventR8V2 = null;

    if (typeof target !== "undefined" && target && target.getAttribute) {
      aicmNavTargetR8V2 = target;
    } else if (typeof button !== "undefined" && button && button.getAttribute) {
      aicmNavTargetR8V2 = button;
    } else if (typeof el !== "undefined" && el && el.getAttribute) {
      aicmNavTargetR8V2 = el;
    }

    if (typeof ev !== "undefined" && ev) {
      aicmNavEventR8V2 = ev;
    } else if (typeof e !== "undefined" && e) {
      aicmNavEventR8V2 = e;
    } else if (typeof event !== "undefined" && event) {
      aicmNavEventR8V2 = event;
    }

    if (!aicmNavTargetR8V2 && aicmNavEventR8V2 && aicmNavEventR8V2.target) {
      if (aicmNavEventR8V2.target.closest) {
        aicmNavTargetR8V2 = aicmNavEventR8V2.target.closest("[data-core-action]");
      } else {
        aicmNavTargetR8V2 = aicmNavEventR8V2.target;
      }
    }

    if (
      typeof action !== "undefined" &&
      action === "go" &&
      aicmNavTargetR8V2 &&
      aicmNavTargetR8V2.getAttribute &&
      aicmNavTargetR8V2.getAttribute("data-screen") === "task-ledger"
    ) {
      if (aicmNavEventR8V2 && aicmNavEventR8V2.preventDefault) {
        aicmNavEventR8V2.preventDefault();
      }

      state.screen = "task-ledger";
      state.managerMajorDeleteConfirm = null;

      if (typeof setMessage === "function") {
        setMessage("ok", "部門別タスク台帳を表示します。");
      }

      if (typeof aicmReloadTaskLedgerContext === "function") {
        Promise.resolve()
          .then(function () {
            return aicmReloadTaskLedgerContext();
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
      } else {
        render();
      }

      return;
    }
${V2_END}
`;

const goIdx = src.indexOf('if (action === "go")');
if (goIdx < 0) {
  throw new Error('generic go handler not found');
}

src = src.slice(0, goIdx) + navBlock + '\n    ' + src.slice(goIdx);

const after = {
  v1: count(src, V1),
  v2: count(src, V2),
  genericGo: count(src, 'if (action === "go")'),
  unsafeTargetGo: count(src, 'action === "go" && target'),
  unsafeEventPrevent: count(src, 'event && event.preventDefault'),
  taskLedgerGoButtons: count(src, 'data-core-action="go" data-screen="task-ledger"'),
  r8o: count(src, 'AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

if (after.v1 !== 0) throw new Error('V1 nav marker still present');
if (after.v2 < 2) throw new Error('V2 nav marker missing');
if (after.genericGo !== 1) throw new Error('generic go handler count invalid: ' + after.genericGo);
if (after.unsafeTargetGo !== 0) throw new Error('unsafe target go condition still present');
if (after.unsafeEventPrevent !== 0) throw new Error('unsafe event prevent still present');
if (after.taskLedgerGoButtons < 1) throw new Error('task-ledger go button missing');
if (after.r8m < 1) throw new Error('R8M hydration marker missing');
if (after.r8l !== 0) throw new Error('R8L diagnostic marker returned');

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  cause: 'central click handler likely referenced target/event directly; V2 uses typeof-guarded target/event resolution',
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
