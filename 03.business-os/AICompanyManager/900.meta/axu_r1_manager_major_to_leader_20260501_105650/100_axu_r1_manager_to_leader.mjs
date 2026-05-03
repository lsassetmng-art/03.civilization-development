import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;

if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let core = fs.readFileSync(coreFile, 'utf8');
const beforeCore = core;

const marker = 'AICM_AXU_R1_MANAGER_MAJOR_TO_LEADER_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function insertBefore(anchor, text) {
  const idx = core.indexOf(anchor);
  if (idx < 0) {
    console.error('Core anchor not found: ' + anchor);
    process.exit(1);
  }
  core = core.slice(0, idx) + text + '\n\n' + core.slice(idx);
}

function replaceOnce(needle, replacement, required) {
  if (!core.includes(needle)) {
    if (required) {
      console.error('Required needle not found: ' + needle);
      process.exit(1);
    }
    return false;
  }
  core = core.replace(needle, replacement);
  return true;
}

/*
 * 1. Add Manager major -> Leader handoff helpers.
 * This does NOT create Worker Runtime request.
 * It only prepares manager-major/update through the existing confirmation screen.
 */
if (!core.includes('function aicmAxuR1OpenLeaderHandoffConfirm')) {
  const helper = `
// ${marker}
// Manager大項目 -> 課長/Leader引渡し。
// Worker Runtime requestはここでは作らない。
// DB書込は既存確認画面を通して /api/aicm/v2/manager-major/update で実行する。
function aicmAxuR1Text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

function aicmAxuR1OwnerId() {
    if (state && state.ownerCivilizationId) return aicmAxuR1Text(state.ownerCivilizationId);
    if (state && state.context && state.context.owner_civilization_id) return aicmAxuR1Text(state.context.owner_civilization_id);
    return "00000000-0000-4000-8000-000000000001";
  }

function aicmAxuR1MajorId(row) {
    row = row || {};
    return aicmAxuR1Text(
      row.aicm_manager_major_work_item_id ||
      row.manager_major_work_item_id ||
      row.major_work_item_id ||
      row.id
    );
  }

function aicmAxuR1FindMajorById(majorId) {
    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
      ? state.context.pmlw_major_items
      : [];

    var id = aicmAxuR1Text(majorId);

    for (var i = 0; i < rows.length; i += 1) {
      if (aicmAxuR1MajorId(rows[i]) === id) return rows[i];
    }

    return null;
  }

function aicmAxuR1PlacementRoleText(row) {
    row = row || {};
    return [
      row.role_code,
      row.placement_role_code,
      row.assignment_role_code,
      row.worker_role_code,
      row.role_name,
      row.role_label,
      row.display_role,
      row.role_display_name,
      row.display_label
    ].map(aicmAxuR1Text).join(" ").toLowerCase();
  }

function aicmAxuR1IsActiveLeaderPlacement(row) {
    row = row || {};
    var status = aicmAxuR1Text(row.status_code || row.placement_status_code || "active").toLowerCase();
    var roleText = aicmAxuR1PlacementRoleText(row);

    if (status && status !== "active") return false;

    return (
      roleText.indexOf("leader") >= 0 ||
      roleText.indexOf("課長") >= 0 ||
      roleText.indexOf("リーダ") >= 0
    );
  }

function aicmAxuR1LeaderPlacementsForCompany(companyId) {
    var rows = state && state.context && Array.isArray(state.context.placements)
      ? state.context.placements
      : [];

    var cid = aicmAxuR1Text(companyId);

    return rows.filter(function (row) {
      return aicmAxuR1Text(row.aicm_user_company_id) === cid && aicmAxuR1IsActiveLeaderPlacement(row);
    });
  }

function aicmAxuR1BestLeaderForMajor(row) {
    row = row || {};

    var companyId = aicmAxuR1Text(row.aicm_user_company_id || state.selectedCompanyId);
    var departmentId = aicmAxuR1Text(row.aicm_user_company_department_id);
    var sectionId = aicmAxuR1Text(row.aicm_user_company_section_id);
    var leaders = aicmAxuR1LeaderPlacementsForCompany(companyId);

    if (!leaders.length) return null;

    if (sectionId) {
      for (var i = 0; i < leaders.length; i += 1) {
        if (aicmAxuR1Text(leaders[i].aicm_user_company_section_id) === sectionId) return leaders[i];
      }
    }

    if (departmentId) {
      for (var j = 0; j < leaders.length; j += 1) {
        if (aicmAxuR1Text(leaders[j].aicm_user_company_department_id) === departmentId) return leaders[j];
      }
    }

    return leaders[0] || null;
  }

function aicmAxuR1LeaderLabel(row) {
    row = row || {};

    var existing = aicmAxuR1Text(row.assigned_leader_label);
    if (existing) return existing;

    var leader = aicmAxuR1BestLeaderForMajor(row);
    if (!leader) return "";

    var nickname = aicmAxuR1Text(leader.internal_nickname || leader.placement_nickname || leader.robot_internal_nickname);
    var role = aicmAxuR1Text(leader.role_code || "Leader");
    var model = aicmAxuR1Text(leader.aiworker_model_code || leader.model_code || leader.model_no);
    var display = aicmAxuR1Text(leader.display_label || leader.robot_pool_display_name || leader.robot_pool_label);

    if (nickname) return nickname + "@" + role;
    if (display) return display;
    if (model) return model + "@" + role;

    return role;
  }

function aicmAxuR1BuildLeaderHandoffPayload(row) {
    row = row || {};

    var majorId = aicmAxuR1MajorId(row);
    var leaderLabel = aicmAxuR1LeaderLabel(row);

    if (!majorId) {
      throw new Error("Manager大項目IDを特定できません。");
    }

    if (!leaderLabel) {
      throw new Error("課長/Leaderが未設定です。課変更でLeaderを設定するか、Manager大項目のLeader欄を設定してください。");
    }

    return {
      kind: "manager-major-leader-handoff",
      title: "課長へ送る確認",
      endpoint: "/api/aicm/v2/manager-major/update",
      backScreen: "task-ledger",
      body: {
        owner_civilization_id: aicmAxuR1OwnerId(),
        aicm_manager_major_work_item_id: majorId,
        assigned_leader_label: leaderLabel,
        decomposition_status_code: "assigned_to_leader",
        handoff_status_code: "handed_off",
        note: aicmAxuR1Text(row.note)
      }
    };
  }

function aicmAxuR1ShowLeaderHandoffConfirm(payload) {
    if (typeof aicmAvdShowDbConfirm === "function") {
      aicmAvdShowDbConfirm(payload);
      return;
    }

    if (typeof aicmOrgShowUpdateConfirm === "function") {
      aicmOrgShowUpdateConfirm(payload);
      return;
    }

    state.pendingOrgUpdate = payload;
    state.screen = "task-ledger";

    if (typeof render === "function") render();
  }

function aicmAxuR1OpenLeaderHandoffConfirm(button) {
    try {
      var majorId = button && button.getAttribute ? button.getAttribute("data-pmlw-major-id") : "";
      var row = aicmAxuR1FindMajorById(majorId);

      if (!row) {
        throw new Error("Manager大項目を特定できません。");
      }

      var payload = aicmAxuR1BuildLeaderHandoffPayload(row);
      aicmAxuR1ShowLeaderHandoffConfirm(payload);
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "課長への引渡し確認を表示できません。");
      if (typeof render === "function") render();
    }
  }
`;

  insertBefore('function renderPmlwMajorRows', helper);
}

