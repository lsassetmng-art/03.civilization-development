
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- R8Z-V8Bで DB_TARGET_FOUND_CONTEXT_EXPOSURE_OR_FILTER_MISMATCH
- DBには既知request_id/titleあり
- context APIには対象が出ていない
- R8Z-V8C patcherは context route形式を検出できず安全スキップ

今回の目的:
1. server内の /api/aicm/v2/context 実装形状を特定
2. res.json / writeHead / end / sendJson 等の実レスポンス箇所を特定
3. 既存V8Bのhit sourceを再表示
4. 次のV8Dでどこに最小挿入するか決める

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8C2 server context route actual shape locate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: server exists
PASS: core exists

============================================================
2. syntax check
============================================================
PASS: server syntax PASS
PASS: core syntax PASS

============================================================
3. grep context route candidates
============================================================
---- context endpoint literal ----
2165:if (route === "/api/aicm/v2/context" && req.method === "GET") {

---- context / selectedCompany / review terms ----
239:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
246:    "    owner_civilization_id, aicm_user_company_id, source_route_code, policy_title, policy_text,",
252:    "    " + sqlLiteral(companyId) + "::uuid,",
283:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
289:    "    owner_civilization_id, aicm_user_company_id, aicm_president_policy_id,",
297:    "    " + sqlLiteral(companyId) + "::uuid,",
397:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
408:    ", " + sqlLiteral(companyId) + "::uuid",
421:    "WITH input_rows(row_order, owner_civilization_id, aicm_user_company_id, department_name, section_name, major_item_name, major_item_description, assigned_leader_label, priority_code, due_date, note) AS (",
429:    "      AND d.aicm_user_company_id = i.aicm_user_company_id",
441:    "      AND s.aicm_user_company_id = r.aicm_user_company_id",
451:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
455:    "  SELECT owner_civilization_id, aicm_user_company_id, department_id, section_id,",
498:  const text = String(value || "delivery_summary").trim();
500:    "design_delivery_summary",
501:    "implementation_delivery_summary",
503:    "final_delivery_summary",
504:    "delivery_summary"
505:  ].includes(text) ? text : "delivery_summary";
510:  return ["design_doc", "implementation", "exception", "delivery_package", "handoff"].includes(text) ? text : "design_doc";
520:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
525:    "  INSERT INTO business.aicm_human_review_item (",
526:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
528:    "    related_deliverable_requirement_id, related_worker_work_unit_id,",
530:    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
531:    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
535:    "    " + sqlLiteral(companyId) + "::uuid,",
542:    "    " + aicmHumanReviewOptionalUuidSql(body.related_worker_work_unit_id) + ",",
546:    "    " + aicmHumanReviewTextSql(body.delivery_summary_text) + ",",
564:    "  'human_review_item', to_jsonb(inserted)",
574:  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
578:    "  UPDATE business.aicm_human_review_item",
579:    "  SET human_review_status_code = 'approved',",
580:    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
581:    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
584:    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
591:    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
600:  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
604:    "  UPDATE business.aicm_human_review_item",
605:    "  SET human_review_status_code = 'returned',",
606:    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
607:    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
610:    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
617:    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
646:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
657:    "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
785:    "  'pmlw_worker_work_units', (",
787:    "    FROM business.vw_aicm_pmlw_worker_work_unit_display w",
796:    "  'review_wait_items', (",
798:    "    FROM business.vw_aicm_human_review_wait_display r",
842:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
848:    "  SELECT aicm_user_company_id",
851:    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
856:    "    owner_civilization_id, aicm_user_company_id, department_name, purpose, department_status",
860:    "    aicm_user_company_id,",
888:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
895:    "  SELECT aicm_user_company_id, aicm_user_company_department_id",
898:    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
904:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, section_name, purpose, section_status",
908:    "    aicm_user_company_id,",
938:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
956:    "  SELECT d.aicm_user_company_id, d.aicm_user_company_department_id",
959:    "    ON c.aicm_user_company_id = d.aicm_user_company_id",
961:    "    AND d.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
968:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
975:    "    aicm_user_company_id,",
1016:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1034:    "  SELECT aicm_user_company_id",
1037:    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1042:    "    owner_civilization_id, aicm_user_company_id,",
1049:    "    aicm_user_company_id,",
1134:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1142:      (row.target_level_code === "company" ? companyId : "") ||
1212:    "    owner_civilization_id, aicm_user_company_id,",
1220:    "    c.aicm_user_company_id,",
1245:    "  SELECT aicm_user_company_id",
1248:    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1261:    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1388:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1396:    "    p.aicm_user_company_id,",
1412:    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1653:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1674:    "    " + sqlLiteral(companyId) + "::uuid AS aicm_user_company_id,",
1683:    "   AND r.aicm_user_company_id = m.aicm_user_company_id",
1692:    "        AND existing.aicm_user_company_id = m.aicm_user_company_id",
1705:    "   AND p.aicm_user_company_id = tm.aicm_user_company_id",
1719:    "    owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id,",
1726:    "    tm.owner_civilization_id, tm.aicm_user_company_id, tm.aicm_manager_major_work_item_id,",
1743:    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id,",
1749:    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id,",
1764:    "  INSERT INTO business.aicm_worker_work_unit (",
1765:    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,",
1768:    "    priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link,",
1772:    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,",
1807:    "  JOIN input_request r ON r.owner_civilization_id = m.owner_civilization_id AND r.aicm_user_company_id = m.aicm_user_company_id",
1818:    "  SELECT im.aicm_manager_major_work_item_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id, iw.aicm_worker_work_unit_id, " + sqlLiteral("created") + "::text AS status",
1833:    "  " + sqlLiteral("created_worker_work_unit_count") + ", (SELECT count(*) FROM inserted_worker_unit),",
1863:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1865:  const workerWorkUnitId = aicmR8ZIText(body.aicm_worker_work_unit_id || body.related_worker_work_unit_id);
1873:    ? "    AND w.aicm_worker_work_unit_id = " + sqlLiteral(workerWorkUnitId) + "::uuid"
1879:    "  FROM business.vw_aicm_pmlw_worker_work_unit_display w",
1881:    "    AND w.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1891:    "    u.aicm_worker_work_unit_id,",
1894:    "    p.aicm_user_company_id,",
1909:    "   AND p.aicm_user_company_id = u.aicm_user_company_id",
1915:    "  SELECT *, row_number() OVER (PARTITION BY aicm_worker_work_unit_id ORDER BY match_score DESC, aicm_user_company_worker_placement_id) AS rn",
1920:    "    'worker_work_unit', to_jsonb(u),",
1926:    "  ON r.aicm_worker_work_unit_id = u.aicm_worker_work_unit_id",
1935:  const unit = pair && pair.worker_work_unit ? pair.worker_work_unit : {};
1938:  const unitId = aicmR8ZIText(unit.aicm_worker_work_unit_id);
1945:    unit.input_context_text,
1952:  if (!unitId) throw new Error("worker_work_unit_id missing");
1959:    aicm_user_company_id: aicmR8ZIText(unit.aicm_user_company_id),
1967:    source_request_ref: "aicm_worker_work_unit:" + unitId,
1969:    related_worker_work_unit_id: unitId,
1978:  const unit = requiredUuid(unitId, "aicm_worker_work_unit_id");
1989:    "UPDATE business.aicm_worker_work_unit",
1993:    "WHERE aicm_worker_work_unit_id = " + sqlLiteral(unit) + "::uuid",
1996:    "  'aicm_worker_work_unit_id', aicm_worker_work_unit_id,",
2012:    const unit = pair && pair.worker_work_unit ? pair.worker_work_unit : {};
2013:    const unitId = aicmR8ZIText(unit.aicm_worker_work_unit_id);
2020:          aicm_worker_work_unit_id: unitId,
2042:        aicm_worker_work_unit_id: unitId,
2050:        aicm_worker_work_unit_id: unitId,
2165:if (route === "/api/aicm/v2/context" && req.method === "GET") {

---- response writers ----
27:function sendJson(res, statusCode, payload) {
28:  res.writeHead(statusCode, {
35:  res.end(JSON.stringify(payload, null, 2));
39:  res.writeHead(statusCode, {
43:  res.end(text);
2076:      sendJson(res, 200, { result: "ok", api_identifier: SERVER_MARK });
2083:      sendJson(res, 200, createPresidentPolicy(body));
2089:      sendJson(res, 200, createManagerMajorItem(body));
2095:      sendJson(res, 200, updateManagerMajorItem(body));
2102:      sendJson(res, 200, runLeaderAutoDecomposition(body));
2107:      sendJson(res, 200, archiveManagerMajorItem(body));
2114:      sendJson(res, 200, importManagerMajorItemsCsv(body));
2121:      sendJson(res, 200, createHumanReviewItem(body));
2127:      sendJson(res, 200, approveHumanReviewItem(body));
2133:      sendJson(res, 200, returnHumanReviewItem(body));
2140:      sendJson(res, 200, updateCompany(body));
2146:      sendJson(res, 200, updateDepartment(body));
2155:      sendJson(res, 200, updateSection(body));
2161:      sendJson(res, 200, updateSection(body));
2166:      sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
2171:      sendJson(res, 200, createCompany(await readBody(req)));
2177:      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2183:      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2190:      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2196:      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2202:      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2209:      sendJson(res, 200, await runWorkerAutoExecutionR8ZI(body));
2214:      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2222:      sendJson(res, payload && payload.result === "error" ? 502 : 200, payload);
2228:      sendJson(res, payload && payload.result === "error" ? 502 : 200, payload);
2233:      sendJson(res, 404, {
2243:    sendJson(res, 500, {

---- route structures ----
1581:async function aicmRuntimeStatusAiworkerGet(pathname, searchParams) {
1583:  const params = new URLSearchParams();
1593:  const upstreamUrl = base + pathname + (params.toString() ? "?" + params.toString() : "");
1613:      upstream_path: pathname,
1623:    upstream_path: pathname,
2072:  const route = url.pathname;
2166:      sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
2266:  const filePath = safeStaticPath(url.pathname);
2284:const server = http.createServer(async (req, res) => {
2285:  const url = new URL(req.url || "/", "http://127.0.0.1");
PASS: server contains context endpoint literal

============================================================
4. line-neighborhood snippets
============================================================

===== SNIPPET 1: L204-L334 =====
   204:   const text = String(value || "not_started").trim();
   205:   return ["not_started", "assigned_to_leader", "leader_decomposing", "decomposed", "returned", "archived"].includes(text) ? text : "not_started";
   206: }
   207: 
   208: function aicmPmlwHandoffStatus(value) {
   209:   const text = String(value || "draft").trim();
   210:   return ["draft", "ready_handoff", "handed_off", "accepted", "completed", "archived"].includes(text) ? text : "draft";
   211: }
   212: 
   213: function aicmPmlwCsvRows(body) {
   214:   const rows = Array.isArray(body.rows) ? body.rows : [];
   215:   return rows.slice(0, 300).map((row) => {
   216:     const majorName = aicmPmlwOptionalText(
   217:       row.major_item_name ||
   218:       row.major_name ||
   219:       row.deliverable_name ||
   220:       row.task_name ||
   221:       row.title
   222:     );
   223: 
   224:     return {
   225:       department_name: aicmPmlwOptionalText(row.department_name),
   226:       section_name: aicmPmlwOptionalText(row.section_name),
   227:       major_item_name: majorName,
   228:       major_item_description: aicmPmlwOptionalText(row.major_item_description || row.description || row.task_name || row.note),
   229:       assigned_leader_label: aicmPmlwOptionalText(row.assigned_leader_label || row.leader_label || row.responsible_role_code),
   230:       priority_code: aicmPmlwPriority(row.priority_code),
   231:       due_date: aicmPmlwOptionalText(row.due_date),
   232:       note: aicmPmlwOptionalText(row.note)
   233:     };
   234:   }).filter((row) => row.major_item_name.length > 0);
   235: }
   236: 
   237: function createPresidentPolicy(body) {
   238:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   239:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   240:   const title = requiredText(body.policy_title || body.title, "policy_title");
   241:   const text = requiredText(body.policy_text || body.president_policy_instruction_text || body.description, "policy_text");
   242: 
   243:   const sql = [
   244:     "WITH inserted AS (",
   245:     "  INSERT INTO business.aicm_president_policy (",
   246:     "    owner_civilization_id, aicm_user_company_id, source_route_code, policy_title, policy_text,",
   247:     "    president_robot_label, requested_by_text, company_common_rules_snapshot,",
   248:     "    policy_status_code, priority_code, due_date,",
   249:     "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
   250:     "  ) VALUES (",
   251:     "    " + sqlLiteral(owner) + "::uuid,",
   252:     "    " + sqlLiteral(companyId) + "::uuid,",
   253:     "    " + sqlLiteral(body.source_route_code || "user_to_president") + ",",
   254:     "    " + sqlLiteral(title) + ",",
   255:     "    " + sqlLiteral(text) + ",",
   256:     "    " + aicmPmlwTextSql(body.president_robot_label) + ",",
   257:     "    " + aicmPmlwTextSql(body.requested_by_text || "user") + ",",
   258:     "    " + aicmPmlwTextSql(body.company_common_rules_snapshot) + ",",
   259:     "    " + sqlLiteral(body.policy_status_code || "submitted") + ",",
   260:     "    " + sqlLiteral(aicmPmlwPriority(body.priority_code)) + ",",
   261:     "    " + aicmPmlwOptionalDateSql(body.due_date) + ",",
   262:     "    " + aicmPmlwTextSql(body.reference_files_text) + ",",
   263:     "    " + aicmPmlwTextSql(body.supplemental_materials_text) + ",",
   264:     "    " + aicmPmlwTextSql(body.applicable_rules_text) + ",",
   265:     "    " + aicmPmlwTextSql(body.note) + ",",
   266:     "    " + aicmPmlwTextSql(body.handoff_link),
   267:     "  )",
   268:     "  RETURNING *",
   269:     ")",
   270:     "SELECT jsonb_build_object(",
   271:     "  'result', 'ok',",
   272:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   273:     "  'president_policy', to_jsonb(inserted)",
   274:     ")::text",
   275:     "FROM inserted;"
   276:   ].join("\n");
   277: 
   278:   return runPsqlJson(sql);
   279: }
   280: 
   281: function createManagerMajorItem(body) {
   282:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   283:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   284:   const majorName = requiredText(body.major_item_name || body.deliverable_name || body.task_name, "major_item_name");
   285: 
   286:   const sql = [
   287:     "WITH inserted AS (",
   288:     "  INSERT INTO business.aicm_manager_major_work_item (",
   289:     "    owner_civilization_id, aicm_user_company_id, aicm_president_policy_id,",
   290:     "    aicm_user_company_department_id, aicm_user_company_section_id,",
   291:     "    major_item_name, major_item_description, source_route_code,",
   292:     "    manager_robot_label, assigned_leader_label,",
   293:     "    decomposition_status_code, handoff_status_code, priority_code, due_date,",
   294:     "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
   295:     "  ) VALUES (",
   296:     "    " + sqlLiteral(owner) + "::uuid,",
   297:     "    " + sqlLiteral(companyId) + "::uuid,",
   298:     "    " + aicmPmlwOptionalUuidSql(body.aicm_president_policy_id) + ",",
   299:     "    " + aicmPmlwOptionalUuidSql(body.aicm_user_company_department_id) + ",",
   300:     "    " + aicmPmlwOptionalUuidSql(body.aicm_user_company_section_id) + ",",
   301:     "    " + sqlLiteral(majorName) + ",",
   302:     "    " + aicmPmlwTextSql(body.major_item_description || body.description || body.note) + ",",
   303:     "    " + sqlLiteral(body.source_route_code || "manual") + ",",
   304:     "    " + aicmPmlwTextSql(body.manager_robot_label) + ",",
   305:     "    " + aicmPmlwTextSql(body.assigned_leader_label) + ",",
   306:     "    " + sqlLiteral(aicmPmlwMajorStatus(body.decomposition_status_code)) + ",",
   307:     "    " + sqlLiteral(aicmPmlwHandoffStatus(body.handoff_status_code)) + ",",
   308:     "    " + sqlLiteral(aicmPmlwPriority(body.priority_code)) + ",",
   309:     "    " + aicmPmlwOptionalDateSql(body.due_date) + ",",
   310:     "    " + aicmPmlwTextSql(body.reference_files_text) + ",",
   311:     "    " + aicmPmlwTextSql(body.supplemental_materials_text) + ",",
   312:     "    " + aicmPmlwTextSql(body.applicable_rules_text) + ",",
   313:     "    " + aicmPmlwTextSql(body.note) + ",",
   314:     "    " + aicmPmlwTextSql(body.handoff_link),
   315:     "  )",
   316:     "  RETURNING *",
   317:     ")",
   318:     "SELECT jsonb_build_object(",
   319:     "  'result', 'ok',",
   320:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   321:     "  'manager_major_item', to_jsonb(inserted)",
   322:     ")::text",
   323:     "FROM inserted;"
   324:   ].join("\n");
   325: 
   326:   return runPsqlJson(sql);
   327: }
   328: 
   329: function updateManagerMajorItem(body) {
   330:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   331:   const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");
   332:   const updates = [];
   333: 
   334:   if (body.major_item_name !== undefined) updates.push("major_item_name = " + sqlLiteral(String(body.major_item_name || "").trim()));

===== SNIPPET 2: L362-L702 =====
   362:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   363:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   364:     "  'manager_major_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   365:     ")::text;"
   366:   ].join("\n");
   367: 
   368:   return runPsqlJson(sql);
   369: }
   370: 
   371: function archiveManagerMajorItem(body) {
   372:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   373:   const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");
   374: 
   375:   const sql = [
   376:     "WITH archived AS (",
   377:     "  UPDATE business.aicm_manager_major_work_item",
   378:     "  SET decomposition_status_code = 'archived',",
   379:     "      handoff_status_code = 'archived',",
   380:     "      updated_at = now()",
   381:     "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
   382:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   383:     "  RETURNING *",
   384:     ")",
   385:     "SELECT jsonb_build_object(",
   386:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM archived) THEN 'ok' ELSE 'not_found' END,",
   387:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   388:     "  'manager_major_item', COALESCE((SELECT to_jsonb(archived) FROM archived), '{}'::jsonb)",
   389:     ")::text;"
   390:   ].join("\n");
   391: 
   392:   return runPsqlJson(sql);
   393: }
   394: 
   395: function importManagerMajorItemsCsv(body) {
   396:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   397:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   398:   const rows = aicmPmlwCsvRows(body);
   399: 
   400:   if (rows.length === 0) {
   401:     return { result: "ok", api_identifier: SERVER_MARK, inserted_count: 0, manager_major_items: [] };
   402:   }
   403: 
   404:   const values = rows.map((row, index) => [
   405:     "(",
   406:     index,
   407:     ", " + sqlLiteral(owner) + "::uuid",
   408:     ", " + sqlLiteral(companyId) + "::uuid",
   409:     ", " + sqlLiteral(row.department_name),
   410:     ", " + sqlLiteral(row.section_name),
   411:     ", " + sqlLiteral(row.major_item_name),
   412:     ", " + sqlLiteral(row.major_item_description),
   413:     ", " + sqlLiteral(row.assigned_leader_label),
   414:     ", " + sqlLiteral(row.priority_code),
   415:     ", " + aicmPmlwOptionalDateSql(row.due_date),
   416:     ", " + sqlLiteral(row.note),
   417:     ")"
   418:   ].join("")).join(",\n    ");
   419: 
   420:   const sql = [
   421:     "WITH input_rows(row_order, owner_civilization_id, aicm_user_company_id, department_name, section_name, major_item_name, major_item_description, assigned_leader_label, priority_code, due_date, note) AS (",
   422:     "  VALUES",
   423:     "    " + values,
   424:     "), resolved AS (",
   425:     "  SELECT i.*, (",
   426:     "    SELECT d.aicm_user_company_department_id",
   427:     "    FROM business.aicm_user_company_department d",
   428:     "    WHERE d.owner_civilization_id = i.owner_civilization_id",
   429:     "      AND d.aicm_user_company_id = i.aicm_user_company_id",
   430:     "      AND d.department_status = 'active'",
   431:     "      AND (i.department_name = '' OR d.department_name = i.department_name)",
   432:     "    ORDER BY CASE WHEN d.department_name = i.department_name THEN 0 ELSE 1 END, d.display_order, d.created_at",
   433:     "    LIMIT 1",
   434:     "  ) AS department_id",
   435:     "  FROM input_rows i",
   436:     "), resolved_section AS (",
   437:     "  SELECT r.*, (",
   438:     "    SELECT s.aicm_user_company_section_id",
   439:     "    FROM business.aicm_user_company_section s",
   440:     "    WHERE s.owner_civilization_id = r.owner_civilization_id",
   441:     "      AND s.aicm_user_company_id = r.aicm_user_company_id",
   442:     "      AND s.section_status = 'active'",
   443:     "      AND (r.department_id IS NULL OR s.aicm_user_company_department_id = r.department_id)",
   444:     "      AND (r.section_name = '' OR s.section_name = r.section_name)",
   445:     "    ORDER BY CASE WHEN s.section_name = r.section_name THEN 0 ELSE 1 END, s.display_order, s.created_at",
   446:     "    LIMIT 1",
   447:     "  ) AS section_id",
   448:     "  FROM resolved r",
   449:     "), inserted AS (",
   450:     "  INSERT INTO business.aicm_manager_major_work_item (",
   451:     "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
   452:     "    major_item_name, major_item_description, source_route_code, assigned_leader_label,",
   453:     "    decomposition_status_code, handoff_status_code, priority_code, due_date, note, display_order",
   454:     "  )",
   455:     "  SELECT owner_civilization_id, aicm_user_company_id, department_id, section_id,",
   456:     "         major_item_name, major_item_description, 'csv_import', assigned_leader_label,",
   457:     "         'not_started', 'draft', priority_code, due_date, note, 100 + row_order",
   458:     "  FROM resolved_section",
   459:     "  RETURNING *",
   460:     ")",
   461:     "SELECT jsonb_build_object(",
   462:     "  'result', 'ok',",
   463:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   464:     "  'inserted_count', (SELECT count(*) FROM inserted),",
   465:     "  'manager_major_items', COALESCE((SELECT jsonb_agg(to_jsonb(inserted) ORDER BY display_order, created_at) FROM inserted), '[]'::jsonb)",
   466:     ")::text;"
   467:   ].join("\n");
   468: 
   469:   return runPsqlJson(sql);
   470: }
   471: 
   472: 
   473: 
   474: // AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1
   475: // Human review queue functions.
   476: // Human review is limited to delivery summaries and exception summaries.
   477: // AI review remains internal; only ai_review_result_text summary is shown.
   478: 
   479: function aicmHumanReviewOptionalText(value) {
   480:   return String(value || "").trim();
   481: }
   482: 
   483: function aicmHumanReviewTextSql(value) {
   484:   return sqlLiteral(String(value || ""));
   485: }
   486: 
   487: function aicmHumanReviewOptionalUuidSql(value) {
   488:   const text = String(value || "").trim();
   489:   return text ? sqlLiteral(text) + "::uuid" : "NULL";
   490: }
   491: 
   492: function aicmHumanReviewOptionalDateSql(value) {
   493:   const text = String(value || "").trim();
   494:   return /^\\d{4}-\\d{2}-\\d{2}$/.test(text) ? sqlLiteral(text) + "::date" : "NULL";
   495: }
   496: 
   497: function aicmHumanReviewKind(value) {
   498:   const text = String(value || "delivery_summary").trim();
   499:   return [
   500:     "design_delivery_summary",
   501:     "implementation_delivery_summary",
   502:     "exception_review",
   503:     "final_delivery_summary",
   504:     "delivery_summary"
   505:   ].includes(text) ? text : "delivery_summary";
   506: }
   507: 
   508: function aicmHumanReviewArtifactKind(value) {
   509:   const text = String(value || "design_doc").trim();
   510:   return ["design_doc", "implementation", "exception", "delivery_package", "handoff"].includes(text) ? text : "design_doc";
   511: }
   512: 
   513: function aicmHumanReviewPriority(value) {
   514:   const text = String(value || "normal").trim();
   515:   return ["low", "normal", "high", "urgent"].includes(text) ? text : "normal";
   516: }
   517: 
   518: function createHumanReviewItem(body) {
   519:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   520:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   521:   const title = requiredText(body.review_title || body.title, "review_title");
   522: 
   523:   const sql = [
   524:     "WITH inserted AS (",
   525:     "  INSERT INTO business.aicm_human_review_item (",
   526:     "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
   527:     "    related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id,",
   528:     "    related_deliverable_requirement_id, related_worker_work_unit_id,",
   529:     "    review_kind_code, artifact_kind_code, review_title,",
   530:     "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
   531:     "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
   532:     "    display_order, metadata_jsonb",
   533:     "  ) VALUES (",
   534:     "    " + sqlLiteral(owner) + "::uuid,",
   535:     "    " + sqlLiteral(companyId) + "::uuid,",
   536:     "    " + aicmHumanReviewOptionalUuidSql(body.aicm_user_company_department_id) + ",",
   537:     "    " + aicmHumanReviewOptionalUuidSql(body.aicm_user_company_section_id) + ",",
   538:     "    " + aicmHumanReviewOptionalUuidSql(body.related_president_policy_id) + ",",
   539:     "    " + aicmHumanReviewOptionalUuidSql(body.related_manager_major_work_item_id) + ",",
   540:     "    " + aicmHumanReviewOptionalUuidSql(body.related_leader_middle_work_item_id) + ",",
   541:     "    " + aicmHumanReviewOptionalUuidSql(body.related_deliverable_requirement_id) + ",",
   542:     "    " + aicmHumanReviewOptionalUuidSql(body.related_worker_work_unit_id) + ",",
   543:     "    " + sqlLiteral(aicmHumanReviewKind(body.review_kind_code)) + ",",
   544:     "    " + sqlLiteral(aicmHumanReviewArtifactKind(body.artifact_kind_code)) + ",",
   545:     "    " + sqlLiteral(title) + ",",
   546:     "    " + aicmHumanReviewTextSql(body.delivery_summary_text) + ",",
   547:     "    " + aicmHumanReviewTextSql(body.main_changes_text) + ",",
   548:     "    " + aicmHumanReviewTextSql(body.ai_review_result_text) + ",",
   549:     "    " + aicmHumanReviewTextSql(body.unresolved_issues_text) + ",",
   550:     "    " + aicmHumanReviewTextSql(body.artifact_link) + ",",
   551:     "    " + aicmHumanReviewTextSql(body.responsible_ai_label) + ",",
   552:     "    " + aicmHumanReviewTextSql(body.requested_by_ai_label) + ",",
   553:     "    'pending',",
   554:     "    " + sqlLiteral(aicmHumanReviewPriority(body.priority_code)) + ",",
   555:     "    " + aicmHumanReviewOptionalDateSql(body.due_date) + ",",
   556:     "    COALESCE(NULLIF(" + sqlLiteral(String(body.display_order || "")) + ", '')::integer, 100),",
   557:     "    '{}'::jsonb",
   558:     "  )",
   559:     "  RETURNING *",
   560:     ")",
   561:     "SELECT jsonb_build_object(",
   562:     "  'result', 'ok',",
   563:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   564:     "  'human_review_item', to_jsonb(inserted)",
   565:     ")::text",
   566:     "FROM inserted;"
   567:   ].join("\n");
   568: 
   569:   return runPsqlJson(sql);
   570: }
   571: 
   572: function approveHumanReviewItem(body) {
   573:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   574:   const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
   575: 
   576:   const sql = [
   577:     "WITH updated AS (",
   578:     "  UPDATE business.aicm_human_review_item",
   579:     "  SET human_review_status_code = 'approved',",
   580:     "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
   581:     "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
   582:     "      reviewed_at = now(),",
   583:     "      updated_at = now()",
   584:     "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
   585:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   586:     "  RETURNING *",
   587:     ")",
   588:     "SELECT jsonb_build_object(",
   589:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   590:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   591:     "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   592:     ")::text;"
   593:   ].join("\n");
   594: 
   595:   return runPsqlJson(sql);
   596: }
   597: 
   598: function returnHumanReviewItem(body) {
   599:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   600:   const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
   601: 
   602:   const sql = [
   603:     "WITH updated AS (",
   604:     "  UPDATE business.aicm_human_review_item",
   605:     "  SET human_review_status_code = 'returned',",
   606:     "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
   607:     "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
   608:     "      reviewed_at = now(),",
   609:     "      updated_at = now()",
   610:     "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
   611:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   612:     "  RETURNING *",
   613:     ")",
   614:     "SELECT jsonb_build_object(",
   615:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   616:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   617:     "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   618:     ")::text;"
   619:   ].join("\n");
   620: 
   621:   return runPsqlJson(sql);
   622: }
   623: 
   624: 
   625: 
   626: // AICM_COMPANY_DEPT_SECTION_UPDATE_ARU_ARX_V1
   627: // Company / Department / Section update functions.
   628: // Uses existing SQL-array + runPsqlJson(sql) pattern only.
   629: // No new Pool, no new DB helper, no new connection path.
   630: 
   631: function aicmOrgUpdateOptionalText(value) {
   632:   return String(value || "").trim();
   633: }
   634: 
   635: function aicmOrgUpdateTextSql(value) {
   636:   return sqlLiteral(String(value || ""));
   637: }
   638: 
   639: function aicmOrgUpdateStatus(value, allowed, fallback) {
   640:   const text = String(value || fallback).trim();
   641:   return allowed.includes(text) ? text : fallback;
   642: }
   643: 
   644: function updateCompany(body) {
   645:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   646:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   647:   const name = requiredText(body.company_name || body.companyName, "company_name");
   648: 
   649:   const sql = [
   650:     "WITH updated AS (",
   651:     "  UPDATE business.aicm_user_company",
   652:     "  SET company_name = " + sqlLiteral(name) + ",",
   653:     "      business_domain = " + aicmOrgUpdateTextSql(body.business_domain || body.businessDomain) + ",",
   654:     "      company_common_rules_text = " + aicmOrgUpdateTextSql(body.company_common_rules_text || body.companyCommonRulesText) + ",",
   655:     "      president_policy_instruction_text = " + aicmOrgUpdateTextSql(body.president_policy_instruction_text || body.presidentPolicyInstructionText) + ",",
   656:     "      updated_at = now()",
   657:     "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
   658:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   659:     "  RETURNING *",
   660:     ")",
   661:     "SELECT jsonb_build_object(",
   662:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   663:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   664:     "  'company', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   665:     ")::text;"
   666:   ].join("\n");
   667: 
   668:   return runPsqlJson(sql);
   669: }
   670: 
   671: function updateDepartment(body) {
   672:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   673:   const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
   674:   const name = requiredText(body.department_name || body.departmentName, "department_name");
   675:   const status = aicmOrgUpdateStatus(body.department_status || body.department_status_code, ["active", "inactive", "archived"], "active");
   676: 
   677:   const sql = [
   678:     "WITH updated AS (",
   679:     "  UPDATE business.aicm_user_company_department",
   680:     "  SET department_name = " + sqlLiteral(name) + ",",
   681:     "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
   682:     "      department_status = " + sqlLiteral(status) + ",",
   683:     "      updated_at = now()",
   684:     "  WHERE aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
   685:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   686:     "  RETURNING *",
   687:     ")",
   688:     "SELECT jsonb_build_object(",
   689:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   690:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   691:     "  'department', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   692:     ")::text;"
   693:   ].join("\n");
   694: 
   695:   return runPsqlJson(sql);
   696: }
   697: 
   698: function updateSection(body) {
   699:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   700:   const sectionId = requiredUuid(body.aicm_user_company_section_id, "aicm_user_company_section_id");
   701:   const name = requiredText(body.section_name || body.sectionName, "section_name");
   702:   const status = aicmOrgUpdateStatus(body.section_status || body.section_status_code, ["active", "inactive", "archived"], "active");

===== SNIPPET 3: L750-L1094 =====
   750:     "      AND s.section_status = 'active'",
   751:     "  ),",
   752:     "  'placements', (",
   753:     "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb)",
   754:     "    FROM business.vw_aicm_user_company_worker_placement_display p",
   755:     "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
   756:     "      AND p.status_code = 'active'",
   757:     "  ),",
   758:     "  'task_ledger', (",
   759:     "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.display_order, t.created_at DESC), '[]'::jsonb)",
   760:     "    FROM business.vw_aicm_user_company_department_task_ledger_display t",
   761:     "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
   762:     "      AND t.task_status_code <> 'archived'",
   763:     "  ),",
   764:     // AICM_PMLW_GETCONTEXT_SQL_EXTENSION_AQP_AQS_V1
   765:     "  'pmlw_president_policies', (",
   766:     "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.display_order ASC, p.updated_at DESC, p.created_at DESC), '[]'::jsonb)",
   767:     "    FROM business.vw_aicm_pmlw_president_policy_display p",
   768:     "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
   769:     "  ),",
   770:     "  'pmlw_major_items', (",
   771:     "    SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order ASC, m.updated_at DESC, m.created_at DESC), '[]'::jsonb)",
   772:     "    FROM business.vw_aicm_pmlw_major_work_display m",
   773:     "    WHERE m.owner_civilization_id::text = " + sqlLiteral(owner),
   774:     "  ),",
   775:     "  'pmlw_middle_items', (",
   776:     "    SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.display_order ASC, l.updated_at DESC, l.created_at DESC), '[]'::jsonb)",
   777:     "    FROM business.vw_aicm_pmlw_leader_middle_display l",
   778:     "    WHERE l.owner_civilization_id::text = " + sqlLiteral(owner),
   779:     "  ),",
   780:     "  'pmlw_deliverable_requirements', (",
   781:     "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.display_order ASC, r.updated_at DESC, r.created_at DESC), '[]'::jsonb)",
   782:     "    FROM business.vw_aicm_pmlw_deliverable_requirement_display r",
   783:     "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
   784:     "  ),",
   785:     "  'pmlw_worker_work_units', (",
   786:     "    SELECT COALESCE(jsonb_agg(to_jsonb(w) ORDER BY w.display_order ASC, w.updated_at DESC, w.created_at DESC), '[]'::jsonb)",
   787:     "    FROM business.vw_aicm_pmlw_worker_work_unit_display w",
   788:     "    WHERE w.owner_civilization_id::text = " + sqlLiteral(owner),
   789:     "  ),",
   790:     "  'pmlw_workflow_tree', (",
   791:     "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.last_updated_at DESC NULLS LAST), '[]'::jsonb)",
   792:     "    FROM business.vw_aicm_pmlw_workflow_tree t",
   793:     "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
   794:     "  ),",
   795:     // AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1_CONTEXT
   796:     "  'review_wait_items', (",
   797:     "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.priority_code DESC, r.requested_at DESC, r.created_at DESC), '[]'::jsonb)",
   798:     "    FROM business.vw_aicm_human_review_wait_display r",
   799:     "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
   800:     "  ),",
   801:     "  'robot_catalog', (",
   802:     "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.aiworker_model_code), '[]'::jsonb)",
   803:     "    FROM business.vw_ai_company_manager_system_robot_selector_options r",
   804:     "  )",
   805:     ")::text;"
   806:   ].join("\n");
   807: 
   808:   return runPsqlJson(sql);
   809: }
   810: 
   811: function createCompany(body) {
   812:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   813:   const name = requiredText(body.company_name, "company_name");
   814:   const domain = String(body.business_domain || "");
   815: 
   816:   const sql = [
   817:     "WITH inserted AS (",
   818:     "  INSERT INTO business.aicm_user_company (",
   819:     "    owner_civilization_id, company_name, business_domain, company_status, selected_flag",
   820:     "  ) VALUES (",
   821:     "    " + sqlLiteral(owner) + "::uuid,",
   822:     "    " + sqlLiteral(name) + ",",
   823:     "    " + sqlLiteral(domain) + ",",
   824:     "    'active',",
   825:     "    true",
   826:     "  )",
   827:     "  RETURNING *",
   828:     ")",
   829:     "SELECT jsonb_build_object(",
   830:     "  'result', 'ok',",
   831:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   832:     "  'company', to_jsonb(inserted)",
   833:     ")::text",
   834:     "FROM inserted;"
   835:   ].join("\n");
   836: 
   837:   return runPsqlJson(sql);
   838: }
   839: 
   840: function createDepartment(body) {
   841:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   842:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   843:   const name = requiredText(body.department_name, "department_name");
   844:   const purpose = String(body.purpose || "");
   845: 
   846:   const sql = [
   847:     "WITH company_ok AS (",
   848:     "  SELECT aicm_user_company_id",
   849:     "  FROM business.aicm_user_company",
   850:     "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   851:     "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
   852:     "    AND company_status = 'active'",
   853:     "  LIMIT 1",
   854:     "), inserted AS (",
   855:     "  INSERT INTO business.aicm_user_company_department (",
   856:     "    owner_civilization_id, aicm_user_company_id, department_name, purpose, department_status",
   857:     "  )",
   858:     "  SELECT",
   859:     "    " + sqlLiteral(owner) + "::uuid,",
   860:     "    aicm_user_company_id,",
   861:     "    " + sqlLiteral(name) + ",",
   862:     "    " + sqlLiteral(purpose) + ",",
   863:     "    'active'",
   864:     "  FROM company_ok",
   865:     "  RETURNING *",
   866:     ")",
   867:     "SELECT CASE",
   868:     "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
   869:     "    (SELECT jsonb_build_object(",
   870:     "      'result', 'ok',",
   871:     "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   872:     "      'department', to_jsonb(inserted)",
   873:     "    ) FROM inserted)::text",
   874:     "  ELSE",
   875:     "    jsonb_build_object(",
   876:     "      'result', 'error',",
   877:     "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   878:     "      'error_message', '先にv2のAI企業を作成・選択してください。旧ローカル会社IDでは部門保存できません。'",
   879:     "    )::text",
   880:     "END;"
   881:   ].join("\n");
   882: 
   883:   return runPsqlJson(sql);
   884: }
   885: 
   886: function createSection(body) {
   887:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   888:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   889:   const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
   890:   const name = requiredText(body.section_name, "section_name");
   891:   const purpose = String(body.purpose || "");
   892: 
   893:   const sql = [
   894:     "WITH department_ok AS (",
   895:     "  SELECT aicm_user_company_id, aicm_user_company_department_id",
   896:     "  FROM business.aicm_user_company_department",
   897:     "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   898:     "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
   899:     "    AND aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
   900:     "    AND department_status = 'active'",
   901:     "  LIMIT 1",
   902:     "), inserted AS (",
   903:     "  INSERT INTO business.aicm_user_company_section (",
   904:     "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, section_name, purpose, section_status",
   905:     "  )",
   906:     "  SELECT",
   907:     "    " + sqlLiteral(owner) + "::uuid,",
   908:     "    aicm_user_company_id,",
   909:     "    aicm_user_company_department_id,",
   910:     "    " + sqlLiteral(name) + ",",
   911:     "    " + sqlLiteral(purpose) + ",",
   912:     "    'active'",
   913:     "  FROM department_ok",
   914:     "  RETURNING *",
   915:     ")",
   916:     "SELECT CASE",
   917:     "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
   918:     "    (SELECT jsonb_build_object(",
   919:     "      'result', 'ok',",
   920:     "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   921:     "      'section', to_jsonb(inserted)",
   922:     "    ) FROM inserted)::text",
   923:     "  ELSE",
   924:     "    jsonb_build_object(",
   925:     "      'result', 'error',",
   926:     "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   927:     "      'error_message', '先にv2のAI企業と部門を作成・選択してください。旧ローカルIDでは課保存できません。'",
   928:     "    )::text",
   929:     "END;"
   930:   ].join("\n");
   931: 
   932:   return runPsqlJson(sql);
   933: }
   934: 
   935: 
   936: function createTaskLedger(body) {
   937:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   938:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   939:   const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
   940:   const sectionId = String(body.aicm_user_company_section_id || "").trim();
   941: 
   942:   const deliverableName = requiredText(body.deliverable_name, "deliverable_name");
   943:   const taskName = requiredText(body.task_name, "task_name");
   944:   const workTypeCode = String(body.work_type_code || "design").trim() || "design";
   945:   const responsibleRoleCode = String(body.responsible_role_code || "Manager").trim() || "Manager";
   946:   const responsibleRobotLabel = String(body.responsible_robot_label || "");
   947:   const taskStatusCode = String(body.task_status_code || "todo").trim() || "todo";
   948:   const priorityCode = String(body.priority_code || "normal").trim() || "normal";
   949:   const dueDate = String(body.due_date || "").trim();
   950: 
   951:   const sectionSql = sectionId ? sqlLiteral(sectionId) + "::uuid" : "NULL";
   952:   const dueDateSql = dueDate ? sqlLiteral(dueDate) + "::date" : "NULL";
   953: 
   954:   const sql = [
   955:     "WITH department_ok AS (",
   956:     "  SELECT d.aicm_user_company_id, d.aicm_user_company_department_id",
   957:     "  FROM business.aicm_user_company_department d",
   958:     "  JOIN business.aicm_user_company c",
   959:     "    ON c.aicm_user_company_id = d.aicm_user_company_id",
   960:     "  WHERE d.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   961:     "    AND d.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
   962:     "    AND d.aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
   963:     "    AND d.department_status = 'active'",
   964:     "    AND c.company_status = 'active'",
   965:     "  LIMIT 1",
   966:     "), inserted AS (",
   967:     "  INSERT INTO business.aicm_user_company_department_task_ledger (",
   968:     "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
   969:     "    deliverable_name, task_name, work_type_code, responsible_role_code, responsible_robot_label,",
   970:     "    task_status_code, priority_code, due_date,",
   971:     "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
   972:     "  )",
   973:     "  SELECT",
   974:     "    " + sqlLiteral(owner) + "::uuid,",
   975:     "    aicm_user_company_id,",
   976:     "    aicm_user_company_department_id,",
   977:     "    " + sectionSql + ",",
   978:     "    " + sqlLiteral(deliverableName) + ",",
   979:     "    " + sqlLiteral(taskName) + ",",
   980:     "    " + sqlLiteral(workTypeCode) + ",",
   981:     "    " + sqlLiteral(responsibleRoleCode) + ",",
   982:     "    " + sqlLiteral(responsibleRobotLabel) + ",",
   983:     "    " + sqlLiteral(taskStatusCode) + ",",
   984:     "    " + sqlLiteral(priorityCode) + ",",
   985:     "    " + dueDateSql + ",",
   986:     "    " + sqlLiteral(body.reference_files_text || "") + ",",
   987:     "    " + sqlLiteral(body.supplemental_materials_text || "") + ",",
   988:     "    " + sqlLiteral(body.applicable_rules_text || "") + ",",
   989:     "    " + sqlLiteral(body.note || "") + ",",
   990:     "    " + sqlLiteral(body.handoff_link || "") + "",
   991:     "  FROM department_ok",
   992:     "  RETURNING *",
   993:     ")",
   994:     "SELECT CASE",
   995:     "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
   996:     "    (SELECT jsonb_build_object(",
   997:     "      'result', 'ok',",
   998:     "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   999:     "      'task_ledger', to_jsonb(inserted)",
  1000:     "    ) FROM inserted)::text",
  1001:     "  ELSE",
  1002:     "    jsonb_build_object(",
  1003:     "      'result', 'error',",
  1004:     "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
  1005:     "      'error_message', '先にv2のAI企業と部門を作成・選択してください。'",
  1006:     "    )::text",
  1007:     "END;"
  1008:   ].join("\n");
  1009: 
  1010:   return runPsqlJson(sql);
  1011: }
  1012: 
  1013: 
  1014: function createPlacement(body) {
  1015:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  1016:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  1017:   const roleCode = requiredText(body.role_code, "role_code");
  1018:   const modelCode = requiredText(body.aiworker_model_code, "aiworker_model_code");
  1019: 
  1020:   const departmentId = String(body.aicm_user_company_department_id || "").trim();
  1021:   const sectionId = String(body.aicm_user_company_section_id || "").trim();
  1022:   const targetLevelCode = requiredText(body.target_level_code || "company", "target_level_code");
  1023:   const targetId = String(body.target_id || "").trim();
  1024:   const robotPoolId = String(body.robot_pool_id || "").trim();
  1025:   const nickname = String(body.internal_nickname || "");
  1026: 
  1027:   const departmentSql = departmentId ? sqlLiteral(departmentId) + "::uuid" : "NULL";
  1028:   const sectionSql = sectionId ? sqlLiteral(sectionId) + "::uuid" : "NULL";
  1029:   const targetSql = targetId ? sqlLiteral(targetId) + "::uuid" : "NULL";
  1030:   const robotPoolSql = robotPoolId ? sqlLiteral(robotPoolId) + "::uuid" : "NULL";
  1031: 
  1032:   const sql = [
  1033:     "WITH company_ok AS (",
  1034:     "  SELECT aicm_user_company_id",
  1035:     "  FROM business.aicm_user_company",
  1036:     "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
  1037:     "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
  1038:     "    AND company_status = 'active'",
  1039:     "  LIMIT 1",
  1040:     "), inserted AS (",
  1041:     "  INSERT INTO business.aicm_user_company_worker_placement (",
  1042:     "    owner_civilization_id, aicm_user_company_id,",
  1043:     "    aicm_user_company_department_id, aicm_user_company_section_id,",
  1044:     "    target_level_code, target_id, app_code, role_code, robot_pool_id,",
  1045:     "    aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code",
  1046:     "  )",
  1047:     "  SELECT",
  1048:     "    " + sqlLiteral(owner) + "::uuid,",
  1049:     "    aicm_user_company_id,",
  1050:     "    " + departmentSql + ",",
  1051:     "    " + sectionSql + ",",
  1052:     "    " + sqlLiteral(targetLevelCode) + ",",
  1053:     "    " + targetSql + ",",
  1054:     "    'AICompanyManager',",
  1055:     "    " + sqlLiteral(roleCode) + ",",
  1056:     "    " + robotPoolSql + ",",
  1057:     "    " + sqlLiteral(modelCode) + ",",
  1058:     "    " + sqlLiteral(nickname) + ",",
  1059:     "    1,",
  1060:     "    'unlimited_system_use',",
  1061:     "    'active'",
  1062:     "  FROM company_ok",
  1063:     "  RETURNING *",
  1064:     ")",
  1065:     "SELECT CASE",
  1066:     "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
  1067:     "    (SELECT jsonb_build_object(",
  1068:     "      'result', 'ok',",
  1069:     "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
  1070:     "      'placement', to_jsonb(inserted)",
  1071:     "    ) FROM inserted)::text",
  1072:     "  ELSE",
  1073:     "    jsonb_build_object(",
  1074:     "      'result', 'error',",
  1075:     "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
  1076:     "      'error_message', '先にv2のAI企業を作成・選択してください。'",
  1077:     "    )::text",
  1078:     "END;"
  1079:   ].join("\n");
  1080: 
  1081:   return runPsqlJson(sql);
  1082: }
  1083: 
  1084: 
  1085: 
  1086: // AICM_ROLE_SETTINGS_SYNC_AXC_V1
  1087: // Synchronize President / Manager / Leader / Worker role settings.
  1088: // Canonical table: business.aicm_user_company_worker_placement.
  1089: // This endpoint archives current active placements for each submitted target+role,
  1090: // then recreates submitted active rows. This prevents duplicate single-slot assignments.
  1091: function aicmRoleSyncOptionalUuidSql(value) {
  1092:   const text = String(value || "").trim();
  1093:   return /^[0-9a-fA-F-]{36}$/.test(text) ? sqlLiteral(text) + "::uuid" : "NULL";
  1094: }

===== SNIPPET 4: L1099-L1306 =====
  1099:   if (text === "manager") return "Manager";
  1100:   if (text === "leader") return "Leader";
  1101:   if (text === "worker" || text === "employee") return "Worker";
  1102:   throw new Error("invalid role_code");
  1103: }
  1104: 
  1105: function aicmRoleSyncTargetLevel(value) {
  1106:   const text = String(value || "").trim().toLowerCase();
  1107:   if (text === "company") return "company";
  1108:   if (text === "department") return "department";
  1109:   if (text === "section" || text === "organization") return "section";
  1110:   throw new Error("invalid target_level_code");
  1111: }
  1112: 
  1113: function aicmRoleSyncRows(body) {
  1114:   const rows = Array.isArray(body.role_placements) ? body.role_placements : [];
  1115:   return rows.slice(0, 30).map((row, index) => {
  1116:     const roleCode = aicmRoleSyncRole(row.role_code || row.roleCode);
  1117:     const targetLevelCode = aicmRoleSyncTargetLevel(row.target_level_code || row.targetLevelCode);
  1118:     return {
  1119:       row_order: index,
  1120:       role_code: roleCode,
  1121:       target_level_code: targetLevelCode,
  1122:       aicm_user_company_department_id: String(row.aicm_user_company_department_id || row.departmentId || "").trim(),
  1123:       aicm_user_company_section_id: String(row.aicm_user_company_section_id || row.sectionId || row.organizationId || "").trim(),
  1124:       target_id: String(row.target_id || row.targetId || "").trim(),
  1125:       robot_pool_id: String(row.robot_pool_id || row.robotPoolId || "").trim(),
  1126:       aiworker_model_code: String(row.aiworker_model_code || row.aiworkerModelCode || "").trim(),
  1127:       internal_nickname: String(row.internal_nickname || row.internalNickname || "").trim()
  1128:     };
  1129:   });
  1130: }
  1131: 
  1132: function syncRoleSettings(body) {
  1133:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  1134:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  1135:   const submittedRows = aicmRoleSyncRows(body);
  1136: 
  1137:   const targetKeys = [];
  1138:   const insertRows = [];
  1139: 
  1140:   for (const row of submittedRows) {
  1141:     const targetId = row.target_id ||
  1142:       (row.target_level_code === "company" ? companyId : "") ||
  1143:       (row.target_level_code === "department" ? row.aicm_user_company_department_id : "") ||
  1144:       (row.target_level_code === "section" ? row.aicm_user_company_section_id : "");
  1145: 
  1146:     if (!targetId) continue;
  1147: 
  1148:     const key = [row.target_level_code, targetId, row.role_code].join("|");
  1149: 
  1150:     if (!targetKeys.some((item) => item.key === key)) {
  1151:       targetKeys.push({
  1152:         key,
  1153:         target_level_code: row.target_level_code,
  1154:         target_id: targetId,
  1155:         role_code: row.role_code,
  1156:         aicm_user_company_department_id: row.aicm_user_company_department_id,
  1157:         aicm_user_company_section_id: row.aicm_user_company_section_id
  1158:       });
  1159:     }
  1160: 
  1161:     if (!row.robot_pool_id && !row.aiworker_model_code) continue;
  1162: 
  1163:     insertRows.push({
  1164:       ...row,
  1165:       target_id: targetId,
  1166:       aiworker_model_code: row.aiworker_model_code || "unknown"
  1167:     });
  1168:   }
  1169: 
  1170:   if (targetKeys.length === 0) {
  1171:     return {
  1172:       result: "ok",
  1173:       api_identifier: SERVER_MARK,
  1174:       archived_count: 0,
  1175:       inserted_count: 0,
  1176:       placements: [],
  1177:       note: "no role placement targets"
  1178:     };
  1179:   }
  1180: 
  1181:   const targetValues = targetKeys.map((row, index) => [
  1182:     "(",
  1183:     String(index),
  1184:     ", " + sqlLiteral(row.target_level_code),
  1185:     ", " + sqlLiteral(row.target_id) + "::uuid",
  1186:     ", " + sqlLiteral(row.role_code),
  1187:     ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_department_id),
  1188:     ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_section_id),
  1189:     ")"
  1190:   ].join("")).join(",\n    ");
  1191: 
  1192:   const insertValues = insertRows.length ? insertRows.map((row, index) => [
  1193:     "(",
  1194:     String(index),
  1195:     ", " + sqlLiteral(row.target_level_code),
  1196:     ", " + sqlLiteral(row.target_id) + "::uuid",
  1197:     ", " + sqlLiteral(row.role_code),
  1198:     ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_department_id),
  1199:     ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_section_id),
  1200:     ", " + aicmRoleSyncOptionalUuidSql(row.robot_pool_id),
  1201:     ", " + sqlLiteral(row.aiworker_model_code),
  1202:     ", " + sqlLiteral(row.internal_nickname),
  1203:     ")"
  1204:   ].join("")).join(",\n    ") : "";
  1205: 
  1206:   const insertCte = insertRows.length ? [
  1207:     "), insert_rows(row_order, target_level_code, target_id, role_code, aicm_user_company_department_id, aicm_user_company_section_id, robot_pool_id, aiworker_model_code, internal_nickname) AS (",
  1208:     "  VALUES",
  1209:     "    " + insertValues,
  1210:     "), inserted AS (",
  1211:     "  INSERT INTO business.aicm_user_company_worker_placement (",
  1212:     "    owner_civilization_id, aicm_user_company_id,",
  1213:     "    aicm_user_company_department_id, aicm_user_company_section_id,",
  1214:     "    target_level_code, target_id, app_code, role_code, robot_pool_id,",
  1215:     "    aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code",
  1216:     "  )",
  1217:     "  SELECT",
  1218:     "  -- AICM_ROLE_SYNC_UUID_CAST_AXM_V1",
  1219:     "    " + sqlLiteral(owner) + "::uuid,",
  1220:     "    c.aicm_user_company_id,",
  1221:     "    i.aicm_user_company_department_id::uuid,",
  1222:     "    i.aicm_user_company_section_id::uuid,",
  1223:     "    i.target_level_code,",
  1224:     "    i.target_id,",
  1225:     "    'AICompanyManager',",
  1226:     "    i.role_code,",
  1227:     "    i.robot_pool_id::uuid,",
  1228:     "    i.aiworker_model_code,",
  1229:     "    i.internal_nickname,",
  1230:     "    1,",
  1231:     "    'unlimited_system_use',",
  1232:     "    'active'",
  1233:     "  FROM insert_rows i",
  1234:     "  CROSS JOIN company_ok c",
  1235:     "  RETURNING *"
  1236:   ].join("\n") : [
  1237:     "), inserted AS (",
  1238:     "  SELECT *",
  1239:     "  FROM business.aicm_user_company_worker_placement",
  1240:     "  WHERE false"
  1241:   ].join("\n");
  1242: 
  1243:   const sql = [
  1244:     "WITH company_ok AS (",
  1245:     "  SELECT aicm_user_company_id",
  1246:     "  FROM business.aicm_user_company",
  1247:     "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
  1248:     "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
  1249:     "    AND company_status = 'active'",
  1250:     "  LIMIT 1",
  1251:     "), target_keys(row_order, target_level_code, target_id, role_code, aicm_user_company_department_id, aicm_user_company_section_id) AS (",
  1252:     "  VALUES",
  1253:     "    " + targetValues,
  1254:     "), archived AS (",
  1255:     "  UPDATE business.aicm_user_company_worker_placement p",
  1256:     "  SET status_code = 'archived',",
  1257:     "      updated_at = now(),",
  1258:     "      metadata_jsonb = COALESCE(p.metadata_jsonb, '{}'::jsonb) || jsonb_build_object('archived_by', 'AICompanyManager.role_settings_sync', 'archived_at', now()::text)",
  1259:     "  FROM target_keys k",
  1260:     "  WHERE p.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
  1261:     "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
  1262:     "    AND p.app_code = 'AICompanyManager'",
  1263:     "    AND p.status_code = 'active'",
  1264:     "    AND lower(p.target_level_code) = lower(k.target_level_code)",
  1265:     "    AND p.target_id = k.target_id",
  1266:     "    AND lower(p.role_code) = lower(k.role_code)",
  1267:     "  RETURNING p.*",
  1268:     insertCte,
  1269:     ")",
  1270:     "SELECT jsonb_build_object(",
  1271:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM company_ok) THEN 'ok' ELSE 'error' END,",
  1272:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
  1273:     "  'archived_count', (SELECT count(*) FROM archived),",
  1274:     "  'inserted_count', (SELECT count(*) FROM inserted),",
  1275:     "  'placements', COALESCE((SELECT jsonb_agg(to_jsonb(inserted) ORDER BY created_at, aicm_user_company_worker_placement_id) FROM inserted), '[]'::jsonb),",
  1276:     "  'error_message', CASE WHEN EXISTS (SELECT 1 FROM company_ok) THEN '' ELSE '先にv2のAI企業を作成・選択してください。' END",
  1277:     ")::text;"
  1278:   ].join("\n");
  1279: 
  1280:   return runPsqlJson(sql);
  1281: }
  1282: 
  1283: 
  1284: 
  1285: // AICM_WORKBENCH_RUNTIME_CODE_NORMALIZE_AXT_R7_V1
  1286: // Normalize AICompanyManager Workbench request values to AIWorkerOS runtime profile canon.
  1287: // DB access here is read-only and uses the existing runPsqlJson/sqlLiteral pattern.
  1288: function aicmNormalizeWorkbenchRuntimeAppSurfaceCode(value) {
  1289:   const text = String(value || "").trim();
  1290: 
  1291:   if (!text || text === "ai_company_manager_worker_execution" || text === "AICompanyManager") {
  1292:     return "ai_company_manager";
  1293:   }
  1294: 
  1295:   return text;
  1296: }
  1297: 
  1298: function aicmNormalizeWorkbenchRuntimeModelCode(value) {
  1299:   const text = String(value || "").trim();
  1300: 
  1301:   if (!text) {
  1302:     return text;
  1303:   }
  1304: 
  1305:   const sql = [
  1306:     "SELECT jsonb_build_object(",

===== SNIPPET 5: L1353-L1457 =====
  1353: // Server-side bridge from AICompanyManager to AIWorkerOS Runtime Execution.
  1354: // UI must never receive PERSONA_AIWORKEROS_AUTH_TOKEN.
  1355: // This function does local placement validation, then forwards a sanitized request to AIWorkerOS.
  1356: function aicmWorkerRuntimeText(value) {
  1357:   return String(value || "").trim();
  1358: }
  1359: 
  1360: function aicmWorkerRuntimeDefault(value, fallback) {
  1361:   const text = aicmWorkerRuntimeText(value);
  1362:   return text || fallback;
  1363: }
  1364: 
  1365: function aicmWorkerRuntimeOptionalUuidSql(value) {
  1366:   const text = aicmWorkerRuntimeText(value);
  1367:   return /^[0-9a-fA-F-]{36}$/.test(text) ? sqlLiteral(text) + "::uuid" : "NULL";
  1368: }
  1369: 
  1370: function aicmWorkerRuntimeBaseUrl() {
  1371:   const base = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_BASE_URL);
  1372:   if (!base) {
  1373:     throw new Error("PERSONA_AIWORKEROS_BASE_URL is not set");
  1374:   }
  1375:   return base.replace(/\/+$/, "");
  1376: }
  1377: 
  1378: function aicmWorkerRuntimeAuthToken() {
  1379:   const token = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN);
  1380:   if (!token) {
  1381:     throw new Error("PERSONA_AIWORKEROS_AUTH_TOKEN is not set");
  1382:   }
  1383:   return token;
  1384: }
  1385: 
  1386: function getAicmWorkerRuntimePlacement(body) {
  1387:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  1388:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  1389:   const placementId = requiredUuid(body.aicm_user_company_worker_placement_id, "aicm_user_company_worker_placement_id");
  1390: 
  1391:   const sql = [
  1392:     "WITH placement AS (",
  1393:     "  SELECT",
  1394:     "    p.aicm_user_company_worker_placement_id,",
  1395:     "    p.owner_civilization_id,",
  1396:     "    p.aicm_user_company_id,",
  1397:     "    p.aicm_user_company_department_id,",
  1398:     "    p.aicm_user_company_section_id,",
  1399:     "    p.target_level_code,",
  1400:     "    p.target_id,",
  1401:     "    p.app_code,",
  1402:     "    p.role_code,",
  1403:     "    p.robot_pool_id,",
  1404:     "    p.aiworker_model_code,",
  1405:     "    p.internal_nickname,",
  1406:     "    p.status_code,",
  1407:     "    COALESCE(v.display_label, NULLIF(p.internal_nickname, '') || '@' || p.role_code, p.aiworker_model_code || '@' || p.role_code) AS display_label",
  1408:     "  FROM business.aicm_user_company_worker_placement p",
  1409:     "  LEFT JOIN business.vw_aicm_user_company_worker_placement_display v",
  1410:     "    ON v.aicm_user_company_worker_placement_id = p.aicm_user_company_worker_placement_id",
  1411:     "  WHERE p.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
  1412:     "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
  1413:     "    AND p.aicm_user_company_worker_placement_id = " + sqlLiteral(placementId) + "::uuid",
  1414:     "    AND p.app_code = 'AICompanyManager'",
  1415:     "    AND p.status_code = 'active'",
  1416:     "    AND lower(p.role_code) = lower('Worker')",
  1417:     "  LIMIT 1",
  1418:     ")",
  1419:     "SELECT jsonb_build_object(",
  1420:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM placement) THEN 'ok' ELSE 'not_found' END,",
  1421:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
  1422:     "  'placement', COALESCE((SELECT to_jsonb(placement) FROM placement), '{}'::jsonb)",
  1423:     ")::text;"
  1424:   ].join("\n");
  1425: 
  1426:   return runPsqlJson(sql);
  1427: }
  1428: 
  1429: function aicmWorkerRuntimeBuildIdempotencyKey(body, placement) {
  1430:   const provided = aicmWorkerRuntimeText(body.idempotency_key);
  1431:   if (provided) return provided;
  1432: 
  1433:   const sourceRequestRef = aicmWorkerRuntimeDefault(body.source_request_ref, "manual:" + Date.now());
  1434:   const placementId = aicmWorkerRuntimeText(placement.aicm_user_company_worker_placement_id);
  1435:   return "aicm:" + sourceRequestRef + ":" + placementId;
  1436: }
  1437: 
  1438: async function createWorkerRuntimeRequest(body) {
  1439:   // AICM_WORKBENCH_RUNTIME_CODE_NORMALIZE_AXT_R7_V1
  1440:   body = aicmNormalizeWorkbenchRuntimeRequestBody(body);
  1441: 
  1442:   body = body || {};
  1443: 
  1444:   const placementResult = getAicmWorkerRuntimePlacement(body);
  1445:   if (!placementResult || placementResult.result !== "ok" || !placementResult.placement) {
  1446:     return {
  1447:       result: "error",
  1448:       api_identifier: SERVER_MARK,
  1449:       error_message: "有効なWorker配置が見つかりません。"
  1450:     };
  1451:   }
  1452: 
  1453:   const placement = placementResult.placement;
  1454:   const baseUrl = aicmWorkerRuntimeBaseUrl();
  1455:   const token = aicmWorkerRuntimeAuthToken();
  1456: 
  1457:   const modelCode = aicmWorkerRuntimeDefault(

===== SNIPPET 6: L1618-L2004 =====
  1618: 
  1619:   return {
  1620:     result: "ok",
  1621:     api_identifier: SERVER_MARK,
  1622:     upstream_status_code: response.status,
  1623:     upstream_path: pathname,
  1624:     payload
  1625:   };
  1626: }
  1627: 
  1628: // AICM_R8Z_A_LEADER_AUTO_DECOMPOSITION_START
  1629: 
  1630: function aicmR8zAutoText(value) {
  1631:   if (value === null || typeof value === "undefined") return "";
  1632:   return String(value).trim();
  1633: }
  1634: 
  1635: function aicmR8zAutoMode(value) {
  1636:   const text = aicmR8zAutoText(value).toLowerCase();
  1637:   return text === "pending" ? "pending" : "single";
  1638: }
  1639: 
  1640: function aicmR8zAutoVersion(value) {
  1641:   const text = aicmR8zAutoText(value);
  1642:   return text || "r8z_v1";
  1643: }
  1644: 
  1645: function aicmR8zAutoLimit(value) {
  1646:   const num = Number(value);
  1647:   if (!Number.isFinite(num) || num < 1) return 1;
  1648:   return Math.min(10, Math.floor(num));
  1649: }
  1650: 
  1651: function runLeaderAutoDecomposition(body) {
  1652:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  1653:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  1654:   const mode = aicmR8zAutoMode(body.mode);
  1655:   const limit = aicmR8zAutoLimit(body.limit);
  1656:   const version = aicmR8zAutoVersion(body.auto_decomposition_version);
  1657:   const sourceAppRef = aicmR8zAutoText(body.source_app_ref) || "AICompanyManager";
  1658:   const majorId = body.aicm_manager_major_work_item_id
  1659:     ? requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")
  1660:     : "";
  1661: 
  1662:   if (mode === "single" && !majorId) {
  1663:     throw new Error("aicm_manager_major_work_item_id is required for single mode");
  1664:   }
  1665: 
  1666:   const targetWhere = mode === "single"
  1667:     ? "    AND m.aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid"
  1668:     : "    AND m.aicm_manager_major_work_item_id IS NOT NULL";
  1669: 
  1670:   const sql = [
  1671:     "WITH input_request AS (",
  1672:     "  SELECT",
  1673:     "    " + sqlLiteral(owner) + "::uuid AS owner_civilization_id,",
  1674:     "    " + sqlLiteral(companyId) + "::uuid AS aicm_user_company_id,",
  1675:     "    " + sqlLiteral(version) + "::text AS auto_decomposition_version,",
  1676:     "    " + sqlLiteral(sourceAppRef) + "::text AS source_app_ref,",
  1677:     "    " + String(limit) + "::int AS max_count",
  1678:     "), target_major AS (",
  1679:     "  SELECT m.*",
  1680:     "  FROM business.aicm_manager_major_work_item m",
  1681:     "  JOIN input_request r",
  1682:     "    ON r.owner_civilization_id = m.owner_civilization_id",
  1683:     "   AND r.aicm_user_company_id = m.aicm_user_company_id",
  1684:     "  WHERE m.decomposition_status_code = " + sqlLiteral("assigned_to_leader"),
  1685:     "    AND m.handoff_status_code = " + sqlLiteral("handed_off"),
  1686:     targetWhere,
  1687:     "    AND NOT EXISTS (",
  1688:     "      SELECT 1",
  1689:     "      FROM business.aicm_leader_middle_work_item existing",
  1690:     "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",
  1691:     "        AND existing.owner_civilization_id = m.owner_civilization_id",
  1692:     "        AND existing.aicm_user_company_id = m.aicm_user_company_id",
  1693:     "        AND existing.breakdown_status_code <> " + sqlLiteral("archived"),
  1694:     "    )",
  1695:     "  ORDER BY m.updated_at, m.display_order, m.created_at",
  1696:     "  LIMIT (SELECT max_count FROM input_request)",
  1697:     "), selected_worker AS (",
  1698:     "  SELECT DISTINCT ON (tm.aicm_manager_major_work_item_id)",
  1699:     "    tm.aicm_manager_major_work_item_id,",
  1700:     "    p.aiworker_model_code,",
  1701:     "    COALESCE(NULLIF(p.internal_nickname, ''), p.aiworker_model_code, " + sqlLiteral("未割当") + ") AS worker_label",
  1702:     "  FROM target_major tm",
  1703:     "  LEFT JOIN business.aicm_user_company_worker_placement p",
  1704:     "    ON p.owner_civilization_id = tm.owner_civilization_id",
  1705:     "   AND p.aicm_user_company_id = tm.aicm_user_company_id",
  1706:     "   AND p.role_code = " + sqlLiteral("Worker"),
  1707:     "   AND p.status_code = " + sqlLiteral("active"),
  1708:     "  ORDER BY",
  1709:     "    tm.aicm_manager_major_work_item_id,",
  1710:     "    CASE",
  1711:     "      WHEN p.aicm_user_company_section_id IS NOT NULL AND p.aicm_user_company_section_id = tm.aicm_user_company_section_id THEN 1",
  1712:     "      WHEN p.aicm_user_company_department_id IS NOT NULL AND p.aicm_user_company_department_id = tm.aicm_user_company_department_id THEN 2",
  1713:     "      WHEN p.target_level_code = " + sqlLiteral("company") + " THEN 3",
  1714:     "      ELSE 9",
  1715:     "    END,",
  1716:     "    p.created_at",
  1717:     "), inserted_middle AS (",
  1718:     "  INSERT INTO business.aicm_leader_middle_work_item (",
  1719:     "    owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id,",
  1720:     "    aicm_user_company_department_id, aicm_user_company_section_id,",
  1721:     "    middle_item_name, middle_item_description, leader_robot_label,",
  1722:     "    breakdown_status_code, handoff_status_code, priority_code, due_date,",
  1723:     "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",
  1724:     "  )",
  1725:     "  SELECT",
  1726:     "    tm.owner_civilization_id, tm.aicm_user_company_id, tm.aicm_manager_major_work_item_id,",
  1727:     "    tm.aicm_user_company_department_id, tm.aicm_user_company_section_id,",
  1728:     "    tm.major_item_name, tm.major_item_description,",
  1729:     "    COALESCE(NULLIF(tm.assigned_leader_label, ''), " + sqlLiteral("自動割当") + "),",
  1730:     "    " + sqlLiteral("worker_units_created") + ", " + sqlLiteral("handed_off") + ", tm.priority_code, tm.due_date,",
  1731:     "    tm.reference_files_text, tm.supplemental_materials_text, tm.applicable_rules_text,",
  1732:     "    " + sqlLiteral("R8Z auto-generated from Manager大項目") + ", '', tm.display_order,",
  1733:     "    jsonb_build_object(",
  1734:     "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
  1735:     "      " + sqlLiteral("auto_decomposition_source") + ", " + sqlLiteral("manager_major") + ",",
  1736:     "      " + sqlLiteral("source_app_ref") + ", (SELECT source_app_ref FROM input_request),",
  1737:     "      " + sqlLiteral("source_manager_major_work_item_id") + ", tm.aicm_manager_major_work_item_id::text",
  1738:     "    )",
  1739:     "  FROM target_major tm",
  1740:     "  RETURNING *",
  1741:     "), inserted_requirement AS (",
  1742:     "  INSERT INTO business.aicm_leader_deliverable_requirement (",
  1743:     "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id,",
  1744:     "    deliverable_name, deliverable_type_code, deliverable_description,",
  1745:     "    required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code,",
  1746:     "    priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",
  1747:     "  )",
  1748:     "  SELECT",
  1749:     "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id,",
  1750:     "    im.middle_item_name || " + sqlLiteral(" 成果物") + ", " + sqlLiteral("operation") + ", im.middle_item_description,",
  1751:     "    " + sqlLiteral("会社共通ルールと該当業務ルールに従い、後続Workerが実行可能な成果物にする") + ",",
  1752:     "    " + sqlLiteral("大項目の目的を満たし、レビュー可能な作業結果が作成されていること") + ",",
  1753:     "    true, " + sqlLiteral("ready_for_worker") + ", im.priority_code, im.due_date,",
  1754:     "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",
  1755:     "    " + sqlLiteral("R8Z auto-generated deliverable requirement") + ", '', im.display_order,",
  1756:     "    jsonb_build_object(",
  1757:     "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
  1758:     "      " + sqlLiteral("source_leader_middle_work_item_id") + ", im.aicm_leader_middle_work_item_id::text,",
  1759:     "      " + sqlLiteral("source_manager_major_work_item_id") + ", im.aicm_manager_major_work_item_id::text",
  1760:     "    )",
  1761:     "  FROM inserted_middle im",
  1762:     "  RETURNING *",
  1763:     "), inserted_worker_unit AS (",
  1764:     "  INSERT INTO business.aicm_worker_work_unit (",
  1765:     "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,",
  1766:     "    work_unit_name, work_unit_description, work_type_code,",
  1767:     "    assigned_worker_label, worker_model_code, work_status_code, review_status_code,",
  1768:     "    priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link,",
  1769:     "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, display_order, metadata_jsonb",
  1770:     "  )",
  1771:     "  SELECT",
  1772:     "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,",
  1773:     "    im.middle_item_name || " + sqlLiteral(" 作業") + ", im.middle_item_description, " + sqlLiteral("operation") + ",",
  1774:     "    COALESCE(sw.worker_label, " + sqlLiteral("未割当") + "), COALESCE(sw.aiworker_model_code, ''), " + sqlLiteral("todo") + ", " + sqlLiteral("required") + ",",
  1775:     "    im.priority_code, im.due_date,",
  1776:     "    " + sqlLiteral("Manager大項目: ") + " || im.middle_item_name || E'\\n' || im.middle_item_description,",
  1777:     "    " + sqlLiteral("指定された大項目について、実行可能な成果物または作業結果を作成する") + ",",
  1778:     "    '', '',",
  1779:     "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",
  1780:     "    CASE WHEN sw.aiworker_model_code IS NULL THEN " + sqlLiteral("Worker未割当。配置後に再割当対象。") + " ELSE " + sqlLiteral("R8Z auto-generated worker work unit") + " END,",
  1781:     "    im.display_order,",
  1782:     "    jsonb_build_object(",
  1783:     "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
  1784:     "      " + sqlLiteral("source_leader_middle_work_item_id") + ", im.aicm_leader_middle_work_item_id::text,",
  1785:     "      " + sqlLiteral("source_deliverable_requirement_id") + ", ir.aicm_leader_deliverable_requirement_id::text,",
  1786:     "      " + sqlLiteral("source_manager_major_work_item_id") + ", im.aicm_manager_major_work_item_id::text",
  1787:     "    )",
  1788:     "  FROM inserted_middle im",
  1789:     "  JOIN inserted_requirement ir ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
  1790:     "  LEFT JOIN selected_worker sw ON sw.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",
  1791:     "  RETURNING *",
  1792:     "), updated_manager AS (",
  1793:     "  UPDATE business.aicm_manager_major_work_item m",
  1794:     "  SET decomposition_status_code = " + sqlLiteral("decomposed") + ",",
  1795:     "      handoff_status_code = " + sqlLiteral("completed") + ",",
  1796:     "      metadata_jsonb = COALESCE(m.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
  1797:     "        " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
  1798:     "        " + sqlLiteral("auto_decomposition_completed_at") + ", now()::text",
  1799:     "      ),",
  1800:     "      updated_at = now()",
  1801:     "  FROM inserted_middle im",
  1802:     "  WHERE m.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",
  1803:     "  RETURNING m.*",
  1804:     "), skipped_existing AS (",
  1805:     "  SELECT m.aicm_manager_major_work_item_id",
  1806:     "  FROM business.aicm_manager_major_work_item m",
  1807:     "  JOIN input_request r ON r.owner_civilization_id = m.owner_civilization_id AND r.aicm_user_company_id = m.aicm_user_company_id",
  1808:     "  WHERE m.decomposition_status_code = " + sqlLiteral("assigned_to_leader"),
  1809:     "    AND m.handoff_status_code = " + sqlLiteral("handed_off"),
  1810:     targetWhere,
  1811:     "    AND EXISTS (",
  1812:     "      SELECT 1",
  1813:     "      FROM business.aicm_leader_middle_work_item existing",
  1814:     "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",
  1815:     "        AND existing.breakdown_status_code <> " + sqlLiteral("archived"),
  1816:     "    )",
  1817:     "), final_items AS (",
  1818:     "  SELECT im.aicm_manager_major_work_item_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id, iw.aicm_worker_work_unit_id, " + sqlLiteral("created") + "::text AS status",
  1819:     "  FROM inserted_middle im",
  1820:     "  LEFT JOIN inserted_requirement ir ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
  1821:     "  LEFT JOIN inserted_worker_unit iw ON iw.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
  1822:     "  UNION ALL",
  1823:     "  SELECT se.aicm_manager_major_work_item_id, NULL::uuid, NULL::uuid, NULL::uuid, " + sqlLiteral("skipped_existing_decomposition") + "::text AS status",
  1824:     "  FROM skipped_existing se",
  1825:     ")",
  1826:     "SELECT jsonb_build_object(",
  1827:     "  " + sqlLiteral("result") + ", " + sqlLiteral("ok") + ",",
  1828:     "  " + sqlLiteral("api_identifier") + ", " + sqlLiteral(SERVER_MARK) + ",",
  1829:     "  " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
  1830:     "  " + sqlLiteral("processed_manager_major_count") + ", (SELECT count(*) FROM updated_manager),",
  1831:     "  " + sqlLiteral("created_leader_middle_count") + ", (SELECT count(*) FROM inserted_middle),",
  1832:     "  " + sqlLiteral("created_deliverable_requirement_count") + ", (SELECT count(*) FROM inserted_requirement),",
  1833:     "  " + sqlLiteral("created_worker_work_unit_count") + ", (SELECT count(*) FROM inserted_worker_unit),",
  1834:     "  " + sqlLiteral("skipped_count") + ", (SELECT count(*) FROM skipped_existing),",
  1835:     "  " + sqlLiteral("items") + ", COALESCE((SELECT jsonb_agg(to_jsonb(final_items)) FROM final_items), '[]'::jsonb)",
  1836:     ")::text;"
  1837:   ].join("\n");
  1838: 
  1839:   return runPsqlJson(sql);
  1840: }
  1841: 
  1842: // AICM_R8Z_A_LEADER_AUTO_DECOMPOSITION_END
  1843: 
  1844: 
  1845: 
  1846: // AICM_R8Z_I_WORKER_AUTO_EXECUTION_SERVER_START
  1847: function aicmR8ZIText(value) {
  1848:   if (value === null || typeof value === "undefined") return "";
  1849:   return String(value).trim();
  1850: }
  1851: 
  1852: function aicmR8ZIOptionalUuidSql(value) {
  1853:   const text = aicmR8ZIText(value);
  1854:   return text ? sqlLiteral(text) + "::uuid" : "NULL";
  1855: }
  1856: 
  1857: function aicmR8ZIJsonSql(value) {
  1858:   return sqlLiteral(JSON.stringify(value || {})) + "::jsonb";
  1859: }
  1860: 
  1861: function workerAutoExecutionCandidatesR8ZI(body) {
  1862:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  1863:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  1864:   const managerMajorId = aicmR8ZIText(body.aicm_manager_major_work_item_id || body.related_manager_major_work_item_id);
  1865:   const workerWorkUnitId = aicmR8ZIText(body.aicm_worker_work_unit_id || body.related_worker_work_unit_id);
  1866:   const limit = Math.max(1, Math.min(20, Number(body.limit || 10)));
  1867: 
  1868:   const managerFilter = managerMajorId
  1869:     ? "    AND w.aicm_manager_major_work_item_id = " + sqlLiteral(managerMajorId) + "::uuid"
  1870:     : "";
  1871: 
  1872:   const workerFilter = workerWorkUnitId
  1873:     ? "    AND w.aicm_worker_work_unit_id = " + sqlLiteral(workerWorkUnitId) + "::uuid"
  1874:     : "";
  1875: 
  1876:   const sql = [
  1877:     "WITH target_units AS (",
  1878:     "  SELECT w.*",
  1879:     "  FROM business.vw_aicm_pmlw_worker_work_unit_display w",
  1880:     "  WHERE w.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
  1881:     "    AND w.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
  1882:     "    AND COALESCE(w.work_status_code, '') = 'todo'",
  1883:     "    AND COALESCE(w.worker_model_code, '') <> ''",
  1884:     "    AND COALESCE(w.assigned_worker_label, '') <> ''",
  1885:     managerFilter,
  1886:     workerFilter,
  1887:     "  ORDER BY w.priority_code DESC, w.created_at ASC, w.display_order ASC",
  1888:     "  LIMIT " + String(limit),
  1889:     "), worker_candidates AS (",
  1890:     "  SELECT",
  1891:     "    u.aicm_worker_work_unit_id,",
  1892:     "    p.aicm_user_company_worker_placement_id,",
  1893:     "    p.owner_civilization_id,",
  1894:     "    p.aicm_user_company_id,",
  1895:     "    p.aicm_user_company_department_id,",
  1896:     "    p.aicm_user_company_section_id,",
  1897:     "    p.aiworker_model_code,",
  1898:     "    p.internal_nickname,",
  1899:     "    COALESCE(v.display_label, NULLIF(p.internal_nickname, '') || '@' || p.role_code, p.aiworker_model_code || '@' || p.role_code) AS display_label,",
  1900:     "    CASE",
  1901:     "      WHEN p.aiworker_model_code = u.worker_model_code AND COALESCE(NULLIF(p.internal_nickname, ''), '') = u.assigned_worker_label THEN 100",
  1902:     "      WHEN p.aiworker_model_code = u.worker_model_code THEN 80",
  1903:     "      WHEN COALESCE(NULLIF(p.internal_nickname, ''), '') = u.assigned_worker_label THEN 60",
  1904:     "      ELSE 10",
  1905:     "    END AS match_score",
  1906:     "  FROM target_units u",
  1907:     "  JOIN business.aicm_user_company_worker_placement p",
  1908:     "    ON p.owner_civilization_id = u.owner_civilization_id",
  1909:     "   AND p.aicm_user_company_id = u.aicm_user_company_id",
  1910:     "   AND p.role_code = 'Worker'",
  1911:     "   AND p.status_code = 'active'",
  1912:     "  LEFT JOIN business.vw_aicm_user_company_worker_placement_display v",
  1913:     "    ON v.aicm_user_company_worker_placement_id = p.aicm_user_company_worker_placement_id",
  1914:     "), ranked AS (",
  1915:     "  SELECT *, row_number() OVER (PARTITION BY aicm_worker_work_unit_id ORDER BY match_score DESC, aicm_user_company_worker_placement_id) AS rn",
  1916:     "  FROM worker_candidates",
  1917:     ")",
  1918:     "SELECT COALESCE(jsonb_agg(",
  1919:     "  jsonb_build_object(",
  1920:     "    'worker_work_unit', to_jsonb(u),",
  1921:     "    'worker_placement', to_jsonb(r)",
  1922:     "  ) ORDER BY u.created_at, u.display_order",
  1923:     "), '[]'::jsonb)::text",
  1924:     "FROM target_units u",
  1925:     "LEFT JOIN ranked r",
  1926:     "  ON r.aicm_worker_work_unit_id = u.aicm_worker_work_unit_id",
  1927:     " AND r.rn = 1;"
  1928:   ].filter(Boolean).join("\n");
  1929: 
  1930:   const result = runPsqlJson(sql);
  1931:   return Array.isArray(result) ? result : [];
  1932: }
  1933: 
  1934: function buildWorkerRuntimeRequestBodyR8ZI(pair) {
  1935:   const unit = pair && pair.worker_work_unit ? pair.worker_work_unit : {};
  1936:   const placement = pair && pair.worker_placement ? pair.worker_placement : {};
  1937: 
  1938:   const unitId = aicmR8ZIText(unit.aicm_worker_work_unit_id);
  1939:   const placementId = aicmR8ZIText(placement.aicm_user_company_worker_placement_id);
  1940:   const modelCode = aicmR8ZIText(placement.aiworker_model_code || unit.worker_model_code);
  1941:   const title = aicmR8ZIText(unit.work_unit_name) || "Worker作業単位";
  1942: 
  1943:   const instructionParts = [
  1944:     unit.work_unit_description,
  1945:     unit.input_context_text,
  1946:     unit.expected_output_text,
  1947:     aicmR8ZIText(unit.reference_files_text) ? "参照ファイル: " + aicmR8ZIText(unit.reference_files_text) : "",
  1948:     aicmR8ZIText(unit.supplemental_materials_text) ? "補足資料: " + aicmR8ZIText(unit.supplemental_materials_text) : "",
  1949:     aicmR8ZIText(unit.applicable_rules_text) ? "会社共通ルール/適用ルール: " + aicmR8ZIText(unit.applicable_rules_text) : ""
  1950:   ].map(aicmR8ZIText).filter(Boolean);
  1951: 
  1952:   if (!unitId) throw new Error("worker_work_unit_id missing");
  1953:   if (!placementId) throw new Error("worker placement missing for " + unitId);
  1954:   if (!modelCode) throw new Error("model_code missing for " + unitId);
  1955:   if (!instructionParts.length) throw new Error("instruction missing for " + unitId);
  1956: 
  1957:   return {
  1958:     owner_civilization_id: aicmR8ZIText(unit.owner_civilization_id),
  1959:     aicm_user_company_id: aicmR8ZIText(unit.aicm_user_company_id),
  1960:     aicm_user_company_department_id: aicmR8ZIText(placement.aicm_user_company_department_id || unit.aicm_user_company_department_id),
  1961:     aicm_user_company_section_id: aicmR8ZIText(placement.aicm_user_company_section_id || unit.aicm_user_company_section_id),
  1962:     aicm_user_company_worker_placement_id: placementId,
  1963:     model_code: modelCode,
  1964:     task_domain_code: aicmR8ZIText(unit.work_type_code) || "business_operation",
  1965:     title,
  1966:     instruction: instructionParts.join("\n\n"),
  1967:     source_request_ref: "aicm_worker_work_unit:" + unitId,
  1968:     source_app_ref: "AICompanyManager",
  1969:     related_worker_work_unit_id: unitId,
  1970:     related_leader_middle_work_item_id: aicmR8ZIText(unit.aicm_leader_middle_work_item_id),
  1971:     related_deliverable_requirement_id: aicmR8ZIText(unit.aicm_leader_deliverable_requirement_id),
  1972:     review_required_flag: ["required", "waiting"].includes(aicmR8ZIText(unit.review_status_code)),
  1973:     priority_code: aicmR8ZIText(unit.priority_code) || "normal"
  1974:   };
  1975: }
  1976: 
  1977: function markWorkerUnitAutoExecutionStartedR8ZI(unitId, runtimePayload) {
  1978:   const unit = requiredUuid(unitId, "aicm_worker_work_unit_id");
  1979: 
  1980:   const metadata = {
  1981:     auto_execution: "worker_runtime_request",
  1982:     auto_execution_version: "r8z_i",
  1983:     source_request_ref: runtimePayload && runtimePayload.request_body ? runtimePayload.request_body.source_request_ref : "",
  1984:     runtime_result: runtimePayload || {},
  1985:     started_at: new Date().toISOString()
  1986:   };
  1987: 
  1988:   const sql = [
  1989:     "UPDATE business.aicm_worker_work_unit",
  1990:     "SET work_status_code = 'in_progress',",
  1991:     "    metadata_jsonb = COALESCE(metadata_jsonb, '{}'::jsonb) || " + aicmR8ZIJsonSql(metadata) + ",",
  1992:     "    updated_at = now()",
  1993:     "WHERE aicm_worker_work_unit_id = " + sqlLiteral(unit) + "::uuid",
  1994:     "  AND work_status_code = 'todo'",
  1995:     "RETURNING jsonb_build_object(",
  1996:     "  'aicm_worker_work_unit_id', aicm_worker_work_unit_id,",
  1997:     "  'work_status_code', work_status_code,",
  1998:     "  'metadata_jsonb', metadata_jsonb",
  1999:     ")::text;"
  2000:   ].join("\n");
  2001: 
  2002:   return runPsqlJson(sql);
  2003: }
  2004: 

===== SNIPPET 7: L2130-L2210 =====
  2130: 
  2131:     if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
  2132:       const body = await readBody(req);
  2133:       sendJson(res, 200, returnHumanReviewItem(body));
  2134:       return true;
  2135:     }
  2136: 
  2137: 
  2138:     if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
  2139:       const body = await readBody(req);
  2140:       sendJson(res, 200, updateCompany(body));
  2141:       return true;
  2142:     }
  2143: 
  2144:     if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
  2145:       const body = await readBody(req);
  2146:       sendJson(res, 200, updateDepartment(body));
  2147:       return true;
  2148:     }
  2149: 
  2150:     // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
  2151:     // UI label "組織変更" is connected to the current section/k課 update responsibility.
  2152:     // Keep this as an explicit compatibility route so future split can be handled here.
  2153:     if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
  2154:       const body = await readBody(req);
  2155:       sendJson(res, 200, updateSection(body));
  2156:       return true;
  2157:     }
  2158: 
  2159:     if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
  2160:       const body = await readBody(req);
  2161:       sendJson(res, 200, updateSection(body));
  2162:       return true;
  2163:     }
  2164: 
  2165: if (route === "/api/aicm/v2/context" && req.method === "GET") {
  2166:       sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
  2167:       return true;
  2168:     }
  2169: 
  2170:     if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
  2171:       sendJson(res, 200, createCompany(await readBody(req)));
  2172:       return true;
  2173:     }
  2174: 
  2175:     if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
  2176:       const payload = createDepartment(await readBody(req));
  2177:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2178:       return true;
  2179:     }
  2180: 
  2181:     if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
  2182:       const payload = createSection(await readBody(req));
  2183:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2184:       return true;
  2185:     }
  2186: 
  2187:     
  2188:     if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
  2189:       const payload = createTaskLedger(await readBody(req));
  2190:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2191:       return true;
  2192:     }
  2193: 
  2194:     if (route === "/api/aicm/v2/placement/sync-role-settings" && req.method === "POST") {
  2195:       const payload = syncRoleSettings(await readBody(req));
  2196:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2197:       return true;
  2198:     }
  2199: 
  2200: if (route === "/api/aicm/v2/placement/create" && req.method === "POST") {
  2201:       const payload = createPlacement(await readBody(req));
  2202:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2203:       return true;
  2204:     }
  2205: 
  2206:     // AICM_WORKER_RUNTIME_REQUEST_ROUTE_AXS_V1
  2207:     if (route === "/api/aicm/v2/worker-auto-execution/run" && req.method === "POST") {
  2208:       const body = await readBody(req);
  2209:       sendJson(res, 200, await runWorkerAutoExecutionR8ZI(body));
  2210:       return true;

============================================================
5. structural candidate block extraction
============================================================
SERVER_BLOCKS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/022_server_candidate_blocks.txt

===== BLOCK 1: target=/api/aicm/v2/context L2165-L2297 =====
  2165: if (route === "/api/aicm/v2/context" && req.method === "GET") {
  2166:       sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
  2167:       return true;
  2168:     }
  2169: 
  2170:     if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
  2171:       sendJson(res, 200, createCompany(await readBody(req)));
  2172:       return true;
  2173:     }
  2174: 
  2175:     if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
  2176:       const payload = createDepartment(await readBody(req));
  2177:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2178:       return true;
  2179:     }
  2180: 
  2181:     if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
  2182:       const payload = createSection(await readBody(req));
  2183:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2184:       return true;
  2185:     }
  2186: 
  2187:     
  2188:     if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
  2189:       const payload = createTaskLedger(await readBody(req));
  2190:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2191:       return true;
  2192:     }
  2193: 
  2194:     if (route === "/api/aicm/v2/placement/sync-role-settings" && req.method === "POST") {
  2195:       const payload = syncRoleSettings(await readBody(req));
  2196:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2197:       return true;
  2198:     }
  2199: 
  2200: if (route === "/api/aicm/v2/placement/create" && req.method === "POST") {
  2201:       const payload = createPlacement(await readBody(req));
  2202:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2203:       return true;
  2204:     }
  2205: 
  2206:     // AICM_WORKER_RUNTIME_REQUEST_ROUTE_AXS_V1
  2207:     if (route === "/api/aicm/v2/worker-auto-execution/run" && req.method === "POST") {
  2208:       const body = await readBody(req);
  2209:       sendJson(res, 200, await runWorkerAutoExecutionR8ZI(body));
  2210:       return true;
  2211:     }
  2212:     if (route === "/api/aicm/v2/worker-runtime/request" && req.method === "POST") {
  2213:       const payload = await createWorkerRuntimeRequest(await readBody(req));
  2214:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2215:       return true;
  2216:     }
  2217: 
  2218:     
  2219:     // AICM_RUNTIME_STATUS_PANEL_AXT_R9_R1_V1
  2220:     if (route === "/api/aicm/v2/worker-runtime/pipeline-board" && req.method === "GET") {
  2221:       const payload = await aicmRuntimeStatusAiworkerGet("/aiworker/v1/runtime-execution/pipeline-board", url.searchParams);
  2222:       sendJson(res, payload && payload.result === "error" ? 502 : 200, payload);
  2223:       return true;
  2224:     }
  2225: 
  2226:     if (route === "/api/aicm/v2/worker-runtime/app-read-payload" && req.method === "GET") {
  2227:       const payload = await aicmRuntimeStatusAiworkerGet("/aiworker/v1/runtime-execution/app-read-payload", url.searchParams);
  2228:       sendJson(res, payload && payload.result === "error" ? 502 : 200, payload);
  2229:       return true;
  2230:     }
  2231: 
  2232:     if (route.startsWith("/api/aicm/v2/")) {
  2233:       sendJson(res, 404, {
  2234:         result: "error",
  2235:         api_identifier: SERVER_MARK,
  2236:         error_message: "unknown v2 endpoint"
  2237:       });
  2238:       return true;
  2239:     }
  2240: 
  2241:     return false;
  2242:   } catch (error) {
  2243:     sendJson(res, 500, {
  2244:       result: "error",
  2245:       api_identifier: SERVER_MARK,
  2246:       error_message: safePublicError(error)
  2247:     });
  2248:     return true;
  2249:   }
  2250: }
  2251: 
  2252: function safeStaticPath(urlPath) {
  2253:   const raw = urlPath === "/" ? "/index.html" : urlPath;
  2254:   const decoded = decodeURIComponent(raw);
  2255:   const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  2256:   const full = path.resolve(APP_ROOT, "." + normalized);
  2257: 
  2258:   if (!full.startsWith(APP_ROOT)) {
  2259:     return null;
  2260:   }
  2261: 
  2262:   return full;
  2263: }
  2264: 
  2265: function serveStatic(req, res, url) {
  2266:   const filePath = safeStaticPath(url.pathname);
  2267: 
  2268:   if (!filePath) {
  2269:     sendText(res, 403, "text/plain; charset=utf-8", "Forbidden");
  2270:     return;
  2271:   }
  2272: 
  2273:   fs.readFile(filePath, (error, data) => {
  2274:     if (error) {
  2275:       sendText(res, 404, "text/plain; charset=utf-8", "Not found");
  2276:       return;
  2277:     }
  2278: 
  2279:     const ext = path.extname(filePath).toLowerCase();
  2280:     sendText(res, 200, MIME[ext] || "application/octet-stream", data);
  2281:   });
  2282: }
  2283: 
  2284: const server = http.createServer(async (req, res) => {
  2285:   const url = new URL(req.url || "/", "http://127.0.0.1");
  2286: 
  2287:   if (await handleApi(req, res, url)) {
  2288:     return;
  2289:   }
  2290: 
  2291:   serveStatic(req, res, url);
  2292: });
  2293: 
  2294: server.listen(PORT, "127.0.0.1", () => {
  2295:   console.log("AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:" + PORT);
  2296: });
  2297: 

