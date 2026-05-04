============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 課長/Leaderへ送る
- Manager大項目 -> Leader中項目 -> Worker作業単位

現在位置:
- レビュー・承認待ち一覧は完了
- V10L-A2 audit PASS
- DB上は task ledger 2件 / manager major 38件 / leader middle 4件 / worker unit 4件
- 自動チェーンデータは存在する
- 次は複数件/全件を課長へ送るUIだが、書込前にpayloadと重複作成リスクを確定する

今回:
1. runLeaderAutoDecomposition の exact source を抽出
2. route payload required keys を抽出
3. manager major / leader middle / worker unit の関連keyを確認
4. 既存のLeader中項目がどのManager大項目に紐づいているか確認
5. Manager大項目ごとの送信済/未送信判定候補を確認
6. UIで表示すべき反映先を分類
7. 次のV10L-B patch方針を決める

禁止:
- DB write
- API POST
- PATCH
- server restart

DB_REVIEW:
- 佐藤(DB担当): read-only audit only

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. syntax
============================================================
CORE_SYNTAX=OK
SERVER_SYNTAX=OK

============================================================
3. server function / route extract
============================================================
FUNCTION_FOUND=true
FUNCTION_START_LINE=1651
FUNCTION_END_LINE=1840
REQUIRED_UUID_KEYS=owner_civilization_id,aicm_user_company_id,aicm_manager_major_work_item_id
REQUIRED_TEXT_KEYS=
BODY_KEY_REFERENCES=aicm_manager_major_work_item_id,aicm_user_company_id,auto_decomposition_version,limit,mode,owner_civilization_id,source_app_ref

---- function source ----
function runLeaderAutoDecomposition(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const mode = aicmR8zAutoMode(body.mode);
  const limit = aicmR8zAutoLimit(body.limit);
  const version = aicmR8zAutoVersion(body.auto_decomposition_version);
  const sourceAppRef = aicmR8zAutoText(body.source_app_ref) || "AICompanyManager";
  const majorId = body.aicm_manager_major_work_item_id
    ? requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")
    : "";

  if (mode === "single" && !majorId) {
    throw new Error("aicm_manager_major_work_item_id is required for single mode");
  }

  const targetWhere = mode === "single"
    ? "    AND m.aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid"
    : "    AND m.aicm_manager_major_work_item_id IS NOT NULL";

  const sql = [
    "WITH input_request AS (",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid AS owner_civilization_id,",
    "    " + sqlLiteral(companyId) + "::uuid AS aicm_user_company_id,",
    "    " + sqlLiteral(version) + "::text AS auto_decomposition_version,",
    "    " + sqlLiteral(sourceAppRef) + "::text AS source_app_ref,",
    "    " + String(limit) + "::int AS max_count",
    "), target_major AS (",
    "  SELECT m.*",
    "  FROM business.aicm_manager_major_work_item m",
    "  JOIN input_request r",
    "    ON r.owner_civilization_id = m.owner_civilization_id",
    "   AND r.aicm_user_company_id = m.aicm_user_company_id",
    "  WHERE m.decomposition_status_code = " + sqlLiteral("assigned_to_leader"),
    "    AND m.handoff_status_code = " + sqlLiteral("handed_off"),
    targetWhere,
    "    AND NOT EXISTS (",
    "      SELECT 1",
    "      FROM business.aicm_leader_middle_work_item existing",
    "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",
    "        AND existing.owner_civilization_id = m.owner_civilization_id",
    "        AND existing.aicm_user_company_id = m.aicm_user_company_id",
    "        AND existing.breakdown_status_code <> " + sqlLiteral("archived"),
    "    )",
    "  ORDER BY m.updated_at, m.display_order, m.created_at",
    "  LIMIT (SELECT max_count FROM input_request)",
    "), selected_worker AS (",
    "  SELECT DISTINCT ON (tm.aicm_manager_major_work_item_id)",
    "    tm.aicm_manager_major_work_item_id,",
    "    p.aiworker_model_code,",
    "    COALESCE(NULLIF(p.internal_nickname, ''), p.aiworker_model_code, " + sqlLiteral("未割当") + ") AS worker_label",
    "  FROM target_major tm",
    "  LEFT JOIN business.aicm_user_company_worker_placement p",
    "    ON p.owner_civilization_id = tm.owner_civilization_id",
    "   AND p.aicm_user_company_id = tm.aicm_user_company_id",
    "   AND p.role_code = " + sqlLiteral("Worker"),
    "   AND p.status_code = " + sqlLiteral("active"),
    "  ORDER BY",
    "    tm.aicm_manager_major_work_item_id,",
    "    CASE",
    "      WHEN p.aicm_user_company_section_id IS NOT NULL AND p.aicm_user_company_section_id = tm.aicm_user_company_section_id THEN 1",
    "      WHEN p.aicm_user_company_department_id IS NOT NULL AND p.aicm_user_company_department_id = tm.aicm_user_company_department_id THEN 2",
    "      WHEN p.target_level_code = " + sqlLiteral("company") + " THEN 3",
    "      ELSE 9",
    "    END,",
    "    p.created_at",
    "), inserted_middle AS (",
    "  INSERT INTO business.aicm_leader_middle_work_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id,",
    "    aicm_user_company_department_id, aicm_user_company_section_id,",
    "    middle_item_name, middle_item_description, leader_robot_label,",
    "    breakdown_status_code, handoff_status_code, priority_code, due_date,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",
    "  )",
    "  SELECT",
    "    tm.owner_civilization_id, tm.aicm_user_company_id, tm.aicm_manager_major_work_item_id,",
    "    tm.aicm_user_company_department_id, tm.aicm_user_company_section_id,",
    "    tm.major_item_name, tm.major_item_description,",
    "    COALESCE(NULLIF(tm.assigned_leader_label, ''), " + sqlLiteral("自動割当") + "),",
    "    " + sqlLiteral("worker_units_created") + ", " + sqlLiteral("handed_off") + ", tm.priority_code, tm.due_date,",
    "    tm.reference_files_text, tm.supplemental_materials_text, tm.applicable_rules_text,",
    "    " + sqlLiteral("R8Z auto-generated from Manager大項目") + ", '', tm.display_order,",
    "    jsonb_build_object(",
    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "      " + sqlLiteral("auto_decomposition_source") + ", " + sqlLiteral("manager_major") + ",",
    "      " + sqlLiteral("source_app_ref") + ", (SELECT source_app_ref FROM input_request),",
    "      " + sqlLiteral("source_manager_major_work_item_id") + ", tm.aicm_manager_major_work_item_id::text",
    "    )",
    "  FROM target_major tm",
    "  RETURNING *",
    "), inserted_requirement AS (",
    "  INSERT INTO business.aicm_leader_deliverable_requirement (",
    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id,",
    "    deliverable_name, deliverable_type_code, deliverable_description,",
    "    required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code,",
    "    priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",
    "  )",
    "  SELECT",
    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id,",
    "    im.middle_item_name || " + sqlLiteral(" 成果物") + ", " + sqlLiteral("operation") + ", im.middle_item_description,",
    "    " + sqlLiteral("会社共通ルールと該当業務ルールに従い、後続Workerが実行可能な成果物にする") + ",",
    "    " + sqlLiteral("大項目の目的を満たし、レビュー可能な作業結果が作成されていること") + ",",
    "    true, " + sqlLiteral("ready_for_worker") + ", im.priority_code, im.due_date,",
    "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",
    "    " + sqlLiteral("R8Z auto-generated deliverable requirement") + ", '', im.display_order,",
    "    jsonb_build_object(",
    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "      " + sqlLiteral("source_leader_middle_work_item_id") + ", im.aicm_leader_middle_work_item_id::text,",
    "      " + sqlLiteral("source_manager_major_work_item_id") + ", im.aicm_manager_major_work_item_id::text",
    "    )",
    "  FROM inserted_middle im",
    "  RETURNING *",
    "), inserted_worker_unit AS (",
    "  INSERT INTO business.aicm_worker_work_unit (",
    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,",
    "    work_unit_name, work_unit_description, work_type_code,",
    "    assigned_worker_label, worker_model_code, work_status_code, review_status_code,",
    "    priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, display_order, metadata_jsonb",
    "  )",
    "  SELECT",
    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,",
    "    im.middle_item_name || " + sqlLiteral(" 作業") + ", im.middle_item_description, " + sqlLiteral("operation") + ",",
    "    COALESCE(sw.worker_label, " + sqlLiteral("未割当") + "), COALESCE(sw.aiworker_model_code, ''), " + sqlLiteral("todo") + ", " + sqlLiteral("required") + ",",
    "    im.priority_code, im.due_date,",
    "    " + sqlLiteral("Manager大項目: ") + " || im.middle_item_name || E'\\n' || im.middle_item_description,",
    "    " + sqlLiteral("指定された大項目について、実行可能な成果物または作業結果を作成する") + ",",
    "    '', '',",
    "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",
    "    CASE WHEN sw.aiworker_model_code IS NULL THEN " + sqlLiteral("Worker未割当。配置後に再割当対象。") + " ELSE " + sqlLiteral("R8Z auto-generated worker work unit") + " END,",
    "    im.display_order,",
    "    jsonb_build_object(",
    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "      " + sqlLiteral("source_leader_middle_work_item_id") + ", im.aicm_leader_middle_work_item_id::text,",
    "      " + sqlLiteral("source_deliverable_requirement_id") + ", ir.aicm_leader_deliverable_requirement_id::text,",
    "      " + sqlLiteral("source_manager_major_work_item_id") + ", im.aicm_manager_major_work_item_id::text",
    "    )",
    "  FROM inserted_middle im",
    "  JOIN inserted_requirement ir ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
    "  LEFT JOIN selected_worker sw ON sw.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",
    "  RETURNING *",
    "), updated_manager AS (",
    "  UPDATE business.aicm_manager_major_work_item m",
    "  SET decomposition_status_code = " + sqlLiteral("decomposed") + ",",
    "      handoff_status_code = " + sqlLiteral("completed") + ",",
    "      metadata_jsonb = COALESCE(m.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
    "        " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "        " + sqlLiteral("auto_decomposition_completed_at") + ", now()::text",
    "      ),",
    "      updated_at = now()",
    "  FROM inserted_middle im",
    "  WHERE m.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",
    "  RETURNING m.*",
    "), skipped_existing AS (",
    "  SELECT m.aicm_manager_major_work_item_id",
    "  FROM business.aicm_manager_major_work_item m",
    "  JOIN input_request r ON r.owner_civilization_id = m.owner_civilization_id AND r.aicm_user_company_id = m.aicm_user_company_id",
    "  WHERE m.decomposition_status_code = " + sqlLiteral("assigned_to_leader"),
    "    AND m.handoff_status_code = " + sqlLiteral("handed_off"),
    targetWhere,
    "    AND EXISTS (",
    "      SELECT 1",
    "      FROM business.aicm_leader_middle_work_item existing",
    "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",
    "        AND existing.breakdown_status_code <> " + sqlLiteral("archived"),
    "    )",
    "), final_items AS (",
    "  SELECT im.aicm_manager_major_work_item_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id, iw.aicm_worker_work_unit_id, " + sqlLiteral("created") + "::text AS status",
    "  FROM inserted_middle im",
    "  LEFT JOIN inserted_requirement ir ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
    "  LEFT JOIN inserted_worker_unit iw ON iw.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
    "  UNION ALL",
    "  SELECT se.aicm_manager_major_work_item_id, NULL::uuid, NULL::uuid, NULL::uuid, " + sqlLiteral("skipped_existing_decomposition") + "::text AS status",
    "  FROM skipped_existing se",
    ")",
    "SELECT jsonb_build_object(",
    "  " + sqlLiteral("result") + ", " + sqlLiteral("ok") + ",",
    "  " + sqlLiteral("api_identifier") + ", " + sqlLiteral(SERVER_MARK) + ",",
    "  " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "  " + sqlLiteral("processed_manager_major_count") + ", (SELECT count(*) FROM updated_manager),",
    "  " + sqlLiteral("created_leader_middle_count") + ", (SELECT count(*) FROM inserted_middle),",
    "  " + sqlLiteral("created_deliverable_requirement_count") + ", (SELECT count(*) FROM inserted_requirement),",
    "  " + sqlLiteral("created_worker_work_unit_count") + ", (SELECT count(*) FROM inserted_worker_unit),",
    "  " + sqlLiteral("skipped_count") + ", (SELECT count(*) FROM skipped_existing),",
    "  " + sqlLiteral("items") + ", COALESCE((SELECT jsonb_agg(to_jsonb(final_items)) FROM final_items), '[]'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

ROUTE_FOUND=true
ROUTE_LINE=2100

---- route nearby ----
nst requestBody = buildWorkerRuntimeRequestBodyR8ZI(pair);

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
    dry_run: dryRun,
    candidate_count: pairs.length,
    executed_count: executed.length,
    failed_count: failed.length,
    executed,
    failed
  };
}
// AICM_R8Z_I_WORKER_AUTO_EXECUTION_SERVER_END


