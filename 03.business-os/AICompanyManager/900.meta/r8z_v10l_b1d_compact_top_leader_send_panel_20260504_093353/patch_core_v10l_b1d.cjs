const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

const marker = "AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL";
const oldMarkers = [
  "AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY",
  "AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER",
  "AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR"
];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), "g")) || []).length;
}

function removeMarkedBlock(mark) {
  const re = new RegExp(
    "\\n\\s*//\\s*" + escRe(mark) + "_START[\\s\\S]*?//\\s*" + escRe(mark) + "_END\\s*\\n?",
    "g"
  );
  const oldLen = src.length;
  src = src.replace(re, "\n");
  log.push("REMOVED_" + mark + "=" + (oldLen !== src.length));
}

analysis.push("BEFORE_B1D_MARKER_COUNT=" + count(src, marker));
for (const m of oldMarkers) {
  analysis.push("BEFORE_" + m + "_COUNT=" + count(src, m));
}

removeMarkedBlock(marker);
for (const m of oldMarkers) removeMarkedBlock(m);

const block = `

// ${marker}_START
// Compact top panel for sending Manager major items to Leader.
// Confirm-only. No POST. No DB write.
(function aicmV10lB1dInstallCompactTopLeaderSendPanel() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__aicmV10lB1dInstalled) return;
  window.__aicmV10lB1dInstalled = true;

  window.__aicmV10lB1dSelectedMajorIds = window.__aicmV10lB1dSelectedMajorIds || {};

  var renderLock = false;

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

  function sentMap() {
    var map = {};
    var middle = middleItems();

    for (var i = 0; i < middle.length; i += 1) {
      var id = middleMajorId(middle[i]);
      if (id) map[id] = true;
    }

    return map;
  }

  function rows() {
    var sent = sentMap();
    var s = appState();

    return majorItems().map(function(row) {
      var id = majorId(row);
      return {
        id: id,
        name: majorName(row),
        sent: !!sent[id],
        owner: text(row && row.owner_civilization_id) || text(s.ownerCivilizationId),
        company: text(row && row.aicm_user_company_id) || text(s.selectedCompanyId)
      };
    }).filter(function(row) {
      return !!row.id;
    });
  }

  function selectedMap() {
    window.__aicmV10lB1dSelectedMajorIds = window.__aicmV10lB1dSelectedMajorIds || {};
    return window.__aicmV10lB1dSelectedMajorIds;
  }

  function selectedRows() {
    var selected = selectedMap();
    return rows().filter(function(row) {
      return !!selected[row.id];
    });
  }

  function unsentRows() {
    return rows().filter(function(row) {
      return !row.sent;
    });
  }

  function targets(mode) {
    if (mode === "selected") return selectedRows();
    if (mode === "all") return rows();
    return unsentRows();
  }

  function compactMetric(label, value) {
    return '<span style="display:inline-flex;gap:4px;align-items:baseline;padding:6px 8px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;"><small>' + esc(label) + '</small><strong>' + esc(value) + '</strong></span>';
  }

  function rowListHtml(items) {
    if (!items.length) return '<p class="aicm-core-empty" style="margin:8px 0;">Manager大項目がありません。</p>';

    return [
      '<details style="margin-top:8px;">',
      '<summary style="cursor:pointer;font-weight:700;">対象大項目を開く（' + esc(items.length) + '件）</summary>',
      '<div style="max-height:260px;overflow:auto;margin-top:8px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;">',
      items.map(function(item) {
        var checked = selectedMap()[item.id] ? ' checked' : '';
        return [
          '<label style="display:grid;grid-template-columns:auto 1fr;gap:8px;padding:8px;border-bottom:1px solid #f3f4f6;">',
          '<input type="checkbox" data-v10l-b1d-major-checkbox="true" value="' + esc(item.id) + '"' + checked + '>',
          '<span><strong>' + esc(item.name) + '</strong><br><small>' + esc(item.sent ? "送信済み推定" : "未送信推定") + ' / ' + esc(item.id) + '</small></span>',
          '</label>'
        ].join("");
      }).join(""),
      '</div>',
      '</details>'
    ].join("");
  }

  function panelHtml() {
    var all = rows();
    var unsent = unsentRows();
    var sentCount = all.length - unsent.length;
    var selectedCount = selectedRows().length;
    var middleCount = middleItems().length;
    var workerCount = workerUnits().length;

    return [
      '<section class="aicm-core-card" data-aicm-v10l-b1d-panel="true" style="padding:16px;margin-bottom:14px;">',
      '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap;">',
      '<div>',
      '<p class="aicm-eyebrow" style="margin-bottom:4px;">V10L / 確認UI / NO POST</p>',
      '<h2 style="margin:0;font-size:1.35rem;">課長へ送る</h2>',
      '</div>',
      '<small style="color:#64748b;">実行は次工程</small>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0;">',
      compactMetric("大項目", all.length),
      compactMetric("未送信", unsent.length),
      compactMetric("送信済", sentCount),
      compactMetric("中項目", middleCount),
      compactMetric("作業単位", workerCount),
      compactMetric("選択", selectedCount),
      '</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">',
      '<button type="button" data-core-action="v10l-b1d-select-unsent">未送信を選択</button>',
      '<button type="button" data-core-action="v10l-b1d-clear-selection">解除</button>',
      '<button type="button" data-core-action="v10l-b1d-confirm-selected">選択を確認</button>',
      '<button type="button" data-core-action="v10l-b1d-confirm-unsent">未送信を確認</button>',
      '<button type="button" data-core-action="v10l-b1d-confirm-all" style="grid-column:1 / -1;">全件を確認</button>',
      '</div>',
      '<p class="aicm-selected-note" style="margin:8px 0 0;">全件は重複作成リスクあり。標準は未送信のみ。</p>',
      rowListHtml(all),
      '</section>'
    ].join("");
  }

  function confirmHtml(mode) {
    var list = targets(mode);
    var title = mode === "all" ? "全件を課長へ送る確認" : (mode === "selected" ? "選択分を課長へ送る確認" : "未送信分を課長へ送る確認");

    return [
      '<section class="aicm-core-card" data-aicm-v10l-b1d-confirm="true" style="padding:16px;border:2px solid #f59e0b;margin-bottom:14px;">',
      '<p class="aicm-eyebrow">V10L / DB更新前確認</p>',
      '<h2 style="font-size:1.25rem;">' + esc(title) + '</h2>',
      '<p class="aicm-selected-note">まだDB更新/API POSTは実行しません。</p>',
      mode === "all" ? '<p class="aicm-core-message aicm-core-message-error">全件送信は、送信済み推定も含むため重複リスクがあります。</p>' : '',
      '<p><strong>対象: ' + esc(list.length) + '件</strong></p>',
      '<details><summary style="font-weight:700;cursor:pointer;">対象IDを確認</summary>',
      '<div style="max-height:220px;overflow:auto;margin-top:8px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;">',
      list.length ? list.map(function(item) {
        return '<div style="padding:8px;border-bottom:1px solid #f3f4f6;"><strong>' + esc(item.name) + '</strong><br><small>' + esc(item.id) + '</small></div>';
      }).join("") : '<p class="aicm-core-empty" style="padding:8px;">対象がありません。</p>',
      '</div></details>',
      '<div class="aicm-dashboard-action-row" style="margin-top:10px;">',
      '<button type="button" data-core-action="v10l-b1d-close-confirm">閉じる</button>',
      '<button type="button" disabled title="V10L-B2で実行解放">課長へ送る実行（次工程）</button>',
      '</div>',
      '</section>'
    ].join("");
  }

  function isTaskLedgerScreen() {
    var s = appState();
    if (text(s.screen) === "task-ledger") return true;
    return false;
  }

  function topTarget() {
    return document.querySelector(".aicm-core-main") || document.querySelector("main") || document.body;
  }

  function removeOldPanels() {
    var old = document.querySelectorAll('[data-aicm-v10l-b1b-panel="true"], [data-aicm-v10l-b1c-mount="true"]');
    for (var i = 0; i < old.length; i += 1) {
      if (old[i] && old[i].parentNode) old[i].parentNode.removeChild(old[i]);
    }
  }

  function injectPanel() {
    if (renderLock) return false;
    if (!isTaskLedgerScreen()) return false;

    renderLock = true;
    try {
      removeOldPanels();

      var target = topTarget();
      if (!target) return false;

      var existing = document.querySelector('[data-aicm-v10l-b1d-mount="true"]');

      if (!existing) {
        existing = document.createElement("div");
        existing.setAttribute("data-aicm-v10l-b1d-mount", "true");
        target.insertBefore(existing, target.firstChild);
      }

      existing.innerHTML = panelHtml();
      return true;
    } finally {
      renderLock = false;
    }
  }

  function showConfirm(mode) {
    injectPanel();

    var old = document.querySelector('[data-aicm-v10l-b1d-confirm="true"]');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var mount = document.querySelector('[data-aicm-v10l-b1d-mount="true"]');
    if (!mount || !mount.parentNode) return;

    var wrap = document.createElement("div");
    wrap.innerHTML = confirmHtml(mode);

    mount.parentNode.insertBefore(wrap.firstElementChild, mount.nextSibling);

    try {
      mount.scrollIntoView({ block: "start", behavior: "smooth" });
    } catch (_) {}
  }

  function closeConfirm() {
    var old = document.querySelector('[data-aicm-v10l-b1d-confirm="true"]');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function scheduleInject() {
    try { setTimeout(injectPanel, 0); } catch (_) {}
    try { setTimeout(injectPanel, 200); } catch (_) {}
    try { setTimeout(injectPanel, 800); } catch (_) {}
  }

  try {
    if (typeof render === "function" && !render.__aicmV10lB1d) {
      var beforeRender = render;
      render = function render() {
        var result = beforeRender.apply(this, arguments);
        scheduleInject();
        return result;
      };
      render.__aicmV10lB1d = true;
    }
  } catch (_) {}

  document.addEventListener("change", function(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute("data-v10l-b1d-major-checkbox") !== "true") return;

    var id = text(target.value);
    if (!id) return;

    if (target.checked) selectedMap()[id] = true;
    else delete selectedMap()[id];

    scheduleInject();
  }, true);

  document.addEventListener("click", function(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) return;

    var action = target.getAttribute("data-core-action") || "";
    var screen = target.getAttribute("data-screen") || "";

    if (action === "task-ledger-open" || screen === "task-ledger") {
      scheduleInject();
      return;
    }

    if (action === "v10l-b1d-select-unsent") {
      event.preventDefault();
      var next = {};
      unsentRows().forEach(function(item) { next[item.id] = true; });
      window.__aicmV10lB1dSelectedMajorIds = next;
      injectPanel();
      return;
    }

    if (action === "v10l-b1d-clear-selection") {
      event.preventDefault();
      window.__aicmV10lB1dSelectedMajorIds = {};
      injectPanel();
      return;
    }

    if (action === "v10l-b1d-confirm-selected") {
      event.preventDefault();
      showConfirm("selected");
      return;
    }

    if (action === "v10l-b1d-confirm-unsent") {
      event.preventDefault();
      showConfirm("unsent");
      return;
    }

    if (action === "v10l-b1d-confirm-all") {
      event.preventDefault();
      showConfirm("all");
      return;
    }

    if (action === "v10l-b1d-close-confirm") {
      event.preventDefault();
      closeConfirm();
      return;
    }
  }, true);

  window.addEventListener("load", scheduleInject);
  window.aicmV10lB1dInjectPanel = injectPanel;

  scheduleInject();

  try {
    setInterval(injectPanel, 2500);
  } catch (_) {}
})();
// ${marker}_END
`;

src += block;

analysis.push("AFTER_B1D_MARKER_COUNT=" + count(src, marker));
for (const m of oldMarkers) {
  analysis.push("AFTER_" + m + "_COUNT=" + count(src, m));
}
analysis.push("AFTER_B1D_PANEL_COUNT=" + count(src, "data-aicm-v10l-b1d-panel"));
analysis.push("AFTER_B1D_MOUNT_COUNT=" + count(src, "data-aicm-v10l-b1d-mount"));
analysis.push("AFTER_B1D_CONFIRM_COUNT=" + count(src, "data-aicm-v10l-b1d-confirm"));
analysis.push("AFTER_EXEC_DISABLED_COUNT=" + count(src, "課長へ送る実行（次工程）"));
analysis.push("AFTER_NO_POST_IN_B1D_BLOCK=" + (!block.includes("requestJson(") && !block.includes("window.fetch") && !block.includes(".fetch(")));
analysis.push("PATCH_CHANGED=" + (src !== before));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
