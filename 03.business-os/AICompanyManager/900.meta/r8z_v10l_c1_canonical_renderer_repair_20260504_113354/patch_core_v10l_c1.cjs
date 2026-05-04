const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

const marker = "AICM_R8Z_V10L_C1_CANONICAL_RENDERER_REPAIR";
const oldMarkers = [
  "AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY",
  "AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER",
  "AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR",
  "AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL",
  "AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS",
  "AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP",
  "AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS",
  "AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS",
  "AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS",
  "AICM_R8Z_V10L_B1J_DOM_CARD_SELECTABLE_CONTROLS",
  marker
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

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = "code";
  let escape = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (state === "line_comment") {
      if (ch === "\n") state = "code";
      continue;
    }

    if (state === "block_comment") {
      if (ch === "*" && next === "/") {
        state = "code";
        i += 1;
      }
      continue;
    }

    if (state === "single") {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === "'") {
        state = "code";
      }
      continue;
    }

    if (state === "double") {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        state = "code";
      }
      continue;
    }

    if (state === "template") {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === "`") {
        state = "code";
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      state = "line_comment";
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      state = "block_comment";
      i += 1;
      continue;
    }

    if (ch === "'") {
      state = "single";
      continue;
    }

    if (ch === '"') {
      state = "double";
      continue;
    }

    if (ch === "`") {
      state = "template";
      continue;
    }

    if (ch === "{") {
      depth += 1;
      continue;
    }

    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

analysis.push("BEFORE_RENDER_FUNC_COUNT=" + (src.match(/function\s+renderPmlwMajorRows\s*\(\s*rows\s*\)/g) || []).length);
for (const m of oldMarkers) {
  analysis.push("BEFORE_" + m + "_COUNT=" + count(src, m));
}

for (const m of oldMarkers) {
  removeMarkedBlock(m);
}

