const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9F3_RESTORE_LEADER_HANDOFF_OPEN_CONFIRM_ONLY";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (/function\s+aicmOpenLeaderHandoffConfirmR8S\s*\(/.test(src)) {
  log.push("SKIP: aicmOpenLeaderHandoffConfirmR8S already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("pmlw-major-leader-handoff")) {
  log.push("ERROR: leader handoff action not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

const helper = `

  // ${marker}
  // Restore only the missing open-confirm entrypoint for data-core-action="pmlw-major-leader-handoff".
  // This function does not write DB and does not call any API.
  function aicmOpenLeaderHandoffConfirmR8S(ev, btn) {
    try {
      btn = btn || (typeof aicmActionTargetSafe === "function" ? aicmActionTargetSafe(ev, null) : null);
      if (!btn && ev && ev.target && typeof ev.target.closest === "function") {
        btn = ev.target.closest("[data-core-action]");
      }

      var majorId = "";
      if (btn && btn.getAttribute) {
        majorId = String(btn.getAttribute("data-major-id") || btn.getAttribute("data-manager-major-id") || "").trim();
      }

      if (!majorId && btn && btn.dataset) {
        majorId = String(btn.dataset.majorId || btn.dataset.managerMajorId || "").trim();
      }

      if (!majorId) {
        if (typeof setMessage === "function") setMessage("error", "課長へ送る対象のManager大項目IDを特定できません。");
        if (typeof render === "function") render();
        return;
      }

      var ctx = state && state.context && typeof state.context === "object" ? state.context : {};
      var rows = [];
      function addRows(value) {
        if (Array.isArray(value)) rows = rows.concat(value);
      }

      addRows(ctx.pmlw_major_items);
      addRows(ctx.manager_major_items);
      addRows(ctx.major_items);
      addRows(state && state.pmlw_major_items);
      addRows(state && state.manager_major_items);
      addRows(state && state.major_items);

      var row = null;
      for (var i = 0; i < rows.length; i += 1) {
        var candidate = rows[i] || {};
        var candidateId = String(
          candidate.aicm_manager_major_work_item_id ||
          candidate.manager_major_work_item_id ||
          candidate.major_work_item_id ||
          candidate.major_id ||
          candidate.id ||
          ""
        ).trim();

        if (candidateId === majorId) {
          row = candidate;
          break;
        }
      }

      row = row || {};

      var title = String(
        row.major_item_name ||
        row.task_name ||
        row.deliverable_name ||
        row.title ||
        "Manager大項目"
      ).trim();

      var leader = String(
        row.assigned_leader_label ||
        row.leader_robot_label ||
        row.responsible_robot_label ||
        row.responsible_role_code ||
        "課長/Leader"
      ).trim();

      state.managerMajorLeaderHandoffConfirm = {
        kind: "manager-major-leader-handoff",
        title: "課長へ送る確認",
        majorId: majorId,
        aicm_manager_major_work_item_id: majorId,
        major_item_name: title,
        targetTitle: title,
        leaderLabel: leader,
        leaderRaw: leader,
        row: row,
        endpoint: "/api/aicm/v2/manager-major/update",
        backScreen: "task-ledger",
        body: {
          owner_civilization_id: typeof aicmLeaderHandoffOwnerIdR8S === "function"
            ? aicmLeaderHandoffOwnerIdR8S(row)
            : ((state && state.ownerCivilizationId) || (state && state.owner_civilization_id) || (ctx && ctx.owner_civilization_id) || "00000000-0000-4000-8000-000000000001"),
          aicm_manager_major_work_item_id: majorId,
          assigned_leader_label: leader,
          decomposition_status_code: "assigned_to_leader",
          handoff_status_code: "handed_off",
          note: String(row.note || "").trim()
        }
      };

      state.screen = "task-ledger";

      if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
        aicmRenderTaskLedgerSafeR8V4("r8z_v9f3_open_confirm");
        return;
      }

      if (typeof render === "function") {
        render();
      }
    } catch (error) {
      try {
        if (typeof setMessage === "function") {
          setMessage("error", error && error.message ? error.message : "課長へ送る確認の表示に失敗しました。");
        }
        if (typeof render === "function") render();
      } catch (_) {}
    }
  }
`;

const anchors = [
  "function aicmExecuteLeaderHandoffConfirmR8S",
  "function aicmBuildLeaderHandoffConfirmR8S",
  "// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_START",
  "// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_START"
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
  process.exit(3);
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
