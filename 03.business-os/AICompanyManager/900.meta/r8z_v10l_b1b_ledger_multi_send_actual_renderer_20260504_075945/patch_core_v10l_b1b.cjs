const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

const marker = "AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER";

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), "g")) || []).length;
}

function removeMarkedBlock() {
  const re = new RegExp(
    "\\n\\s*//\\s*" + escRe(marker) + "_START[\\s\\S]*?//\\s*" + escRe(marker) + "_END\\s*\\n?",
    "g"
  );
  const oldLen = src.length;
  src = src.replace(re, "\n");
  log.push("REMOVED_" + marker + "=" + (oldLen !== src.length));
}

function hasFunction(name) {
  const patterns = [
    new RegExp("(?:async\\s+)?function\\s+" + escRe(name) + "\\s*\\("),
    new RegExp("(?:const|let|var)\\s+" + escRe(name) + "\\s*=")
  ];
  return patterns.some(re => re.test(src));
}

analysis.push("BEFORE_MARKER_COUNT=" + count(src, marker));
analysis.push("BEFORE_OLD_B1_MARKER_COUNT=" + count(src, "AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY"));
analysis.push("HAS_aicmRenderTaskLedgerSafeR8V4=" + hasFunction("aicmRenderTaskLedgerSafeR8V4"));
analysis.push("HAS_renderTaskLedgerPlaceholder=" + hasFunction("renderTaskLedgerPlaceholder"));
analysis.push("HAS_aicmOpenTaskLedgerScreenR8V3Clean=" + hasFunction("aicmOpenTaskLedgerScreenR8V3Clean"));
analysis.push("LEADER_AUTO_ROUTE_COUNT=" + count(src, "/api/aicm/v2/leader-auto-decomposition/run"));

removeMarkedBlock();

