import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
const coreFile = process.env.CLEAN_CORE;

if (!serverFile || !coreFile) {
  console.error('SERVER_FILE or CLEAN_CORE env missing');
  process.exit(1);
}

let server = fs.readFileSync(serverFile, 'utf8');
let core = fs.readFileSync(coreFile, 'utf8');

const serverBefore = server;
const coreBefore = core;

function requireIncludes(src, needle, label) {
  if (!src.includes(needle)) {
    console.error(`Missing required anchor: ${label}`);
    process.exit(1);
  }
}

requireIncludes(server, 'function createPlacement(body)', 'server createPlacement');
requireIncludes(server, 'async function handleApi', 'server handleApi');
requireIncludes(server, 'function getContext', 'server getContext');
requireIncludes(core, 'function executeAicmOrgUpdateConfirm()', 'core executeAicmOrgUpdateConfirm');
requireIncludes(core, 'function saveCompanyUpdateFromForm()', 'core saveCompanyUpdateFromForm');
requireIncludes(core, 'function saveDepartmentUpdateFromForm()', 'core saveDepartmentUpdateFromForm');
requireIncludes(core, 'function saveSectionUpdateFromForm()', 'core saveSectionUpdateFromForm');

const serverMarker = 'AICM_ROLE_SETTINGS_SYNC_AXC_V1';

