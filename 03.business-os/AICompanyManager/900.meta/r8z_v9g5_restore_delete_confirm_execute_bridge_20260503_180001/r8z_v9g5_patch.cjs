const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9G5_RESTORE_DELETE_CONFIRM_EXECUTE_BRIDGE_ONLY";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("managerMajorDeleteConfirm")) {
  log.push("ERROR: managerMajorDeleteConfirm not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

if (!src.includes("/api/aicm/v2/manager-major/update")) {
  log.push("ERROR: manager-major/update endpoint not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const helper = `

/* ${marker}
 * Restore only delete-confirm execute/cancel click bridge.
 * Patch itself does not call API.
 * User click on delete-confirm execute will POST/archive the selected Manager大項目.
 */
function aicmR8zV9g5Text(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aicmR8zV9g5DeleteConfirmState() {
  return state && state.managerMajorDeleteConfirm && typeof state.managerMajorDeleteConfirm === "object"
    ? state.managerMajorDeleteConfirm
    : null;
}

function aicmR8zV9g5OwnerId(payload) {
  payload = payload || {};
  var body = payload.body && typeof payload.body === "object" ? payload.body : {};
  return aicmR8zV9g5Text(
    body.owner_civilization_id ||
    payload.owner_civilization_id ||
    (payload.row && payload.row.owner_civilization_id) ||
    (state && state.ownerCivilizationId) ||
    (state && state.owner_civilization_id) ||
    (state && state.context && state.context.owner_civilization_id) ||
    "00000000-0000-4000-8000-000000000001"
  );
}

function aicmR8zV9g5MajorId(payload, btn) {
  payload = payload || {};
  var body = payload.body && typeof payload.body === "object" ? payload.body : {};

  var fromButton = "";
  try {
    if (btn && btn.getAttribute) {
      fromButton = btn.getAttribute("data-major-id") ||
        btn.getAttribute("data-manager-major-id") ||
        btn.getAttribute("data-id") ||
        "";
    }
  } catch (_) {}

  return aicmR8zV9g5Text(
    body.aicm_manager_major_work_item_id ||
    payload.aicm_manager_major_work_item_id ||
    payload.majorId ||
    payload.managerMajorId ||
    (payload.row && (
      payload.row.aicm_manager_major_work_item_id ||
      payload.row.manager_major_work_item_id ||
      payload.row.major_work_item_id ||
      payload.row.id
    )) ||
    fromButton ||
    ""
  );
}

async function aicmR8zV9g5ExecuteDeleteConfirm(btn) {
  var payload = aicmR8zV9g5DeleteConfirmState();

  if (!payload) {
    if (typeof setMessage === "function") setMessage("error", "削除確認情報が見つかりません。もう一度削除を押してください。");
    if (typeof render === "function") render();
    return;
  }

  var majorId = aicmR8zV9g5MajorId(payload, btn);
  var owner = aicmR8zV9g5OwnerId(payload);

  if (!majorId) {
    if (typeof setMessage === "function") setMessage("error", "削除対象のManager大項目IDを特定できません。");
    if (typeof render === "function") render();
    return;
  }

  try {
    if (typeof setMessage === "function") setMessage("info", "削除を実行しています。");

    if (typeof aicmExecuteMajorItemDeleteConfirmR8P === "function") {
      try {
        await aicmExecuteMajorItemDeleteConfirmR8P();
        return;
      } catch (existingError1) {
        if (typeof console !== "undefined" && console.warn) console.warn("existing delete execute R8P failed; fallback follows", existingError1);
      }
    }

    if (typeof aicmExecuteManagerMajorDeleteConfirmR8P === "function") {
      try {
        await aicmExecuteManagerMajorDeleteConfirmR8P();
        return;
      } catch (existingError2) {
        if (typeof console !== "undefined" && console.warn) console.warn("existing manager delete execute R8P failed; fallback follows", existingError2);
      }
    }

    var postBody = {
      owner_civilization_id: owner,
      aicm_manager_major_work_item_id: majorId,
      decomposition_status_code: "archived",
      handoff_status_code: "archived",
      note: aicmR8zV9g5Text(
        (payload.body && payload.body.note) ||
        (payload.row && payload.row.note) ||
        ""
      )
    };

    var result = null;

    if (typeof requestJson === "function") {
      result = await requestJson("/api/aicm/v2/manager-major/update", postBody);
    } else {
      var response = await fetch("/api/aicm/v2/manager-major/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(postBody)
      });

      var json = null;
      try { json = await response.json(); } catch (_) { json = null; }

      if (!response.ok || (json && json.result && json.result !== "ok")) {
        throw new Error(
          json && (json.error_message || json.message || json.error)
            ? (json.error_message || json.message || json.error)
            : "削除更新に失敗しました。"
        );
      }

      result = json || {};
    }

    state.managerMajorDeleteConfirm = null;
    state.screen = "task-ledger";

    try {
      if (typeof aicmReloadTaskLedgerContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else if (typeof refreshContext === "function") {
        await refreshContext();
      } else if (typeof loadContext === "function") {
        await loadContext();
      } else {
        var responseReload = await fetch("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner) + "&v=r8z_v9g5_" + Date.now());
        var contextJson = await responseReload.json();
        if (contextJson && contextJson.result === "ok") state.context = contextJson;
      }
    } catch (reloadError) {
      if (typeof console !== "undefined" && console.warn) console.warn("delete context reload skipped", reloadError);
    }

    if (typeof setMessage === "function") setMessage("ok", "Manager大項目を削除しました。");

    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_execute_done");
    } else if (typeof render === "function") {
      render();
    }

    return result || {};
  } catch (error) {
    if (typeof setMessage === "function") {
      setMessage("error", error && error.message ? error.message : "削除に失敗しました。");
    }
    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_execute_error");
    } else if (typeof render === "function") {
      render();
    }
    throw error;
  }
}

function aicmR8zV9g5CancelDeleteConfirm() {
  if (state) state.managerMajorDeleteConfirm = null;
  if (typeof setMessage === "function") setMessage("info", "削除をキャンセルしました。");

  if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
    aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_cancel");
  } else if (typeof render === "function") {
    render();
  }
}

(function aicmInstallR8zV9g5DeleteConfirmExecuteBridge() {
  try {
    if (typeof document !== "undefined" && document.addEventListener && typeof window !== "undefined") {
      if (!window.__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled) {
        window.__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled = true;

        document.addEventListener("click", function aicmR8zV9g5DeleteConfirmClickBridge(ev) {
          try {
            var target = ev && ev.target;
            var btn = target && typeof target.closest === "function"
              ? target.closest("[data-core-action], button")
              : null;

            if (!btn || !btn.getAttribute) return;

            var action = aicmR8zV9g5Text(btn.getAttribute("data-core-action"));
            var label = aicmR8zV9g5Text(btn.textContent || btn.innerText || "");

            var isDeleteExecuteAction =
              action === "pmlw-major-delete-execute" ||
              action === "manager-major-delete-execute" ||
              action === "major-delete-execute" ||
              action === "delete-major-confirm" ||
              action === "r8z-v9g-delete-execute" ||
              action === "r8z-v9g5-delete-execute";

            var isDeleteCancelAction =
              action === "pmlw-major-delete-cancel" ||
              action === "manager-major-delete-cancel" ||
              action === "major-delete-cancel" ||
              action === "delete-major-cancel" ||
              action === "r8z-v9g-delete-cancel" ||
              action === "r8z-v9g5-delete-cancel";

            var hasDeleteState = !!aicmR8zV9g5DeleteConfirmState();

            if (!isDeleteExecuteAction && hasDeleteState && /削除/.test(label) && /確定|実行|削除する|はい/.test(label)) {
              isDeleteExecuteAction = true;
            }

            if (!isDeleteCancelAction && hasDeleteState && /キャンセル|戻る|いいえ/.test(label)) {
              isDeleteCancelAction = true;
            }

            if (isDeleteExecuteAction) {
              ev.preventDefault();
              ev.stopPropagation();
              aicmR8zV9g5ExecuteDeleteConfirm(btn);
              return;
            }

            if (isDeleteCancelAction) {
              ev.preventDefault();
              ev.stopPropagation();
              aicmR8zV9g5CancelDeleteConfirm();
            }
          } catch (error) {
            try {
              if (typeof setMessage === "function") setMessage("error", error && error.message ? error.message : "削除操作でエラーが発生しました。");
              if (typeof render === "function") render();
            } catch (_) {}
          }
        }, true);
      }
    }
  } catch (error) {
    try {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("AICM R8Z-V9G5 delete confirm execute bridge install skipped", error);
      }
    } catch (_) {}
  }
})();
`;

const anchors = [
  "/* AICM_R8Z_V9G_DELETE_RUNTIME_VISIBLE_DEBUG_AND_BRIDGE",
  "/* AICM_R8Z_V9F6_RESTORE_LEADER_HANDOFF_EXECUTE_ONLY",
  "// AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1",
  "// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START"
];

let inserted = false;
for (const anchor of anchors) {
  const idx = src.indexOf(anchor);
  if (idx >= 0) {
    src = src.slice(0, idx) + helper + "\n" + src.slice(idx);
    log.push("PATCH_APPLIED: inserted before " + anchor);
    inserted = true;
    break;
  }
}

if (!inserted) {
  log.push("ERROR: safe anchor not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(4);
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
