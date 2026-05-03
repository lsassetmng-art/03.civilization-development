import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let src = fs.readFileSync(corePath, 'utf8');

const MARK = 'AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';
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

  const before = lines.slice(0, start);
  const after = lines.slice(end);
  const middle = replacement.trimEnd().split('\n');

  return before.concat(middle).concat(after).join('\n');
}

const before = {
  mark: count(src, MARK),
  render: count(src, 'function aicmRenderManagerMajorRows'),
  reload: count(src, 'async function aicmReloadTaskLedgerContext'),
  pmlwPrompt: count(src, 'function aicmPmlwCsvPromptText'),
  pmlwPromptNext: count(src, 'function handleTaskLedgerChatGptPrompt'),
  taskPrompt: count(src, 'function taskLedgerCsvPromptText'),
  taskPromptNext: count(src, 'function parseCsv'),
  refreshAction: count(src, 'task-ledger-refresh'),
  archiveRoute: count(src, '/api/aicm/v2/manager-major/archive')
};

src = removeMarkedBlock(src, START, END);
src = removeMarkedBlock(src, HANDLER_START, HANDLER_END);

const helperAndRender = `
${START}
  function aicmMajorItemPageSizeR8O() {
    return 20;
  }

  function aicmMajorItemCurrentPageR8O(totalRows) {
    var pageSize = aicmMajorItemPageSizeR8O();
    var total = Number(totalRows || 0);
    var totalPages = Math.max(1, Math.ceil(total / pageSize));
    var page = Number(state.managerMajorPage || 1);

    if (!Number.isFinite(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    state.managerMajorPage = page;
    return page;
  }

  function aicmMajorItemSetPageR8O(delta) {
    var current = Number(state.managerMajorPage || 1);
    if (!Number.isFinite(current) || current < 1) current = 1;
    state.managerMajorPage = current + Number(delta || 0);
    render();
  }

  function aicmMajorItemPriorityLabelR8O(code) {
    var map = {
      urgent: "緊急",
      high: "高",
      normal: "通常",
      low: "低"
    };
    return map[String(code || "")] || String(code || "normal");
  }

  function aicmMajorItemStatusLabelR8O(row) {
    var handoff = String(row && row.handoff_status_code || "");
    var decomposition = String(row && row.decomposition_status_code || "");

    if (handoff === "archived" || handoff === "deleted") return "削除済";
    if (handoff === "sent" || handoff === "handed_off") return "課長送付済";
    if (decomposition === "in_progress") return "分解中";
    if (decomposition === "done" || decomposition === "completed") return "分解済";
    return "未実行";
  }

  function aicmMajorItemSummaryR8O(row) {
    var title = row && (row.major_item_name || row.deliverable_name || row.task_name) || "Manager大項目";
    var description = row && (row.major_item_description || row.task_description || row.note) || "";
    var leader = row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label) || "未設定";
    var due = row && row.due_date ? String(row.due_date) : "未設定";
    var priority = aicmMajorItemPriorityLabelR8O(row && row.priority_code);
    var status = aicmMajorItemStatusLabelR8O(row);

    return {
      title: String(title),
      description: String(description),
      leader: String(leader),
      due: String(due),
      priority: String(priority),
      status: String(status)
    };
  }

  function aicmRenderMajorItemDeleteConfirmCardR8P() {
    var payload = state.managerMajorDeleteConfirm || null;
    if (!payload) return "";

    return [
      '<section class="aicm-core-card" style="border:2px solid #f97316;">',
      '  <p class="aicm-eyebrow">削除確認</p>',
      '  <h2>登録済み大項目を削除しますか？</h2>',
      '  <p class="aicm-selected-note">この操作は確認後にDBへ保存されます。物理DELETEではなく、既存APIで削除済み扱いにします。</p>',
      '  <dl class="aicm-core-detail-list">',
      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
      '  </dl>',
      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="pmlw-major-delete-execute">削除を確定</button>',
      '    <button type="button" data-core-action="pmlw-major-delete-cancel">キャンセル</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function aicmOpenMajorItemDeleteConfirmR8P(button) {
    try {
      var majorId = button && button.getAttribute ? button.getAttribute("data-major-id") : "";
      if (!majorId) throw new Error("Manager大項目IDを特定できません。");

      var row = aicmAxuR1FindMajorById(majorId);
      if (!row) throw new Error("Manager大項目を特定できません。");

      var summary = aicmMajorItemSummaryR8O(row);

      state.managerMajorDeleteConfirm = {
        majorId: majorId,
        title: summary.title,
        description: summary.description,
        leader: summary.leader,
        due: summary.due,
        priority: summary.priority,
        status: summary.status
      };

      state.screen = "task-ledger";
      setMessage("ok", "削除確認を表示しました。内容を確認してから確定してください。");
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "削除確認を表示できません。");
      render();
    }
  }

  function aicmCancelMajorItemDeleteConfirmR8P() {
    state.managerMajorDeleteConfirm = null;
    setMessage("ok", "削除をキャンセルしました。");
    state.screen = "task-ledger";
    render();
  }

  async function aicmExecuteMajorItemDeleteConfirmR8P() {
    var payload = state.managerMajorDeleteConfirm || null;
    if (!payload || !payload.majorId) {
      setMessage("error", "削除確認対象がありません。");
      render();
      return;
    }

    try {
      var response = await fetch("/api/aicm/v2/manager-major/archive", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          aicm_manager_major_work_item_id: payload.majorId
        })
      });

      var json = null;
      try {
        json = await response.json();
      } catch (_) {
        json = null;
      }

      if (!response.ok || (json && json.result && json.result !== "ok")) {
        throw new Error(json && (json.error || json.message) ? (json.error || json.message) : "大項目の削除に失敗しました。");
      }

      state.managerMajorDeleteConfirm = null;
      setMessage("ok", "大項目を削除済みにしました。");
      await aicmReloadTaskLedgerContext();
      state.screen = "task-ledger";
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "大項目の削除に失敗しました。");
      render();
    }
  }
${END}

  function aicmRenderManagerMajorRows(rows) {
    var sourceRows = Array.isArray(rows) ? rows : [];
    var pendingRows = sourceRows.filter(function (row) {
      return isPendingMajor(row);
    });

    var confirmCard = aicmRenderMajorItemDeleteConfirmCardR8P();

    if (!pendingRows.length) {
      return [
        confirmCard,
        '<div class="aicm-core-empty">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>CSV取り込み後、未実行/未引き継ぎのManager大項目だけが表示されます。</p>',
        '</div>'
      ].join("");
    }

    var pageSize = aicmMajorItemPageSizeR8O();
    var totalRows = pendingRows.length;
    var totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    var page = aicmMajorItemCurrentPageR8O(totalRows);
    var start = (page - 1) * pageSize;
    var pageRows = pendingRows.slice(start, start + pageSize);

    var pager = [
      '<div class="aicm-dashboard-action-row">',
      '  <button type="button" data-core-action="pmlw-major-page-prev"' + (page <= 1 ? ' disabled' : '') + '>前ページ</button>',
      '  <span class="aicm-selected-note">ページ ' + escapeHtml(String(page)) + ' / ' + escapeHtml(String(totalPages)) + '　表示 ' + escapeHtml(String(start + 1)) + '-' + escapeHtml(String(start + pageRows.length)) + ' / ' + escapeHtml(String(totalRows)) + '件</span>',
      '  <button type="button" data-core-action="pmlw-major-page-next"' + (page >= totalPages ? ' disabled' : '') + '>次ページ</button>',
      '</div>'
    ].join("");

    var cards = pageRows.map(function (row, index) {
      var majorId = aicmAxuR1MajorId(row);
      var summary = aicmMajorItemSummaryR8O(row);
      var displayNo = start + index + 1;

      return [
        '<article class="aicm-core-card aicm-major-item-row">',
        '  <p class="aicm-eyebrow">Manager大項目 #' + escapeHtml(String(displayNo)) + '</p>',
        '  <h3>' + escapeHtml(summary.title) + '</h3>',
        summary.description ? '  <p class="aicm-selected-note">' + escapeHtml(summary.description) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>課長/Leader</dt><dd>' + escapeHtml(summary.leader) + '</dd>',
        '    <dt>優先度</dt><dd>' + escapeHtml(summary.priority) + '</dd>',
        '    <dt>期限</dt><dd>' + escapeHtml(summary.due) + '</dd>',
        '    <dt>状態</dt><dd>' + escapeHtml(summary.status) + '</dd>',
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="pmlw-major-leader-handoff" data-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
        '    <button type="button" data-core-action="pmlw-major-delete-open" data-major-id="' + escapeHtml(majorId) + '">削除</button>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    return [
      confirmCard,
      pager,
      '<div class="aicm-manager-major-list">',
      cards,
      '</div>',
      pager
    ].join("");
  }
`;