===== BLOCK 2: target=review_wait_items L726-L948 =====
   726: function getContext(ownerCivilizationId) {
   727:   const owner = requiredUuid(ownerCivilizationId, "owner_civilization_id");
   728: 
   729:   const sql = [
   730:     "SELECT jsonb_build_object(",
   731:     "  'result', 'ok',",
   732:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   733:     "  'owner_civilization_id', " + sqlLiteral(owner) + ",",
   734:     "  'companies', (",
   735:     "    SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC), '[]'::jsonb)",
   736:     "    FROM business.aicm_user_company c",
   737:     "    WHERE c.owner_civilization_id::text = " + sqlLiteral(owner),
   738:     "      AND c.company_status = 'active'",
   739:     "  ),",
   740:     "  'departments', (",
   741:     "    SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.display_order, d.created_at), '[]'::jsonb)",
   742:     "    FROM business.aicm_user_company_department d",
   743:     "    WHERE d.owner_civilization_id::text = " + sqlLiteral(owner),
   744:     "      AND d.department_status = 'active'",
   745:     "  ),",
   746:     "  'sections', (",
   747:     "    SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.display_order, s.created_at), '[]'::jsonb)",
   748:     "    FROM business.aicm_user_company_section s",
   749:     "    WHERE s.owner_civilization_id::text = " + sqlLiteral(owner),
   750:     "      AND s.section_status = 'active'",
   751:     "  ),",
   752:     "  'placements', (",
   753:     "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb)",
   754:     "    FROM business.vw_aicm_user_company_worker_placement_display p",
   755:     "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
   756:     "      AND p.status_code = 'active'",
   757:     "  ),",
   758:     "  'task_ledger', (",
   759:     "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.display_order, t.created_at DESC), '[]'::jsonb)",
   760:     "    FROM business.vw_aicm_user_company_department_task_ledger_display t",
   761:     "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
   762:     "      AND t.task_status_code <> 'archived'",
   763:     "  ),",
   764:     // AICM_PMLW_GETCONTEXT_SQL_EXTENSION_AQP_AQS_V1
   765:     "  'pmlw_president_policies', (",
   766:     "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.display_order ASC, p.updated_at DESC, p.created_at DESC), '[]'::jsonb)",
   767:     "    FROM business.vw_aicm_pmlw_president_policy_display p",
   768:     "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
   769:     "  ),",
   770:     "  'pmlw_major_items', (",
   771:     "    SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order ASC, m.updated_at DESC, m.created_at DESC), '[]'::jsonb)",
   772:     "    FROM business.vw_aicm_pmlw_major_work_display m",
   773:     "    WHERE m.owner_civilization_id::text = " + sqlLiteral(owner),
   774:     "  ),",
   775:     "  'pmlw_middle_items', (",
   776:     "    SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.display_order ASC, l.updated_at DESC, l.created_at DESC), '[]'::jsonb)",
   777:     "    FROM business.vw_aicm_pmlw_leader_middle_display l",
   778:     "    WHERE l.owner_civilization_id::text = " + sqlLiteral(owner),
   779:     "  ),",
   780:     "  'pmlw_deliverable_requirements', (",
   781:     "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.display_order ASC, r.updated_at DESC, r.created_at DESC), '[]'::jsonb)",
   782:     "    FROM business.vw_aicm_pmlw_deliverable_requirement_display r",
   783:     "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
   784:     "  ),",
   785:     "  'pmlw_worker_work_units', (",
   786:     "    SELECT COALESCE(jsonb_agg(to_jsonb(w) ORDER BY w.display_order ASC, w.updated_at DESC, w.created_at DESC), '[]'::jsonb)",
   787:     "    FROM business.vw_aicm_pmlw_worker_work_unit_display w",
   788:     "    WHERE w.owner_civilization_id::text = " + sqlLiteral(owner),
   789:     "  ),",
   790:     "  'pmlw_workflow_tree', (",
   791:     "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.last_updated_at DESC NULLS LAST), '[]'::jsonb)",
   792:     "    FROM business.vw_aicm_pmlw_workflow_tree t",
   793:     "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
   794:     "  ),",
   795:     // AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1_CONTEXT
   796:     "  'review_wait_items', (",
   797:     "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.priority_code DESC, r.requested_at DESC, r.created_at DESC), '[]'::jsonb)",
   798:     "    FROM business.vw_aicm_human_review_wait_display r",
   799:     "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
   800:     "  ),",
   801:     "  'robot_catalog', (",
   802:     "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.aiworker_model_code), '[]'::jsonb)",
   803:     "    FROM business.vw_ai_company_manager_system_robot_selector_options r",
   804:     "  )",
   805:     ")::text;"
   806:   ].join("\n");
   807: 
   808:   return runPsqlJson(sql);
---- SERVER_BLOCKS tail ----
   565:     ")::text",
   566:     "FROM inserted;"
   567:   ].join("\n");
   568: 
   569:   return runPsqlJson(sql);
   570: }
   571: 
   572: function approveHumanReviewItem(body) {
   573:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   574:   const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
   575: 
   576:   const sql = [
   577:     "WITH updated AS (",
   578:     "  UPDATE business.aicm_human_review_item",
   579:     "  SET human_review_status_code = 'approved',",
   580:     "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
   581:     "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
   582:     "      reviewed_at = now(),",
   583:     "      updated_at = now()",
   584:     "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
   585:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   586:     "  RETURNING *",
   587:     ")",
   588:     "SELECT jsonb_build_object(",
   589:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   590:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   591:     "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   592:     ")::text;"
   593:   ].join("\n");
   594: 
   595:   return runPsqlJson(sql);
   596: }
   597: 
   598: function returnHumanReviewItem(body) {
   599:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   600:   const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
   601: 
   602:   const sql = [
   603:     "WITH updated AS (",
   604:     "  UPDATE business.aicm_human_review_item",
   605:     "  SET human_review_status_code = 'returned',",
   606:     "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
   607:     "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
   608:     "      reviewed_at = now(),",
   609:     "      updated_at = now()",
   610:     "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
   611:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   612:     "  RETURNING *",
   613:     ")",
   614:     "SELECT jsonb_build_object(",
   615:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   616:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   617:     "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   618:     ")::text;"
   619:   ].join("\n");
   620: 
   621:   return runPsqlJson(sql);
   622: }
   623: 
   624: 
   625: 
   626: // AICM_COMPANY_DEPT_SECTION_UPDATE_ARU_ARX_V1
   627: // Company / Department / Section update functions.
   628: // Uses existing SQL-array + runPsqlJson(sql) pattern only.
   629: // No new Pool, no new DB helper, no new connection path.
   630: 
   631: function aicmOrgUpdateOptionalText(value) {
   632:   return String(value || "").trim();
   633: }
   634: 
   635: function aicmOrgUpdateTextSql(value) {
   636:   return sqlLiteral(String(value || ""));
   637: }
   638: 
   639: function aicmOrgUpdateStatus(value, allowed, fallback) {
   640:   const text = String(value || fallback).trim();
   641:   return allowed.includes(text) ? text : fallback;
   642: }
   643: 
   644: function updateCompany(body) {
   645:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   646:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
   647:   const name = requiredText(body.company_name || body.companyName, "company_name");
   648: 
   649:   const sql = [
   650:     "WITH updated AS (",
   651:     "  UPDATE business.aicm_user_company",
   652:     "  SET company_name = " + sqlLiteral(name) + ",",
   653:     "      business_domain = " + aicmOrgUpdateTextSql(body.business_domain || body.businessDomain) + ",",
   654:     "      company_common_rules_text = " + aicmOrgUpdateTextSql(body.company_common_rules_text || body.companyCommonRulesText) + ",",
   655:     "      president_policy_instruction_text = " + aicmOrgUpdateTextSql(body.president_policy_instruction_text || body.presidentPolicyInstructionText) + ",",
   656:     "      updated_at = now()",
   657:     "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
   658:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   659:     "  RETURNING *",
   660:     ")",
   661:     "SELECT jsonb_build_object(",
   662:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   663:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   664:     "  'company', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   665:     ")::text;"
   666:   ].join("\n");
   667: 
   668:   return runPsqlJson(sql);
   669: }
   670: 
   671: function updateDepartment(body) {
   672:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   673:   const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
   674:   const name = requiredText(body.department_name || body.departmentName, "department_name");
   675:   const status = aicmOrgUpdateStatus(body.department_status || body.department_status_code, ["active", "inactive", "archived"], "active");
   676: 
   677:   const sql = [
   678:     "WITH updated AS (",
   679:     "  UPDATE business.aicm_user_company_department",
   680:     "  SET department_name = " + sqlLiteral(name) + ",",
   681:     "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
   682:     "      department_status = " + sqlLiteral(status) + ",",
   683:     "      updated_at = now()",
   684:     "  WHERE aicm_use

============================================================
6. response writer scan with nearby context
============================================================

===== WRITER NEAR L1858 =====
  1846: // AICM_R8Z_I_WORKER_AUTO_EXECUTION_SERVER_START
  1847: function aicmR8ZIText(value) {
  1848:   if (value === null || typeof value === "undefined") return "";
  1849:   return String(value).trim();
  1850: }
  1851: 
  1852: function aicmR8ZIOptionalUuidSql(value) {
  1853:   const text = aicmR8ZIText(value);
  1854:   return text ? sqlLiteral(text) + "::uuid" : "NULL";
  1855: }
  1856: 
  1857: function aicmR8ZIJsonSql(value) {
  1858:   return sqlLiteral(JSON.stringify(value || {})) + "::jsonb";
  1859: }
  1860: 
  1861: function workerAutoExecutionCandidatesR8ZI(body) {
  1862:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  1863:   const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  1864:   const managerMajorId = aicmR8ZIText(body.aicm_manager_major_work_item_id || body.related_manager_major_work_item_id);
  1865:   const workerWorkUnitId = aicmR8ZIText(body.aicm_worker_work_unit_id || body.related_worker_work_unit_id);
  1866:   const limit = Math.max(1, Math.min(20, Number(body.limit || 10)));
  1867: 
  1868:   const managerFilter = managerMajorId
  1869:     ? "    AND w.aicm_manager_major_work_item_id = " + sqlLiteral(managerMajorId) + "::uuid"
  1870:     : "";

===== WRITER NEAR L2107 =====
  2095:       sendJson(res, 200, updateManagerMajorItem(body));
  2096:       return true;
  2097:     }
  2098: 
  2099:     
  2100:     if (route === "/api/aicm/v2/leader-auto-decomposition/run" && req.method === "POST") {
  2101:       const body = await readBody(req);
  2102:       sendJson(res, 200, runLeaderAutoDecomposition(body));
  2103:       return true;
  2104:     }
  2105: if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
  2106:       const body = await readBody(req);
  2107:       sendJson(res, 200, archiveManagerMajorItem(body));
  2108:       return true;
  2109:     }
  2110: 
  2111: // AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
  2112:     if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
  2113:       const body = await readBody(req);
  2114:       sendJson(res, 200, importManagerMajorItemsCsv(body));
  2115:       return true;
  2116:     }
  2117: 
  2118: 
  2119:     if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {

===== WRITER NEAR L2114 =====
  2102:       sendJson(res, 200, runLeaderAutoDecomposition(body));
  2103:       return true;
  2104:     }
  2105: if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
  2106:       const body = await readBody(req);
  2107:       sendJson(res, 200, archiveManagerMajorItem(body));
  2108:       return true;
  2109:     }
  2110: 
  2111: // AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
  2112:     if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
  2113:       const body = await readBody(req);
  2114:       sendJson(res, 200, importManagerMajorItemsCsv(body));
  2115:       return true;
  2116:     }
  2117: 
  2118: 
  2119:     if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
  2120:       const body = await readBody(req);
  2121:       sendJson(res, 200, createHumanReviewItem(body));
  2122:       return true;
  2123:     }
  2124: 
  2125:     if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
  2126:       const body = await readBody(req);

