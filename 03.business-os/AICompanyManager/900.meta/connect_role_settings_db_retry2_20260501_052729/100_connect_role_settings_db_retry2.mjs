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

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function requireIncludes(src, needle, label) {
  if (!src.includes(needle)) {
    console.error(`Missing required anchor: ${label}`);
    process.exit(1);
  }
}

function findFunctionRange(src, functionName) {
  const start = src.indexOf(`function ${functionName}(`);
  if (start < 0) return null;

  const open = src.indexOf('{', start);
  if (open < 0) return null;

  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth === 0) {
      return { start, open, end: i + 1 };
    }
  }

  return null;
}

requireIncludes(server, 'function createPlacement(body)', 'server createPlacement');
requireIncludes(server, 'async function handleApi', 'server handleApi');
requireIncludes(core, 'function executeAicmOrgUpdateConfirm()', 'core executeAicmOrgUpdateConfirm');
requireIncludes(core, 'function saveCompanyUpdateFromForm()', 'core saveCompanyUpdateFromForm');
requireIncludes(core, 'function saveDepartmentUpdateFromForm()', 'core saveDepartmentUpdateFromForm');
requireIncludes(core, 'function saveSectionUpdateFromForm()', 'core saveSectionUpdateFromForm');

const serverMarker = 'AICM_ROLE_SETTINGS_SYNC_AXC_V1';

