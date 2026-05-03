import fs from 'node:fs';

const serverPath = process.argv[2];
if (!serverPath) {
  console.error('ERROR: server path missing');
  process.exit(1);
}

let text = fs.readFileSync(serverPath, 'utf8');

const MARK = 'AICM_R8Z_A_LEADER_AUTO_DECOMPOSITION';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function removeMarkedBlock(src, startMarker, endMarker) {
  const s = src.indexOf(startMarker);
  if (s < 0) return src;
  const e = src.indexOf(endMarker, s);
  if (e < 0) throw new Error('marked block end not found');
  return src.slice(0, s) + src.slice(e + endMarker.length);
}

function findFunctionRange(src, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{', 'm');
  const m = re.exec(src);
  if (!m) throw new Error('function not found: ' + name);

  const start = m.index;
  const open = src.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') {
      depth += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          start,
          end: i + 1,
          oldText: src.slice(start, i + 1)
        };
      }
    }
  }

  throw new Error('closing brace not found: ' + name);
}

const before = {
  mark: count(text, MARK),
  route: count(text, '/api/aicm/v2/leader-auto-decomposition/run'),
  functionCount: count(text, 'function runLeaderAutoDecomposition'),
  handleApiCount: count(text, 'async function handleApi')
};

text = removeMarkedBlock(text, START, END);

if (count(text, 'function runLeaderAutoDecomposition') > 0) {
  throw new Error('unmarked runLeaderAutoDecomposition already exists; review required');
}