/*
 * 2. Add operation column and action button to Manager major rows.
 */
if (!core.includes('data-core-action="pmlw-major-leader-handoff"')) {
  replaceOnce(
    "'        <th>期限</th>',",
    "'        <th>期限</th>',\\n      '        <th>操作</th>',",
    true
  );

  replaceOnce(
    "'        <td>' + escapeHtml(pmlwValue(row.due_date, \"-\")) + '</td>',",
    "'        <td>' + escapeHtml(pmlwValue(row.due_date, \"-\")) + '</td>',\\n          '        <td><button type=\"button\" data-core-action=\"pmlw-major-leader-handoff\" data-pmlw-major-id=\"' + escapeHtml(aicmAxuR1MajorId(row)) + '\">課長へ送る</button></td>',",
    true
  );
}

/*
 * 3. Add click handler branch.
 */
if (!core.includes('action === "pmlw-major-leader-handoff"')) {
  const actionNeedle = 'var action = button.getAttribute("data-core-action") || "";';
  const idx = core.indexOf(actionNeedle);

  if (idx < 0) {
    console.error('action variable anchor not found');
    process.exit(1);
  }

  const insertAt = idx + actionNeedle.length;

  core = core.slice(0, insertAt) + `

    // ${marker}
    if (action === "pmlw-major-leader-handoff") {
      aicmAxuR1OpenLeaderHandoffConfirm(button);
      return;
    }` + core.slice(insertAt);
}

fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== beforeCore));
console.log('markerCount=' + String(countText(core, marker)));
console.log('helperCount=' + String(countText(core, 'function aicmAxuR1OpenLeaderHandoffConfirm')));
console.log('payloadBuilderCount=' + String(countText(core, 'function aicmAxuR1BuildLeaderHandoffPayload')));
console.log('buttonActionCount=' + String(countText(core, 'pmlw-major-leader-handoff')));
console.log('buttonLabelCount=' + String(countText(core, '課長へ送る')));
console.log('managerMajorUpdateEndpointCount=' + String(countText(core, 'endpoint: "/api/aicm/v2/manager-major/update"')));
console.log('assignedToLeaderCount=' + String(countText(core, 'assigned_to_leader')));
console.log('handedOffCount=' + String(countText(core, 'handed_off')));
console.log('workerRuntimeRequestEndpointCount=' + String(countText(core, 'endpoint: "/api/aicm/v2/worker-runtime/request"')));
console.log('directRuntimeActionCount=' + String(countText(core, 'pmlw-major-runtime-request')));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