const pmlwPrompt = `
  function aicmPmlwCsvPromptText() {
    return [
      "あなたはAICompanyManagerの部長/Managerです。",
      "President方針を受けて、課長/Leaderへ渡す前段の「粗いManager大項目CSV」を作成してください。",
      "",
      "重要:",
      "- 出力はCSVのみ。説明文、Markdown、コードブロック、箇条書きは禁止。",
      "- 大項目は粗い業務領域にしてください。",
      "- 目安は20〜40行です。125行のような細かい粒度は禁止です。",
      "- 中項目、作業単位、関数名、DOM id、個別バグ修正、実装手順は書かないでください。",
      "- 課長/Leaderが後で中項目と作業単位へ分解する前提で書いてください。",
      "- 1行=1つのManager大項目です。",
      "- noteは短文にしてください。",
      "",
      "CSVヘッダー:",
      "department_name,section_name,major_item_name,major_item_description,assigned_leader_label,priority_code,due_date,note",
      "",
      "列ルール:",
      "- department_name: 部門名",
      "- section_name: 課名。未定なら空欄可",
      "- major_item_name: 粗い大項目名",
      "- major_item_description: 大項目の目的や範囲を1文で説明",
      "- assigned_leader_label: 課長/Leader候補。未定なら空欄可",
      "- priority_code: low / normal / high / urgent のいずれか",
      "- due_date: YYYY-MM-DD。未定なら空欄可",
      "- note: 補足。短文のみ",
      "",
      "粒度の良い例:",
      "開発部,UI課,AI企業業務開始導線の整備,President起点からManager大項目登録までの導線を整理する,,high,,課長分解前の粗い領域",
      "開発部,UI課,部門別タスク台帳のCSV運用整備,Manager大項目CSVの作成と取り込み運用を整える,,normal,,細かい実装手順は書かない",
      "開発部,API課,課長引き継ぎフローの整備,Manager大項目をLeaderへ安全に引き継ぐ流れを整備する,,high,,確認画面を含む",
      "",
      "細かすぎるため禁止の例:",
      "- rowsLengthのDEBUG表示確認",
      "- 特定関数のtry/catch追加",
      "- CSV due_date cast修正",
      "- リロードボタンのDOM id確認",
      "- node --checkの個別実行行",
      "",
      "上記ルールに従ってCSVのみ出力してください。"
    ].join("\\\\n");
  }
`;