const helperBlock = [
  START,
  '',
  'function aicmR8zAutoText(value) {',
  '  if (value === null || typeof value === "undefined") return "";',
  '  return String(value).trim();',
  '}',
  '',
  'function aicmR8zAutoMode(value) {',
  '  const text = aicmR8zAutoText(value).toLowerCase();',
  '  return text === "pending" ? "pending" : "single";',
  '}',
  '',
  'function aicmR8zAutoVersion(value) {',
  '  const text = aicmR8zAutoText(value);',
  '  return text || "r8z_v1";',
  '}',
  '',
  'function aicmR8zAutoLimit(value) {',
  '  const num = Number(value);',
  '  if (!Number.isFinite(num) || num < 1) return 1;',
  '  return Math.min(10, Math.floor(num));',
  '}',
  '',
  'function runLeaderAutoDecomposition(body) {',
  '  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");',
  '  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");',
  '  const mode = aicmR8zAutoMode(body.mode);',
  '  const limit = aicmR8zAutoLimit(body.limit);',
  '  const version = aicmR8zAutoVersion(body.auto_decomposition_version);',
  '  const sourceAppRef = aicmR8zAutoText(body.source_app_ref) || "AICompanyManager";',
  '  const majorId = body.aicm_manager_major_work_item_id ? requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id") : "";',
  '',
  '  if (mode === "single" && !majorId) {',
  '    throw new Error("aicm_manager_major_work_item_id is required for single mode");',
  '  }',
  '',
  '  const targetWhere = mode === "single"',
  '    ? "    AND m.aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid"',
  '    : "    AND m.aicm_manager_major_work_item_id IS NOT NULL";',
  '',
  '  const sql = [',
  '    "WITH input_request AS (",',
  '    "  SELECT",',
  '    "    " + sqlLiteral(owner) + "::uuid AS owner_civilization_id,",',
  '    "    " + sqlLiteral(companyId) + "::uuid AS aicm_user_company_id,",',
  '    "    " + sqlLiteral(version) + "::text AS auto_decomposition_version,",',
  '    "    " + sqlLiteral(sourceAppRef) + "::text AS source_app_ref,",',
  '    "    " + String(limit) + "::int AS max_count",',
  '    "), target_major AS (",',
  '    "  SELECT m.*",',
  '    "  FROM business.aicm_manager_major_work_item m",',
  '    "  JOIN input_request r",',
  '    "    ON r.owner_civilization_id = m.owner_civilization_id",',
  '    "   AND r.aicm_user_company_id = m.aicm_user_company_id",',
  '    "  WHERE m.decomposition_status_code = ' + "'assigned_to_leader'" + '",',
  '    "    AND m.handoff_status_code = ' + "'handed_off'" + '",',
  '    targetWhere,',
  '    "    AND NOT EXISTS (",',
  '    "      SELECT 1",',
  '    "      FROM business.aicm_leader_middle_work_item existing",',
  '    "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",',
  '    "        AND existing.owner_civilization_id = m.owner_civilization_id",',
  '    "        AND existing.aicm_user_company_id = m.aicm_user_company_id",',
  '    "        AND existing.breakdown_status_code <> ' + "'archived'" + '",',
  '    "    )",',
  '    "  ORDER BY m.updated_at, m.display_order, m.created_at",',
  '    "  LIMIT (SELECT max_count FROM input_request)",',
  '    "), selected_worker AS (",',
  '    "  SELECT DISTINCT ON (tm.aicm_manager_major_work_item_id)",',
  '    "    tm.aicm_manager_major_work_item_id,",',
  '    "    p.aiworker_model_code,",',
  '    "    COALESCE(NULLIF(p.internal_nickname, ' + "''" + '), p.aiworker_model_code, ' + "'未割当'" + ') AS worker_label",',
  '    "  FROM target_major tm",',
  '    "  LEFT JOIN business.aicm_user_company_worker_placement p",',
  '    "    ON p.owner_civilization_id = tm.owner_civilization_id",',
  '    "   AND p.aicm_user_company_id = tm.aicm_user_company_id",',
  '    "   AND p.role_code = ' + "'Worker'" + '",',
  '    "   AND p.status_code = ' + "'active'" + '",',
  '    "  ORDER BY",',
  '    "    tm.aicm_manager_major_work_item_id,",',
  '    "    CASE",',
  '    "      WHEN p.aicm_user_company_section_id IS NOT NULL AND p.aicm_user_company_section_id = tm.aicm_user_company_section_id THEN 1",',
  '    "      WHEN p.aicm_user_company_department_id IS NOT NULL AND p.aicm_user_company_department_id = tm.aicm_user_company_department_id THEN 2",',
  '    "      WHEN p.target_level_code = ' + "'company'" + ' THEN 3",',
  '    "      ELSE 9",',
  '    "    END,",',
  '    "    p.created_at",',
  '    "), inserted_middle AS (",',
  '    "  INSERT INTO business.aicm_leader_middle_work_item (",',
  '    "    owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id,",',
  '    "    aicm_user_company_department_id, aicm_user_company_section_id,",',
  '    "    middle_item_name, middle_item_description, leader_robot_label,",',
  '    "    breakdown_status_code, handoff_status_code, priority_code, due_date,",',
  '    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",',
  '    "  )",',
  '    "  SELECT",',
  '    "    tm.owner_civilization_id, tm.aicm_user_company_id, tm.aicm_manager_major_work_item_id,",',
  '    "    tm.aicm_user_company_department_id, tm.aicm_user_company_section_id,",',
  '    "    tm.major_item_name, tm.major_item_description,",',
  '    "    COALESCE(NULLIF(tm.assigned_leader_label, ' + "''" + '), ' + "'自動割当'" + '),",',
  '    "    ' + "'worker_units_created'" + ', ' + "'handed_off'" + ', tm.priority_code, tm.due_date,",',
  '    "    tm.reference_files_text, tm.supplemental_materials_text, tm.applicable_rules_text,",',
  '    "    ' + "'R8Z auto-generated from Manager大項目'" + ', ' + "''" + ', tm.display_order,",',
  '    "    jsonb_build_object(",',
  '    "      ' + "'auto_decomposition_version'" + ', (SELECT auto_decomposition_version FROM input_request),",',
  '    "      ' + "'auto_decomposition_source'" + ', ' + "'manager_major'" + ',",',
  '    "      ' + "'source_app_ref'" + ', (SELECT source_app_ref FROM input_request),",',
  '    "      ' + "'source_manager_major_work_item_id'" + ', tm.aicm_manager_major_work_item_id::text",',
  '    "    )",',
  '    "  FROM target_major tm",',
  '    "  RETURNING *",',
  '    "), inserted_requirement AS (",',
  '    "  INSERT INTO business.aicm_leader_deliverable_requirement (",',
  '    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id,",',
  '    "    deliverable_name, deliverable_type_code, deliverable_description,",',
  '    "    required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code,",',
  '    "    priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",',
  '    "  )",',
  '    "  SELECT",',
  '    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id,",',
  '    "    im.middle_item_name || ' + "' 成果物'" + ', ' + "'operation'" + ', im.middle_item_description,",',
  '    "    ' + "'会社共通ルールと該当業務ルールに従い、後続Workerが実行可能な成果物にする'" + ',',',
  '    "    ' + "'大項目の目的を満たし、レビュー可能な作業結果が作成されていること'" + ',',',
  '    "    true, ' + "'ready_for_worker'" + ', im.priority_code, im.due_date,",',
  '    "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",',
  '    "    ' + "'R8Z auto-generated deliverable requirement'" + ', ' + "''" + ', im.display_order,",',
  '    "    jsonb_build_object(",',
  '    "      ' + "'auto_decomposition_version'" + ', (SELECT auto_decomposition_version FROM input_request),",',
  '    "      ' + "'source_leader_middle_work_item_id'" + ', im.aicm_leader_middle_work_item_id::text,",',
  '    "      ' + "'source_manager_major_work_item_id'" + ', im.aicm_manager_major_work_item_id::text",',
  '    "    )",',
  '    "  FROM inserted_middle im",',
  '    "  RETURNING *",',
  '    "), inserted_worker_unit AS (",',
  '    "  INSERT INTO business.aicm_worker_work_unit (",',
  '    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,",',
  '    "    work_unit_name, work_unit_description, work_type_code,",',
  '    "    assigned_worker_label, worker_model_code, work_status_code, review_status_code,",',
  '    "    priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link,",',
  '    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, display_order, metadata_jsonb",',
  '    "  )",',
  '    "  SELECT",',
  '    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,",',
  '    "    im.middle_item_name || ' + "' 作業'" + ', im.middle_item_description, ' + "'operation'" + ',',',
  '    "    COALESCE(sw.worker_label, ' + "'未割当'" + '), COALESCE(sw.aiworker_model_code, ' + "''" + '), ' + "'todo'" + ', ' + "'required'" + ',',',
  '    "    im.priority_code, im.due_date,",',
  '    "    ' + "'Manager大項目: '" + ' || im.middle_item_name || E' + "'\\\\n'" + ' || im.middle_item_description,",',
  '    "    ' + "'指定された大項目について、実行可能な成果物または作業結果を作成する'" + ',',',
  '    "    ' + "''" + ', ' + "''" + ',',',
  '    "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",',
  '    "    CASE WHEN sw.aiworker_model_code IS NULL THEN ' + "'Worker未割当。配置後に再割当対象。'" + ' ELSE ' + "'R8Z auto-generated worker work unit'" + ' END,",',
  '    "    im.display_order,",',
  '    "    jsonb_build_object(",',
  '    "      ' + "'auto_decomposition_version'" + ', (SELECT auto_decomposition_version FROM input_request),",',
  '    "      ' + "'source_leader_middle_work_item_id'" + ', im.aicm_leader_middle_work_item_id::text,",',
  '    "      ' + "'source_deliverable_requirement_id'" + ', ir.aicm_leader_deliverable_requirement_id::text,",',
  '    "      ' + "'source_manager_major_work_item_id'" + ', im.aicm_manager_major_work_item_id::text",',
  '    "    )",',
  '    "  FROM inserted_middle im",',
  '    "  JOIN inserted_requirement ir",',
  '    "    ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",',
  '    "  LEFT JOIN selected_worker sw",',
  '    "    ON sw.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",',
  '    "  RETURNING *",',
  '    "), updated_manager AS (",',
  '    "  UPDATE business.aicm_manager_major_work_item m",',
  '    "  SET decomposition_status_code = ' + "'decomposed'" + ',",',
  '    "      handoff_status_code = ' + "'completed'" + ',",',
  '    "      metadata_jsonb = COALESCE(m.metadata_jsonb, ' + "'{}'" + '::jsonb) || jsonb_build_object(",',
  '    "        ' + "'auto_decomposition_version'" + ', (SELECT auto_decomposition_version FROM input_request),",',
  '    "        ' + "'auto_decomposition_completed_at'" + ', now()::text",',
  '    "      ),",',
  '    "      updated_at = now()",',
  '    "  FROM inserted_middle im",',
  '    "  WHERE m.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",',
  '    "  RETURNING m.*",',
  '    "), skipped_existing AS (",',
  '    "  SELECT m.aicm_manager_major_work_item_id",',
  '    "  FROM business.aicm_manager_major_work_item m",',
  '    "  JOIN input_request r",',
  '    "    ON r.owner_civilization_id = m.owner_civilization_id",',
  '    "   AND r.aicm_user_company_id = m.aicm_user_company_id",',
  '    "  WHERE m.decomposition_status_code = ' + "'assigned_to_leader'" + '",',
  '    "    AND m.handoff_status_code = ' + "'handed_off'" + '",',
  '    targetWhere,',
  '    "    AND EXISTS (",',
  '    "      SELECT 1",',
  '    "      FROM business.aicm_leader_middle_work_item existing",',
  '    "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",',
  '    "        AND existing.breakdown_status_code <> ' + "'archived'" + '",',
  '    "    )",',
  '    "), final_items AS (",',
  '    "  SELECT",',
  '    "    im.aicm_manager_major_work_item_id,",',
  '    "    im.aicm_leader_middle_work_item_id,",',
  '    "    ir.aicm_leader_deliverable_requirement_id,",',
  '    "    iw.aicm_worker_work_unit_id,",',
  '    "    ' + "'created'" + '::text AS status",',
  '    "  FROM inserted_middle im",',
  '    "  LEFT JOIN inserted_requirement ir ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",',
  '    "  LEFT JOIN inserted_worker_unit iw ON iw.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",',
  '    "  UNION ALL",',
  '    "  SELECT",',
  '    "    se.aicm_manager_major_work_item_id,",',
  '    "    NULL::uuid,",',
  '    "    NULL::uuid,",',
  '    "    NULL::uuid,",',
  '    "    ' + "'skipped_existing_decomposition'" + '::text AS status",',
  '    "  FROM skipped_existing se",',
  '    ")",',
  '    "SELECT jsonb_build_object(",',
  '    "  ' + "'result'" + ', ' + "'ok'" + ',',',
  '    "  ' + "'api_identifier'" + ', " + sqlLiteral(SERVER_MARK) + ",",',
  '    "  ' + "'auto_decomposition_version'" + ', (SELECT auto_decomposition_version FROM input_request),",',
  '    "  ' + "'processed_manager_major_count'" + ', (SELECT count(*) FROM updated_manager),",',
  '    "  ' + "'created_leader_middle_count'" + ', (SELECT count(*) FROM inserted_middle),",',
  '    "  ' + "'created_deliverable_requirement_count'" + ', (SELECT count(*) FROM inserted_requirement),",',
  '    "  ' + "'created_worker_work_unit_count'" + ', (SELECT count(*) FROM inserted_worker_unit),",',
  '    "  ' + "'skipped_count'" + ', (SELECT count(*) FROM skipped_existing),",',
  '    "  ' + "'items'" + ', COALESCE((SELECT jsonb_agg(to_jsonb(final_items)) FROM final_items), ' + "'[]'" + '::jsonb)",',
  '    ")::text;"',
  '  ].join("\\n");',
  '',
  '  return runPsqlJson(sql);',
  '}',
  '',
  END
].join('\n');