if (!server.includes(serverMarker)) {
  const insertAfter = server.indexOf('function createPlacement(body)');
  const handleApiStart = server.indexOf('async function handleApi');
  if (insertAfter < 0 || handleApiStart < 0 || handleApiStart <= insertAfter) {
    console.error('Could not locate safe server insertion point.');
    process.exit(1);
  }

  const syncFunctions = `

// ${serverMarker}
// Synchronize President / Manager / Leader / Worker role settings.
// Uses existing canonical table business.aicm_user_company_worker_placement.
// This endpoint intentionally archives the current active placements for the same
// target+role and recreates the submitted selection, so single-slot roles do not duplicate.
function aicmRoleSyncOptionalUuidSql(value) {
  const text = String(value || "").trim();
  return /^[0-9a-fA-F-]{36}$/.test(text) ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmRoleSyncRole(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "president") return "President";
  if (text === "manager") return "Manager";
  if (text === "leader") return "Leader";
  if (text === "worker" || text === "employee") return "Worker";
  throw new Error("invalid role_code");
}

function aicmRoleSyncTargetLevel(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "company") return "company";
  if (text === "department") return "department";
  if (text === "section" || text === "organization") return "section";
  throw new Error("invalid target_level_code");
}

function aicmRoleSyncRows(body) {
  const rows = Array.isArray(body.role_placements) ? body.role_placements : [];
  return rows.slice(0, 30).map((row, index) => {
    const roleCode = aicmRoleSyncRole(row.role_code || row.roleCode);
    const targetLevelCode = aicmRoleSyncTargetLevel(row.target_level_code || row.targetLevelCode);
    const robotPoolId = String(row.robot_pool_id || row.robotPoolId || "").trim();
    const aiworkerModelCode = String(row.aiworker_model_code || row.aiworkerModelCode || "").trim();
    const internalNickname = String(row.internal_nickname || row.internalNickname || "").trim();

    return {
      row_order: index,
      role_code: roleCode,
      target_level_code: targetLevelCode,
      aicm_user_company_department_id: String(row.aicm_user_company_department_id || row.departmentId || "").trim(),
      aicm_user_company_section_id: String(row.aicm_user_company_section_id || row.sectionId || row.organizationId || "").trim(),
      target_id: String(row.target_id || row.targetId || "").trim(),
      robot_pool_id: robotPoolId,
      aiworker_model_code: aiworkerModelCode,
      internal_nickname: internalNickname
    };
  });
}

function syncRoleSettings(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const submittedRows = aicmRoleSyncRows(body);

  const targetKeys = [];
  const insertRows = [];

  for (const row of submittedRows) {
    const targetId = row.target_id ||
      (row.target_level_code === "company" ? companyId : "") ||
      (row.target_level_code === "department" ? row.aicm_user_company_department_id : "") ||
      (row.target_level_code === "section" ? row.aicm_user_company_section_id : "");

    if (!targetId) continue;

    const key = [
      row.target_level_code,
      targetId,
      row.role_code
    ].join("|");

    if (!targetKeys.some((item) => item.key === key)) {
      targetKeys.push({
        key,
        target_level_code: row.target_level_code,
        target_id: targetId,
        role_code: row.role_code,
        aicm_user_company_department_id: row.aicm_user_company_department_id,
        aicm_user_company_section_id: row.aicm_user_company_section_id
      });
    }

    if (!row.robot_pool_id && !row.aiworker_model_code) continue;

    insertRows.push({
      ...row,
      target_id: targetId,
      aiworker_model_code: row.aiworker_model_code || "unknown"
    });
  }

  if (targetKeys.length === 0) {
    return {
      result: "ok",
      api_identifier: SERVER_MARK,
      archived_count: 0,
      inserted_count: 0,
      placements: [],
      note: "no role placement targets"
    };
  }

  const targetValues = targetKeys.map((row, index) => [
    "(",
    String(index),
    ", " + sqlLiteral(row.target_level_code),
    ", " + sqlLiteral(row.target_id) + "::uuid",
    ", " + sqlLiteral(row.role_code),
    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_department_id),
    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_section_id),
    ")"
  ].join("")).join(",\\n    ");

  const insertValues = insertRows.length ? insertRows.map((row, index) => [
    "(",
    String(index),
    ", " + sqlLiteral(row.target_level_code),
    ", " + sqlLiteral(row.target_id) + "::uuid",
    ", " + sqlLiteral(row.role_code),
    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_department_id),
    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_section_id),
    ", " + aicmRoleSyncOptionalUuidSql(row.robot_pool_id),
    ", " + sqlLiteral(row.aiworker_model_code),
    ", " + sqlLiteral(row.internal_nickname),
    ")"
  ].join("")).join(",\\n    ") : "";

  const insertCte = insertRows.length ? [
    "), insert_rows(row_order, target_level_code, target_id, role_code, aicm_user_company_department_id, aicm_user_company_section_id, robot_pool_id, aiworker_model_code, internal_nickname) AS (",
    "  VALUES",
    "    " + insertValues,
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_worker_placement (",
    "    owner_civilization_id, aicm_user_company_id,",
    "    aicm_user_company_department_id, aicm_user_company_section_id,",
    "    target_level_code, target_id, app_code, role_code, robot_pool_id,",
    "    aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    c.aicm_user_company_id,",
    "    i.aicm_user_company_department_id,",
    "    i.aicm_user_company_section_id,",
    "    i.target_level_code,",
    "    i.target_id,",
    "    'AICompanyManager',",
    "    i.role_code,",
    "    i.robot_pool_id,",
    "    i.aiworker_model_code,",
    "    i.internal_nickname,",
    "    1,",
    "    'unlimited_system_use',",
    "    'active'",
    "  FROM insert_rows i",
    "  CROSS JOIN company_ok c",
    "  RETURNING *"
  ].join("\\n") : [
    "), inserted AS (",
    "  SELECT *",
    "  FROM business.aicm_user_company_worker_placement",
    "  WHERE false"
  ].join("\\n");

  const sql = [
    "WITH company_ok AS (",
    "  SELECT aicm_user_company_id",
    "  FROM business.aicm_user_company",
    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND company_status = 'active'",
    "  LIMIT 1",
    "), target_keys(row_order, target_level_code, target_id, role_code, aicm_user_company_department_id, aicm_user_company_section_id) AS (",
    "  VALUES",
    "    " + targetValues,
    "), archived AS (",
    "  UPDATE business.aicm_user_company_worker_placement p",
    "  SET status_code = 'archived',",
    "      updated_at = now(),",
    "      metadata_jsonb = COALESCE(p.metadata_jsonb, '{}'::jsonb) || jsonb_build_object('archived_by', 'AICompanyManager.role_settings_sync', 'archived_at', now()::text)",
    "  FROM target_keys k",
    "  WHERE p.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND p.app_code = 'AICompanyManager'",
    "    AND p.status_code = 'active'",
    "    AND lower(p.target_level_code) = lower(k.target_level_code)",
    "    AND p.target_id = k.target_id",
    "    AND lower(p.role_code) = lower(k.role_code)",
    "  RETURNING p.*",
    insertCte,
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM company_ok) THEN 'ok' ELSE 'error' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'archived_count', (SELECT count(*) FROM archived),",
    "  'inserted_count', (SELECT count(*) FROM inserted),",
    "  'placements', COALESCE((SELECT jsonb_agg(to_jsonb(inserted) ORDER BY created_at, aicm_user_company_worker_placement_id) FROM inserted), '[]'::jsonb),",
    "  'error_message', CASE WHEN EXISTS (SELECT 1 FROM company_ok) THEN '' ELSE '先にv2のAI企業を作成・選択してください。' END",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}
`;

  server = server.slice(0, handleApiStart) + syncFunctions + "\n" + server.slice(handleApiStart);
}