===== WRITER NEAR L2121 =====
  2109:     }
  2110: 
  2111: // AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
  2112:     if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
  2113:       const body = await readBody(req);
  2114:       sendJson(res, 200, importManagerMajorItemsCsv(body));
  2115:       return true;
  2116:     }
  2117: 
  2118: 
  2119:     if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
  2120:       const body = await readBody(req);
  2121:       sendJson(res, 200, createHumanReviewItem(body));
  2122:       return true;
  2123:     }
  2124: 
  2125:     if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
  2126:       const body = await readBody(req);
  2127:       sendJson(res, 200, approveHumanReviewItem(body));
  2128:       return true;
  2129:     }
  2130: 
  2131:     if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
  2132:       const body = await readBody(req);
  2133:       sendJson(res, 200, returnHumanReviewItem(body));

===== WRITER NEAR L2127 =====
  2115:       return true;
  2116:     }
  2117: 
  2118: 
  2119:     if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
  2120:       const body = await readBody(req);
  2121:       sendJson(res, 200, createHumanReviewItem(body));
  2122:       return true;
  2123:     }
  2124: 
  2125:     if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
  2126:       const body = await readBody(req);
  2127:       sendJson(res, 200, approveHumanReviewItem(body));
  2128:       return true;
  2129:     }
  2130: 
  2131:     if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
  2132:       const body = await readBody(req);
  2133:       sendJson(res, 200, returnHumanReviewItem(body));
  2134:       return true;
  2135:     }
  2136: 
  2137: 
  2138:     if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
  2139:       const body = await readBody(req);