if (!hasFunction("aicmRenderTaskLedgerSafeR8V4") && !hasFunction("renderTaskLedgerPlaceholder")) {
  analysis.push("PATCH_DECISION=STOP_NO_SAFE_RENDERER_CANDIDATE");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

const block = `

// ${marker}_START
// Confirm-only UI for sending Manager major items to Leader.
// This block hooks actual task-ledger renderers and does not POST/write DB.
(function aicmV10lB1bInstallLedgerMultiSendConfirmOnly() {
  if (typeof window === "undefined") return;
  if (window.__aicmV10lB1bInstalled) return;
  window.__aicmV10lB1bInstalled = true;

  window.__aicmV10lB1bSelectedMajorIds = window.__aicmV10lB1bSelectedMajorIds || {};

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function esc(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function appState() {
    if (typeof state !== "undefined" && state && typeof state === "object") return state;
    if (window.state && typeof window.state === "object") return window.state;
    return {};
  }

  function ctx() {
    var s = appState();
    return (s.context && typeof s.context === "object") ? s.context : {};
  }

  function arrayFrom(names) {
    var s = appState();
    var c = ctx();

    for (var i = 0; i < names.length; i += 1) {
      var key = names[i];
      if (Array.isArray(c[key])) return c[key];
      if (Array.isArray(s[key])) return s[key];
    }

    return [];
  }

  function majorItems() {
    return arrayFrom([
      "pmlw_major_items",
      "pmlwMajorItems",
      "manager_major_items",
      "managerMajorItems",
      "major_items",
      "majorItems"
    ]);
  }

  function middleItems() {
    return arrayFrom([
      "pmlw_middle_items",
      "pmlwMiddleItems",
      "leader_middle_items",
      "leaderMiddleItems",
      "middle_items",
      "middleItems"
    ]);
  }

  function workerUnits() {
    return arrayFrom([
      "pmlw_worker_work_units",
      "pmlwWorkerWorkUnits",
      "worker_work_units",
      "workerWorkUnits"
    ]);
  }

  function majorId(row) {
    return text(row && (
      row.aicm_manager_major_work_item_id ||
      row.manager_major_work_item_id ||
      row.related_manager_major_work_item_id ||
      row.major_work_item_id ||
      row.major_item_id ||
      row.id
    ));
  }

  function middleMajorId(row) {
    return text(row && (
      row.aicm_manager_major_work_item_id ||
      row.related_manager_major_work_item_id ||
      row.manager_major_work_item_id ||
      row.major_work_item_id ||
      row.major_item_id
    ));
  }

  function majorName(row) {
    return text(row && (
      row.major_item_name ||
      row.major_work_title ||
      row.major_work_name ||
      row.deliverable_name ||
      row.task_name ||
      row.title ||
      row.name ||
      "Manager大項目"
    ));
  }

  function majorStatus(row) {
    return text(row && (
      row.decomposition_status_code ||
      row.handoff_status_code ||
      row.status_code ||
      row.status ||
      "unknown"
    ));
  }

  function companyId(row) {
    var s = appState();
    return text(row && (
      row.aicm_user_company_id ||
      row.company_id
    )) || text(s.selectedCompanyId);
  }

  function ownerId(row) {
    var s = appState();
    return text(row && (
      row.owner_civilization_id ||
      row.owner_id
    )) || text(s.ownerCivilizationId);
  }

  function sentMajorIdMap() {
    var map = {};
    var middle = middleItems();

    for (var i = 0; i < middle.length; i += 1) {
      var id = middleMajorId(middle[i]);
      if (id) map[id] = true;
    }

    return map;
  }

  function majorWithSendState() {
    var sentMap = sentMajorIdMap();

    return majorItems().map(function(row) {
      var id = majorId(row);

      return {
        id: id,
        row: row,
        sent: !!sentMap[id],
        name: majorName(row),
        status: majorStatus(row),
        owner: ownerId(row),
        company: companyId(row)
      };
    }).filter(function(item) {
      return !!item.id;
    });
  }

  function selectedMap() {
    window.__aicmV10lB1bSelectedMajorIds = window.__aicmV10lB1bSelectedMajorIds || {};
    return window.__aicmV10lB1bSelectedMajorIds;
  }

  function selectedItems() {
    var selected = selectedMap();

    return majorWithSendState().filter(function(item) {
      return !!selected[item.id];
    });
  }

  function unsentItems() {
    return majorWithSendState().filter(function(item) {
      return !item.sent;
    });
  }

  function allItems() {
    return majorWithSendState();
  }

  function targetsForMode(mode) {
    if (mode === "selected") return selectedItems();
    if (mode === "all") return allItems();
    return unsentItems();
  }

  function metric(label, value, note) {
    return [
      '<div class="aicm-metric-card">',
      '  <p>' + esc(label) + '</p>',
      '  <strong>' + esc(value) + '</strong>',
      '  <span>' + esc(note) + '</span>',
      '</div>'
    ].join("");
  }

  function renderMajorRows(items) {
    if (!items.length) {
      return '<p class="aicm-core-empty">課長へ送信できるManager大項目はありません。</p>';
    }

    return [
      '<div style="max-height:360px;overflow:auto;border:1px solid #e5e7eb;border-radius:16px;padding:8px;background:#fff;">',
      items.map(function(item) {
        var selected = !!selectedMap()[item.id];
        var sentText = item.sent ? "課長送信済み推定" : "未送信推定";

        return [
          '<label class="aicm-core-row" style="display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;padding:10px;border-bottom:1px solid #f3f4f6;">',
          '  <input type="checkbox" data-v10l-b1b-major-checkbox="true" value="' + esc(item.id) + '"' + (selected ? ' checked' : '') + '>',
          '  <span>',
          '    <strong>' + esc(item.name) + '</strong>',
          '    <br><small>ID: ' + esc(item.id) + '</small>',
          '    <br><small>状態: ' + esc(item.status) + ' / ' + esc(sentText) + '</small>',
          '  </span>',
          '</label>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function renderPanel() {
    var majors = allItems();
    var unsent = unsentItems();
    var sentCount = majors.length - unsent.length;
    var middle = middleItems();
    var workers = workerUnits();
    var selectedCount = selectedItems().length;

    return [
      '<section class="aicm-core-card" data-aicm-v10l-b1b-panel="true">',
      '  <p class="aicm-eyebrow">V10L / 課長へ送る</p>',
      '  <h2>Manager大項目を課長へ送る</h2>',
      '  <p class="aicm-selected-note">この画面は確認UIです。今回の工程ではDB更新/API POSTは実行しません。</p>',
      '  <div class="aicm-metric-grid">',
      metric("Manager大項目", majors.length, "送信候補"),
      metric("課長送信済み推定", sentCount, "Leader中項目あり"),
      metric("未送信推定", unsent.length, "標準送信対象"),
      metric("Leader中項目", middle.length, "自動分解結果"),
      metric("Worker作業単位", workers.length, "自動生成結果"),
      metric("選択中", selectedCount, "チェック済み"),
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="v10l-b1b-select-unsent">未送信推定を選択</button>',
      '    <button type="button" data-core-action="v10l-b1b-clear-selection">選択解除</button>',
      '    <button type="button" data-core-action="v10l-b1b-confirm-selected">選択した大項目を課長へ送る確認</button>',
      '    <button type="button" data-core-action="v10l-b1b-confirm-unsent">未送信推定をまとめて課長へ送る確認</button>',
      '    <button type="button" data-core-action="v10l-b1b-confirm-all">全件を課長へ送る確認</button>',
      '  </div>',
      '  <p class="aicm-selected-note">全件送信は、既にLeader中項目がある大項目も含むため、重複作成リスクがあります。</p>',
      renderMajorRows(majors),
      '</section>'
    ].join("");
  }

  function insertPanel(html) {
    html = text(html);

    if (html.indexOf('data-aicm-v10l-b1b-panel="true"') >= 0) return html;

    var panel = renderPanel();

    if (html.indexOf("</main>") >= 0) {
      return html.replace("</main>", panel + "</main>");
    }

    if (html.indexOf("</section>") >= 0) {
      return html + panel;
    }

    return html + panel;
  }

  function renderConfirm(mode) {
    var targets = targetsForMode(mode);
    var operation = mode === "all"
      ? "全Manager大項目を課長へ送る"
      : (mode === "selected" ? "選択したManager大項目を課長へ送る" : "未送信推定Manager大項目を課長へ送る");

    var warning = mode === "all"
      ? '<p class="aicm-core-message aicm-core-message-error">全件送信は重複作成リスクがあります。既にLeader中項目がある大項目も対象に含みます。</p>'
      : '<p class="aicm-selected-note">標準では未送信推定を対象にし、重複作成を避けます。</p>';

    return [
      '<section class="aicm-core-card" data-aicm-v10l-b1b-confirm="true" style="border:2px solid #f59e0b;">',
      '  <p class="aicm-eyebrow">V10L / DB更新前確認</p>',
      '  <h2>' + esc(operation) + '</h2>',
      '  <p class="aicm-selected-note">この確認画面ではまだDB更新しません。実POST解放は次工程V10L-B2で行います。</p>',
      warning,
      '  <dl class="aicm-core-detail-list">',
      '    <dt>対象件数</dt><dd>' + esc(targets.length) + '件</dd>',
      '    <dt>API予定</dt><dd>/api/aicm/v2/leader-auto-decomposition/run</dd>',
      '    <dt>必須payload</dt><dd>owner_civilization_id / aicm_user_company_id / aicm_manager_major_work_item_id</dd>',
      '  </dl>',
      '<div style="max-height:260px;overflow:auto;border:1px solid #e5e7eb;border-radius:16px;padding:8px;background:#fff;">',
      targets.length ? targets.map(function(item) {
        return [
          '<div style="padding:8px;border-bottom:1px solid #f3f4f6;">',
          '<strong>' + esc(item.name) + '</strong>',
          '<br><small>manager_major_id: ' + esc(item.id) + '</small>',
          '<br><small>company_id: ' + esc(item.company) + '</small>',
          '<br><small>owner: ' + esc(item.owner) + '</small>',
          '<br><small>送信済み推定: ' + esc(item.sent ? "YES" : "NO") + '</small>',
          '</div>'
        ].join("");
      }).join("") : '<p class="aicm-core-empty">対象がありません。</p>',
      '</div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="v10l-b1b-close-confirm">確認を閉じる</button>',
      '    <button type="button" disabled title="V10L-B2で実行解放">課長へ送る実行（次工程）</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function showConfirm(mode) {
    var old = document.querySelector('[data-aicm-v10l-b1b-confirm="true"]');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var panel = document.querySelector('[data-aicm-v10l-b1b-panel="true"]');
    if (!panel) return;

    var wrap = document.createElement("div");
    wrap.innerHTML = renderConfirm(mode);

    panel.parentNode.insertBefore(wrap.firstElementChild, panel.nextSibling);

    try {
      if (window.scrollTo) window.scrollTo(0, panel.offsetTop || 0);
    } catch (_) {}
  }

  function closeConfirm() {
    var old = document.querySelector('[data-aicm-v10l-b1b-confirm="true"]');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function rerender() {
    try {
      if (typeof render === "function") render();
    } catch (_) {}
  }

  function selectUnsent() {
    var selected = {};
    unsentItems().forEach(function(item) {
      selected[item.id] = true;
    });
    window.__aicmV10lB1bSelectedMajorIds = selected;
    rerender();
  }

  function clearSelection() {
    window.__aicmV10lB1bSelectedMajorIds = {};
    rerender();
  }

  function hookRenderer(name) {
    try {
      if (typeof eval(name) !== "function") return false;
      var fn = eval(name);
      if (fn.__aicmV10lB1b) return true;

      var wrapped = function() {
        return insertPanel(fn.apply(this, arguments));
      };

      wrapped.__aicmV10lB1b = true;
      eval(name + " = wrapped");
      return true;
    } catch (_) {
      return false;
    }
  }

  var hooked =
    hookRenderer("aicmRenderTaskLedgerSafeR8V4") ||
    hookRenderer("renderTaskLedgerPlaceholder");

  window.__aicmV10lB1bHooked = hooked;

  document.addEventListener("change", function(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) return;

    if (target.getAttribute("data-v10l-b1b-major-checkbox") !== "true") return;

    var selected = selectedMap();
    var id = text(target.value);

    if (!id) return;

    if (target.checked) selected[id] = true;
    else delete selected[id];
  }, true);

  document.addEventListener("click", function(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) return;

    var action = target.getAttribute("data-core-action") || "";

    if (action === "v10l-b1b-select-unsent") {
      event.preventDefault();
      selectUnsent();
      return;
    }

    if (action === "v10l-b1b-clear-selection") {
      event.preventDefault();
      clearSelection();
      return;
    }

    if (action === "v10l-b1b-confirm-selected") {
      event.preventDefault();
      showConfirm("selected");
      return;
    }

    if (action === "v10l-b1b-confirm-unsent") {
      event.preventDefault();
      showConfirm("unsent");
      return;
    }

    if (action === "v10l-b1b-confirm-all") {
      event.preventDefault();
      showConfirm("all");
      return;
    }

    if (action === "v10l-b1b-close-confirm") {
      event.preventDefault();
      closeConfirm();
      return;
    }
  }, true);

  window.aicmV10lB1bRenderPanel = renderPanel;
  window.aicmV10lB1bShowConfirm = showConfirm;
})();
// ${marker}_END
`;

src += block;

analysis.push("AFTER_MARKER_COUNT=" + count(src, marker));
analysis.push("AFTER_CONFIRM_ONLY_TEXT_COUNT=" + count(src, "この確認画面ではまだDB更新しません"));
analysis.push("AFTER_EXEC_DISABLED_COUNT=" + count(src, "課長へ送る実行（次工程）"));
analysis.push("AFTER_CHECKBOX_COUNT=" + count(src, "data-v10l-b1b-major-checkbox"));
analysis.push("AFTER_PANEL_COUNT=" + count(src, "data-aicm-v10l-b1b-panel"));
analysis.push("AFTER_NO_POST_ROUTE_CALL_IN_BLOCK=" + (block.indexOf("requestJson(") < 0 && block.indexOf("fetch(") < 0));
analysis.push("PATCH_CHANGED=" + (src !== before));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
