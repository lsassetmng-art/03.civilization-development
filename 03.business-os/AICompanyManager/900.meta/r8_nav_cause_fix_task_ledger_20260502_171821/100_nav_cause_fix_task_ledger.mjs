import fs from 'node:fs';

const corePath = process.argv[2];
const syntaxBefore = process.argv[3] || 'PASS';

let src = fs.readFileSync(corePath, 'utf8');

const NAV_MARK = 'AICM_R8_NAV_TASK_LEDGER_EXPLICIT_GO_V1';
const NAV_START = '// ' + NAV_MARK + '_START';
const NAV_END = '// ' + NAV_MARK + '_END';

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

function lineNoOf(lines, re, fromIndex = 0) {
  for (let i = fromIndex; i < lines.length; i += 1) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}

function replaceLinesBetweenFunctions(text, startName, endName, replacement) {
  const lines = text.split('\n');
  const startRe = new RegExp('^\\s*(?:async\\s+)?function\\s+' + startName + '\\s*\\(');
  const endRe = new RegExp('^\\s*(?:async\\s+)?function\\s+' + endName + '\\s*\\(');

  const start = lineNoOf(lines, startRe, 0);
  if (start < 0) throw new Error('start function line not found: ' + startName);

  const end = lineNoOf(lines, endRe, start + 1);
  if (end < 0) throw new Error('end function line not found after ' + startName + ': ' + endName);

  return lines.slice(0, start).concat(replacement.trimEnd().split('\n')).concat(lines.slice(end)).join('\n');
}

const before = {
  syntaxBefore,
  navMark: count(src, NAV_MARK),
  goHandler: count(src, 'if (action === "go")'),
  taskLedgerButton: count(src, 'data-core-action="go" data-screen="task-ledger"'),
  renderTaskLedger: count(src, 'function renderTaskLedgerPlaceholder'),
  renderMajor: count(src, 'function aicmRenderManagerMajorRows'),
  reloadTaskLedger: count(src, 'async function aicmReloadTaskLedgerContext'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  r8o: count(src, 'AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1')
};

src = removeMarkedBlock(src, NAV_START, NAV_END);

/*
  If current core is syntactically broken around:
    function aicmRenderManagerMajorRows(...) ... async function aicmReloadTaskLedgerContext()
  repair only that boundary with a minimal stable renderer.
  This is not a full rollback; it fixes the broken function range that prevents navigation.
*/
let boundaryRepairApplied = false;

if (syntaxBefore === 'FAIL') {
  const minimalRenderMajor = `
  function aicmRenderManagerMajorRows(rows) {
    var sourceRows = Array.isArray(rows) ? rows : [];
    var pendingRows = sourceRows.filter(function (row) {
      return isPendingMajor(row);
    });

    if (!pendingRows.length) {
      return [
        '<div class="aicm-core-empty">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>CSV取り込み後、未実行/未引き継ぎのManager大項目だけが表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-manager-major-list">',
      pendingRows.map(function (row, index) {
        var majorId = aicmAxuR1MajorId(row);
        var title = row.major_item_name || row.deliverable_name || row.task_name || "Manager大項目";
        var description = row.major_item_description || row.task_description || row.note || "";
        var leader = row.assigned_leader_label || row.leader_label || row.responsible_robot_label || "未設定";
        var due = row.due_date || "未設定";
        var priority = row.priority_code || "normal";
        var status = row.handoff_status_code || row.decomposition_status_code || "not_started";

        return [
          '<article class="aicm-core-card aicm-major-item-row">',
          '  <p class="aicm-eyebrow">Manager大項目 #' + escapeHtml(String(index + 1)) + '</p>',
          '  <h3>' + escapeHtml(title) + '</h3>',
          description ? '  <p class="aicm-selected-note">' + escapeHtml(description) + '</p>' : '',
          '  <dl class="aicm-core-detail-list">',
          '    <dt>課長/Leader</dt><dd>' + escapeHtml(leader) + '</dd>',
          '    <dt>優先度</dt><dd>' + escapeHtml(priority) + '</dd>',
          '    <dt>期限</dt><dd>' + escapeHtml(due) + '</dd>',
          '    <dt>状態</dt><dd>' + escapeHtml(status) + '</dd>',
          '  </dl>',
          '  <div class="aicm-dashboard-action-row">',
          '    <button type="button" data-core-action="pmlw-major-leader-handoff" data-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
          '  </div>',
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }
`;

  src = replaceLinesBetweenFunctions(src, 'aicmRenderManagerMajorRows', 'aicmReloadTaskLedgerContext', minimalRenderMajor);
  boundaryRepairApplied = true;
}

/*
  Explicit task-ledger navigation.
  Cause fix:
  - generic goだけに任せず、task-ledgerだけは reload + render を専用処理する。
  - event handlerがasyncでなくても動くよう Promise chain にする。
*/
const navBlock = `
${NAV_START}
    if (action === "go" && target && target.getAttribute && target.getAttribute("data-screen") === "task-ledger") {
      if (event && event.preventDefault) event.preventDefault();

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
${NAV_END}
`;

const goIdx = src.indexOf('if (action === "go")');
if (goIdx < 0) {
  throw new Error('generic go handler not found');
}

src = src.slice(0, goIdx) + navBlock + '\n    ' + src.slice(goIdx);

const after = {
  navMark: count(src, NAV_MARK),
  goHandler: count(src, 'if (action === "go")'),
  explicitTaskLedgerNav: count(src, 'data-screen") === "task-ledger"'),
  taskLedgerButton: count(src, 'data-core-action="go" data-screen="task-ledger"'),
  renderTaskLedger: count(src, 'function renderTaskLedgerPlaceholder'),
  renderMajor: count(src, 'function aicmRenderManagerMajorRows'),
  reloadTaskLedger: count(src, 'async function aicmReloadTaskLedgerContext'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  r8o: count(src, 'AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1'),
  boundaryRepairApplied
};

if (after.navMark < 2) throw new Error('explicit nav marker missing');
if (after.explicitTaskLedgerNav < 1) throw new Error('explicit task-ledger nav missing');
if (after.goHandler < 1) throw new Error('go handler missing');
if (after.taskLedgerButton < 1) throw new Error('task-ledger go button missing');
if (after.renderTaskLedger !== 1) throw new Error('renderTaskLedgerPlaceholder count invalid: ' + after.renderTaskLedger);
if (after.renderMajor !== 1) throw new Error('aicmRenderManagerMajorRows count invalid: ' + after.renderMajor);
if (after.reloadTaskLedger !== 1) throw new Error('aicmReloadTaskLedgerContext count invalid: ' + after.reloadTaskLedger);
if (after.r8m < 1) throw new Error('R8M hydration marker missing');
if (after.r8l !== 0) throw new Error('R8L diagnostic marker returned');

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  cause_classification: boundaryRepairApplied
    ? 'syntax boundary around aicmRenderManagerMajorRows was broken; repaired boundary and added explicit task-ledger navigation'
    : 'syntax OK; added explicit task-ledger navigation before generic go handler',
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
