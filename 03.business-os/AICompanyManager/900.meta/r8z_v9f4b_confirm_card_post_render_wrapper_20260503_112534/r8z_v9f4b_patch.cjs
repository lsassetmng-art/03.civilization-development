const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9F4B_CONFIRM_CARD_POST_RENDER_WRAPPER";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("function renderTaskLedgerPlaceholder()")) {
  log.push("ERROR: renderTaskLedgerPlaceholder not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

const helper = `

/* ${marker}
 * Display-only repair for Manager大項目 -> 課長へ送る confirmation card.
 * This block is intentionally installed AFTER renderTaskLedgerPlaceholder exists.
 * It does not write DB and does not call API.
 */
function aicmRenderLeaderHandoffConfirmCardR8SV9F4B() {
  var payload = state && state.managerMajorLeaderHandoffConfirm;
  if (!payload || typeof payload !== "object") return "";

  var esc = typeof escapeHtml === "function" ? escapeHtml : function(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  var majorId = String(
    payload.majorId ||
    payload.aicm_manager_major_work_item_id ||
    (payload.body && payload.body.aicm_manager_major_work_item_id) ||
    ""
  ).trim();

  var row = payload.row || {};
  var title = String(
    payload.major_item_name ||
    payload.targetTitle ||
    row.major_item_name ||
    row.task_name ||
    row.deliverable_name ||
    "Manager大項目"
  ).trim();

  var leader = String(
    payload.leaderLabel ||
    payload.leaderRaw ||
    payload.assigned_leader_label ||
    (payload.body && payload.body.assigned_leader_label) ||
    row.assigned_leader_label ||
    row.leader_robot_label ||
    "課長/Leader"
  ).trim();

  return [
    '<section class="aicm-core-card aicm-leader-handoff-confirm-r8s" style="border:2px solid #f59e0b;">',
    '  <p class="aicm-eyebrow">課長へ送る確認</p>',
    '  <h2>このManager大項目を課長へ送りますか？</h2>',
    '  <p class="aicm-selected-note">DB更新前の確認カードです。内容を確認してから確定してください。</p>',
    '  <dl class="aicm-core-detail-list">',
    '    <dt>対象</dt><dd>' + esc(title) + '</dd>',
    '    <dt>課長/Leader</dt><dd>' + esc(leader) + '</dd>',
    '    <dt>Manager大項目ID</dt><dd>' + esc(majorId || '-') + '</dd>',
    '  </dl>',
    '  <div class="aicm-dashboard-action-row">',
    '    <button type="button" data-core-action="r8z-v9f4b-leader-handoff-confirm-cancel">キャンセル</button>',
    '    <button type="button" data-core-action="r8z-v9f4b-leader-handoff-confirm-execute" data-major-id="' + esc(majorId) + '">確認して課長へ送る</button>',
    '  </div>',
    '</section>'
  ].join("");
}

function aicmInjectLeaderHandoffConfirmCardR8SV9F4B(html) {
  var source = String(html || "");
  var card = aicmRenderLeaderHandoffConfirmCardR8SV9F4B();

  if (!card) return source;
  if (source.indexOf("aicm-leader-handoff-confirm-r8s") >= 0) return source;

  var anchor = '<p class="aicm-eyebrow">Manager大項目</p>';
  var idx = source.indexOf(anchor);

  if (idx >= 0) {
    var sectionIdx = source.lastIndexOf("<section", idx);
    if (sectionIdx >= 0) {
      return source.slice(0, sectionIdx) + card + source.slice(sectionIdx);
    }
    return source.slice(0, idx) + card + source.slice(idx);
  }

  if (source.indexOf("</main>") >= 0) {
    return source.replace("</main>", card + "</main>");
  }

  return card + source;
}

(function aicmInstallLeaderHandoffConfirmCardBridgeR8SV9F4B() {
  try {
    if (typeof renderTaskLedgerPlaceholder === "function" && !renderTaskLedgerPlaceholder.__r8zV9f4bLeaderConfirmWrapped) {
      var originalTaskLedgerPlaceholderR8zV9f4b = renderTaskLedgerPlaceholder;
      var wrappedTaskLedgerPlaceholderR8zV9f4b = function renderTaskLedgerPlaceholder() {
        return aicmInjectLeaderHandoffConfirmCardR8SV9F4B(
          originalTaskLedgerPlaceholderR8zV9f4b.apply(this, arguments)
        );
      };
      wrappedTaskLedgerPlaceholderR8zV9f4b.__r8zV9f4bLeaderConfirmWrapped = true;
      wrappedTaskLedgerPlaceholderR8zV9f4b.__r8zV9f4bOriginal = originalTaskLedgerPlaceholderR8zV9f4b;
      renderTaskLedgerPlaceholder = wrappedTaskLedgerPlaceholderR8zV9f4b;
    }

    if (typeof document !== "undefined" && document.addEventListener && typeof window !== "undefined") {
      if (!window.__aicmR8zV9f4bLeaderHandoffClickBridgeInstalled) {
        window.__aicmR8zV9f4bLeaderHandoffClickBridgeInstalled = true;

        document.addEventListener("click", function aicmR8zV9f4bLeaderHandoffClickBridge(ev) {
          try {
            var target = ev && ev.target;
            var btn = target && typeof target.closest === "function"
              ? target.closest("[data-core-action]")
              : null;

            if (!btn || !btn.getAttribute) return;

            var action = String(btn.getAttribute("data-core-action") || "").trim();

            if (action === "pmlw-major-leader-handoff") {
              if (typeof aicmOpenLeaderHandoffConfirmR8S === "function") {
                ev.preventDefault();
                ev.stopPropagation();
                aicmOpenLeaderHandoffConfirmR8S(ev, btn);
              }
              return;
            }

            if (action === "r8z-v9f4b-leader-handoff-confirm-cancel") {
              ev.preventDefault();
              ev.stopPropagation();
              if (state) state.managerMajorLeaderHandoffConfirm = null;

              if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
                aicmRenderTaskLedgerSafeR8V4("r8z_v9f4b_confirm_cancel");
              } else if (typeof render === "function") {
                render();
              }
              return;
            }

            if (action === "r8z-v9f4b-leader-handoff-confirm-execute") {
              if (typeof aicmExecuteLeaderHandoffConfirmR8S === "function") {
                ev.preventDefault();
                ev.stopPropagation();
                aicmExecuteLeaderHandoffConfirmR8S();
              }
            }
          } catch (error) {
            try {
              if (typeof setMessage === "function") {
                setMessage("error", error && error.message ? error.message : "課長へ送る確認の操作に失敗しました。");
              }
              if (typeof render === "function") render();
            } catch (_) {}
          }
        }, true);
      }
    }
  } catch (error) {
    try {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("AICM leader handoff confirm bridge V9F4B install skipped", error);
      }
    } catch (_) {}
  }
})();
`;

const anchor = "// AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1";
let idx = src.indexOf(anchor);

if (idx < 0) {
  anchor2 = "// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START";
  idx = src.indexOf(anchor2);
}

if (idx < 0) {
  log.push("ERROR: post-render safe anchor not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

src = src.slice(0, idx) + helper + "\n" + src.slice(idx);

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: V9F4B post-render wrapper installed before " + (src.indexOf(anchor) >= 0 ? anchor : "fallback anchor"));
fs.writeFileSync(patchLog, log.join("\n") + "\n");
