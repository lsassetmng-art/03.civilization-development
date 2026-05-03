import fs from 'node:fs';

const serverPath = process.argv[2];
let text = fs.readFileSync(serverPath, 'utf8');

const MARK = 'AICM_R8Z_I_WORKER_AUTO_EXECUTION';
const START = '// ' + MARK + '_SERVER_START';
const END = '// ' + MARK + '_SERVER_END';

function count(src, needle) {
  return src.split(needle).length - 1;
}

function removeMarkedBlock(src, start, end) {
  const s = src.indexOf(start);
  if (s < 0) return src;
  const e = src.indexOf(end, s);
  if (e < 0) throw new Error('marked block end not found: ' + start);
  return src.slice(0, s) + src.slice(e + end.length);
}

function insertBefore(src, needle, block) {
  const idx = src.indexOf(needle);
  if (idx < 0) throw new Error('insert target not found: ' + needle);
  return src.slice(0, idx) + block + '\n\n' + src.slice(idx);
}

const before = {
  mark: count(text, MARK),
  createWorkerRuntimeRequest: count(text, 'function createWorkerRuntimeRequest'),
  workerRuntimeRoute: count(text, '/api/aicm/v2/worker-runtime/request'),
  leaderAutoRoute: count(text, '/api/aicm/v2/leader-auto-decomposition/run')
};

if (before.createWorkerRuntimeRequest !== 1) {
  throw new Error('createWorkerRuntimeRequest count invalid: ' + before.createWorkerRuntimeRequest);
}

text = removeMarkedBlock(text, START, END);

if (count(text, 'runWorkerAutoExecutionR8ZI') > 0) {
  throw new Error('unmarked R8Z-I server helper exists');
}

