const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

const marker = "AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR";

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

analysis.push("BEFORE_B1C_MARKER_COUNT=" + count(src, marker));
analysis.push("BEFORE_B1B_MARKER_COUNT=" + count(src, "AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER"));
analysis.push("BEFORE_B1B_PANEL_COUNT=" + count(src, "data-aicm-v10l-b1b-panel"));
analysis.push("BEFORE_B1B_CHECKBOX_COUNT=" + count(src, "data-v10l-b1b-major-checkbox"));
analysis.push("BEFORE_REQUEST_JSON_B1B_BLOCK_COUNT=" + count(src, "requestJson("));

removeMarkedBlock();

const block = `

// ${marker}_START
// DOM injector for V10L-B1B panel.
// This is confirm-only. It does not POST, does not fetch, and does not write DB.
(function aicmV10lB1cInstallDomInjector() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__aicmV10lB1cInstalled) return;
  window.__aicmV10lB1cInstalled = true;

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
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
    } catch (_) {}
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
    return arrayFrom(["pmlw_major_items", "pmlwMajorItems", "manager_major_items", "managerMajorItems", "major_items", "majorItems"]);
  }

  function middleItems() {
    return arrayFrom(["pmlw_middle_items", "pmlwMiddleItems", "leader_middle_items", "leaderMiddleItems", "middle_items", "middleItems"]);
  }

  function workerUnits() {
    return arrayFrom(["pmlw_worker_work_units", "pmlwWorkerWorkUnits", "worker_work_units", "workerWorkUnits"]);
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

  function sentMap() {
    var map = {};
    var middle = middleItems();

    for (var i = 0; i < middle.length; i += 1) {
      var id = middleMajorId(middle[i]);
      if (id) map[id] = true;
    }

    return map;
  }

  function majorRows() {
    var sent = sentMap();

    return majorItems().map(function(row) {
      var id = majorId(row);
      return {
        id: id,
        row: row,
        name: majorName(row),
        sent: !!sent[id],
        owner: text(row && row.owner_civilization_id) || text(appState().ownerCivilizationId),
        company: text(row && row.aicm_user_company_id) || text(appState().selectedCompanyId)
      };
    }).filter(function(row) {
      return !!row.id;
    });
  }

  function selectedMap() {
    window.__aicmV10lB1bSelectedMajorIds = window.__aicmV10lB1bSelectedMajorIds || {};
    return window.__aicmV10lB1bSelectedMajorIds;
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

  function fallbackPanel() {
    var majors = majorRows();
    var middle = middleItems();
    var workers = workerUnits();
    var sentCount = majors.filter(function(row) { return row.sent; }).length;
    var unsentCount = majors.length - sentCount;
    var selected = selectedMap();
    var selectedCount = Object.keys(selected).filter(function(key) { return selected[key]; }).length;

    return [
      '<section class="aicm-core-card" data-aicm-v10l-b1b-panel="true" data-aicm-v10l-b1c-injected="true">',
      '  <p class="aicm-eyebrow">V10L / 課長へ送る</p>',
      '  <h2>Manager大項目を課長へ送る</h2>',
      '  <p class="aicm-selected-note">この画面は確認UIです。今回の工程ではDB更新/API POSTは実行しません。</p>',
      '  <div class="aicm-metric-grid">',
      metric("Manager大項目", majors.length, "送信候補"),
      metric("課長送信済み推定", sentCount, "Leader中項目あり"),
      metric("未送信推定", unsentCount, "標準送信対象"),
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
      '  <div style="max-height:360px;overflow:auto;border:1px solid #e5e7eb;border-radius:16px;padding:8px;background:#fff;">',
      majors.length ? majors.map(function(item) {
        var checked = selected[item.id] ? ' checked' : '';
        return [
          '<label class="aicm-core-row" style="display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;padding:10px;border-bottom:1px solid #f3f4f6;">',
          '  <input type="checkbox" data-v10l-b1b-major-checkbox="true" value="' + esc(item.id) + '"' + checked + '>',
          '  <span>',
          '    <strong>' + esc(item.name) + '</strong>',
          '    <br><small>ID: ' + esc(item.id) + '</small>',
          '    <br><small>' + esc(item.sent ? "課長送信済み推定" : "未送信推定") + '</small>',
          '  </span>',
          '</label>'
        ].join("");
      }).join("") : '<p class="aicm-core-empty">Manager大項目がありません。</p>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function isTaskLedgerScreen() {
    var s = appState();

    if (text(s.screen) === "task-ledger") return true;

    var bodyText = text(document.body && document.body.innerText);
    return bodyText.indexOf("部門別タスク台帳") >= 0 || bodyText.indexOf("タスク台帳") >= 0;
  }

  function mountTarget() {
    return (
      document.querySelector(".aicm-core-main") ||
      document.querySelector("main") ||
      document.querySelector(".aicm-core") ||
      document.body
    );
  }

  function injectPanel() {
    if (!isTaskLedgerScreen()) return false;

    if (document.querySelector('[data-aicm-v10l-b1b-panel="true"]')) return true;

    var target = mountTarget();
    if (!target) return false;

    var html = "";

    if (typeof window.aicmV10lB1bRenderPanel === "function") {
      try {
        html = window.aicmV10lB1bRenderPanel();
      } catch (_) {
        html = "";
      }
    }

    if (!html) html = fallbackPanel();

    var wrap = document.createElement("div");
    wrap.setAttribute("data-aicm-v10l-b1c-mount", "true");
    wrap.innerHTML = html;

    target.appendChild(wrap);
    return true;
  }

  function scheduleInject() {
    try { setTimeout(injectPanel, 0); } catch (_) {}
    try { setTimeout(injectPanel, 120); } catch (_) {}
    try { setTimeout(injectPanel, 500); } catch (_) {}
    try { setTimeout(injectPanel, 1200); } catch (_) {}
  }

  try {
    if (typeof render === "function" && !render.__aicmV10lB1c) {
      var beforeRender = render;
      render = function render() {
        var result = beforeRender.apply(this, arguments);
        scheduleInject();
        return result;
      };
      render.__aicmV10lB1c = true;
    }
  } catch (_) {}

  document.addEventListener("click", function(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) return;

    var action = target.getAttribute("data-core-action") || "";
    var screen = target.getAttribute("data-screen") || "";

    if (action === "task-ledger-open" || screen === "task-ledger" || action.indexOf("v10l-b1b-") === 0) {
      scheduleInject();
    }
  }, true);

  document.addEventListener("change", function(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) return;

    if (target.getAttribute("data-v10l-b1b-major-checkbox") === "true") {
      scheduleInject();
    }
  }, true);

  window.addEventListener("load", scheduleInject);

  try {
    var observer = new MutationObserver(function() {
      scheduleInject();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  } catch (_) {}

  window.aicmV10lB1cInjectPanel = injectPanel;

  scheduleInject();

  try {
    setInterval(injectPanel, 1500);
  } catch (_) {}
})();
// ${marker}_END
`;

src += block;

analysis.push("AFTER_B1C_MARKER_COUNT=" + count(src, marker));
analysis.push("AFTER_DOM_INJECTOR_COUNT=" + count(src, "aicmV10lB1cInjectPanel"));
analysis.push("AFTER_B1C_MOUNT_COUNT=" + count(src, "data-aicm-v10l-b1c-mount"));
analysis.push("AFTER_B1B_PANEL_COUNT=" + count(src, "data-aicm-v10l-b1b-panel"));
analysis.push("AFTER_B1B_ACTION_UNSENT_COUNT=" + count(src, "v10l-b1b-confirm-unsent"));
analysis.push("AFTER_B1B_ACTION_ALL_COUNT=" + count(src, "v10l-b1b-confirm-all"));
analysis.push("AFTER_EXEC_DISABLED_COUNT=" + count(src, "課長へ送る実行（次工程）"));
analysis.push("AFTER_NO_POST_IN_B1C_BLOCK=" + (block.indexOf("requestJson(") < 0 && block.indexOf("fetch(") < 0));
analysis.push("PATCH_CHANGED=" + (src !== before));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