const funcRe = /function\s+renderPmlwMajorRows\s*\(\s*rows\s*\)\s*\{/;
const match = funcRe.exec(src);

if (!match) {
  fs.writeFileSync(logPath, log.concat(["PATCH_DECISION=STOP_RENDER_PMLW_MAJOR_ROWS_NOT_FOUND"]).join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.concat(["PATCH_DECISION=STOP_RENDER_PMLW_MAJOR_ROWS_NOT_FOUND"]).join("\n") + "\n");
  process.exit(2);
}

const start = match.index;
const open = src.indexOf("{", start);
const end = findMatchingBrace(src, open);

if (open < 0 || end < 0) {
  fs.writeFileSync(logPath, log.concat(["PATCH_DECISION=STOP_FUNCTION_BOUNDARY_NOT_FOUND"]).join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.concat(["PATCH_DECISION=STOP_FUNCTION_BOUNDARY_NOT_FOUND"]).join("\n") + "\n");
  process.exit(3);
}

const replacement = `
// ${marker}_START
function renderPmlwMajorRows(rows) {
    rows = Array.isArray(rows) ? rows : [];

    function h(value) {
      if (typeof escapeHtml === "function") return escapeHtml(value);
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function txt(value) {
      return String(value == null ? "" : value).trim();
    }

    function value(row, keys, fallback) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") return row[key];
      }
      return fallback == null ? "" : fallback;
    }

    function majorId(row, index) {
      if (typeof aicmAxuR1MajorId === "function") {
        var fromHelper = aicmAxuR1MajorId(row);
        if (fromHelper) return String(fromHelper);
      }

      return String(value(row, [
        "aicm_manager_major_work_item_id",
        "manager_major_work_item_id",
        "pmlw_major_item_id",
        "major_item_id",
        "id"
      ], "row-" + String(index)));
    }

    function titleOf(row) {
      return String(value(row, [
        "major_item_name",
        "major_work_title",
        "major_work_name",
        "deliverable_name",
        "task_name",
        "title",
        "name"
      ], "Manager大項目"));
    }

    function descriptionOf(row) {
      return String(value(row, [
        "major_item_description",
        "description",
        "note",
        "task_description"
      ], ""));
    }

    function statusText(row, key, fallback) {
      var raw = String(row && row[key] != null ? row[key] : fallback || "");
      if (typeof pmlwStatusLabel === "function") return pmlwStatusLabel(raw);
      return raw || "-";
    }

    function isArchived(row) {
      var handoff = String(row && row.handoff_status_code || "").toLowerCase();
      var decomposition = String(row && row.decomposition_status_code || "").toLowerCase();
      var deleted = String(row && (row.deleted_flag || row.is_deleted) || "").toLowerCase();
      var archived = String(row && (row.archived_flag || row.is_archived) || "").toLowerCase();

      return (
        handoff === "archived" ||
        handoff === "deleted" ||
        decomposition === "archived" ||
        decomposition === "deleted" ||
        deleted === "true" ||
        deleted === "1" ||
        archived === "true" ||
        archived === "1"
      );
    }

    function isSendable(row) {
      if (isArchived(row)) return false;

      var handoff = String(row && row.handoff_status_code || "").toLowerCase();
      var decomposition = String(row && row.decomposition_status_code || "").toLowerCase();

      if (handoff === "completed" || handoff === "done" || handoff === "sent" || handoff === "handoff_completed") return false;
      if (decomposition === "decomposed" || decomposition === "completed" || decomposition === "done") return false;

      return true;
    }

    function selectedMap() {
      if (typeof window === "undefined") return {};
      window.__aicmV10LC1SelectedMajorIds = window.__aicmV10LC1SelectedMajorIds || {};
      return window.__aicmV10LC1SelectedMajorIds;
    }

    function setSelectedMap(next) {
      if (typeof window === "undefined") return;
      window.__aicmV10LC1SelectedMajorIds = next || {};
    }

    function selectedIds() {
      var map = selectedMap();
      return Object.keys(map).filter(function (id) { return !!map[id]; });
    }

    function selectedRows() {
      var map = selectedMap();
      return rows.filter(function (row, index) {
        return !!map[majorId(row, index)];
      });
    }

    function sendableRows() {
      return rows.filter(isSendable);
    }

    function syncRuntimeRows() {
      if (typeof window === "undefined") return;

      var byId = {};
      var order = [];

      rows.forEach(function (row, index) {
        var id = majorId(row, index);
        byId[id] = row;
        order.push(id);
      });

      window.__aicmV10LC1MajorRowsById = byId;
      window.__aicmV10LC1MajorRowOrder = order;
    }

    function ensureDelegatedHandler() {
      if (typeof window === "undefined" || typeof document === "undefined") return;
      if (window.__aicmV10LC1DelegatedHandlerInstalled) return;

      window.__aicmV10LC1DelegatedHandlerInstalled = true;

      function rerender(reason) {
        try {
          if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
            aicmRenderTaskLedgerSafeR8V4(reason || "v10l_c1");
            return;
          }
        } catch (_) {}

        try {
          if (typeof render === "function") render();
        } catch (_) {}
      }

      function runtimeRows() {
        var byId = window.__aicmV10LC1MajorRowsById || {};
        var order = window.__aicmV10LC1MajorRowOrder || [];
        return order.map(function (id) {
          return byId[id];
        }).filter(Boolean);
      }

      function runtimeIsSendable(row) {
        var handoff = String(row && row.handoff_status_code || "").toLowerCase();
        var decomposition = String(row && row.decomposition_status_code || "").toLowerCase();

        if (handoff === "archived" || handoff === "deleted" || decomposition === "archived" || decomposition === "deleted") return false;
        if (handoff === "completed" || handoff === "done" || handoff === "sent" || handoff === "handoff_completed") return false;
        if (decomposition === "decomposed" || decomposition === "completed" || decomposition === "done") return false;

        return true;
      }

      function runtimeMajorId(row, index) {
        if (typeof aicmAxuR1MajorId === "function") {
          var fromHelper = aicmAxuR1MajorId(row);
          if (fromHelper) return String(fromHelper);
        }

        return String(
          row && (
            row.aicm_manager_major_work_item_id ||
            row.manager_major_work_item_id ||
            row.pmlw_major_item_id ||
            row.major_item_id ||
            row.id
          ) || "row-" + String(index)
        );
      }

      function runtimeSelectedRows() {
        var map = window.__aicmV10LC1SelectedMajorIds || {};
        return runtimeRows().filter(function (row, index) {
          return !!map[runtimeMajorId(row, index)];
        });
      }

      function openConfirm(kind) {
        if (typeof state !== "undefined" && state) {
          state.aicmV10LC1MajorConfirm = {
            kind: kind,
            ids: runtimeSelectedRows().map(function (row, index) {
              return runtimeMajorId(row, index);
            })
          };
        }

        rerender("v10l_c1_open_confirm");
      }

      function closeConfirm() {
        if (typeof state !== "undefined" && state) {
          state.aicmV10LC1MajorConfirm = null;
        }

        rerender("v10l_c1_close_confirm");
      }

      function yesConfirm() {
        var kind = "send";

        if (typeof state !== "undefined" && state && state.aicmV10LC1MajorConfirm) {
          kind = state.aicmV10LC1MajorConfirm.kind || "send";
          state.aicmV10LC1MajorConfirm = null;
          state.noticeMessage = (kind === "delete" ? "削除" : "課長へ送る") + "は次工程で実行します。今回はDB更新/API POSTなしです。";
          state.errorMessage = "";
        }

        rerender("v10l_c1_yes_noop");
      }

      document.addEventListener("click", function (event) {
        var target = event && event.target;
        if (!target || !target.getAttribute) return;

        var actionTarget = target.closest ? target.closest("[data-core-action]") : target;
        var action = actionTarget && actionTarget.getAttribute ? actionTarget.getAttribute("data-core-action") : "";

        if (action === "v10l-c1-send-selected") {
          event.preventDefault();
          event.stopPropagation();
          openConfirm("send");
          return;
        }

        if (action === "v10l-c1-delete-selected") {
          event.preventDefault();
          event.stopPropagation();
          openConfirm("delete");
          return;
        }

        if (action === "v10l-c1-select-all") {
          event.preventDefault();
          event.stopPropagation();

          var next = {};
          runtimeRows().forEach(function (row, index) {
            if (runtimeIsSendable(row)) next[runtimeMajorId(row, index)] = true;
          });

          window.__aicmV10LC1SelectedMajorIds = next;
          rerender("v10l_c1_select_all");
          return;
        }

        if (action === "v10l-c1-clear-selection") {
          event.preventDefault();
          event.stopPropagation();
          window.__aicmV10LC1SelectedMajorIds = {};
          rerender("v10l_c1_clear_selection");
          return;
        }

        if (action === "v10l-c1-confirm-no") {
          event.preventDefault();
          event.stopPropagation();
          closeConfirm();
          return;
        }

        if (action === "v10l-c1-confirm-yes") {
          event.preventDefault();
          event.stopPropagation();
          yesConfirm();
          return;
        }

        var rowCard = target.closest ? target.closest("[data-v10l-c1-major-card='true']") : null;
        if (rowCard && !target.closest("[data-v10l-c1-selector='true']") && !target.closest("button,a,input,select,textarea")) {
          var rowId = rowCard.getAttribute("data-major-id") || "";
          if (rowId) {
            event.preventDefault();
            event.stopPropagation();

            var selected = window.__aicmV10LC1SelectedMajorIds || {};
            if (selected[rowId]) delete selected[rowId];
            else selected[rowId] = true;

            window.__aicmV10LC1SelectedMajorIds = selected;
            rerender("v10l_c1_toggle_card");
          }
        }
      }, true);

      document.addEventListener("change", function (event) {
        var target = event && event.target;
        if (!target || !target.getAttribute) return;

        if (target.getAttribute("data-v10l-c1-major-checkbox") === "true") {
          var id = target.value || "";
          var selected = window.__aicmV10LC1SelectedMajorIds || {};

          if (target.checked) selected[id] = true;
          else delete selected[id];

          window.__aicmV10LC1SelectedMajorIds = selected;
          rerender("v10l_c1_checkbox");
        }
      }, true);
    }

    function renderOperationPanel() {
      var selectedCount = selectedRows().length;
      var sendableCount = sendableRows().length;

      return [
        '<section class="aicm-core-card" data-v10l-c1-operation-panel="true">',
        '  <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;">',
        '    <strong>大項目操作</strong>',
        '    <small style="color:#64748b;">選択 ' + h(selectedCount) + ' / 未送信 ' + h(sendableCount) + ' / 表示 ' + h(rows.length) + '</small>',
        '  </div>',
        '  <div class="aicm-dashboard-action-row" style="margin-top:10px;">',
        '    <button type="button" data-core-action="v10l-c1-send-selected">課長へ送る</button>',
        '    <button type="button" data-core-action="v10l-c1-delete-selected">削除</button>',
        '    <button type="button" data-core-action="v10l-c1-select-all">全件選択</button>',
        '    <button type="button" data-core-action="v10l-c1-clear-selection">解除</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderConfirm() {
      var confirm = (typeof state !== "undefined" && state) ? state.aicmV10LC1MajorConfirm : null;
      if (!confirm) return "";

      var map = {};
      (confirm.ids || []).forEach(function (id) { map[id] = true; });

      var list = rows.filter(function (row, index) {
        return !!map[majorId(row, index)];
      });

      var isDelete = confirm.kind === "delete";
      var title = isDelete ? "選択した大項目を削除しますか？" : "選択した大項目を課長へ送りますか？";

      return [
        '<section class="aicm-core-card" data-v10l-c1-confirm="true" style="border:2px solid ' + (isDelete ? '#ef4444' : '#f59e0b') + ';">',
        '  <h2>' + h(title) + '</h2>',
        list.length ? [
          '  <ol>',
          list.map(function (row) {
            return '    <li>' + h(titleOf(row)) + '</li>';
          }).join(""),
          '  </ol>'
        ].join("") : '  <p class="aicm-core-empty">対象がありません。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="v10l-c1-confirm-no">No</button>',
        '    <button type="button" data-core-action="v10l-c1-confirm-yes">Yes</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderRowCard(row, index) {
      var id = majorId(row, index);
      var selected = !!selectedMap()[id];
      var sendable = isSendable(row);
      var title = titleOf(row);
      var description = descriptionOf(row);

      return [
        '<article class="aicm-core-card" data-v10l-c1-major-card="true" data-major-id="' + h(id) + '">',
        '  <label data-v10l-c1-selector="true" style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">',
        '    <input type="checkbox" data-v10l-c1-major-checkbox="true" value="' + h(id) + '"' + (selected ? ' checked' : '') + '>',
        '    <span><strong>選択</strong><br><small>' + h(sendable ? "未送信" : "送信済み/対象外") + '</small></span>',
        '  </label>',
        '  <p class="aicm-eyebrow">Manager大項目 #' + h(index + 1) + '</p>',
        '  <h3>' + h(title) + '</h3>',
        description ? '  <p class="aicm-selected-note">' + h(description) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>課長/Leader</dt><dd>' + h(value(row, ["assigned_leader_label", "leader_label"], "未設定")) + '</dd>',
        '    <dt>優先度</dt><dd>' + h(statusText(row, "priority_code", "-")) + '</dd>',
        '    <dt>期限</dt><dd>' + h(value(row, ["due_date"], "未設定")) + '</dd>',
        '    <dt>分解状態</dt><dd>' + h(statusText(row, "decomposition_status_code", "-")) + '</dd>',
        '    <dt>引渡し</dt><dd>' + h(statusText(row, "handoff_status_code", "-")) + '</dd>',
        '  </dl>',
        '</article>'
      ].join("");
    }

    syncRuntimeRows();
    ensureDelegatedHandler();

    if (!rows.length) {
      return [
        renderOperationPanel(),
        '<div class="aicm-empty-state">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      renderOperationPanel(),
      renderConfirm(),
      '<div class="aicm-dashboard-grid">',
      rows.map(renderRowCard).join(""),
      '</div>'
    ].join("");
  }
// ${marker}_END`;

src = src.slice(0, start) + replacement + src.slice(end + 1);

analysis.push("AFTER_RENDER_FUNC_COUNT=" + (src.match(/function\s+renderPmlwMajorRows\s*\(\s*rows\s*\)/g) || []).length);
analysis.push("AFTER_C1_MARKER_COUNT=" + count(src, marker));
for (const m of oldMarkers) {
  if (m !== marker) analysis.push("AFTER_" + m + "_COUNT=" + count(src, m));
}
analysis.push("AFTER_V10L_C1_ACTION_COUNT=" + count(src, "v10l-c1-"));
analysis.push("AFTER_CHECKBOX_COUNT=" + count(src, "data-v10l-c1-major-checkbox"));
analysis.push("AFTER_CARD_COUNT=" + count(src, "data-v10l-c1-major-card"));
analysis.push("AFTER_CONFIRM_YES_COUNT=" + count(src, "v10l-c1-confirm-yes"));
analysis.push("AFTER_CONFIRM_NO_COUNT=" + count(src, "v10l-c1-confirm-no"));
analysis.push("PATCH_CHANGED=" + (src !== before));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
