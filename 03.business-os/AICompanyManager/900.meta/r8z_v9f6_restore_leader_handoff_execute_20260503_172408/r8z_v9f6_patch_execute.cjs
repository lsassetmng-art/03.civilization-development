const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9F6_RESTORE_LEADER_HANDOFF_EXECUTE_ONLY";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (/function\s+aicmExecuteLeaderHandoffConfirmR8S\s*\(/.test(src)) {
  log.push("SKIP: aicmExecuteLeaderHandoffConfirmR8S already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!/function\s+aicmOpenLeaderHandoffConfirmR8S\s*\(/.test(src)) {
  log.push("ERROR: aicmOpenLeaderHandoffConfirmR8S not found. Apply V9F3 first.");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

if (!src.includes("/api/aicm/v2/manager-major/update")) {
  log.push("ERROR: manager-major/update endpoint literal not found in core");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const helper = `

/* ${marker}
 * Restore only the missing execute entrypoint for the already-visible
 * Manager大項目 -> 課長へ送る confirmation card.
 * Patch execution itself does not write DB or call API.
 * User click on the confirm button will POST to /api/aicm/v2/manager-major/update.
 */
async function aicmExecuteLeaderHandoffConfirmR8S() {
  var payload = state && state.managerMajorLeaderHandoffConfirm;

  try {
    if (!payload || typeof payload !== "object") {
      throw new Error("課長へ送る確認情報が見つかりません。もう一度「課長へ送る」を押してください。");
    }

    var body = payload.body && typeof payload.body === "object" ? payload.body : {};

    var owner = String(
      body.owner_civilization_id ||
      (typeof aicmLeaderHandoffOwnerIdR8S === "function" ? aicmLeaderHandoffOwnerIdR8S(payload.row || payload) : "") ||
      (state && state.ownerCivilizationId) ||
      (state && state.owner_civilization_id) ||
      (state && state.context && state.context.owner_civilization_id) ||
      "00000000-0000-4000-8000-000000000001"
    ).trim();

    var majorId = String(
      body.aicm_manager_major_work_item_id ||
      payload.majorId ||
      payload.aicm_manager_major_work_item_id ||
      ""
    ).trim();

    if (!owner) throw new Error("owner_civilization_idを特定できません。");
    if (!majorId) throw new Error("Manager大項目IDを特定できません。");

    var leader = String(
      body.assigned_leader_label ||
      payload.leaderLabel ||
      payload.leaderRaw ||
      (payload.row && (payload.row.assigned_leader_label || payload.row.leader_robot_label)) ||
      "課長/Leader"
    ).trim();

    var postBody = {
      owner_civilization_id: owner,
      aicm_manager_major_work_item_id: majorId,
      assigned_leader_label: leader,
      decomposition_status_code: "assigned_to_leader",
      handoff_status_code: "handed_off",
      note: String(body.note || (payload.row && payload.row.note) || "").trim()
    };

    if (typeof setMessage === "function") {
      setMessage("info", "課長へ送る処理を実行しています。");
    }

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
      try {
        json = await response.json();
      } catch (_) {
        json = null;
      }

      if (!response.ok || (json && json.result && json.result !== "ok")) {
        throw new Error(
          json && (json.error_message || json.message || json.error)
            ? (json.error_message || json.message || json.error)
            : "課長へ送る更新に失敗しました。"
        );
      }

      result = json || {};
    }

    var autoMessages = [];

    async function callOptionalAutoFunction(fnName, arg) {
      try {
        if (typeof globalThis !== "undefined" && typeof globalThis[fnName] === "function") {
          return await globalThis[fnName](arg);
        }
      } catch (_) {}
      return null;
    }

    try {
      var autoResult = null;

      if (typeof aicmRunLeaderAutoDecompositionAfterHandoffR8ZB === "function") {
        autoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(majorId);
      } else if (typeof aicmRunLeaderAutoDecompositionAfterConfirmR8ZB === "function") {
        autoResult = await aicmRunLeaderAutoDecompositionAfterConfirmR8ZB(majorId);
      } else if (typeof aicmRunLeaderAutoDecompositionForMajorR8ZB === "function") {
        autoResult = await aicmRunLeaderAutoDecompositionForMajorR8ZB(majorId);
      } else {
        autoResult = await callOptionalAutoFunction("aicmRunLeaderAutoDecompositionAfterHandoffR8ZB", majorId);
      }

      if (autoResult && autoResult.message) {
        autoMessages.push(String(autoResult.message));
      }
    } catch (autoError) {
      autoMessages.push("Leader自動分解は後続確認が必要です: " + String(autoError && autoError.message ? autoError.message : autoError));
    }

    try {
      if (typeof aicmRunWorkerAutoExecutionAfterDecompositionR8ZI === "function") {
        var workerAuto = await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(majorId);
        if (typeof aicmWorkerAutoExecutionMessageR8ZI === "function") {
          autoMessages.push(aicmWorkerAutoExecutionMessageR8ZI(workerAuto));
        }
      }
    } catch (workerAutoError) {
      autoMessages.push("Worker自動実行は後続確認が必要です: " + String(workerAutoError && workerAutoError.message ? workerAutoError.message : workerAutoError));
    }

    state.managerMajorLeaderHandoffConfirm = null;
    state.screen = "task-ledger";

    try {
      if (typeof aicmReloadTaskLedgerContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else if (typeof refreshContext === "function") {
        await refreshContext();
      } else if (typeof loadContext === "function") {
        await loadContext();
      } else {
        var ownerForReload = encodeURIComponent(owner);
        var responseReload = await fetch("/api/aicm/v2/context?owner_civilization_id=" + ownerForReload + "&v=r8z_v9f6_" + Date.now());
        var contextJson = await responseReload.json();
        if (contextJson && contextJson.result === "ok") {
          state.context = contextJson;
        }
      }
    } catch (reloadError) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("AICM V9F6 context reload skipped", reloadError);
      }
    }

    var okMessage = "課長へ送りました。";
    if (autoMessages.length) {
      okMessage += " " + autoMessages.join(" / ");
    }

    if (typeof setMessage === "function") {
      setMessage("ok", okMessage);
    }

    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("r8z_v9f6_execute_done");
    } else if (typeof render === "function") {
      render();
    }

    return result || {};
  } catch (error) {
    if (typeof setMessage === "function") {
      setMessage("error", error && error.message ? error.message : "課長へ送る処理に失敗しました。");
    }

    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("r8z_v9f6_execute_error");
    } else if (typeof render === "function") {
      render();
    }

    throw error;
  }
}
`;

const anchors = [
  "/* AICM_R8Z_V9F4B_CONFIRM_CARD_POST_RENDER_WRAPPER",
  "/* AICM_R8Z_V9F4",
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