if (!server.includes('/api/aicm/v2/placement/sync-role-settings')) {
  const routeAnchor = 'if (route === "/api/aicm/v2/placement/create" && req.method === "POST") {';
  const idx = server.indexOf(routeAnchor);
  if (idx < 0) {
    console.error('Could not find placement/create route anchor.');
    process.exit(1);
  }

  const routeBlock = `    if (route === "/api/aicm/v2/placement/sync-role-settings" && req.method === "POST") {
      const payload = syncRoleSettings(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

`;

  server = server.slice(0, idx) + routeBlock + server.slice(idx);
}

// Keep API return discipline.
const handleStart = server.indexOf('async function handleApi');
const safeStaticStart = server.indexOf('function safeStaticPath');
if (handleStart >= 0 && safeStaticStart > handleStart) {
  const prefix = server.slice(0, handleStart);
  let block = server.slice(handleStart, safeStaticStart);
  const suffix = server.slice(safeStaticStart);
  block = block.replace(
    /(\n[ \t]*sendJson\(res,[^\n]*\);\n)([ \t]*)return;/g,
    '$1$2return true;'
  );
  server = prefix + block + suffix;
}

const coreMarker = 'AICM_ROLE_SETTINGS_SYNC_AXC_V1';

if (!core.includes(coreMarker)) {
  const insertBefore = core.indexOf('function saveCompanyUpdateFromForm()');
  if (insertBefore < 0) {
    console.error('Could not find saveCompanyUpdateFromForm insertion point.');
    process.exit(1);
  }

  const helpers = `
// ${coreMarker}
// Role settings are saved through a dedicated placement sync endpoint after the main entity update succeeds.
// Main company/department/section fields remain separate from robot placement truth.
function aicmAxcSelectedRobotMeta(selectId) {
  var el = document.getElementById(selectId);
  if (!el) return null;
  var robotPoolId = String(el.value || "").trim();
  var opt = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
  var modelCode = opt ? String(opt.getAttribute("data-model") || "") : "";
  if (!robotPoolId && !modelCode) return null;
  return {
    robot_pool_id: robotPoolId,
    aiworker_model_code: modelCode || "unknown"
  };
}

function aicmAxcInputValue(id) {
  var el = document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}

function aicmAxcBuildRolePlacement(row) {
  if (!row || !row.role_code || !row.target_level_code || !row.target_id) return null;
  if (!row.robot_pool_id && !row.aiworker_model_code) return null;
  return {
    role_code: row.role_code,
    target_level_code: row.target_level_code,
    target_id: row.target_id,
    aicm_user_company_department_id: row.aicm_user_company_department_id || "",
    aicm_user_company_section_id: row.aicm_user_company_section_id || "",
    robot_pool_id: row.robot_pool_id || "",
    aiworker_model_code: row.aiworker_model_code || "unknown",
    internal_nickname: row.internal_nickname || ""
  };
}

function aicmAxcCompanyRolePlacements(company) {
  var selected = aicmAxcSelectedRobotMeta("aicm-company-president-robot");
  if (!company || !selected) return [];
  var row = aicmAxcBuildRolePlacement({
    role_code: "President",
    target_level_code: "company",
    target_id: company.aicm_user_company_id,
    robot_pool_id: selected.robot_pool_id,
    aiworker_model_code: selected.aiworker_model_code,
    internal_nickname: aicmAxcInputValue("aicm-company-president-robot-nickname")
  });
  return row ? [row] : [];
}

function aicmAxcDepartmentRolePlacements(department) {
  var selected = aicmAxcSelectedRobotMeta("aicm-department-manager-robot");
  if (!department || !selected) return [];
  var row = aicmAxcBuildRolePlacement({
    role_code: "Manager",
    target_level_code: "department",
    target_id: department.aicm_user_company_department_id,
    aicm_user_company_department_id: department.aicm_user_company_department_id,
    robot_pool_id: selected.robot_pool_id,
    aiworker_model_code: selected.aiworker_model_code,
    internal_nickname: aicmAxcInputValue("aicm-department-manager-robot-nickname")
  });
  return row ? [row] : [];
}

function aicmAxcSectionRolePlacements(section) {
  var rows = [];
  if (!section) return rows;

  var leader = aicmAxcSelectedRobotMeta("aicm-section-leader-robot");
  var leaderRow = aicmAxcBuildRolePlacement({
    role_code: "Leader",
    target_level_code: "section",
    target_id: section.aicm_user_company_section_id,
    aicm_user_company_department_id: section.aicm_user_company_department_id,
    aicm_user_company_section_id: section.aicm_user_company_section_id,
    robot_pool_id: leader ? leader.robot_pool_id : "",
    aiworker_model_code: leader ? leader.aiworker_model_code : "",
    internal_nickname: aicmAxcInputValue("aicm-section-leader-robot-nickname")
  });
  if (leaderRow) rows.push(leaderRow);

  var index = 0;
  while (index < 30) {
    var robotId = "aicm-inline-worker-" + String(index) + "-robot";
    var nickId = "aicm-inline-worker-" + String(index) + "-nickname";
    var robotEl = document.getElementById(robotId);
    var nickEl = document.getElementById(nickId);
    if (!robotEl && !nickEl) break;

    var worker = aicmAxcSelectedRobotMeta(robotId);
    var workerRow = aicmAxcBuildRolePlacement({
      role_code: "Worker",
      target_level_code: "section",
      target_id: section.aicm_user_company_section_id,
      aicm_user_company_department_id: section.aicm_user_company_department_id,
      aicm_user_company_section_id: section.aicm_user_company_section_id,
      robot_pool_id: worker ? worker.robot_pool_id : "",
      aiworker_model_code: worker ? worker.aiworker_model_code : "",
      internal_nickname: nickEl ? String(nickEl.value || "").trim() : ""
    });
    if (workerRow) rows.push(workerRow);

    index += 1;
  }

  return rows;
}

async function aicmAxcSyncRolePlacementsForPayload(payload) {
  var rows = payload && Array.isArray(payload.rolePlacements) ? payload.rolePlacements : [];
  if (!rows.length) return { result: "ok", skipped: true };

  var body = payload.body || {};
  var companyId = body.aicm_user_company_id || "";
  if (!companyId && state && state.selectedCompanyId) companyId = state.selectedCompanyId;

  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
    method: "POST",
    body: JSON.stringify({
      owner_civilization_id: ownerId(),
      aicm_user_company_id: companyId,
      role_placements: rows
    })
  });
}

`;
  core = core.slice(0, insertBefore) + helpers + "\n" + core.slice(insertBefore);
}