const handleRange = findFunctionRange(text, 'handleApi');

text = text.slice(0, handleRange.start) + helperBlock + '\n\n' + text.slice(handleRange.start);

let handleRange2 = findFunctionRange(text, 'handleApi');
let handleText = handleRange2.oldText;

if (!handleText.includes('/api/aicm/v2/leader-auto-decomposition/run')) {
  const anchor = 'if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST")';
  const idx = handleText.indexOf(anchor);
  if (idx < 0) throw new Error('route anchor not found');

  const routeBlock = [
    '',
    '    if (route === "/api/aicm/v2/leader-auto-decomposition/run" && req.method === "POST") {',
    '      const body = await readBody(req);',
    '      sendJson(res, 200, runLeaderAutoDecomposition(body));',
    '      return true;',
    '    }',
    ''
  ].join('\n');

  handleText = handleText.slice(0, idx) + routeBlock + handleText.slice(idx);
  text = text.slice(0, handleRange2.start) + handleText + text.slice(handleRange2.end);
}

const after = {
  mark: count(text, MARK),
  route: count(text, '/api/aicm/v2/leader-auto-decomposition/run'),
  functionCount: count(text, 'function runLeaderAutoDecomposition'),
  middleTable: count(text, 'aicm_leader_middle_work_item'),
  requirementTable: count(text, 'aicm_leader_deliverable_requirement'),
  workerTable: count(text, 'aicm_worker_work_unit'),
  handleApiCount: count(text, 'async function handleApi')
};

if (after.mark < 2) throw new Error('R8Z-A markers missing');
if (after.route !== 1) throw new Error('route count invalid: ' + after.route);
if (after.functionCount !== 1) throw new Error('function count invalid: ' + after.functionCount);
if (after.middleTable < 1 || after.requirementTable < 1 || after.workerTable < 1) throw new Error('PMLW table references missing');
if (after.handleApiCount !== 1) throw new Error('handleApi count invalid');

fs.writeFileSync(serverPath, text, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  db_write: 'NO_IN_PATCH',
  api_post: 'NO',
  persistent_db_write: 'NO'
}, null, 2));