===== WRITER NEAR L2133 =====
  2121:       sendJson(res, 200, createHumanReviewItem(body));
  2122:       return true;
  2123:     }
  2124: 
  2125:     if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
  2126:       const body = await readBody(req);
  2127:       sendJson(res, 200, approveHumanReviewItem(body));
  2128:       return true;
  2129:     }
  2130: 
  2131:     if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
  2132:       const body = await readBody(req);
  2133:       sendJson(res, 200, returnHumanReviewItem(body));
  2134:       return true;
  2135:     }
  2136: 
  2137: 
  2138:     if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
  2139:       const body = await readBody(req);
  2140:       sendJson(res, 200, updateCompany(body));
  2141:       return true;
  2142:     }
  2143: 
  2144:     if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
  2145:       const body = await readBody(req);

===== WRITER NEAR L2140 =====
  2128:       return true;
  2129:     }
  2130: 
  2131:     if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
  2132:       const body = await readBody(req);
  2133:       sendJson(res, 200, returnHumanReviewItem(body));
  2134:       return true;
  2135:     }
  2136: 
  2137: 
  2138:     if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
  2139:       const body = await readBody(req);
  2140:       sendJson(res, 200, updateCompany(body));
  2141:       return true;
  2142:     }
  2143: 
  2144:     if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
  2145:       const body = await readBody(req);
  2146:       sendJson(res, 200, updateDepartment(body));
  2147:       return true;
  2148:     }
  2149: 
  2150:     // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
  2151:     // UI label "組織変更" is connected to the current section/k課 update responsibility.
  2152:     // Keep this as an explicit compatibility route so future split can be handled here.