const serverBlock = String.raw`
// AICM_R8Z_I_WORKER_AUTO_EXECUTION_SERVER_START
function aicmR8ZIText(value) {
  if (value === null || typeof value === "undefined") return "";
  return String(value).trim();
}

function aicmR8ZIOptionalUuidSql(value) {
  const text = aicmR8ZIText(value);
  return text ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmR8ZIJsonSql(value) {
  return sqlLiteral(JSON.stringify(value || {})) + "::jsonb";
}

function workerAutoExecutionCandidatesR8ZI(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const managerMajorId = aicmR8ZIText(body.aicm_manager_major_work_item_id || body.related_manager_major_work_item_id);
  const workerWorkUnitId = aicmR8ZIText(body.aicm_worker_work_unit_id || body.related_worker_work_unit_id);
  const limit = Math.max(1, Math.min(20, Number(body.limit || 10)));

  const managerFilter = managerMajorId
    ? "    AND w.aicm_manager_major_work_item_id = " + sqlLiteral(managerMajorId) + "::uuid"
    : "";

  const workerFilter = workerWorkUnitId
    ? "    AND w.aicm_worker_work_unit_id = " + sqlLiteral(workerWorkUnitId) + "::uuid"
    : "";

  const sql = [
    "WITH target_units AS (",
    "  SELECT w.*",
    "  FROM business.vw_aicm_pmlw_worker_work_unit_display w",
    "  WHERE w.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND w.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND COALESCE(w.work_status_code, '') = 'todo'",
    "    AND COALESCE(w.worker_model_code, '') <> ''",
    "    AND COALESCE(w.assigned_worker_label, '') <> ''",
    managerFilter,
    workerFilter,
    "  ORDER BY w.priority_code DESC, w.created_at ASC, w.display_order ASC",
    "  LIMIT " + String(limit),
    "), worker_candidates AS (",
    "  SELECT",
    "    u.aicm_worker_work_unit_id,",
    "    p.aicm_user_company_worker_placement_id,",
    "    p.owner_civilization_id,",
    "    p.aicm_user_company_id,",
    "    p.aicm_user_company_department_id,",
    "    p.aicm_user_company_section_id,",
    "    p.aiworker_model_code,",
    "    p.internal_nickname,",
    "    COALESCE(v.display_label, NULLIF(p.internal_nickname, '') || '@' || p.role_code, p.aiworker_model_code || '@' || p.role_code) AS display_label,",
    "    CASE",
    "      WHEN p.aiworker_model_code = u.worker_model_code AND COALESCE(NULLIF(p.internal_nickname, ''), '') = u.assigned_worker_label THEN 100",
    "      WHEN p.aiworker_model_code = u.worker_model_code THEN 80",
    "      WHEN COALESCE(NULLIF(p.internal_nickname, ''), '') = u.assigned_worker_label THEN 60",
    "      ELSE 10",
    "    END AS match_score",
    "  FROM target_units u",
    "  JOIN business.aicm_user_company_worker_placement p",
    "    ON p.owner_civilization_id = u.owner_civilization_id",
    "   AND p.aicm_user_company_id = u.aicm_user_company_id",
    "   AND p.role_code = 'Worker'",
    "   AND p.status_code = 'active'",
    "  LEFT JOIN business.vw_aicm_user_company_worker_placement_display v",
    "    ON v.aicm_user_company_worker_placement_id = p.aicm_user_company_worker_placement_id",
    "), ranked AS (",
    "  SELECT *, row_number() OVER (PARTITION BY aicm_worker_work_unit_id ORDER BY match_score DESC, aicm_user_company_worker_placement_id) AS rn",
    "  FROM worker_candidates",
    ")",
    "SELECT COALESCE(jsonb_agg(",
    "  jsonb_build_object(",
    "    'worker_work_unit', to_jsonb(u),",
    "    'worker_placement', to_jsonb(r)",
    "  ) ORDER BY u.created_at, u.display_order",
    "), '[]'::jsonb)::text",
    "FROM target_units u",
    "LEFT JOIN ranked r",
    "  ON r.aicm_worker_work_unit_id = u.aicm_worker_work_unit_id",
    " AND r.rn = 1;"
  ].filter(Boolean).join("\n");

  const result = runPsqlJson(sql);
  return Array.isArray(result) ? result : [];
}

function buildWorkerRuntimeRequestBodyR8ZI(pair) {
  const unit = pair && pair.worker_work_unit ? pair.worker_work_unit : {};
  const placement = pair && pair.worker_placement ? pair.worker_placement : {};

  const unitId = aicmR8ZIText(unit.aicm_worker_work_unit_id);
  const placementId = aicmR8ZIText(placement.aicm_user_company_worker_placement_id);
  const modelCode = aicmR8ZIText(placement.aiworker_model_code || unit.worker_model_code);
  const title = aicmR8ZIText(unit.work_unit_name) || "Worker作業単位";

  const instructionParts = [
    unit.work_unit_description,
    unit.input_context_text,
    unit.expected_output_text,
    aicmR8ZIText(unit.reference_files_text) ? "参照ファイル: " + aicmR8ZIText(unit.reference_files_text) : "",
    aicmR8ZIText(unit.supplemental_materials_text) ? "補足資料: " + aicmR8ZIText(unit.supplemental_materials_text) : "",
    aicmR8ZIText(unit.applicable_rules_text) ? "会社共通ルール/適用ルール: " + aicmR8ZIText(unit.applicable_rules_text) : ""
  ].map(aicmR8ZIText).filter(Boolean);

  if (!unitId) throw new Error("worker_work_unit_id missing");
  if (!placementId) throw new Error("worker placement missing for " + unitId);
  if (!modelCode) throw new Error("model_code missing for " + unitId);
  if (!instructionParts.length) throw new Error("instruction missing for " + unitId);

  return {
    owner_civilization_id: aicmR8ZIText(unit.owner_civilization_id),
    aicm_user_company_id: aicmR8ZIText(unit.aicm_user_company_id),
    aicm_user_company_department_id: aicmR8ZIText(placement.aicm_user_company_department_id || unit.aicm_user_company_department_id),
    aicm_user_company_section_id: aicmR8ZIText(placement.aicm_user_company_section_id || unit.aicm_user_company_section_id),
    aicm_user_company_worker_placement_id: placementId,
    model_code: modelCode,
    task_domain_code: aicmR8ZIText(unit.work_type_code) || "business_operation",
    title,
    instruction: instructionParts.join("\n\n"),
    source_request_ref: "aicm_worker_work_unit:" + unitId,
    source_app_ref: "AICompanyManager",
    related_worker_work_unit_id: unitId,
    related_leader_middle_work_item_id: aicmR8ZIText(unit.aicm_leader_middle_work_item_id),
    related_deliverable_requirement_id: aicmR8ZIText(unit.aicm_leader_deliverable_requirement_id),
    review_required_flag: ["required", "waiting"].includes(aicmR8ZIText(unit.review_status_code)),
    priority_code: aicmR8ZIText(unit.priority_code) || "normal"
  };
}

function markWorkerUnitAutoExecutionStartedR8ZI(unitId, runtimePayload) {
  const unit = requiredUuid(unitId, "aicm_worker_work_unit_id");

  const metadata = {
    auto_execution: "worker_runtime_request",
    auto_execution_version: "r8z_i",
    source_request_ref: runtimePayload && runtimePayload.request_body ? runtimePayload.request_body.source_request_ref : "",
    runtime_result: runtimePayload || {},
    started_at: new Date().toISOString()
  };

  const sql = [
    "UPDATE business.aicm_worker_work_unit",
    "SET work_status_code = 'in_progress',",
    "    metadata_jsonb = COALESCE(metadata_jsonb, '{}'::jsonb) || " + aicmR8ZIJsonSql(metadata) + ",",
    "    updated_at = now()",
    "WHERE aicm_worker_work_unit_id = " + sqlLiteral(unit) + "::uuid",
    "  AND work_status_code = 'todo'",
    "RETURNING jsonb_build_object(",
    "  'aicm_worker_work_unit_id', aicm_worker_work_unit_id,",
    "  'work_status_code', work_status_code,",
    "  'metadata_jsonb', metadata_jsonb",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

async function runWorkerAutoExecutionR8ZI(body) {
  const dryRun = body && body.dry_run === true;
  const pairs = workerAutoExecutionCandidatesR8ZI(body || {});
  const executed = [];
  const failed = [];

  for (const pair of pairs) {
    const unit = pair && pair.worker_work_unit ? pair.worker_work_unit : {};
    const unitId = aicmR8ZIText(unit.aicm_worker_work_unit_id);

    try {
      const requestBody = buildWorkerRuntimeRequestBodyR8ZI(pair);

      if (dryRun) {
        executed.push({
          aicm_worker_work_unit_id: unitId,
          dry_run: true,
          request_body: requestBody
        });
        continue;
      }

      const runtimeResult = await createWorkerRuntimeRequest(requestBody);
      const ok = runtimeResult && runtimeResult.result === "ok";

      if (!ok) {
        throw new Error(runtimeResult && (runtimeResult.error_message || runtimeResult.message || runtimeResult.error) ? (runtimeResult.error_message || runtimeResult.message || runtimeResult.error) : "runtime request failed");
      }

      const markResult = markWorkerUnitAutoExecutionStartedR8ZI(unitId, {
        result: runtimeResult.result,
        request_body: requestBody,
        runtime_request: runtimeResult.runtime_request || {},
        aiworker_response: runtimeResult.aiworker_response || {}
      });

      executed.push({
        aicm_worker_work_unit_id: unitId,
        result: "ok",
        request_body: requestBody,
        runtime_result: runtimeResult,
        mark_result: markResult
      });
    } catch (error) {
      failed.push({
        aicm_worker_work_unit_id: unitId,
        result: "error",
        error_message: error && error.message ? error.message : String(error)
      });
    }
  }

  return {
    result: failed.length ? "partial_error" : "ok",
    api_identifier: SERVER_MARK,
    dry_run,
    candidate_count: pairs.length,
    executed_count: executed.length,
    failed_count: failed.length,
    executed,
    failed
  };
}
// AICM_R8Z_I_WORKER_AUTO_EXECUTION_SERVER_END
`;