async function handleApi(req, res, url) {
  const route = url.pathname;

  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 200, { result: "ok", api_identifier: SERVER_MARK });
      return true;
    }

    
    if (route === "/api/aicm/v2/president-policy/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createPresidentPolicy(body));
      return true;
    }

    if (route === "/api/aicm/v2/manager-major/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createManagerMajorItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/manager-major/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateManagerMajorItem(body));
      return true;
    }

    
    if (route === "/api/aicm/v2/leader-auto-decomposition/run" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, runLeaderAutoDecomposition(body));
      return true;
    }
if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, archiveManagerMajorItem(body));
      return true;
    }

// AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, importManagerMajorItemsCsv(body));
      return true;
    }


    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, approveHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, returnHumanReviewItem(body));
      return true;
    }


    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateCompany(body));
      return true;
    }

    if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateDepartment(body));
      return true;
    }

    // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
    // UI label "組織変更" is connected to the current section/k課 update responsibility.
    // Keep this as an explicit compatibility route so future split can be handled here.
    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateSection(body));
      return true;
    }

    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateSection(body));
      return true;
    }


    // AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE: review-list script transport for local browser hydration
    if (route === "/api/aicm/v2/context-script" && req.method === "G
============================================================
4. DB columns
============================================================
aicm_department_task_ledger	1	ledger_row_id	uuid
aicm_department_task_ledger	10	responsible_role	text
aicm_department_task_ledger	11	responsible_robot_id	uuid
aicm_department_task_ledger	12	source_type	text
aicm_department_task_ledger	13	handoff_link	text
aicm_department_task_ledger	14	note	text
aicm_department_task_ledger	15	created_at	timestamp with time zone
aicm_department_task_ledger	16	updated_at	timestamp with time zone
aicm_department_task_ledger	2	company_id	uuid
aicm_department_task_ledger	3	department_id	uuid
aicm_department_task_ledger	4	deliverable_name	text
aicm_department_task_ledger	5	task_name	text
aicm_department_task_ledger	6	work_type	text
aicm_department_task_ledger	7	task_status	text
aicm_department_task_ledger	8	priority	text
aicm_department_task_ledger	9	due_date	date
aicm_leader_deliverable_requirement	1	aicm_leader_deliverable_requirement_id	uuid
aicm_leader_deliverable_requirement	10	review_required_flag	boolean
aicm_leader_deliverable_requirement	11	requirement_status_code	text
aicm_leader_deliverable_requirement	12	priority_code	text
aicm_leader_deliverable_requirement	13	due_date	date
aicm_leader_deliverable_requirement	14	reference_files_text	text
aicm_leader_deliverable_requirement	15	supplemental_materials_text	text
aicm_leader_deliverable_requirement	16	applicable_rules_text	text
aicm_leader_deliverable_requirement	17	note	text
aicm_leader_deliverable_requirement	18	handoff_link	text
aicm_leader_deliverable_requirement	19	display_order	integer
aicm_leader_deliverable_requirement	2	owner_civilization_id	uuid
aicm_leader_deliverable_requirement	20	metadata_jsonb	jsonb
aicm_leader_deliverable_requirement	21	created_at	timestamp with time zone
aicm_leader_deliverable_requirement	22	updated_at	timestamp with time zone
aicm_leader_deliverable_requirement	3	aicm_user_company_id	uuid
aicm_leader_deliverable_requirement	4	aicm_leader_middle_work_item_id	uuid
aicm_leader_deliverable_requirement	5	deliverable_name	text
aicm_leader_deliverable_requirement	6	deliverable_type_code	text
aicm_leader_deliverable_requirement	7	deliverable_description	text
aicm_leader_deliverable_requirement	8	required_quality_text	text
aicm_leader_deliverable_requirement	9	acceptance_criteria_text	text
aicm_leader_middle_work_item	1	aicm_leader_middle_work_item_id	uuid
aicm_leader_middle_work_item	10	breakdown_status_code	text
aicm_leader_middle_work_item	11	handoff_status_code	text
aicm_leader_middle_work_item	12	priority_code	text
aicm_leader_middle_work_item	13	due_date	date
aicm_leader_middle_work_item	14	reference_files_text	text
aicm_leader_middle_work_item	15	supplemental_materials_text	text
aicm_leader_middle_work_item	16	applicable_rules_text	text
aicm_leader_middle_work_item	17	note	text
aicm_leader_middle_work_item	18	handoff_link	text
aicm_leader_middle_work_item	19	display_order	integer
aicm_leader_middle_work_item	2	owner_civilization_id	uuid
aicm_leader_middle_work_item	20	metadata_jsonb	jsonb
aicm_leader_middle_work_item	21	created_at	timestamp with time zone
aicm_leader_middle_work_item	22	updated_at	timestamp with time zone
aicm_leader_middle_work_item	3	aicm_user_company_id	uuid
aicm_leader_middle_work_item	4	aicm_manager_major_work_item_id	uuid
aicm_leader_middle_work_item	5	aicm_user_company_department_id	uuid
aicm_leader_middle_work_item	6	aicm_user_company_section_id	uuid
aicm_leader_middle_work_item	7	middle_item_name	text
aicm_leader_middle_work_item	8	middle_item_description	text
aicm_leader_middle_work_item	9	leader_robot_label	text
aicm_manager_major_work_item	1	aicm_manager_major_work_item_id	uuid
aicm_manager_major_work_item	10	manager_robot_label	text
aicm_manager_major_work_item	11	assigned_leader_label	text
aicm_manager_major_work_item	12	decomposition_status_code	text
aicm_manager_major_work_item	13	handoff_status_code	text
aicm_manager_major_work_item	14	priority_code	text
aicm_manager_major_work_item	15	due_date	date
aicm_manager_major_work_item	16	reference_files_text	text
aicm_manager_major_work_item	17	supplemental_materials_text	text
aicm_manager_major_work_item	18	applicable_rules_text	text
aicm_manager_major_work_item	19	note	text
aicm_manager_major_work_item	2	owner_civilization_id	uuid
aicm_manager_major_work_item	20	handoff_link	text
aicm_manager_major_work_item	21	display_order	integer
aicm_manager_major_work_item	22	metadata_jsonb	jsonb
aicm_manager_major_work_item	23	created_at	timestamp with time zone
aicm_manager_major_work_item	24	updated_at	timestamp with time zone
aicm_manager_major_work_item	3	aicm_user_company_id	uuid
aicm_manager_major_work_item	4	aicm_president_policy_id	uuid
aicm_manager_major_work_item	5	aicm_user_company_department_id	uuid
aicm_manager_major_work_item	6	aicm_user_company_section_id	uuid
aicm_manager_major_work_item	7	major_item_name	text
aicm_manager_major_work_item	8	major_item_description	text
aicm_manager_major_work_item	9	source_route_code	text
aicm_user_company_department_task_ledger	1	aicm_user_company_department_task_ledger_id	uuid
aicm_user_company_department_task_ledger	10	responsible_robot_label	text
aicm_user_company_department_task_ledger	11	task_status_code	text
aicm_user_company_department_task_ledger	12	priority_code	text
aicm_user_company_department_task_ledger	13	due_date	date
aicm_user_company_department_task_ledger	14	reference_files_text	text
aicm_user_company_department_task_ledger	15	supplemental_materials_text	text
aicm_user_company_department_task_ledger	16	applicable_rules_text	text
aicm_user_company_department_task_ledger	17	note	text
aicm_user_company_department_task_ledger	18	handoff_link	text
aicm_user_company_department_task_ledger	19	display_order	integer
aicm_user_company_department_task_ledger	2	owner_civilization_id	uuid
aicm_user_company_department_task_ledger	20	metadata_jsonb	jsonb
aicm_user_company_department_task_ledger	21	created_at	timestamp with time zone
aicm_user_company_department_task_ledger	22	updated_at	timestamp with time zone
aicm_user_company_department_task_ledger	3	aicm_user_company_id	uuid
aicm_user_company_department_task_ledger	4	aicm_user_company_department_id	uuid
aicm_user_company_department_task_ledger	5	aicm_user_company_section_id	uuid
aicm_user_company_department_task_ledger	6	deliverable_name	text
aicm_user_company_department_task_ledger	7	task_name	text
aicm_user_company_department_task_ledger	8	work_type_code	text
aicm_user_company_department_task_ledger	9	responsible_role_code	text
aicm_worker_work_unit	1	aicm_worker_work_unit_id	uuid
aicm_worker_work_unit	10	worker_model_code	text
aicm_worker_work_unit	11	work_status_code	text
aicm_worker_work_unit	12	review_status_code	text
aicm_worker_work_unit	13	priority_code	text
aicm_worker_work_unit	14	due_date	date
aicm_worker_work_unit	15	input_context_text	text
aicm_worker_work_unit	16	expected_output_text	text
aicm_worker_work_unit	17	result_summary_text	text
aicm_worker_work_unit	18	handoff_link	text
aicm_worker_work_unit	19	reference_files_text	text
aicm_worker_work_unit	2	owner_civilization_id	uuid
aicm_worker_work_unit	20	supplemental_materials_text	text
aicm_worker_work_unit	21	applicable_rules_text	text
aicm_worker_work_unit	22	note	text
aicm_worker_work_unit	23	display_order	integer
aicm_worker_work_unit	24	metadata_jsonb	jsonb
aicm_worker_work_unit	25	created_at	timestamp with time zone
aicm_worker_work_unit	26	updated_at	timestamp with time zone
aicm_worker_work_unit	3	aicm_user_company_id	uuid
aicm_worker_work_unit	4	aicm_leader_middle_work_item_id	uuid
aicm_worker_work_unit	5	aicm_leader_deliverable_requirement_id	uuid
aicm_worker_work_unit	6	work_unit_name	text
aicm_worker_work_unit	7	work_unit_description	text
aicm_worker_work_unit	8	work_type_code	text
aicm_worker_work_unit	9	assigned_worker_label	text
vw_aicm_pmlw_leader_middle_display	1	aicm_leader_middle_work_item_id	uuid
vw_aicm_pmlw_leader_middle_display	10	section_name	text
vw_aicm_pmlw_leader_middle_display	11	middle_item_name	text
vw_aicm_pmlw_leader_middle_display	12	middle_item_description	text
vw_aicm_pmlw_leader_middle_display	13	leader_robot_label	text
vw_aicm_pmlw_leader_middle_display	14	breakdown_status_code	text
vw_aicm_pmlw_leader_middle_display	15	handoff_status_code	text
vw_aicm_pmlw_leader_middle_display	16	priority_code	text
vw_aicm_pmlw_leader_middle_display	17	due_date	date
vw_aicm_pmlw_leader_middle_display	18	reference_files_text	text
vw_aicm_pmlw_leader_middle_display	19	supplemental_materials_text	text
vw_aicm_pmlw_leader_middle_display	2	owner_civilization_id	uuid
vw_aicm_pmlw_leader_middle_display	20	applicable_rules_text	text
vw_aicm_pmlw_leader_middle_display	21	note	text
vw_aicm_pmlw_leader_middle_display	22	handoff_link	text
vw_aicm_pmlw_leader_middle_display	23	display_order	integer
vw_aicm_pmlw_leader_middle_display	24	metadata_jsonb	jsonb
vw_aicm_pmlw_leader_middle_display	25	created_at	timestamp with time zone
vw_aicm_pmlw_leader_middle_display	26	updated_at	timestamp with time zone
vw_aicm_pmlw_leader_middle_display	3	aicm_user_company_id	uuid
vw_aicm_pmlw_leader_middle_display	4	company_name	text
vw_aicm_pmlw_leader_middle_display	5	aicm_manager_major_work_item_id	uuid
vw_aicm_pmlw_leader_middle_display	6	major_item_name	text
vw_aicm_pmlw_leader_middle_display	7	aicm_user_company_department_id	uuid
vw_aicm_pmlw_leader_middle_display	8	department_name	text
vw_aicm_pmlw_leader_middle_display	9	aicm_user_company_section_id	uuid
vw_aicm_pmlw_major_work_display	1	aicm_manager_major_work_item_id	uuid
vw_aicm_pmlw_major_work_display	10	aicm_user_company_section_id	uuid
vw_aicm_pmlw_major_work_display	11	section_name	text
vw_aicm_pmlw_major_work_display	12	major_item_name	text
vw_aicm_pmlw_major_work_display	13	major_item_description	text
vw_aicm_pmlw_major_work_display	14	source_route_code	text
vw_aicm_pmlw_major_work_display	15	manager_robot_label	text
vw_aicm_pmlw_major_work_display	16	assigned_leader_label	text
vw_aicm_pmlw_major_work_display	17	decomposition_status_code	text
vw_aicm_pmlw_major_work_display	18	handoff_status_code	text
vw_aicm_pmlw_major_work_display	19	priority_code	text
vw_aicm_pmlw_major_work_display	2	owner_civilization_id	uuid
vw_aicm_pmlw_major_work_display	20	due_date	date
vw_aicm_pmlw_major_work_display	21	reference_files_text	text
vw_aicm_pmlw_major_work_display	22	supplemental_materials_text	text
vw_aicm_pmlw_major_work_display	23	applicable_rules_text	text
vw_aicm_pmlw_major_work_display	24	note	text
vw_aicm_pmlw_major_work_display	25	handoff_link	text
vw_aicm_pmlw_major_work_display	26	display_order	integer
vw_aicm_pmlw_major_work_display	27	metadata_jsonb	jsonb
vw_aicm_pmlw_major_work_display	28	created_at	timestamp with time zone
vw_aicm_pmlw_major_work_display	29	updated_at	timestamp with time zone
vw_aicm_pmlw_major_work_display	3	aicm_user_company_id	uuid
vw_aicm_pmlw_major_work_display	4	company_name	text
vw_aicm_pmlw_major_work_display	5	aicm_president_policy_id	uuid
vw_aicm_pmlw_major_work_display	6	policy_title	text
vw_aicm_pmlw_major_work_display	7	policy_status_code	text
vw_aicm_pmlw_major_work_display	8	aicm_user_company_department_id	uuid
vw_aicm_pmlw_major_work_display	9	department_name	text
vw_aicm_pmlw_worker_work_unit_display	1	aicm_worker_work_unit_id	uuid
vw_aicm_pmlw_worker_work_unit_display	10	deliverable_name	text
vw_aicm_pmlw_worker_work_unit_display	11	deliverable_type_code	text
vw_aicm_pmlw_worker_work_unit_display	12	work_unit_name	text
vw_aicm_pmlw_worker_work_unit_display	13	work_unit_description	text
vw_aicm_pmlw_worker_work_unit_display	14	work_type_code	text
vw_aicm_pmlw_worker_work_unit_display	15	assigned_worker_label	text
vw_aicm_pmlw_worker_work_unit_display	16	worker_model_code	text
vw_aicm_pmlw_worker_work_unit_display	17	work_status_code	text
vw_aicm_pmlw_worker_work_unit_display	18	review_status_code	text
vw_aicm_pmlw_worker_work_unit_display	19	priority_code	text
vw_aicm_pmlw_worker_work_unit_display	2	owner_civilization_id	uuid
vw_aicm_pmlw_worker_work_unit_display	20	due_date	date
vw_aicm_pmlw_worker_work_unit_display	21	input_context_text	text
vw_aicm_pmlw_worker_work_unit_display	22	expected_output_text	text
vw_aicm_pmlw_worker_work_unit_display	23	result_summary_text	text
vw_aicm_pmlw_worker_work_unit_display	24	handoff_link	text
vw_aicm_pmlw_worker_work_unit_display	25	reference_files_text	text
vw_aicm_pmlw_worker_work_unit_display	26	supplemental_materials_text	text
vw_aicm_pmlw_worker_work_unit_display	27	applicable_rules_text	text
vw_aicm_pmlw_worker_work_unit_display	28	note	text
vw_aicm_pmlw_worker_work_unit_display	29	display_order	integer
vw_aicm_pmlw_worker_work_unit_display	3	aicm_user_company_id	uuid
vw_aicm_pmlw_worker_work_unit_display	30	metadata_jsonb	jsonb
vw_aicm_pmlw_worker_work_unit_display	31	created_at	timestamp with time zone
vw_aicm_pmlw_worker_work_unit_display	32	updated_at	timestamp with time zone
vw_aicm_pmlw_worker_work_unit_display	4	company_name	text
vw_aicm_pmlw_worker_work_unit_display	5	aicm_leader_middle_work_item_id	uuid
vw_aicm_pmlw_worker_work_unit_display	6	middle_item_name	text
vw_aicm_pmlw_worker_work_unit_display	7	aicm_manager_major_work_item_id	uuid
vw_aicm_pmlw_worker_work_unit_display	8	major_item_name	text
vw_aicm_pmlw_worker_work_unit_display	9	aicm_leader_deliverable_requirement_id	uuid
vw_aicm_pmlw_workflow_tree	1	owner_civilization_id	uuid
vw_aicm_pmlw_workflow_tree	10	manager_handoff_status_code	text
vw_aicm_pmlw_workflow_tree	11	department_name	text
vw_aicm_pmlw_workflow_tree	12	section_name	text
vw_aicm_pmlw_workflow_tree	13	aicm_leader_middle_work_item_id	uuid
vw_aicm_pmlw_workflow_tree	14	middle_item_name	text
vw_aicm_pmlw_workflow_tree	15	leader_breakdown_status_code	text
vw_aicm_pmlw_workflow_tree	16	leader_handoff_status_code	text
vw_aicm_pmlw_workflow_tree	17	aicm_leader_deliverable_requirement_id	uuid
vw_aicm_pmlw_workflow_tree	18	deliverable_name	text
vw_aicm_pmlw_workflow_tree	19	deliverable_type_code	text
vw_aicm_pmlw_workflow_tree	2	aicm_user_company_id	uuid
vw_aicm_pmlw_workflow_tree	20	requirement_status_code	text
vw_aicm_pmlw_workflow_tree	21	aicm_worker_work_unit_id	uuid
vw_aicm_pmlw_workflow_tree	22	work_unit_name	text
vw_aicm_pmlw_workflow_tree	23	assigned_worker_label	text
vw_aicm_pmlw_workflow_tree	24	work_status_code	text
vw_aicm_pmlw_workflow_tree	25	review_status_code	text
vw_aicm_pmlw_workflow_tree	26	last_updated_at	timestamp with time zone
vw_aicm_pmlw_workflow_tree	3	company_name	text
vw_aicm_pmlw_workflow_tree	4	aicm_president_policy_id	uuid
vw_aicm_pmlw_workflow_tree	5	policy_title	text
vw_aicm_pmlw_workflow_tree	6	policy_status_code	text
vw_aicm_pmlw_workflow_tree	7	aicm_manager_major_work_item_id	uuid
vw_aicm_pmlw_workflow_tree	8	major_item_name	text
vw_aicm_pmlw_workflow_tree	9	manager_decomposition_status_code	text
vw_aicm_user_company_department_task_ledger_display	1	aicm_user_company_department_task_ledger_id	uuid
vw_aicm_user_company_department_task_ledger_display	10	deliverable_name	text
vw_aicm_user_company_department_task_ledger_display	11	task_name	text
vw_aicm_user_company_department_task_ledger_display	12	work_type_code	text
vw_aicm_user_company_department_task_ledger_display	13	responsible_role_code	text
vw_aicm_user_company_department_task_ledger_display	14	responsible_robot_label	text
vw_aicm_user_company_department_task_ledger_display	15	task_status_code	text
vw_aicm_user_company_department_task_ledger_display	16	priority_code	text
vw_aicm_user_company_department_task_ledger_display	17	due_date	date
vw_aicm_user_company_department_task_ledger_display	18	reference_files_text	text
vw_aicm_user_company_department_task_ledger_display	19	supplemental_materials_text	text
vw_aicm_user_company_department_task_ledger_display	2	owner_civilization_id	uuid
vw_aicm_user_company_department_task_ledger_display	20	applicable_rules_text	text
vw_aicm_user_company_department_task_ledger_display	21	note	text
vw_aicm_user_company_department_task_ledger_display	22	handoff_link	text
vw_aicm_user_company_department_task_ledger_display	23	display_order	integer
vw_aicm_user_company_department_task_ledger_display	24	metadata_jsonb	jsonb
vw_aicm_user_company_department_task_ledger_display	25	created_at	timestamp with time zone
vw_aicm_user_company_department_task_ledger_display	26	updated_at	timestamp with time zone
vw_aicm_user_company_department_task_ledger_display	3	aicm_user_company_id	uuid
vw_aicm_user_company_department_task_ledger_display	4	company_name	text
vw_aicm_user_company_department_task_ledger_display	5	business_domain	text
vw_aicm_user_company_department_task_ledger_display	6	aicm_user_company_department_id	uuid
vw_aicm_user_company_department_task_ledger_display	7	department_name	text
vw_aicm_user_company_department_task_ledger_display	8	aicm_user_company_section_id	uuid
vw_aicm_user_company_department_task_ledger_display	9	section_name	text

============================================================
5. DB relation counts
============================================================
aicm_user_company_department_task_ledger	1
vw_aicm_user_company_department_task_ledger_display	1
aicm_manager_major_work_item	38
vw_aicm_pmlw_major_work_display	38
aicm_leader_middle_work_item	4
vw_aicm_pmlw_leader_middle_display	4
aicm_worker_work_unit	4
vw_aicm_pmlw_worker_work_unit_display	4

============================================================
6. DB chain links
============================================================
major_chain	86457c2c-4078-4efc-9109-28fa45b78ab4	decomposed	completed	1	1	AI企業業務開始導線の整備
major_chain	eab18cda-a3e2-4dc7-8d0c-7068fdc980f4	decomposed	completed	1	1	Manager大項目台帳運用の整備
major_chain	002ef7b8-3f5d-49e5-90e6-49235f99ee86	decomposed	completed	1	1	Leader引き継ぎ方針の整備
major_chain	436b26b8-ea94-47d3-847e-69ba7d8e646c	decomposed	completed	1	1	開発案件全体ロードマップの整備
major_chain	1f5c787f-3f9d-4571-9a62-ae258b6e8cb4	archived	archived	0	0	主要画面構成の整理
major_chain	f2240a10-b712-4af4-a3a7-a11df53a9bf6	archived	archived	0	0	部門別タスク台帳画面の整備
major_chain	f2badab8-43df-49cf-8400-022430bf22d5	not_started	draft	0	0	ロボット配置表示の整備
major_chain	9cbd039f-d44c-4c96-9be0-8d057d2966ad	not_started	draft	0	0	引き継ぎ前確認画面の整備
major_chain	eb5019b3-70b0-45ce-a5a5-34a001366674	not_started	draft	0	0	レビュー承認待ち一覧の整備
major_chain	49cb5824-fa59-4dc7-9919-28a09b851f6a	not_started	draft	0	0	President方針受領API領域の整備
major_chain	d5415e3c-54e4-4f87-90c3-aaa31cebd7bb	not_started	draft	0	0	Manager大項目登録API領域の整備
major_chain	9b585672-b3df-4cf8-8151-7ec9ed0f3abb	not_started	draft	0	0	Leader引き継ぎAPI領域の整備
major_chain	0353be4e-be2b-49fe-a51b-14de73654c5a	not_started	draft	0	0	ロボット参照API領域の整備
major_chain	a22c789e-b255-4379-84cf-cb92a38b3a50	not_started	draft	0	0	AI企業基本データ領域の整備
major_chain	d6948313-6a0c-4bc9-8091-22ce18b1c5af	not_started	draft	0	0	Manager大項目データ領域の整備
major_chain	a71aae34-f997-4ac9-ab39-1185e02f7e7d	not_started	draft	0	0	Leader分解結果データ領域の整備
major_chain	5b6a423b-6dd6-4043-a48f-bd5a241f275f	not_started	draft	0	0	成果物参照データ領域の整備
major_chain	b96ffef0-6952-416a-ae15-906d6b79c1a8	not_started	draft	0	0	PresidentからManagerへの業務変換整備
major_chain	0ca95f87-556c-469a-b113-3e32dd1a86b3	not_started	draft	0	0	ManagerからLeaderへの配布整備
major_chain	fe3223c2-2f27-4330-901d-65110a550369	not_started	draft	0	0	LeaderからWorkerへの作業化整備
major_chain	f3b220c8-22c1-4cfb-928c-b41098dabc01	not_started	draft	0	0	ロボット進捗監視の整備
major_chain	f9de8116-e094-4fbf-a349-13991685a43e	not_started	draft	0	0	ロボット選定基準の整備
major_chain	994357eb-56c9-41d9-bba7-05810e90dc6a	not_started	draft	0	0	ロボット作業権限の整備
major_chain	fe75cf70-46ef-499a-bc61-16e15f046209	not_started	draft	0	0	ロボット特性反映方針の整備
major_chain	01d2f1dd-c431-494b-96b8-f5575fb1142a	not_started	draft	0	0	開発成果物レビュー運用の整備
major_chain	aee80365-038c-496d-ad77-a96036cafd20	not_started	draft	0	0	承認導線の整備
major_chain	16478a44-cdac-4d66-b0a5-469e32f5cd19	not_started	draft	0	0	受入基準の整備
major_chain	8bc546dc-963a-4cda-be95-a37facb7f555	not_started	draft	0	0	ロボット作業ログ確認の整備
major_chain	1fcffc1a-90bb-4e07-ae83-8655e009b194	not_started	draft	0	0	会社別アクセス制御の整備
major_chain	975edafa-8b13-4e82-9fa5-0e16f5751659	not_started	draft	0	0	ロボット別アクセス制御の整備
major_chain	7d5a6454-fbf4-41cc-935e-6a14313d1346	not_started	draft	0	0	操作監査と履歴管理の整備
major_chain	5fc24434-6a47-4d93-9757-5edb54296873	not_started	draft	0	0	CommonOS連携領域の整備
major_chain	c74c6139-44e6-4706-8357-6e92386eb05b	not_started	draft	0	0	AIWorkerOS参照連携の整備
major_chain	285c8286-4c83-4601-88b7-6beca100df4e	not_started	draft	0	0	CX知識参照連携の整備
major_chain	f4c0cae3-3296-406f-b92e-03b8608b51ec	not_started	draft	0	0	CSV作成テンプレ運用の整備
major_chain	4553ac03-397b-418c-821a-7f3c651473dc	not_started	draft	0	0	例外時差し戻し運用の整備
major_chain	fc71d4b8-05a1-418c-a94d-726428f6a224	not_started	draft	0	0	複数アプリ開発の継続運用整備
major_chain	72546344-1c6f-4dba-a635-e4a7dbafc1a7	archived	archived	0	0	AI企業業務開始導線整理

============================================================
7. DB duplicate risk
============================================================
middle_duplicate_groups	0
worker_duplicate_groups	0
middle_items_total	4
worker_units_total	4
major_with_existing_middle	4

============================================================
8. DB compact samples
============================================================
ERROR:  column "decomposition_status_code" does not exist
LINE 7:     COALESCE(decomposition_status_code,''),
                     ^
task_ledger_sample	be5598bb-a9bf-4cb1-a521-e01559087068:うんこ:うんこさん:todo
major_sample	1f5c787f-3f9d-4571-9a62-ae258b6e8cb4:archived:archived:主要画面構成の整理 || 436b26b8-ea94-47d3-847e-69ba7d8e646c:decomposed:completed:開発案件全体ロードマップの整備 || f2240a10-b712-4af4-a3a7-a11df53a9bf6:archived:archived:部門別タスク台帳画面の整備 || 002ef7b8-3f5d-49e5-90e6-49235f99ee86:decomposed:completed:Leader引き継ぎ方針の整備 || eab18cda-a3e2-4dc7-8d0c-7068fdc980f4:decomposed:completed:Manager大項目台帳運用の整備 || 86457c2c-4078-4efc-9109-28fa45b78ab4:decomposed:completed:AI企業業務開始導線の整備 || 0353be4e-be2b-49fe-a51b-14de73654c5a:not_started:draft:ロボット参照API領域の整備 || 9b585672-b3df-4cf8-8151-7ec9ed0f3abb:not_started:draft:Leader引き継ぎAPI領域の整備 || eb5019b3-70b0-45ce-a5a5-34a001366674:not_started:draft:レビュー承認待ち一覧の整備 || a71aae34-f997-4ac9-ab39-1185e02f7e7d:not_started:draft:Leader分解結果データ領域の整備

============================================================
9. core UI extract
============================================================
CORE_RENDER_TASK_LEDGER_COUNT=15
CORE_LEADER_AUTO_ROUTE_COUNT=1
CORE_CONFIRM_HELPER_COUNT=8
CORE_TASK_LEDGER_CHECKBOX_COUNT=0
CORE_BULK_LABEL_COUNT=3

---- task-ledger / leader-auto / confirm nearby ----
1235-    var worker = aicmAxcSelectedRobotMeta(robotEl);
1236-    var workerRow = aicmAxcBuildRolePlacement({
1237-      role_code: "Worker",
1238-      target_level_code: "section",
1239-      target_id: section.aicm_user_company_section_id,
1240-      aicm_user_company_department_id: section.aicm_user_company_department_id,
1241-      aicm_user_company_section_id: section.aicm_user_company_section_id,
1242-      robot_pool_id: worker ? worker.robot_pool_id : "",
1243-      aiworker_model_code: worker ? worker.aiworker_model_code : "",
1244-      internal_nickname: nickEl ? String(nickEl.value || "").trim() : ""
1245-    });
1246-    if (workerRow) rows.push(workerRow);
1247-
1248-    index += 1;
1249-  }
1250-
1251-  return rows;
1252-}
1253-
1254-async function aicmAxcSyncRolePlacementsForPayload(payload) {
1255-  // AICM_ROLE_SYNC_REQUEST_BODY_AXH_R1_V1
1256-  var rows = payload && Array.isArray(payload.rolePlacements) ? payload.rolePlacements : [];
1257-
1258-  if (!rows.length) {
1259-    return { result: "ok", skipped: true };
1260-  }
1261-
1262-  var body = payload.body || {};
1263-  var companyId = body.aicm_user_company_id || "";
1264-
1265-  if (!companyId && state && state.selectedCompanyId) {
1266-    companyId = state.selectedCompanyId;
1267-  }
1268-
1269-  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
1270-    // AICM_ROLE_SYNC_OWNER_RESOLVER_AXK_V1
1271-    owner_civilization_id: (
1272-      typeof aicmAvdOwnerId === "function"
1273-        ? aicmAvdOwnerId()
1274-        : ((typeof state !== "undefined" && state && state.ownerCivilizationId) ? state.ownerCivilizationId : "")
1275-    ),
1276-    aicm_user_company_id: companyId,
1277-    role_placements: rows
1278-  });
1279-}
1280-
1281-
1282-function saveCompanyUpdateFromForm() {
1283-    var companyId = aicmAvdTextById("aicm-company-edit-id");
1284-
1285-    if (!companyId) {
1286-      setMessage("error", "変更対象の企業が見つかりません。");
1287-      return;
1288-    }
1289-
1290-    var body = {
1291-      owner_civilization_id: aicmAvdOwnerId(),
1292-      aicm_user_company_id: companyId,
1293-      company_name: aicmAvdTextById("aicm-company-edit-name"),
1294-      business_domain: aicmAvdTextById("aicm-company-edit-domain"),
1295-      company_status: aicmAvdTextById("aicm-company-edit-status") || "active"
1296-    };
1297-
1298-    var rows = [
1299-      ["操作", "企業変更"],
1300-      ["企業名", body.company_name],
1301-      ["事業領域", body.business_domain || "未設定"],
1302-      ["状態", body.company_status]
1303-    ].concat(aicmAvdRoleSummaryRows("company"));
1304-
1305:    aicmAvdShowDbConfirm({
1306-      kind: "company-update",
1307-      title: "企業変更",
1308-      endpoint: "/api/aicm/v2/company/update",
1309-      body: body,
1310-      // AICM_ROLEPLACEMENT_SCOPE_FIX_AXG_V1
1311-      rolePlacements: aicmAxcCompanyRolePlacements({
1312-        aicm_user_company_id: body.aicm_user_company_id
1313-      }),
1314-      summary_rows: rows
1315-    });
1316-  }
1317-
1318-
1319-function saveDepartmentUpdateFromForm() {
1320-    var departmentId = aicmAvdTextById("aicm-department-edit-id");
1321-    var companyId = aicmAvdTextById("aicm-department-edit-company-id");
1322-
1323-    if (!departmentId || !companyId) {
1324-      setMessage("error", "変更対象の部門が見つかりません。");
1325-      return;
1326-    }
1327-
1328-    var body = {
1329-      owner_civilization_id: aicmAvdOwnerId(),
1330-      aicm_user_company_id: companyId,
1331-      aicm_user_company_department_id: departmentId,
1332-      department_name: aicmAvdTextById("aicm-department-edit-name"),
1333-      purpose: aicmAvdTextById("aicm-department-edit-purpose"),
1334-      department_status: aicmAvdTextById("aicm-department-edit-status") || "active"
1335-    };
1336-
1337-    var rows = [
1338-      ["操作", "部門変更"],
1339-      ["部門名", body.department_name],
1340-      ["目的", body.purpose || "未設定"],
1341-      ["状態", body.department_status]
1342-    ].concat(aicmAvdRoleSummaryRows("department"));
1343-
1344:    aicmAvdShowDbConfirm({
1345-      kind: "department-update",
1346-      title: "部門変更",
1347-      endpoint: "/api/aicm/v2/department/update",
1348-      body: body,
1349-      // AICM_ROLEPLACEMENT_SCOPE_FIX_AXG_V1
1350-      rolePlacements: aicmAxcDepartmentRolePlacements({
1351-        aicm_user_company_department_id: body.aicm_user_company_department_id
1352-      }),
1353-      summary_rows: rows
1354-    });
1355-  }
1356-
1357-
1358-function saveSectionUpdateFromForm() {
1359-    var sectionId = aicmAvdTextById("aicm-section-edit-id");
1360-    var companyId = aicmAvdTextById("aicm-section-edit-company-id");
1361-    var departmentId = aicmAvdTextById("aicm-section-edit-department-id");
1362-
1363-    if (!sectionId || !companyId || !departmentId) {
1364-      setMessage("error", "変更対象の課が見つかりません。");
1365-      return;
1366-    }
1367-
1368-    var body = {
1369-      owner_civilization_id: aicmAvdOwnerId(),
1370-      aicm_user_company_id: companyId,
1371-      aicm_user_company_department_id: departmentId,
1372-      aicm_user_company_section_id: sectionId,
1373-      section_name: aicmAvdTextById("aicm-section-edit-name"),
1374-      purpose: aicmAvdTextById("aicm-section-edit-purpose"),
1375-      section_status: aicmAvdTextById("aicm-section-edit-status") || "active"
1376-    };
1377-
1378-    var rows = [
1379-      ["操作", "課変更"],
1380-      ["課名", body.section_name],
1381-      ["目的", body.purpose || "未設定"],
1382-      ["状態", body.section_status]
1383-    ].concat(aicmAvdRoleSummaryRows("section"));
1384-
1385:    aicmAvdShowDbConfirm({
1386-      kind: "section-update",
1387-      title: "課変更",
1388-      endpoint: "/api/aicm/v2/section/update",
1389-      body: body,
1390-      // AICM_ROLEPLACEMENT_SCOPE_FIX_AXG_V1
1391-      rolePlacements: aicmAxcSectionRolePlacements({
1392-        aicm_user_company_section_id: body.aicm_user_company_section_id,
1393-        aicm_user_company_department_id: body.aicm_user_company_department_id || (
1394-          typeof aicmOrgSectionById === "function" && body.aicm_user_company_section_id
1395-            ? ((aicmOrgSectionById(body.aicm_user_company_section_id) || {}).aicm_user_company_department_id || "")
1396-            : ""
1397-        )
1398-      }),
1399-      summary_rows: rows
1400-    });
1401-  }
1402-
1403-
1404-
1405-  
1406-
1407-
1408-// AICM_DASHBOARD_COMPANY_OVERVIEW_ASO_ASR_V1
1409-// Dashboard company overview must return only a card fragment.
1410-// Company update uses this dedicated screen renderer.
1411-
1412-
1413-// AICM_COMPANY_EDIT_NAV_STALE_MESSAGE_ASS_ASV_V1
1414-// Navigation route safety for edit screens.
1415-// DB write confirmation remains required before POST.
1416-
1417-function aicmClearTransientMessage() {
1418-    if (!state) return;
1419-
1420-    state.message = "";
1421-    state.messageText = "";
1422-    state.message_type = "";
1423-    state.messageType = "";
1424-    state.statusMessage = "";
1425-    state.toastMessage = "";
1426-    state.errorMessage = "";
1427-    state.successMessage = "";
1428-  }
1429-
1430-
1431-  
1432-// AICM_EDIT_SCREEN_FALLBACK_ATA_ATD_V1
1433-// Edit screens must not depend only on transient selected state.
1434-
1435-
1436-
1437-
1438-
1439-
1440-
1441-
1442-
1443-
1444-
1445-
1446-  
1447-
1448-// AICM_EXACT_EDIT_ROUTE_FALLBACK_TARGET_ATE_ATH_V1
1449-// Exact edit fallback helpers. These helpers are read-only and do not write DB.
1450-
1451-
1452-
1453-
1454-
1455-
1456-
1457-
1458-
1459-
1460-
1461-
1462-
1463-
1464-  
1465-
1466-// AICM_DEDUPE_EDIT_FALLBACK_HELPERS_ATI_ATL_V1
1467-// Single canonical edit fallback helper block.
1468-// Do not duplicate these helpers.
1469-
1470-function aicmCtxSafe() {
1471-    var candidates = [];
1472-
1473-    if (typeof aicmOrgCtx === "function") {
1474-      try { candidates.push(aicmOrgCtx()); } catch (_) {}
1475-    }
1476-
1477-    if (state) {
1478-      candidates.push(state.context);
1479-      candidates.push(state.ctx);
1480-      candidates.push(state.aicmContext);
1481-      candidates.push(state.contextData);
1482-      candidates.push(state.latestContext);
1483-      candidates.push(state.data);
1484-      candidates.push(state);
1485-    }
1486-
1487-    for (var i = 0; i < candidates.length; i++) {
1488-      var c = candidates[i];
1489-      if (!c || typeof c !== "object") continue;
1490-
1491-      if (
1492-        Array.isArray(c.companies) ||
1493-        Array.isArray(c.departments) ||
1494-        Array.isArray(c.sections)
1495-      ) {
1496-        return c;
1497-      }
1498-
1499-      if (c.context && typeof c.context === "object") {
1500-        if (
1501-          Array.isArray(c.context.companies) ||
1502-          Array.isArray(c.context.departments) ||
1503-          Array.isArray(c.context.sections)
1504-        ) {
1505-          return c.context;
1506-        }
1507-      }
1508-    }
1509-
1510-    return {};
1511-  }
1512-
1513-function aicmCompaniesSafe() {
1514-    var ctx = aicmCtxSafe();
1515-    return Array.isArray(ctx.companies) ? ctx.companies : [];
1516-  }
1517-
1518-function aicmSelectedCompanySafe() {
1519-    var company = null;
1520-    var companies = aicmCompaniesSafe();
1521-
1522-    if (typeof selectedCompany === "function") {
1523-      try { company = selectedCompany(); } catch (_) { company = null; }
1524-    }
1525-
1526-    if (!company && typeof aicmOrgSelectedCompany === "function") {
1527-      try { company = aicmOrgSelectedCompany(); } catch (_) { company = null; }
1528-    }
1529-
1530-    var selectedIds = [];
1531-
1532-    if (state) {
1533-      selectedIds.push(state.selectedCompanyId);
1534-      selectedIds.push(state.selected_company_id);
1535-      selectedIds.push(state.currentCompanyId);
1536-      selectedIds.push(state.companyId);
1537-      selectedIds.push(state.aicm_user_company_id);
1538-    }
1539-
1540-    for (var i = 0; !company && i < selectedIds.length; i++) {
1541-      var id = selectedIds[i];
1542-      if (!id) continue;
1543-
1544-      company = companies.find(function (row) {
1545-        return row.aicm_user_company_id === id;
1546-      }) || null;
1547-    }
1548-
1549-    if (!company) {
1550-      company = companies.find(function (row) {
1551-        return row.selected_flag === true || row.selected_flag === "true" || row.selected_flag === 1;
1552-      }) || companies[0] || null;
1553-    }
1554-
1555-    if (company && state) {
1556-      var cid = company.aicm_user_company_id || "";
1557-      state.selectedCompanyId = cid;
1558-      state.selected_company_id = cid;
1559-      state.currentCompanyId = cid;
1560-    }
1561-
1562-    return company;
1563-  }
1564-
1565-function aicmDepartmentsForCompanySafe(companyId) {
--
2355-
2356-      workers.push({
2357-        robot_pool_id: robotEl ? String(robotEl.value || "") : "",
2358-        internal_nickname: nicknameEl ? String(nicknameEl.value || "") : ""
2359-      });
2360-
2361-      index += 1;
2362-    }
2363-
2364-    draft.workers = workers;
2365-    return draft;
2366-  }
2367-
2368-function aicmAxoClearDraftAfterSuccessfulSave() {
2369-    state.aicmAxoFormDraft = null;
2370-  }
2371-
2372-function renderAicmWorkerInlineRows(fieldPrefix) {
2373-    if (typeof aicmR8zV10f4aIsSectionCreateScreen === "function" && aicmR8zV10f4aIsSectionCreateScreen()) {
2374-      return ""; // AICM_R8Z_V10F4A_REVIEW_LIST_COMMON_NAV_AND_SECTION_WORKER_SOURCE_GUARD_WORKER_GUARD_CALL
2375-    }
2376-
2377-    // AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1
2378-    var savedRows = typeof aicmAxnCurrentPlacements === "function" ? aicmAxnCurrentPlacements("worker") : [];
2379-    var draft = state.aicmAxoFormDraft || {};
2380-    var draftWorkers = Array.isArray(draft.workers) ? draft.workers : [];
2381-
2382-    var baseCount = typeof aicmWorkerSlotCount === "function" ? aicmWorkerSlotCount() : 3;
2383-    var count = Math.max(baseCount, savedRows.length || 0, draftWorkers.length || 0, 1);
2384-    var safePrefix = fieldPrefix || "worker";
2385-    var html = [];
2386-
2387-    for (var i = 0; i < count; i += 1) {
2388-      var existing = savedRows[i] || null;
2389-      var draftRow = draftWorkers[i] || null;
2390-
2391-      var selectedValue = draftRow
2392-        ? String(draftRow.robot_pool_id || "")
2393-        : (typeof aicmAxnPlacementValue === "function" ? aicmAxnPlacementValue(existing) : "");
2394-
2395-      var selectedLabel = typeof aicmAxnPlacementLabel === "function" ? aicmAxnPlacementLabel(existing) : "";
2396-
2397-      var nickname = draftRow
2398-        ? String(draftRow.internal_nickname || "")
2399-        : (typeof aicmAxnPlacementNickname === "function" ? aicmAxnPlacementNickname(existing) : "");
2400-
2401-      html.push([
2402-        '<div class="aicm-worker-inline-row">',
2403-        '  <label>従業員設定ロボット ' + String(i + 1) + '<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot-' + String(i) + '" data-inline-role-code="worker" data-worker-slot-index="' + String(i) + '">',
2404-        aicmInlineRobotOptions("worker", selectedValue, selectedLabel),
2405-        '  </select></label>',
2406-        '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname-' + String(i) + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ウルフ@従業員' + String(i + 1) + '"></label>',
2407-        '</div>'
2408-      ].join(""));
2409-    }
2410-
2411-    return html.join("");
2412-  }
2413-
2414-function renderAicmInlineRoleSetting(roleCode, title, subtitle, fieldPrefix) {
2415-    var safePrefix = fieldPrefix || roleCode;
2416-
2417-    if (roleCode === "worker") {
2418-      return [
2419-        '<section class="aicm-core-card aicm-inline-role-setting-card" data-inline-role="' + escapeHtml(roleCode) + '">',
2420-        '  <p class="aicm-eyebrow">役職設定</p>',
2421-        '  <h2>' + escapeHtml(title) + '</h2>',
2422-        subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
2423-        renderAicmWorkerInlineRows(safePrefix),
2424-        '  <button type="button" data-core-action="inline-worker-slot-add">従業員行を追加</button>',
2425:        '  <p class="aicm-core-empty">従業員は複数設定できます。保存時は確認画面を通して登録します。</p>',
2426-        '</section>'
2427-      ].join("");
2428-    }
2429-
2430-    return [
2431-      '<section class="aicm-core-card aicm-inline-role-setting-card" data-inline-role="' + escapeHtml(roleCode) + '">',
2432-      '  <p class="aicm-eyebrow">役職設定</p>',
2433-      '  <h2>' + escapeHtml(title) + '</h2>',
2434-      subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
2435-      '  <label>' + escapeHtml(title) + 'ロボット<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot" data-inline-role-code="' + escapeHtml(roleCode) + '">',
2436-      aicmInlineRobotOptions(roleCode),
2437-      '  </select></label>',
2438-      '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname" type="text" placeholder="例: ウルフ@' + escapeHtml(title.replace("設定", "")) + '"></label>',
2439-      '  <p class="aicm-core-empty">保存時は確認画面を通して登録します。</p>',
2440-      '</section>'
2441-    ].join("");
2442-  }
2443-
2444-function renderAicmRoleSettingCard(roleCode, title, subtitle, scope) {
2445-    var prefix = roleCode;
2446-
2447-    if (scope && scope.sectionId) prefix = roleCode + "-section";
2448-    else if (scope && scope.departmentId) prefix = roleCode + "-department";
2449-    else if (scope && scope.companyId) prefix = roleCode + "-company";
2450-
2451-    return renderAicmInlineRoleSetting(roleCode, title, subtitle, prefix);
2452-  }
2453-
2454-
2455-  function aicmInjectInlineRoleSettingsForAddScreens(html) {
2456-    if (!state || !state.screen || !html) return html;
2457-
2458-    var extra = "";
2459-
2460-    if (state.screen === "company-new") {
2461-      extra = renderAicmInlineRoleSetting("president", "社長設定", "AI企業全体の方針を受けるPresidentを設定します。", "president-company-new");
2462-    }
2463-
2464-    if (state.screen === "department-new") {
2465-      extra = renderAicmInlineRoleSetting("manager", "部長設定", "この部門を統括するManagerを設定します。", "manager-department-new");
2466-    }
2467-
2468-    if (state.screen === "section-new") {
2469-      extra = [
2470-        renderAicmInlineRoleSetting("leader", "課長設定", "この課を統括するLeaderを設定します。", "leader-section-new"),
2471-        renderAicmInlineRoleSetting("worker", "従業員設定", "この課に配置するWorkerを設定します。", "worker-section-new")
2472-      ].join("");
2473-    }
2474-
2475-    if (!extra) return html;
2476-    if (html.indexOf("aicm-inline-role-setting-card") >= 0) return html;
2477-
2478-    if (html.indexOf("</main></div>") >= 0) {
2479-      return html.replace("</main></div>", extra + "</main></div>");
2480-    }
2481-
2482-    if (html.indexOf("</main>") >= 0) {
2483-      return html.replace("</main>", extra + "</main>");
2484-    }
2485-
2486-    return html + extra;
2487-  }
2488-
2489-
2490-  
2491-// AICM_EXPLICIT_EDIT_DB_CONNECT_AVA_AVD_REDO_V1
2492-function aicmAvdCtx() {
2493-    if (typeof ctx !== "undefined" && ctx) return ctx;
2494-    if (typeof state !== "undefined" && state && state.context) return state.context;
2495-    if (typeof state !== "undefined" && state && state.ctx) return state.ctx;
2496-    return {};
2497-  }
2498-
2499-function aicmAvdArray(value) {
2500-    return Array.isArray(value) ? value : [];
2501-  }
2502-
2503-function aicmAvdOwnerId() {
2504-    var c = aicmAvdCtx();
2505-    if (c.owner_civilization_id) return c.owner_civilization_id;
2506-    if (typeof state !== "undefined" && state && state.owner_civilization_id) return state.owner_civilization_id;
2507-    if (typeof state !== "undefined" && state && state.ownerCivilizationId) return state.ownerCivilizationId;
2508-    return "00000000-0000-4000-8000-000000000001";
2509-  }
2510-
2511-function aicmAvdCurrentCompany() {
2512-    var c = aicmAvdCtx();
2513-    var rows = aicmAvdArray(c.companies);
2514-    var selected = null;
2515-
2516-    try {
2517-      if (typeof selectedCompany === "function") selected = selectedCompany();
2518-    } catch (_) {}
2519-
2520-    if (selected && selected.aicm_user_company_id) return selected;
2521-
2522-    for (var i = 0; i < rows.length; i++) {
2523-      if (rows[i] && rows[i].selected_flag) return rows[i];
2524-    }
2525-
2526-    return rows[0] || null;
2527-  }
2528-
2529-function aicmAvdCurrentDepartment(companyId) {
2530-    var c = aicmAvdCtx();
2531-    var rows = aicmAvdArray(c.departments);
2532-    var id = companyId || (aicmAvdCurrentCompany() || {}).aicm_user_company_id;
2533-
2534-    for (var i = 0; i < rows.length; i++) {
2535-      if (rows[i] && rows[i].aicm_user_company_id === id) return rows[i];
2536-    }
2537-
2538-    return rows[0] || null;
2539-  }
2540-
2541-function aicmAvdCurrentSection(companyId, departmentId) {
2542-    var c = aicmAvdCtx();
2543-    var rows = aicmAvdArray(c.sections);
2544-    var cid = companyId || (aicmAvdCurrentCompany() || {}).aicm_user_company_id;
2545-    var did = departmentId || (aicmAvdCurrentDepartment(cid) || {}).aicm_user_company_department_id;
2546-
2547-    for (var i = 0; i < rows.length; i++) {
2548-      if (!rows[i]) continue;
2549-      if (rows[i].aicm_user_company_id === cid && rows[i].aicm_user_company_department_id === did) return rows[i];
2550-    }
2551-
2552-    for (var j = 0; j < rows.length; j++) {
2553-      if (rows[j] && rows[j].aicm_user_company_id === cid) return rows[j];
2554-    }
2555-
2556-    return rows[0] || null;
2557-  }
2558-
2559-function aicmAvdTextById(id) {
2560-    var el = document.getElementById(id);
2561-    return el ? String(el.value || "").trim() : "";
2562-  }
2563-
2564-function aicmAvdRoleSelect(id, roleCode) {
2565-    // AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1
2566-    var role = roleCode || {};
2567-    var existing = typeof aicmAxnFirstPlacement === "function" ? aicmAxnFirstPlacement(role.code) : null;
2568-
2569-    var selectedValue = typeof aicmAxnPlacementValue === "function" ? aicmAxnPlacementValue(existing) : "";
2570-    var selectedLabel = typeof aicmAxnPlacementLabel === "function" ? aicmAxnPlacementLabel(existing) : "";
2571-    var nickname = typeof aicmAxnPlacementNickname === "function" ? aicmAxnPlacementNickname(existing) : "";
2572-
2573-    selectedValue = aicmAxoDraftValue(id, selectedValue);
2574-    nickname = aicmAxoDraftValue(id + "-nickname", nickname);
2575-
2576-    return [
2577-      '<label>' + escapeHtml(role.label) + 'ロボット',
2578-      '<select id="' + escapeHtml(id) + '" data-inline-role-code="' + escapeHtml(role.code) + '">',
2579-      aicmInlineRobotOptions(role.code, selectedValue, selectedLabel),
2580-      '</select></label>',
2581-      '<label>' + escapeHtml(role.label) + '社内通称',
2582-      '<input id="' + escapeHtml(id + "-nickname") + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ' + escapeHtml(role.placeholder) + '">',
2583-      '</label>'
2584-    ].join("");
2585-  }
2586-
2587-function aicmAvdWorkerRows() {
2588-    if (typeof renderAicmWorkerInlineRows === "function") {
2589-      return renderAicmWorkerInlineRows();
2590-    }
2591-
2592-    return [
2593-      '<div class="aicm-inline-worker-row" data-worker-slot-index="0">',
2594-      '<label>従業員ロボット<select id="aicm-inline-worker-0-robot">' + aicmInlineRobotOptions("worker") + '</select></label>',
2595-      '<label>従業員社内通称<input id="aicm-inline-worker-0-nickname" type="text" placeholder="例: 作業担当A"></label>',
2596-      '</div>'
2597-    ].join("");
2598-  }
2599-
2600-function aicmAvdRoleSummaryRows(prefix) {
2601-    // AICM_ROLE_CONFIRM_DISPLAY_LABEL_AXH_R1_V1
2602-    var rows = [];
2603-
2604-    function textById(id) {
2605-      if (typeof aicmAvdTextById === "function") return aicmAvdTextById(id);
--
2624-      return String(el.value || "").trim();
2625-    }
2626-
2627-    function selectedLabelById(id) {
2628-      return selectedLabelFromElement(document.getElementById(id));
2629-    }
2630-
2631-    function findByIds(ids) {
2632-      for (var i = 0; i < ids.length; i += 1) {
2633-        var el = document.getElementById(ids[i]);
2634-        if (el) return el;
2635-      }
2636-      return null;
2637-    }
2638-
2639-    function push(label, robotId, nicknameId) {
2640-      var robot = selectedLabelById(robotId);
2641-      var nickname = textById(nicknameId);
2642-
2643-      rows.push([label + "ロボット", robot || "未設定"]);
2644-      rows.push([label + "社内通称", nickname || "未設定"]);
2645-    }
2646-
2647-    if (prefix === "company") {
2648-      push("社長", "aicm-company-president-robot", "aicm-company-president-robot-nickname");
2649-    }
2650-
2651-    if (prefix === "department") {
2652-      push("部長", "aicm-department-manager-robot", "aicm-department-manager-robot-nickname");
2653-    }
2654-
2655-    if (prefix === "section") {
2656-      push("課長", "aicm-section-leader-robot", "aicm-section-leader-robot-nickname");
2657-
2658-      var workerRows = [];
2659-      var index = 0;
2660-
2661-      while (index < 30) {
2662-        var robotEl = findByIds([
2663-          "aicm-inline-worker-" + String(index) + "-robot",
2664-          "aicm-role-worker-robot-" + String(index),
2665-          "aicm-role-worker-section-robot-" + String(index),
2666-          "aicm-role-worker-section-new-robot-" + String(index)
2667-        ]);
2668-
2669-        var nickEl = findByIds([
2670-          "aicm-inline-worker-" + String(index) + "-nickname",
2671-          "aicm-role-worker-nickname-" + String(index),
2672-          "aicm-role-worker-section-nickname-" + String(index),
2673-          "aicm-role-worker-section-new-nickname-" + String(index)
2674-        ]);
2675-
2676-        if (!robotEl && !nickEl) break;
2677-
2678-        var robotLabel = selectedLabelFromElement(robotEl);
2679-        var nickname = nickEl ? String(nickEl.value || "").trim() : "";
2680-
2681-        if (robotLabel || nickname) {
2682-          workerRows.push((robotLabel || "未設定") + (nickname ? " / " + nickname : ""));
2683-        }
2684-
2685-        index += 1;
2686-      }
2687-
2688-      rows.push(["従業員設定", workerRows.length ? workerRows.join("\n") : "未設定"]);
2689-    }
2690-
2691-    return rows;
2692-  }
2693-
2694:function aicmAvdShowDbConfirm(payload) {
2695-    if (!payload || !payload.endpoint || !payload.body) {
2696-      setMessage("error", "確認画面を表示できません。");
2697-      return;
2698-    }
2699-
2700-    if (typeof aicmOrgShowUpdateConfirm === "function") {
2701-      aicmOrgShowUpdateConfirm(payload);
2702-      return;
2703-    }
2704-
2705-    if (typeof state !== "undefined") {
2706-      state.pendingOrgUpdate = payload;
2707-    }
2708-
2709-    var root = document.getElementById("aicm-root");
2710-    if (!root) return;
2711-
2712-    root.innerHTML = renderAicmOrgUpdateConfirmation(payload);
2713-  }
2714-
2715-function aicmAvdSummaryHtml(payload) {
2716-    var rows = payload && Array.isArray(payload.summary_rows) ? payload.summary_rows : [];
2717-
2718-    if (!rows.length) return "";
2719-
2720-    return [
2721-      '<section class="aicm-core-card">',
2722-      '  <p class="aicm-eyebrow">保存内容</p>',
2723-      '  <h2>確認対象</h2>',
2724-      '  <dl class="aicm-summary-list">',
2725-      rows.map(function (row) {
2726-        return '<div><dt>' + escapeHtml(row[0] || "") + '</dt><dd>' + escapeHtml(row[1] || "") + '</dd></div>';
2727-      }).join(""),
2728-      '  </dl>',
2729-      '</section>'
2730-    ].join("");
2731-  }
2732-
2733-
2734-  
2735-function renderCompanyEditPlaceholder() {
2736-    var company = aicmAvdCurrentCompany();
2737-
2738-    if (!company) {
2739-      return renderShell([
2740-        '<section class="aicm-core-card">',
2741-        '  <p class="aicm-eyebrow">企業変更</p>',
2742-        '  <h2>AI企業が選択されていません</h2>',
2743-        '  <p class="aicm-core-empty">AI企業ダッシュボードで企業を作成または選択してください。</p>',
2744-        '  <div class="aicm-dashboard-action-row">',
2745-        '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
2746-        '  </div>',
2747-        '</section>'
2748-      ].join(""));
2749-    }
2750-
2751-    return renderShell([
2752-      '<section class="aicm-core-card">',
2753-      '  <p class="aicm-eyebrow">企業変更</p>',
2754-      '  <h2>企業情報を変更</h2>',
2755-      '  <input id="aicm-company-edit-id" type="hidden" value="' + escapeHtml(company.aicm_user_company_id || "") + '">',
2756-      '  <label>企業名<input id="aicm-company-edit-name" type="text" value="' + escapeHtml(company.company_name || "") + '" placeholder="例: ウルフ"></label>',
2757-      '  <label>事業領域<textarea id="aicm-company-edit-domain" rows="3" placeholder="例: 開発 / 運営 / 管理">' + escapeHtml(company.business_domain || "") + '</textarea></label>',
2758-      '  <label>状態<select id="aicm-company-edit-status">',
2759-      '    <option value="active"' + ((company.company_status || "active") === "active" ? " selected" : "") + '>有効</option>',
2760-      '    <option value="inactive"' + ((company.company_status || "active") === "inactive" ? " selected" : "") + '>無効</option>',
2761-      '  </select></label>',
2762-      '</section>',
2763-      '<section class="aicm-core-card">',
2764-      '  <p class="aicm-eyebrow">社長設定</p>',
2765-      '  <h2>社長ロボット</h2>',
2766-      aicmAvdRoleSelect("aicm-company-president-robot", { code: "president", label: "社長", placeholder: "社長" }),
2767-      '</section>',
2768-      '<section class="aicm-core-card aicm-operation-card">',
2769-      '  <p class="aicm-eyebrow">操作</p>',
2770-      '  <div class="aicm-dashboard-action-row">',
2771-      '    <button type="button" data-core-action="company-update-save">変更を保存</button>',
2772-      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
2773-      '  </div>',
2774-      '</section>'
2775-    ].join(""));
2776-  }
2777-
2778-
2779-  function renderCompanyOverviewBaseAxuMaintR3() {
2780-    var company = null;
2781-
2782-    if (typeof selectedCompany === "function") {
2783-      company = selectedCompany();
2784-    }
2785-
2786-    if (!company && typeof aicmOrgSelectedCompany === "function") {
2787-      company = aicmOrgSelectedCompany();
2788-    }
2789-
2790-    if (!company) {
2791-      return [
2792-        '<div class="aicm-core-card">',
2793-        '  <p class="aicm-eyebrow">会社概要</p>',
2794-        '  <h2>会社概要</h2>',
2795-        '  <div class="aicm-empty-state">',
2796-        '    <strong>AI企業が未選択です</strong>',
2797-        '    <p>AI企業を選択すると、部門・課・Worker配置の概要を確認できます。</p>',
2798-        '    <div class="aicm-dashboard-action-row">',
2799-        '      <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
2800-        '    </div>',
2801-        '  </div>',
2802-        '</div>'
2803-      ].join("");
2804-    }
2805-
2806-    var companyId = company.aicm_user_company_id || "";
2807-    var departments = typeof aicmOrgDepartmentsForCompany === "function" ? aicmOrgDepartmentsForCompany(companyId) : [];
2808-    var sections = typeof aicmOrgSectionsForCompany === "function" ? aicmOrgSectionsForCompany(companyId) : [];
2809-    var ctx = typeof aicmOrgCtx === "function" ? aicmOrgCtx() : (state.context || state || {});
2810-    var placements = Array.isArray(ctx.placements) ? ctx.placements.filter(function (row) {
2811-      return row.aicm_user_company_id === companyId;
2812-    }) : [];
2813-
2814-    return [
2815-      '<div class="aicm-core-card">',
2816-      '  <p class="aicm-eyebrow">会社概要</p>',
2817-      '  <h2>' + escapeHtml(company.company_name || "AI企業") + '</h2>',
2818-      company.business_domain ? '  <p class="aicm-selected-note">' + escapeHtml(company.business_domain) + '</p>' : '',
2819-      '  <div class="aicm-company-overview-stats">',
2820-      '    <div class="aicm-company-overview-stat"><span>部門</span><strong>' + String(departments.length) + '件</strong></div>',
2821-      '    <div class="aicm-company-overview-stat"><span>課</span><strong>' + String(sections.length) + '件</strong></div>',
2822-      '    <div class="aicm-company-overview-stat"><span>Worker配置</span><strong>' + String(placements.length) + '件</strong></div>',
2823-      '  </div>',
2824-      '  <div class="aicm-dashboard-action-row">',
2825-      '    <button type="button" data-core-action="company-edit-open">AI企業変更</button>',
2826-      '    <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
2827-      '  </div>',
2828-      '</div>'
2829-    ].join("");
2830-  }
2831-
2832-function renderCompanyOverview() {
2833-    return renderCompanyOverviewBaseAxuMaintR3() + renderAicmBusinessStartDashboardCard();
2834-  }
2835-
2836-  function renderNoCompanyCard() {
2837-    return [
2838-      '<div class="aicm-empty-state">',
2839-      '  <strong>AI企業が未選択です</strong>',
2840-      '  <p>まずAI企業を作成すると、部門・課・Worker配置を登録できます。</p>',
2841-      '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加へ</button>',
2842-      '</div>'
2843-    ].join("");
2844-  }
2845-
2846-  function renderQuickActions(company, departments) {
2847-    if (!company) {
2848-      return [
2849-        '<div class="aicm-action-list">',
2850-        '  <button type="button" data-core-action="go" data-screen="company-new">AI企業を作成</button>',
2851-        '</div>'
2852-      ].join("");
2853-    }
2854-
2855-    return [
2856-      '<div class="aicm-action-list">',
2857-      '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
2858-      '  <button type="button" data-core-action="go" data-screen="department-new">部門追加</button>',
2859-      departments.length > 0 ? '  <button type="button" data-core-action="go" data-screen="section-new">課追加</button>' : '  <button type="button" data-core-action="go" data-screen="department-new">先に部門を追加</button>',
2860-      '  <button type="button" data-core-action="go" data-screen="placement-new">Worker配置</button>',
2861-      '</div>',
2862-      '<p class="aicm-core-empty">編集・削除は次工程で追加します。</p>'
2863-    ].join("");
2864-  }
2865-
2866-
2867-  
2868-
2869-
2870-function renderTree(departments) {
2871-    if (departments.length === 0) {
2872-      return [
2873-        '<div class="aicm-empty-state">',
2874-        '  <strong>部門がまだありません</strong>',
--
2982-      '    <option value="President">President</option>',
2983-      '    <option value="Manager">Manager</option>',
2984-      '    <option value="Leader">Leader</option>',
2985-      '    <option value="Worker">Worker</option>',
2986-      '  </select>',
2987-      '  <label>課</label>',
2988-      '  <select name="sectionId">',
2989-      '    <option value="">未選択</option>',
2990-      sections.map(function (section) {
2991-        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
2992-      }).join(""),
2993-      '  </select>',
2994-      '  <label>Robot</label>',
2995-      '  <select name="robotPoolId">',
2996-      robots.map(function (robot) {
2997-        return '<option value="' + escapeHtml(robot.robot_pool_id || "") + '" data-model="' + escapeHtml(robot.aiworker_model_code || "") + '">' + escapeHtml(robot.selector_label || robot.display_name || robot.aiworker_model_code) + '</option>';
2998-      }).join(""),
2999-      '  </select>',
3000-      '  <label>社内通称</label>',
3001-      '  <input name="internalNickname" autocomplete="off">',
3002-      '  <button type="submit">Worker配置を作成</button>',
3003-      '</form>',
3004-      departments.length === 0 ? '<p class="aicm-core-empty">先に部門を作成してください。</p>' : ''
3005-    ].join(""));
3006-  }
3007-
3008-  function renderSettings() {
3009-    var company = selectedCompany();
3010-
3011-    return renderShell([
3012-      '<section class="aicm-core-card">',
3013-      renderCompanySelect(),
3014-      company ? [
3015-        '<p>会社名: ' + escapeHtml(company.company_name) + '</p>',
3016-        '<p>事業領域: ' + escapeHtml(company.business_domain || "") + '</p>',
3017-        '<p class="aicm-core-empty">編集/削除は未設定。作成系の確認後に実装します。</p>'
3018-      ].join("") : '<p class="aicm-core-empty">会社なし</p>',
3019-      '</section>'
3020-    ].join(""));
3021-  }
3022-
3023-  
3024-
3025-function taskLedgerRows(companyId) {
3026-    var rows = [];
3027-
3028-    if (state.context && Array.isArray(state.context.taskLedger)) {
3029-      rows = state.context.taskLedger;
3030-    } else if (state.context && Array.isArray(state.context.task_ledger)) {
3031-      rows = state.context.task_ledger;
3032-    }
3033-
3034-    if (!companyId) return rows;
3035-
3036-    return rows.filter(function (row) {
3037-      return String(row.aicm_user_company_id || "") === String(companyId || "");
3038-    });
3039-  }
3040-
3041-  function sectionsForDepartment(departmentId) {
3042-    return state.context.sections.filter(function (section) {
3043-      return String(section.aicm_user_company_department_id || "") === String(departmentId || "");
3044-    });
3045-  }