===== WRITER NEAR L2146 =====
  2134:       return true;
  2135:     }
  2136: 
  2137: 
  2138:     if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
  2139:       const body = await readBody(req);
  2140:       sendJson(res, 200, updateCompany(body));
  2141:       return true;
  2142:     }
  2143: 
  2144:     if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
  2145:       const body = await readBody(req);
  2146:       sendJson(res, 200, updateDepartment(body));
  2147:       return true;
  2148:     }
  2149: 
  2150:     // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
  2151:     // UI label "組織変更" is connected to the current section/k課 update responsibility.
  2152:     // Keep this as an explicit compatibility route so future split can be handled here.
  2153:     if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
  2154:       const body = await readBody(req);
  2155:       sendJson(res, 200, updateSection(body));
  2156:       return true;
  2157:     }
  2158: 

===== WRITER NEAR L2155 =====
  2143: 
  2144:     if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
  2145:       const body = await readBody(req);
  2146:       sendJson(res, 200, updateDepartment(body));
  2147:       return true;
  2148:     }
  2149: 
  2150:     // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
  2151:     // UI label "組織変更" is connected to the current section/k課 update responsibility.
  2152:     // Keep this as an explicit compatibility route so future split can be handled here.
  2153:     if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
  2154:       const body = await readBody(req);
  2155:       sendJson(res, 200, updateSection(body));
  2156:       return true;
  2157:     }
  2158: 
  2159:     if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
  2160:       const body = await readBody(req);
  2161:       sendJson(res, 200, updateSection(body));
  2162:       return true;
  2163:     }
  2164: 
  2165: if (route === "/api/aicm/v2/context" && req.method === "GET") {
  2166:       sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
  2167:       return true;

===== WRITER NEAR L2161 =====
  2149: 
  2150:     // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
  2151:     // UI label "組織変更" is connected to the current section/k課 update responsibility.
  2152:     // Keep this as an explicit compatibility route so future split can be handled here.
  2153:     if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
  2154:       const body = await readBody(req);
  2155:       sendJson(res, 200, updateSection(body));
  2156:       return true;
  2157:     }
  2158: 
  2159:     if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
  2160:       const body = await readBody(req);
  2161:       sendJson(res, 200, updateSection(body));
  2162:       return true;
  2163:     }
  2164: 
  2165: if (route === "/api/aicm/v2/context" && req.method === "GET") {
  2166:       sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
  2167:       return true;
  2168:     }
  2169: 
  2170:     if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
  2171:       sendJson(res, 200, createCompany(await readBody(req)));
  2172:       return true;
  2173:     }