// ============================================================
// SERVER: add dedicated placement sync endpoint
// ============================================================
if (!server.includes(serverMarker)) {
  const handleApiStart = server.indexOf('async function handleApi');
  if (handleApiStart < 0) {
    console.error('Could not locate handleApi insertion point.');
    process.exit(1);
  }

  const syncFunctions = `

// ${serverMarker}
// Synchronize President / Manager / Leader / Worker role settings.
// Canonical table: business.aicm_user_company_worker_placement.
// This endpoint archives current active placements for each submitted target+role,
// then recreates submitted active rows. This prevents duplicate single-slot assignments.
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
    return {
      row_order: index,
      role_code: roleCode,
      target_level_code: targetLevelCode,
      aicm_user_company_department_id: String(row.aicm_user_company_department_id || row.departmentId || "").trim(),
      aicm_user_company_section_id: String(row.aicm_user_company_section_id || row.sectionId || row.organizationId || "").trim(),
      target_id: String(row.target_id || row.targetId || "").trim(),
      robot_pool_id: String(row.robot_pool_id || row.robotPoolId || "").trim(),
      aiworker_model_code: String(row.aiworker_model_code || row.aiworkerModelCode || "").trim(),
      internal_nickname: String(row.internal_nickname || row.internalNickname || "").trim()
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

    const key = [row.target_level_code, targetId, row.role_code].join("|");

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

  const lineStart = server.lastIndexOf('\n', idx) + 1;
  const indent = (server.slice(lineStart, idx).match(/^\\s*/) || ['    '])[0];

  const routeBlock = `${indent}if (route === "/api/aicm/v2/placement/sync-role-settings" && req.method === "POST") {
${indent}  const payload = syncRoleSettings(await readBody(req));
${indent}  sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
${indent}  return true;
${indent}}

`;

  server = server.slice(0, idx) + routeBlock + server.slice(idx);
}

// API return discipline
{
  const handleStart = server.indexOf('async function handleApi');
  const safeStaticStart = server.indexOf('function safeStaticPath');
  if (handleStart >= 0 && safeStaticStart > handleStart) {
    const prefix = server.slice(0, handleStart);
    let block = server.slice(handleStart, safeStaticStart);
    const suffix = server.slice(safeStaticStart);
    block = block.replace(
      /(\\n[ \\t]*sendJson\\(res,[^\\n]*\\);\\n)([ \\t]*)return;/g,
      '$1$2return true;'
    );
    server = prefix + block + suffix;
  }
}

// ============================================================
// CORE: add role placement payload builders and sync hook
// ============================================================
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
function aicmAxcUuidLike(value) {
  return /^[0-9a-fA-F-]{36}$/.test(String(value || "").trim());
}

function aicmAxcFindElement(ids) {
  for (var i = 0; i < ids.length; i += 1) {
    var el = document.getElementById(ids[i]);
    if (el) return el;
  }
  return null;
}

function aicmAxcCatalogRowByValue(value) {
  var text = String(value || "").trim();
  if (!text) return null;
  var rows = typeof aicmRobotCatalogSafe === "function" ? aicmRobotCatalogSafe() : [];
  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i] || {};
    var values = [
      typeof aicmRobotValue === "function" ? aicmRobotValue(row) : "",
      row.robot_pool_id,
      row.business_robot_pool_id,
      row.aicm_robot_pool_id,
      row.worker_pool_id,
      row.placement_robot_pool_id,
      row.aiworker_model_code,
      row.model_code,
      row.robot_id
    ].map(function (item) { return String(item || "").trim(); });

    if (values.indexOf(text) >= 0) return row;
  }
  return null;
}

function aicmAxcSelectedRobotMeta(selectOrId) {
  var el = typeof selectOrId === "string" ? document.getElementById(selectOrId) : selectOrId;
  if (!el) return null;

  var selectedValue = String(el.value || "").trim();
  var opt = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
  var row = aicmAxcCatalogRowByValue(selectedValue) || {};

  var robotPoolId = String(
    row.robot_pool_id ||
    row.business_robot_pool_id ||
    row.aicm_robot_pool_id ||
    row.worker_pool_id ||
    row.placement_robot_pool_id ||
    (aicmAxcUuidLike(selectedValue) ? selectedValue : "")
  ).trim();

  var modelCode = String(
    row.aiworker_model_code ||
    row.model_code ||
    row.aiworkerModelCode ||
    (opt ? opt.getAttribute("data-model") || "" : "") ||
    (!aicmAxcUuidLike(selectedValue) ? selectedValue : "")
  ).trim();

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
    var robotEl = aicmAxcFindElement([
      "aicm-inline-worker-" + String(index) + "-robot",
      "aicm-role-worker-robot-" + String(index),
      "aicm-role-worker-section-robot-" + String(index),
      "aicm-role-worker-section-new-robot-" + String(index)
    ]);

    var nickEl = aicmAxcFindElement([
      "aicm-inline-worker-" + String(index) + "-nickname",
      "aicm-role-worker-nickname-" + String(index),
      "aicm-role-worker-section-nickname-" + String(index),
      "aicm-role-worker-section-new-nickname-" + String(index)
    ]);

    if (!robotEl && !nickEl) break;

    var worker = aicmAxcSelectedRobotMeta(robotEl);
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

function addRolePlacements(kind, builderCall) {
  const needle = `kind: "${kind}",`;
  const idx = core.indexOf(needle);
  if (idx < 0) {
    console.error(`Could not find confirm payload kind: ${kind}`);
    process.exit(1);
  }

  const start = core.lastIndexOf('aicmAvdShowDbConfirm({', idx);
  const end = core.indexOf('});', idx);
  if (start < 0 || end < 0 || end <= start) {
    console.error(`Could not locate confirmation payload block for ${kind}`);
    process.exit(1);
  }

  const block = core.slice(start, end);
  if (block.includes('rolePlacements:')) return;

  const bodyIdx = core.indexOf('body: body', start);
  if (bodyIdx < 0 || bodyIdx > end) {
    console.error(`Could not find body: body in ${kind} payload`);
    process.exit(1);
  }

  const insertAt = bodyIdx + 'body: body'.length;
  core = core.slice(0, insertAt) + `,\n      rolePlacements: ${builderCall}` + core.slice(insertAt);
}

addRolePlacements("company-update", "aicmAxcCompanyRolePlacements(company)");
addRolePlacements("department-update", "aicmAxcDepartmentRolePlacements(department)");
addRolePlacements("section-update", "aicmAxcSectionRolePlacements(section)");

if (!core.includes('AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE')) {
  const range = findFunctionRange(core, 'executeAicmOrgUpdateConfirm');
  if (!range) {
    console.error('Could not parse executeAicmOrgUpdateConfirm function range.');
    process.exit(1);
  }

  const fn = core.slice(range.start, range.end);
  const clearNeedle = 'state.pendingOrgUpdate = null;';
  const localIdx = fn.indexOf(clearNeedle);
  if (localIdx < 0) {
    console.error('Could not find success clear point inside executeAicmOrgUpdateConfirm.');
    process.exit(1);
  }

  const absoluteIdx = range.start + localIdx;
  const lineStart = core.lastIndexOf('\n', absoluteIdx) + 1;
  const indent = (core.slice(lineStart, absoluteIdx).match(/^\\s*/) || ['      '])[0];

  const syncLine =
`${indent}// AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE
${indent}await aicmAxcSyncRolePlacementsForPayload(payload);
`;

  core = core.slice(0, absoluteIdx) + syncLine + core.slice(absoluteIdx);
}

fs.writeFileSync(serverFile, server, 'utf8');
fs.writeFileSync(coreFile, core, 'utf8');

console.log(`serverChanged=${server !== serverBefore}`);
console.log(`coreChanged=${core !== coreBefore}`);
console.log(`serverMarkerCount=${countText(server, serverMarker)}`);
console.log(`coreMarkerCount=${countText(core, coreMarker)}`);
console.log(`syncRouteCount=${countText(server, '/api/aicm/v2/placement/sync-role-settings')}`);
console.log(`coreSyncCallCount=${countText(core, 'placement/sync-role-settings')}`);
console.log(`rolePlacementsPayloadCount=${countText(core, 'rolePlacements:')}`);
console.log(`executeSyncMarkerCount=${countText(core, 'AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE')}`);
