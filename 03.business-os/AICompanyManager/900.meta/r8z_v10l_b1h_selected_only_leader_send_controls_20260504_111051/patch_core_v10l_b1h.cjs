const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

const marker = "AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS";
const oldMarkers = [
  "AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY",
  "AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER",
  "AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR",
  "AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL",
  "AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS",
  "AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP",
  "AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS"
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

analysis.push("BEFORE_B1H_MARKER_COUNT=" + count(src, marker));
for (const m of oldMarkers) {
  analysis.push("BEFORE_" + m + "_COUNT=" + count(src, m));
}

removeMarkedBlock(marker);
for (const m of oldMarkers) removeMarkedBlock(m);

const block = `

// ${marker}_START
// Registered major list controls.
// Top buttons:
// - 課長へ送る = selected rows only
// - 全件選択 = select all unsent / sendable rows
// - 解除 = clear selection
// Confirm-only. No DB write. No API POST.
(function aicmV10lB1hInstallSelectedOnlyLeaderSendControls() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__aicmV10lB1hInstalled) return;
  window.__aicmV10lB1hInstalled = true;

  var lock = false;
  window.__aicmV10lB1hSelectedMajorIds = window.__aicmV10lB1hSelectedMajorIds || {};

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

  function contextMajorItems() {
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
    var mids = middleItems();

    for (var i = 0; i < mids.length; i += 1) {
      var id = middleMajorId(mids[i]);
      if (id) map[id] = true;
    }

    return map;
  }

  function rowsFromContext() {
    var s = appState();
    var sent = sentMap();

    return contextMajorItems().map(function(row) {
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
    window.__aicmV10lB1hSelectedMajorIds = window.__aicmV10lB1hSelectedMajorIds || {};
    return window.__aicmV10lB1hSelectedMajorIds;
  }

  function allRows() {
    return rowsFromContext();
  }

  function sendableRows() {
    return allRows().filter(function(row) {
      return !row.sent;
    });
  }

  function selectedRows() {
    var selected = selectedMap();
    return allRows().filter(function(row) {
      return !!selected[row.id];
    });
  }

  function findRegisteredMajorHeading() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3,h4,h5,p,strong,summary,div"));
    var best = null;

    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      var t = text(node.innerText || node.textContent);
      if (!t) continue;

      if (
        t === "登録済み大項目" ||
        t === "登録済みManager大項目" ||
        t.indexOf("登録済み大項目") >= 0 ||
        t.indexOf("登録済み Manager大項目") >= 0
      ) {
        if (!best || t.length < text(best.innerText || best.textContent).length) {
          best = node;
        }
      }
    }

    return best;
  }

  function findRegisteredMajorSection() {
    var heading = findRegisteredMajorHeading();
    if (!heading) return null;
    return heading.closest(".aicm-core-card") || heading.parentElement || null;
  }

  function isTaskLedgerScreen() {
    var s = appState();
    if (text(s.screen) === "task-ledger") return true;

    var bodyText = text(document.body && document.body.innerText);
    return bodyText.indexOf("部門別タスク台帳") >= 0 && bodyText.indexOf("登録済み大項目") >= 0;
  }

  function removeMounts() {
    var old = document.querySelectorAll(
      '[data-aicm-v10l-b1b-panel="true"],' +
      '[data-aicm-v10l-b1c-mount="true"],' +
      '[data-aicm-v10l-b1d-mount="true"],' +
      '[data-aicm-v10l-b1d-panel="true"],' +
      '[data-aicm-v10l-b1e-mount="true"],' +
      '[data-aicm-v10l-b1f-mount="true"],' +
      '[data-aicm-v10l-b1f-confirm="true"],' +
      '[data-aicm-v10l-b1g-mount="true"],' +
      '[data-aicm-v10l-b1g-confirm="true"],' +
      '[data-aicm-v10l-b1h-mount="true"],' +
      '[data-aicm-v10l-b1h-confirm="true"]'
    );

    for (var i = 0; i < old.length; i += 1) {
      if (old[i] && old[i].parentNode) old[i].parentNode.removeChild(old[i]);
    }
  }

  function findRowElementByIdOrName(row) {
    var section = findRegisteredMajorSection();
    if (!section) return null;

    var selectors = [
      ".aicm-core-card",
      "article",
      "li",
      "tr",
      "[data-manager-major-id]",
      "[data-major-id]",
      "[data-row-id]",
      "[data-id]"
    ].join(",");

    var nodes = Array.prototype.slice.call(section.querySelectorAll(selectors));
    var id = text(row.id);
    var name = text(row.name);

    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      if (!node || node.getAttribute && node.getAttribute("data-aicm-v10l-b1h-mount") === "true") continue;

      var attrs = "";
      if (node.getAttribute) {
        attrs = [
          node.getAttribute("data-manager-major-id"),
          node.getAttribute("data-major-id"),
          node.getAttribute("data-row-id"),
          node.getAttribute("data-id")
        ].filter(Boolean).join(" ");
      }

      var body = text((node.innerText || node.textContent || "") + " " + attrs);

      if (id && body.indexOf(id) >= 0) return node;
      if (name && name.length >= 6 && body.indexOf(name) >= 0) return node;
    }

    return null;
  }

  function hidePerCardLeaderButtons() {
    var section = findRegisteredMajorSection();
    if (!section) return;

    var buttons = Array.prototype.slice.call(section.querySelectorAll("button,a"));
    buttons.forEach(function(btn) {
      if (!btn || btn.closest('[data-aicm-v10l-b1h-mount="true"]') || btn.closest('[data-aicm-v10l-b1h-confirm="true"]')) return;

      var label = text(btn.innerText || btn.textContent || btn.value);
      if (!label) return;

      if (
        label === "課長へ送る" ||
        label.indexOf("課長へ送る") >= 0 ||
        label.indexOf("Leaderへ送る") >= 0 ||
        label.indexOf("リーダーへ送る") >= 0
      ) {
        btn.setAttribute("data-aicm-v10l-b1h-hidden-individual-send", "true");
        btn.style.display = "none";
      }
    });
  }

  function applyRowSelectionControls() {
    var rows = allRows();
    var selected = selectedMap();
    var applied = 0;

    rows.forEach(function(row) {
      var el = findRowElementByIdOrName(row);
      if (!el) return;

      if (el.querySelector && el.querySelector('[data-aicm-v10l-b1h-row-selector="true"][data-major-id="' + row.id + '"]')) {
        return;
      }

      var wrap = document.createElement("label");
      wrap.setAttribute("data-aicm-v10l-b1h-row-selector", "true");
      wrap.setAttribute("data-major-id", row.id);
      wrap.style.cssText = "display:flex;align-items:center;gap:8px;margin:6px 0 8px;padding:8px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;";

      var disabled = row.sent ? " disabled" : "";
      var checked = selected[row.id] ? " checked" : "";

      wrap.innerHTML = [
        '<input type="checkbox" data-v10l-b1h-major-checkbox="true" value="' + esc(row.id) + '"' + checked + disabled + '>',
        '<span><strong>選択</strong><br><small>' + esc(row.sent ? "課長送信済み推定のため選択不可" : "課長へ送信対象にする") + '</small></span>'
      ].join("");

      if (el.firstChild) el.insertBefore(wrap, el.firstChild);
      else el.appendChild(wrap);

      applied += 1;
    });

    return applied;
  }

  function syncCheckboxesFromSelection() {
    var selected = selectedMap();
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-v10l-b1h-major-checkbox="true"]'));
    boxes.forEach(function(box) {
      var id = text(box.value);
      if (!id) return;
      box.checked = !!selected[id];
    });
  }

  function buttonBarHtml() {
    var all = allRows();
    var sendable = sendableRows();
    var selected = selectedRows();

    return [
      '<div data-aicm-v10l-b1h-buttons="true" style="margin:8px 0 12px;padding:8px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;">',
      '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;">',
      '<strong>課長へ送る</strong>',
      '<small style="color:#64748b;">選択 ' + esc(selected.length) + ' / 送信可能 ' + esc(sendable.length) + ' / 全件 ' + esc(all.length) + '</small>',
      '</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">',
      '<button type="button" data-core-action="v10l-b1h-send-selected">課長へ送る</button>',
      '<button type="button" data-core-action="v10l-b1h-select-all">全件選択</button>',
      '<button type="button" data-core-action="v10l-b1h-clear-selection">解除</button>',
      '</div>',
      '<p class="aicm-selected-note" style="margin:6px 0 0;">全件選択は未送信分のみ選択します。</p>',
      '</div>'
    ].join("");
  }

  function confirmHtml() {
    var list = selectedRows();

    return [
      '<section class="aicm-core-card" data-aicm-v10l-b1h-confirm="true" style="padding:14px;border:2px solid #f59e0b;margin:8px 0 12px;">',
      '<p class="aicm-eyebrow">V10L / DB更新前確認</p>',
      '<h2 style="font-size:1.2rem;">選択した大項目を課長へ送る確認</h2>',
      '<p class="aicm-selected-note">まだDB更新/API POSTは実行しません。</p>',
      list.length === 0 ? '<p class="aicm-core-message aicm-core-message-error">送る大項目が選択されていません。</p>' : '',
      '<p><strong>対象: ' + esc(list.length) + '件</strong></p>',
      '<details><summary style="font-weight:700;cursor:pointer;">対象を確認</summary>',
      '<div style="max-height:220px;overflow:auto;margin-top:8px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;">',
      list.length ? list.map(function(item) {
        return '<div style="padding:8px;border-bottom:1px solid #f3f4f6;"><strong>' + esc(item.name) + '</strong><br><small>' + esc(item.id) + '</small></div>';
      }).join("") : '<p class="aicm-core-empty" style="padding:8px;">対象がありません。</p>',
      '</div></details>',
      '<div class="aicm-dashboard-action-row" style="margin-top:10px;">',
      '<button type="button" data-core-action="v10l-b1h-close-confirm">閉じる</button>',
      '<button type="button" disabled title="V10L-B2で実行解放">課長へ送る実行（次工程）</button>',
      '</div>',
      '</section>'
    ].join("");
  }

  function injectButtons() {
    if (lock) return false;

    if (!isTaskLedgerScreen()) {
      removeMounts();
      return false;
    }

    lock = true;
    try {
      var heading = findRegisteredMajorHeading();
      if (!heading || !heading.parentNode) return false;

      hidePerCardLeaderButtons();

      var existing = document.querySelector('[data-aicm-v10l-b1h-mount="true"]');

      if (!existing) {
        existing = document.createElement("div");
        existing.setAttribute("data-aicm-v10l-b1h-mount", "true");
        heading.parentNode.insertBefore(existing, heading.nextSibling);
      }

      existing.innerHTML = buttonBarHtml();

      var applied = applyRowSelectionControls();
      syncCheckboxesFromSelection();

      existing.setAttribute("data-applied-row-selectors", String(applied));
      return true;
    } finally {
      lock = false;
    }
  }

  function showConfirm() {
    injectButtons();

    var old = document.querySelector('[data-aicm-v10l-b1h-confirm="true"]');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var mount = document.querySelector('[data-aicm-v10l-b1h-mount="true"]');
    if (!mount || !mount.parentNode) return;

    var wrap = document.createElement("div");
    wrap.innerHTML = confirmHtml();
    mount.parentNode.insertBefore(wrap.firstElementChild, mount.nextSibling);

    try {
      mount.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch (_) {}
  }

  function closeConfirm() {
    var old = document.querySelector('[data-aicm-v10l-b1h-confirm="true"]');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function selectAllSendable() {
    var next = {};
    sendableRows().forEach(function(row) {
      next[row.id] = true;
    });
    window.__aicmV10lB1hSelectedMajorIds = next;
    injectButtons();
  }

  function clearSelection() {
    window.__aicmV10lB1hSelectedMajorIds = {};
    injectButtons();
  }

  function scheduleInject() {
    try { setTimeout(injectButtons, 0); } catch (_) {}
    try { setTimeout(injectButtons, 200); } catch (_) {}
    try { setTimeout(injectButtons, 800); } catch (_) {}
    try { setTimeout(injectButtons, 1500); } catch (_) {}
  }

  try {
    if (typeof render === "function" && !render.__aicmV10lB1h) {
      var beforeRender = render;
      render = function render() {
        var result = beforeRender.apply(this, arguments);
        scheduleInject();
        return result;
      };
      render.__aicmV10lB1h = true;
    }
  } catch (_) {}

  document.addEventListener("click", function(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) return;

    var action = target.getAttribute("data-core-action") || "";
    var screen = target.getAttribute("data-screen") || "";

    if (action === "task-ledger-open" || screen === "task-ledger") {
      scheduleInject();
      return;
    }

    if (action === "v10l-b1h-send-selected") {
      event.preventDefault();
      showConfirm();
      return;
    }

    if (action === "v10l-b1h-select-all") {
      event.preventDefault();
      selectAllSendable();
      return;
    }

    if (action === "v10l-b1h-clear-selection") {
      event.preventDefault();
      clearSelection();
      return;
    }

    if (action === "v10l-b1h-close-confirm") {
      event.preventDefault();
      closeConfirm();
      return;
    }
  }, true);

  document.addEventListener("change", function(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) return;

    if (target.getAttribute("data-v10l-b1h-major-checkbox") === "true") {
      var id = text(target.value);
      if (!id) return;

      if (target.checked) selectedMap()[id] = true;
      else delete selectedMap()[id];

      injectButtons();
      return;
    }

    scheduleInject();
  }, true);

  window.addEventListener("load", scheduleInject);
  window.aicmV10lB1hInjectButtons = injectButtons;

  scheduleInject();

  try {
    setInterval(injectButtons, 2000);
  } catch (_) {}
})();
// ${marker}_END
`;

src += block;

analysis.push("AFTER_B1H_MARKER_COUNT=" + count(src, marker));
for (const m of oldMarkers) {
  analysis.push("AFTER_" + m + "_COUNT=" + count(src, m));
}
analysis.push("AFTER_B1H_MOUNT_COUNT=" + count(src, "data-aicm-v10l-b1h-mount"));
analysis.push("AFTER_B1H_BUTTONS_COUNT=" + count(src, "data-aicm-v10l-b1h-buttons"));
analysis.push("AFTER_B1H_ROW_SELECTOR_COUNT=" + count(src, "data-aicm-v10l-b1h-row-selector"));
analysis.push("AFTER_B1H_CHECKBOX_COUNT=" + count(src, "data-v10l-b1h-major-checkbox"));
analysis.push("AFTER_B1H_SEND_SELECTED_ACTION_COUNT=" + count(src, "v10l-b1h-send-selected"));
analysis.push("AFTER_B1H_SELECT_ALL_ACTION_COUNT=" + count(src, "v10l-b1h-select-all"));
analysis.push("AFTER_B1H_CLEAR_ACTION_COUNT=" + count(src, "v10l-b1h-clear-selection"));
analysis.push("AFTER_LABEL_KACHO_SEND_COUNT=" + count(src, "課長へ送る"));
analysis.push("AFTER_LABEL_SELECT_ALL_COUNT=" + count(src, "全件選択"));
analysis.push("AFTER_LABEL_CLEAR_COUNT=" + count(src, "解除"));
analysis.push("AFTER_EXEC_DISABLED_COUNT=" + count(src, "課長へ送る実行（次工程）"));
analysis.push("AFTER_NO_API_CALL_IN_B1H_BLOCK=" + (!block.includes("requestJson(") && !block.includes("window.fetch") && !block.includes(".fetch(")));
analysis.push("PATCH_CHANGED=" + (src !== before));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\\n") + "\\n");
fs.writeFileSync(analysisPath, analysis.join("\\n") + "\\n");