===== WRITER NEAR L2166 =====
  2154:       const body = await readBody(req);
  2155:       sendJson(res, 200, updateSection(body));
  2156:       return true;
  2157:     }
  2158: 
  2159:     if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
  2160:       const body = await readBody(req);
  2161:       sendJson(res, 200, updateSection(body));
  2162:       return true;
  2163:     }
  2164: 
  2165: if (route === "/api/aicm/v2/context" && req.method === "GET") {
  2166:       sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
  2167:       return true;
  2168:     }
  2169: 
  2170:     if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
  2171:       sendJson(res, 200, createCompany(await readBody(req)));
  2172:       return true;
  2173:     }
  2174: 
  2175:     if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
  2176:       const payload = createDepartment(await readBody(req));
  2177:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2178:       return true;

===== WRITER NEAR L2171 =====
  2159:     if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
  2160:       const body = await readBody(req);
  2161:       sendJson(res, 200, updateSection(body));
  2162:       return true;
  2163:     }
  2164: 
  2165: if (route === "/api/aicm/v2/context" && req.method === "GET") {
  2166:       sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
  2167:       return true;
  2168:     }
  2169: 
  2170:     if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
  2171:       sendJson(res, 200, createCompany(await readBody(req)));
  2172:       return true;
  2173:     }
  2174: 
  2175:     if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
  2176:       const payload = createDepartment(await readBody(req));
  2177:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2178:       return true;
  2179:     }
  2180: 
  2181:     if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
  2182:       const payload = createSection(await readBody(req));
  2183:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);