============================================================
10. classification
============================================================
FINAL_JUDGEMENT=V10L_B0_AUDIT_PASS_READY_FOR_GUARDED_UI_PATCH
NEXT_ACTION=V10L_B1_PATCH_LEDGER_MULTI_SEND_UI_CONFIRM_ONLY
WARN_COUNT=0
WARNINGS=
FUNCTION_FOUND=true
ROUTE_FOUND=true
REQUIRED_UUID_KEYS=owner_civilization_id,aicm_user_company_id,aicm_manager_major_work_item_id
REQUIRED_TEXT_KEYS=
BODY_KEY_REFERENCES=aicm_manager_major_work_item_id,aicm_user_company_id,auto_decomposition_version,limit,mode,owner_civilization_id,source_app_ref
TASK_LEDGER_VIEW_COUNT=1
MAJOR_COUNT=38
MIDDLE_COUNT=4
WORKER_COUNT=4
MIDDLE_DUP_GROUPS=0
WORKER_DUP_GROUPS=0
MAJOR_WITH_EXISTING_MIDDLE=4
SEND_TARGET_RULE=ONLY_MAJOR_WITHOUT_EXISTING_MIDDLE_BY_DEFAULT
CORE_RENDER_TASK_LEDGER_COUNT=15
CORE_CONFIRM_HELPER_COUNT=8
CORE_TASK_LEDGER_CHECKBOX_COUNT=0
CORE_BULK_LABEL_COUNT=3
SERVER_FN_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/010_server_runLeaderAutoDecomposition_extract.txt
SERVER_ROUTE_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/020_server_route_extract.txt
DB_COLUMNS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/030_db_columns.tsv
DB_RELATION_COUNTS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/040_db_relation_counts.tsv
DB_CHAIN_LINKS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/050_db_chain_links.tsv
DB_DUPLICATE_RISK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/060_db_duplicate_risk.tsv
DB_SAMPLE_COMPACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/070_db_sample_compact.tsv
CORE_UI_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/080_core_task_ledger_leader_ui_extract.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/090_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b0_leader_send_payload_idempotency_audit_20260504_075251/000_R8Z_V10L_B0_LEADER_SEND_PAYLOAD_IDEMPOTENCY_AUDIT_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

NEXT DESIGN IF PASS:
- UIは部門別タスク台帳に追加する
- 表示は以下:
  1. 台帳件数
  2. Manager大項目件数
  3. Leader中項目件数
  4. Worker作業単位件数
  5. 課長送信済み推定件数
  6. 未送信推定件数
- 操作は以下:
  1. 未送信Manager大項目を課長へ送る
  2. 選択したManager大項目を課長へ送る
  3. 全Manager大項目を課長へ送る場合は重複警告を出す
- 実行前に必ず確認画面を出す
- 初回patchは「確認画面まで」。実POSTは別スモーク後に解放する方が安全