// Add rolePlacements to confirmation payloads.
core = core.replace(
  /(aicmAvdShowDbConfirm\(\{\s*\n\s*kind:\s*"company-update",[\s\S]*?body:\s*body)(\s*\n\s*\}\);)/,
  '$1,\n      rolePlacements: aicmAxcCompanyRolePlacements(company)$2'
);

core = core.replace(
  /(aicmAvdShowDbConfirm\(\{\s*\n\s*kind:\s*"department-update",[\s\S]*?body:\s*body)(\s*\n\s*\}\);)/,
  '$1,\n      rolePlacements: aicmAxcDepartmentRolePlacements(department)$2'
);

core = core.replace(
  /(aicmAvdShowDbConfirm\(\{\s*\n\s*kind:\s*"section-update",[\s\S]*?body:\s*body)(\s*\n\s*\}\);)/,
  '$1,\n      rolePlacements: aicmAxcSectionRolePlacements(section)$2'
);

// Execute role sync after main entity update success.
if (!core.includes('AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE')) {
  const needle = 'state.pendingOrgUpdate = null;\\n      await loadContext();';
  if (core.includes(needle)) {
    core = core.replace(
      needle,
      'state.pendingOrgUpdate = null;\\n      // AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE\\n      await aicmAxcSyncRolePlacementsForPayload(payload);\\n      await loadContext();'
    );
  } else {
    const alt = 'state.pendingOrgUpdate = null;\n      await loadContext();';
    if (core.includes(alt)) {
      core = core.replace(
        alt,
        'state.pendingOrgUpdate = null;\n      // AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE\n      await aicmAxcSyncRolePlacementsForPayload(payload);\n      await loadContext();'
      );
    } else {
      console.error('Could not locate execute confirmation success flow.');
      process.exit(1);
    }
  }
}

fs.writeFileSync(serverFile, server, 'utf8');
fs.writeFileSync(coreFile, core, 'utf8');

console.log(`serverChanged=${server !== serverBefore}`);
console.log(`coreChanged=${core !== coreBefore}`);
console.log(`serverMarkerCount=${(server.match(new RegExp(serverMarker, 'g')) || []).length}`);
console.log(`coreMarkerCount=${(core.match(new RegExp(coreMarker, 'g')) || []).length}`);
console.log(`syncRouteCount=${(server.match(/\\/api\\/aicm\\/v2\\/placement\\/sync-role-settings/g) || []).length}`);
console.log(`coreSyncCallCount=${(core.match(/placement\\/sync-role-settings/g) || []).length}`);
console.log(`rolePlacementsPayloadCount=${(core.match(/rolePlacements:/g) || []).length}`);
console.log(`executeSyncMarkerCount=${(core.match(/AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE/g) || []).length}`);