===== WRITER NEAR L2177 =====
  2165: if (route === "/api/aicm/v2/context" && req.method === "GET") {
  2166:       sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
  2167:       return true;
  2168:     }
  2169: 
  2170:     if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
  2171:       sendJson(res, 200, createCompany(await readBody(req)));
  2172:       return true;
  2173:     }
  2174: 
  2175:     if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
  2176:       const payload = createDepartment(await readBody(req));
  2177:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2178:       return true;
  2179:     }
  2180: 
  2181:     if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
  2182:       const payload = createSection(await readBody(req));
  2183:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2184:       return true;
  2185:     }
  2186: 
  2187:     
  2188:     if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
  2189:       const payload = createTaskLedger(await readBody(req));

===== WRITER NEAR L2183 =====
  2171:       sendJson(res, 200, createCompany(await readBody(req)));
  2172:       return true;
  2173:     }
  2174: 
  2175:     if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
  2176:       const payload = createDepartment(await readBody(req));
  2177:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2178:       return true;
  2179:     }
  2180: 
  2181:     if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
  2182:       const payload = createSection(await readBody(req));
  2183:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2184:       return true;
  2185:     }
  2186: 
  2187:     
  2188:     if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
  2189:       const payload = createTaskLedger(await readBody(req));
  2190:       sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
  2191:       return true;
  2192:     }
  2193: 
  2194:     if (route === "/api/aicm/v2/placement/sync-role-settings" && req.method === "POST") {
  2195:       const payload = syncRoleSettings(await readBody(req));

============================================================
7. reuse latest V8B hit summary
============================================================
LATEST_V8B_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714
---- latest V8B final report ----
  FINAL_JUDGEMENT=NO_CONTEXT_AND_DB_COUNT_UNCLEAR_CHECK_DB_VIEW_OR_IDS
REQUEST_FOUND=YES
TITLE_FOUND=YES
STATUS_HAS_REVIEW_WAITING=NO
CONTEXT_HAS_KNOWN=NO
FINAL_JUDGEMENT=DB_TARGET_FOUND_CONTEXT_EXPOSURE_OR_FILTER_MISMATCH
REQ_HIT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/030_request_id_hit_scan.txt
TITLE_HIT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/031_title_hit_scan.txt
STATUS_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/032_status_count_scan.txt

---- request id hits ----
aiworker.runtime_execution_event_log|request_id|2
aiworker.runtime_execution_request|request_id|2
aiworker.runtime_handoff_packet|request_id|2
aiworker.runtime_review_gate_log|request_id|4
aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1|request_id|2
aiworker.vw_app_aiworker_runtime_execution_gate_board_v1|request_id|4
aiworker.vw_app_aiworker_runtime_execution_intake_payload_v1|request_id|2
aiworker.vw_app_aiworker_runtime_execution_request_board_v1|request_id|2
aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1|request_id|2
aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1|request_id|2
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_compiled_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_compiled_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_compiled_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_compiled_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_compiled_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_intersection_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_intersection_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_intersection_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_intersection_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_latest_decisions"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_latest_intersection_decisions"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_request_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"

---- title hits ----
aiworker.runtime_execution_request|task_instruction_ja|2|President方針をManager大項目へ変換して開発業務を開始する流れを整理する

Manager大項目: AI企業業務開始導線の整備
President方針をManager大項目へ変換して開発業務を開始する流れを整理する

指定された大項目について、実行可能な成果物または作業結果を作成する || 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする

Manager大項目: Manager大項目台帳運用の整備
粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする

指定された大項目について、実行可能な成果物または作業結果を作成する
aiworker.runtime_execution_request|task_title|2|AI企業業務開始導線の整備 作業 || Manager大項目台帳運用の整備 作業
aiworker.runtime_handoff_packet|handoff_payload_jsonb|2|{"safety": {"pg_apply_allowed_flag": false, "destructive_action_allowed_flag": false, "external_execution_allowed_flag": false}, "model_no": "BYD1-003", "model_code": "byd1_003_asic_workers3", "request_id": "1c2fceb2-4f1a-4dd4-8cc7-63d7d529 || {"safety": {"pg_apply_allowed_flag": false, "destructive_action_allowed_flag": false, "external_execution_allowed_flag": false}, "model_no": "BYD1-003", "model_code": "byd1_003_asic_workers3", "request_id": "569fc089-2771-4616-9c3b-0a93698b
aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1|app_read_payload_jsonb|2|{"gates": [{"created_at": "2026-05-02T13:48:19.638748+00:00", "gate_type_code": "REVIEW_REQUIRED", "gate_result_code": "PENDING", "gate_status_code": "TODO", "review_summary_ja": "Runtime Control Profileによりレビューゲートが必要", "reviewer_role_layer_ || {"gates": [{"created_at": "2026-05-02T13:48:22.056743+00:00", "gate_type_code": "REVIEW_REQUIRED", "gate_result_code": "PENDING", "gate_status_code": "TODO", "review_summary_ja": "Runtime Control Profileによりレビューゲートが必要", "reviewer_role_layer_
aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1|task_title|2|AI企業業務開始導線の整備 作業 || Manager大項目台帳運用の整備 作業
aiworker.vw_app_aiworker_runtime_execution_gate_board_v1|task_title|4|AI企業業務開始導線の整備 作業 || Manager大項目台帳運用の整備 作業
aiworker.vw_app_aiworker_runtime_execution_intake_payload_v1|intake_payload_jsonb|2|{"safety": {"review_required_flag": true, "pg_apply_allowed_flag": false, "human_go_required_flag": true, "destructive_action_allowed_flag": false, "external_execution_allowed_flag": false}, "model_no": "BYD1-003", "model_code": "byd1_003_a
aiworker.vw_app_aiworker_runtime_execution_request_board_v1|task_title|2|AI企業業務開始導線の整備 作業 || Manager大項目台帳運用の整備 作業
aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1|task_title|2|AI企業業務開始導線の整備 作業 || Manager大項目台帳運用の整備 作業
aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1|handoff_payload_jsonb|2|{"safety": {"pg_apply_allowed_flag": false, "destructive_action_allowed_flag": false, "external_execution_allowed_flag": false}, "model_no": "BYD1-003", "model_code": "byd1_003_asic_workers3", "request_id": "1c2fceb2-4f1a-4dd4-8cc7-63d7d529 || {"safety": {"pg_apply_allowed_flag": false, "destructive_action_allowed_flag": false, "external_execution_allowed_flag": false}, "model_no": "BYD1-003", "model_code": "byd1_003_asic_workers3", "request_id": "569fc089-2771-4616-9c3b-0a93698b
aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1|task_title|2|AI企業業務開始導線の整備 作業 || Manager大項目台帳運用の整備 作業
business.aicm_human_review_item|ai_review_result_text|2|AIWorkerOS成果物回収済み。Worker自動実行後の納品サマリー確認待ち。
business.aicm_human_review_item|delivery_summary_text|2|AIWorkerOS成果物回収: AI企業業務開始導線の整備 作業 / President方針をManager大項目へ変換して開発業務を開始する流れを整理する Manager大項目: AI企業業務開始導線の整備 President方針をManager大項目へ変換して開発業務を開始する流れを整理する 指定された大項目について、実行可能な成果物または作業結果を作成する || AIWorkerOS成果物回収: Manager大項目台帳運用の整備 作業 / 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする Manager大項目: Manager大項目台帳運用の整備 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする 指定された大項目について、実行可能な成果物または作業結果を作成する
business.aicm_human_review_item|review_title|2|納品サマリー確認: AI企業業務開始導線の整備 作業 || 納品サマリー確認: Manager大項目台帳運用の整備 作業
business.aicm_leader_deliverable_requirement|deliverable_name|2|AI企業業務開始導線の整備 成果物 || Manager大項目台帳運用の整備 成果物
business.aicm_leader_middle_work_item|middle_item_name|2|AI企業業務開始導線の整備 || Manager大項目台帳運用の整備
business.aicm_worker_work_unit|input_context_text|2|Manager大項目: AI企業業務開始導線の整備
President方針をManager大項目へ変換して開発業務を開始する流れを整理する || Manager大項目: Manager大項目台帳運用の整備
粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする
business.aicm_worker_work_unit|metadata_jsonb|2|{"started_at": "2026-05-02T13:48:19.028Z", "auto_execution": "worker_runtime_request", "runtime_result": {"result": "ok", "request_body": {"title": "AI企業業務開始導線の整備 作業", "model_code": "BYD1-003", "instruction": "President方針をManager大項目へ変換して開発業 || {"started_at": "2026-05-02T13:48:21.338Z", "auto_execution": "worker_runtime_request", "runtime_result": {"result": "ok", "request_body": {"title": "Manager大項目台帳運用の整備 作業", "model_code": "BYD1-003", "instruction": "粗い業務領域を台帳へ登録しLeaderへ渡せる状態に
business.aicm_worker_work_unit|result_summary_text|2|AIWorkerOS成果物回収: AI企業業務開始導線の整備 作業 / President方針をManager大項目へ変換して開発業務を開始する流れを整理する Manager大項目: AI企業業務開始導線の整備 President方針をManager大項目へ変換して開発業務を開始する流れを整理する 指定された大項目について、実行可能な成果物または作業結果を作成する || AIWorkerOS成果物回収: Manager大項目台帳運用の整備 作業 / 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする Manager大項目: Manager大項目台帳運用の整備 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする 指定された大項目について、実行可能な成果物または作業結果を作成する
business.aicm_worker_work_unit|work_unit_name|2|AI企業業務開始導線の整備 作業 || Manager大項目台帳運用の整備 作業
business.vw_aicm_human_review_wait_display|ai_review_result_text|2|AIWorkerOS成果物回収済み。Worker自動実行後の納品サマリー確認待ち。
business.vw_aicm_human_review_wait_display|delivery_summary_text|2|AIWorkerOS成果物回収: AI企業業務開始導線の整備 作業 / President方針をManager大項目へ変換して開発業務を開始する流れを整理する Manager大項目: AI企業業務開始導線の整備 President方針をManager大項目へ変換して開発業務を開始する流れを整理する 指定された大項目について、実行可能な成果物または作業結果を作成する || AIWorkerOS成果物回収: Manager大項目台帳運用の整備 作業 / 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする Manager大項目: Manager大項目台帳運用の整備 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする 指定された大項目について、実行可能な成果物または作業結果を作成する
business.vw_aicm_human_review_wait_display|review_title|2|納品サマリー確認: AI企業業務開始導線の整備 作業 || 納品サマリー確認: Manager大項目台帳運用の整備 作業
business.vw_aicm_pmlw_deliverable_requirement_display|deliverable_name|2|AI企業業務開始導線の整備 成果物 || Manager大項目台帳運用の整備 成果物
business.vw_aicm_pmlw_deliverable_requirement_display|major_item_name|2|AI企業業務開始導線の整備 || Manager大項目台帳運用の整備
business.vw_aicm_pmlw_deliverable_requirement_display|middle_item_name|2|AI企業業務開始導線の整備 || Manager大項目台帳運用の整備
business.vw_aicm_pmlw_leader_middle_display|major_item_name|2|AI企業業務開始導線の整備 || Manager大項目台帳運用の整備
business.vw_aicm_pmlw_leader_middle_display|middle_item_name|2|AI企業業務開始導線の整備 || Manager大項目台帳運用の整備
business.vw_aicm_pmlw_major_work_display|major_item_name|3|AI企業業務開始導線の整備 || AI企業業務開始導線整理 || Manager大項目台帳運用の整備
business.vw_aicm_pmlw_worker_work_unit_display|deliverable_name|2|AI企業業務開始導線の整備 成果物 || Manager大項目台帳運用の整備 成果物
business.vw_aicm_pmlw_worker_work_unit_display|input_context_text|2|Manager大項目: AI企業業務開始導線の整備
President方針をManager大項目へ変換して開発業務を開始する流れを整理する || Manager大項目: Manager大項目台帳運用の整備
粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする
business.vw_aicm_pmlw_worker_work_unit_display|major_item_name|2|AI企業業務開始導線の整備 || Manager大項目台帳運用の整備
business.vw_aicm_pmlw_worker_work_unit_display|metadata_jsonb|2|{"started_at": "2026-05-02T13:48:19.028Z", "auto_execution": "worker_runtime_request", "runtime_result": {"result": "ok", "request_body": {"title": "AI企業業務開始導線の整備 作業", "model_code": "BYD1-003", "instruction": "President方針をManager大項目へ変換して開発業 || {"started_at": "2026-05-02T13:48:21.338Z", "auto_execution": "worker_runtime_request", "runtime_result": {"result": "ok", "request_body": {"title": "Manager大項目台帳運用の整備 作業", "model_code": "BYD1-003", "instruction": "粗い業務領域を台帳へ登録しLeaderへ渡せる状態に
business.vw_aicm_pmlw_worker_work_unit_display|middle_item_name|2|AI企業業務開始導線の整備 || Manager大項目台帳運用の整備
business.vw_aicm_pmlw_worker_work_unit_display|result_summary_text|2|AIWorkerOS成果物回収: AI企業業務開始導線の整備 作業 / President方針をManager大項目へ変換して開発業務を開始する流れを整理する Manager大項目: AI企業業務開始導線の整備 President方針をManager大項目へ変換して開発業務を開始する流れを整理する 指定された大項目について、実行可能な成果物または作業結果を作成する || AIWorkerOS成果物回収: Manager大項目台帳運用の整備 作業 / 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする Manager大項目: Manager大項目台帳運用の整備 粗い業務領域を台帳へ登録しLeaderへ渡せる状態にする 指定された大項目について、実行可能な成果物または作業結果を作成する
business.vw_aicm_pmlw_worker_work_unit_display|work_unit_name|2|AI企業業務開始導線の整備 作業 || Manager大項目台帳運用の整備 作業
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_batch_summary"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_runtime_ready_promotion_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_stub_view_runtime_catalog"
ERROR:  infinite recursion detected in rules for relation "v_access_stub_view_runtime_catalog"
ERROR:  infinite recursion detected in rules for relation "v_access_stub_view_runtime_catalog"
ERROR:  infinite recursion detected in rules for relation "v_access_stub_view_runtime_catalog"
ERROR:  infinite recursion detected in rules for relation "v_access_stub_view_runtime_catalog"
ERROR:  infinite recursion detected in rules for relation "v_access_stub_view_runtime_catalog"

---- status scan ----
--- review_status_code count by relation with company_id ---
--- work_status_code count by relation with company_id ---
PASS: latest V8B hit summary loaded

============================================================
8. current context raw shape
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
GET http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP_CONTEXT=000
WARN: context API did not return 200

============================================================
9. classification
============================================================

============================================================
10. FINAL
============================================================
ROUTE_LITERAL_FOUND=YES
ROUTE_APP_STYLE=NO
ROUTE_CREATE_SERVER_STYLE=YES
RESPONSE_WRITER_FOUND=YES
V8B_REQUEST_TITLE_FOUND=YES
PASS_COUNT=6
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=CONTEXT_ROUTE_IS_CUSTOM_HTTP_STYLE_PREPARE_V8D_TARGETED_PATCH
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/000_R8Z_V8C2_SERVER_CONTEXT_ROUTE_ACTUAL_SHAPE_REPORT.md
SERVER_CONTEXT_GREP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/020_server_context_grep.txt
SERVER_ROUTE_SNIPS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/021_server_route_snippets.txt
SERVER_BLOCKS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/022_server_candidate_blocks.txt
SERVER_JSON_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/023_server_json_response_scan.txt
V8B_HIT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/031_v8b_hit_summary.txt
CONTEXT_SHAPE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/041_context_shape.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- CONTEXT_ROUTE_IS_CUSTOM_HTTP_STYLE_PREPARE_V8D_TARGETED_PATCH:
  serverはcreateServer/pathname/switch系。
  次は該当branchのJSON payload作成直後に review_wait_items をmergeする最小パッチ。

- CONTEXT_ROUTE_IS_EXPRESS_STYLE_BUT_PATTERN_DIFFERENT_PREPARE_V8D_TARGETED_PATCH:
  Express系だがasync arrow等の形が違う。
  次は実snipに合わせた1点パッチ。

- CONTEXT_ROUTE_LITERAL_FOUND_NEED_MANUAL_SNIP_REVIEW:
  /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/021_server_route_snippets.txt と /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/023_server_json_response_scan.txt の該当箇所を貼る。

- CONTEXT_ROUTE_LITERAL_NOT_FOUND_CHECK_SERVER_ENTRY_OR_PROXY:
  起動しているserver entryが別ファイルの可能性を確認。