text = insertBefore(text, 'async function handleApi', serverBlock);

const routeNeedle = '    if (route === "/api/aicm/v2/worker-runtime/request" && req.method === "POST") {';

if (text.indexOf('"/api/aicm/v2/worker-auto-execution/run"') < 0) {
  const routeBlock = [
    '    if (route === "/api/aicm/v2/worker-auto-execution/run" && req.method === "POST") {',
    '      const body = await readBody(req);',
    '      sendJson(res, 200, await runWorkerAutoExecutionR8ZI(body));',
    '      return true;',
    '    }',
    '',
  ].join('\n');

  const routeIdx = text.indexOf(routeNeedle);
  if (routeIdx < 0) throw new Error('worker runtime route insertion point not found');

  text = text.slice(0, routeIdx) + routeBlock + text.slice(routeIdx);
}

const after = {
  mark: count(text, MARK),
  helper: count(text, 'runWorkerAutoExecutionR8ZI'),
  route: count(text, '/api/aicm/v2/worker-auto-execution/run'),
  createWorkerRuntimeRequest: count(text, 'createWorkerRuntimeRequest'),
  markStarted: count(text, 'markWorkerUnitAutoExecutionStartedR8ZI'),
  noNewTable: count(text, 'CREATE TABLE')
};

if (after.mark < 2) throw new Error('R8Z-I server markers missing');
if (after.helper < 2) throw new Error('server helper missing');
if (after.route !== 1) throw new Error('worker-auto route count invalid: ' + after.route);
if (after.createWorkerRuntimeRequest < before.createWorkerRuntimeRequest + 1) throw new Error('createWorkerRuntimeRequest not reused');
if (after.markStarted < 2) throw new Error('mark started helper missing');

fs.writeFileSync(serverPath, text, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  server_file_write: 'YES',
  api_post: 'NO_IN_PATCH',
  db_write: 'NO_IN_PATCH',
  persistent_db_write: 'NO_IN_PATCH'
}, null, 2));