const taskPrompt = `
  function taskLedgerCsvPromptText() {
    return aicmPmlwCsvPromptText();
  }
`;

src = replaceLinesBetweenFunctions(src, 'aicmPmlwCsvPromptText', 'handleTaskLedgerChatGptPrompt', pmlwPrompt);
src = replaceLinesBetweenFunctions(src, 'taskLedgerCsvPromptText', 'parseCsv', taskPrompt);
src = replaceLinesBetweenFunctions(src, 'aicmRenderManagerMajorRows', 'aicmReloadTaskLedgerContext', helperAndRender);

const handlerBlock = `
${HANDLER_START}
    if (action === "pmlw-major-page-prev") {
      aicmMajorItemSetPageR8O(-1);
      return;
    }

    if (action === "pmlw-major-page-next") {
      aicmMajorItemSetPageR8O(1);
      return;
    }

    if (action === "pmlw-major-delete-open") {
      aicmOpenMajorItemDeleteConfirmR8P(target);
      return;
    }

    if (action === "pmlw-major-delete-cancel") {
      aicmCancelMajorItemDeleteConfirmR8P();
      return;
    }

    if (action === "pmlw-major-delete-execute") {
      aicmExecuteMajorItemDeleteConfirmR8P();
      return;
    }
${HANDLER_END}
`;

const refreshNeedle = 'if (action === "task-ledger-refresh") {';
const refreshIdx = src.indexOf(refreshNeedle);
if (refreshIdx < 0) {
  throw new Error('task-ledger-refresh action handler not found');
}

src = src.slice(0, refreshIdx) + handlerBlock + '\n    ' + src.slice(refreshIdx);

const after = {
  mark: count(src, MARK),
  render: count(src, 'function aicmRenderManagerMajorRows'),
  reload: count(src, 'async function aicmReloadTaskLedgerContext'),
  pmlwPrompt: count(src, 'function aicmPmlwCsvPromptText'),
  pmlwPromptNext: count(src, 'function handleTaskLedgerChatGptPrompt'),
  taskPrompt: count(src, 'function taskLedgerCsvPromptText'),
  taskPromptNext: count(src, 'function parseCsv'),
  pagePrevAction: count(src, 'pmlw-major-page-prev'),
  pageNextAction: count(src, 'pmlw-major-page-next'),
  deleteOpenAction: count(src, 'pmlw-major-delete-open'),
  deleteExecuteAction: count(src, 'pmlw-major-delete-execute'),
  archiveRoute: count(src, '/api/aicm/v2/manager-major/archive'),
  coarsePrompt: count(src, '粗いManager大項目'),
  forbiddenFinePrompt: count(src, '125行のような細かい粒度は禁止'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

if (after.render !== 1) throw new Error('aicmRenderManagerMajorRows count invalid: ' + after.render);
if (after.reload !== 1) throw new Error('aicmReloadTaskLedgerContext count invalid: ' + after.reload);
if (after.pmlwPrompt !== 1) throw new Error('aicmPmlwCsvPromptText count invalid: ' + after.pmlwPrompt);
if (after.pmlwPromptNext !== 1) throw new Error('handleTaskLedgerChatGptPrompt count invalid: ' + after.pmlwPromptNext);
if (after.taskPrompt !== 1) throw new Error('taskLedgerCsvPromptText count invalid: ' + after.taskPrompt);
if (after.taskPromptNext !== 1) throw new Error('parseCsv count invalid: ' + after.taskPromptNext);
if (after.archiveRoute < 1) throw new Error('archive route reference missing');
if (after.deleteOpenAction < 2) throw new Error('delete open action not inserted/rendered');
if (after.deleteExecuteAction < 2) throw new Error('delete execute action not inserted/rendered');
if (after.pagePrevAction < 2 || after.pageNextAction < 2) throw new Error('paging actions not inserted/rendered');
if (after.coarsePrompt < 1 || after.forbiddenFinePrompt < 1) throw new Error('coarse prompt text missing');
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'line range by known function anchors',
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
