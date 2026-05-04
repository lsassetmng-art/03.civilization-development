============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 課長/Leaderへ送る既存経路

現在位置:
- レビュー・承認待ち一覧は完了
- 次工程 V10L-A 監査で code 127 により停止
- code 127 は command not found 系の可能性が高い
- 今回は落ちた場所のサルベージと、より単純な安全監査を行う

今回:
1. 最新V10L-A reportを探す
2. report / 出力ファイルがあれば表示
3. command存在確認
4. node syntax確認
5. DB read-onlyで主要件数確認
6. server/coreを静的scan
7. 次patch方針を分類

禁止:
- DB write
- API POST
- PATCH
- server restart

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
META=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_a2_failed_salvage_and_safe_audit_20260504_074947
LATEST_DIR=
LATEST_REPORT=/000_R8Z_V10L_A_LEADER_SEND_EXISTING_ROUTE_AUDIT_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. command availability
============================================================
CMD_bash=OK /data/data/com.termux/files/usr/bin/bash
CMD_sh=OK /data/data/com.termux/files/usr/bin/sh
CMD_grep=OK /data/data/com.termux/files/usr/bin/grep
CMD_sed=OK /data/data/com.termux/files/usr/bin/sed
CMD_awk=OK /data/data/com.termux/files/usr/bin/awk
CMD_find=OK /data/data/com.termux/files/usr/bin/find
CMD_sort=OK /data/data/com.termux/files/usr/bin/sort
CMD_tail=OK /data/data/com.termux/files/usr/bin/tail
CMD_head=OK /data/data/com.termux/files/usr/bin/head
CMD_cat=OK /data/data/com.termux/files/usr/bin/cat
CMD_date=OK /data/data/com.termux/files/usr/bin/date
CMD_mkdir=OK /data/data/com.termux/files/usr/bin/mkdir
CMD_node=OK /data/data/com.termux/files/usr/bin/node
CMD_psql=OK /data/data/com.termux/files/usr/bin/psql
CMD_git=OK /data/data/com.termux/files/usr/bin/git

============================================================
3. previous failed report tail
============================================================
LATEST_REPORT_FOUND=NO

============================================================
4. latest V10L-A files
============================================================
LATEST_DIR_NOT_FOUND

============================================================
5. syntax
============================================================
bash: /tmp/aicm_v10l_core_syntax.out: Permission denied
CORE_SYNTAX=FAIL
cat: /tmp/aicm_v10l_core_syntax.out: No such file or directory
bash: /tmp/aicm_v10l_server_syntax.out: Permission denied
SERVER_SYNTAX=FAIL
cat: /tmp/aicm_v10l_server_syntax.out: No such file or directory

============================================================
6. DB safe readonly audit
============================================================
rel:aicm_department_task_ledger	YES
rel:aicm_manager_major_work_item	YES
rel:aicm_leader_middle_work_item	YES
rel:aicm_worker_work_unit	YES
count:aicm_department_task_ledger	2
count:aicm_manager_major_work_item	38
count:aicm_leader_middle_work_item	4
count:aicm_worker_work_unit	4
count:pending_review_view	0
business_aicm_relation_list	ai_company_manager_approval | ai_company_manager_audit_log | ai_company_manager_company | ai_company_manager_deliverable | ai_company_manager_delivery | ai_company_manager_pipeline_run | ai_company_manager_policy | ai_company_manager_project | ai_company_manager_queue_item | ai_company_manager_return_request | ai_company_manager_review | ai_company_manager_role_assignment | ai_company_manager_stage | aicm_actor_membership | aicm_aiworker_api_audit_log | aicm_aiworker_api_client | aicm_company | aicm_department | aicm_department_task_ledger | aicm_human_review_item | aicm_leader_deliverable_requirement | aicm_leader_middle_work_item | aicm_manager_major_work_item | aicm_organization | aicm_organization_robot_assignment | aicm_president_policy | aicm_review_action | aicm_review_item | aicm_task_file_metadata | aicm_task_ledger_csv_import_batch | aicm_task_ledger_csv_import_row | aicm_user_company | aicm_user_company_department | aicm_user_company_department_task_ledger | aicm_user_company_section | aicm_user_company_worker_placement | aicm_user_company_worker_placement_event | aicm_worker_work_unit | aicm_workflow_run | aicm_workflow_step | robot_pool_sync_ledger | vw_ai_company_manager_system_robot_selector_options | vw_aicm_aiworker_api_audit_recent | vw_aicm_company_robot_active_assignment_display | vw_aicm_company_robot_assignment_display | vw_aicm_human_review_wait_display | vw_aicm_pmlw_deliverable_requirement_display | vw_aicm_pmlw_leader_middle_display | vw_aicm_pmlw_major_work_display | vw_aicm_pmlw_president_policy_display | vw_aicm_pmlw_worker_work_unit_display | vw_aicm_pmlw_workflow_tree | vw_aicm_robot_role_duplicate_rule | vw_aicm_screen_robot_route_definition | vw_aicm_user_company_department_task_ledger_display | vw_aicm_user_company_tree | vw_aicm_user_company_worker_placement_display

============================================================
7. server safe scan
============================================================
SERVER_LEADER_AUTO_ROUTE_COUNT=1
SERVER_LEADER_AUTO_FUNCTION_COUNT=2
SERVER_MANAGER_MAJOR_COUNT=46
SERVER_TASK_LEDGER_COUNT=4
SERVER_BULK_COUNT=23

---- leader/manager route nearby ----
258-    "    " + aicmPmlwTextSql(body.company_common_rules_snapshot) + ",",
259-    "    " + sqlLiteral(body.policy_status_code || "submitted") + ",",
260-    "    " + sqlLiteral(aicmPmlwPriority(body.priority_code)) + ",",
261-    "    " + aicmPmlwOptionalDateSql(body.due_date) + ",",
262-    "    " + aicmPmlwTextSql(body.reference_files_text) + ",",
263-    "    " + aicmPmlwTextSql(body.supplemental_materials_text) + ",",
264-    "    " + aicmPmlwTextSql(body.applicable_rules_text) + ",",
265-    "    " + aicmPmlwTextSql(body.note) + ",",
266-    "    " + aicmPmlwTextSql(body.handoff_link),
267-    "  )",
268-    "  RETURNING *",
269-    ")",
270-    "SELECT jsonb_build_object(",
271-    "  'result', 'ok',",
272-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
273-    "  'president_policy', to_jsonb(inserted)",
274-    ")::text",
275-    "FROM inserted;"
276-  ].join("\n");
277-
278-  return runPsqlJson(sql);
279-}
280-
281-function createManagerMajorItem(body) {
282-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
283-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
284-  const majorName = requiredText(body.major_item_name || body.deliverable_name || body.task_name, "major_item_name");
285-
286-  const sql = [
287-    "WITH inserted AS (",
288:    "  INSERT INTO business.aicm_manager_major_work_item (",
289-    "    owner_civilization_id, aicm_user_company_id, aicm_president_policy_id,",
290-    "    aicm_user_company_department_id, aicm_user_company_section_id,",
291-    "    major_item_name, major_item_description, source_route_code,",
292-    "    manager_robot_label, assigned_leader_label,",
293-    "    decomposition_status_code, handoff_status_code, priority_code, due_date,",
294-    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
295-    "  ) VALUES (",
296-    "    " + sqlLiteral(owner) + "::uuid,",
297-    "    " + sqlLiteral(companyId) + "::uuid,",
298-    "    " + aicmPmlwOptionalUuidSql(body.aicm_president_policy_id) + ",",
299-    "    " + aicmPmlwOptionalUuidSql(body.aicm_user_company_department_id) + ",",
300-    "    " + aicmPmlwOptionalUuidSql(body.aicm_user_company_section_id) + ",",
301-    "    " + sqlLiteral(majorName) + ",",
302-    "    " + aicmPmlwTextSql(body.major_item_description || body.description || body.note) + ",",
303-    "    " + sqlLiteral(body.source_route_code || "manual") + ",",
304-    "    " + aicmPmlwTextSql(body.manager_robot_label) + ",",
305-    "    " + aicmPmlwTextSql(body.assigned_leader_label) + ",",
306-    "    " + sqlLiteral(aicmPmlwMajorStatus(body.decomposition_status_code)) + ",",
307-    "    " + sqlLiteral(aicmPmlwHandoffStatus(body.handoff_status_code)) + ",",
308-    "    " + sqlLiteral(aicmPmlwPriority(body.priority_code)) + ",",
309-    "    " + aicmPmlwOptionalDateSql(body.due_date) + ",",
310-    "    " + aicmPmlwTextSql(body.reference_files_text) + ",",
311-    "    " + aicmPmlwTextSql(body.supplemental_materials_text) + ",",
312-    "    " + aicmPmlwTextSql(body.applicable_rules_text) + ",",
313-    "    " + aicmPmlwTextSql(body.note) + ",",
314-    "    " + aicmPmlwTextSql(body.handoff_link),
315-    "  )",
316-    "  RETURNING *",
317-    ")",
318-    "SELECT jsonb_build_object(",
319-    "  'result', 'ok',",
320-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
321:    "  'manager_major_item', to_jsonb(inserted)",
322-    ")::text",
323-    "FROM inserted;"
324-  ].join("\n");
325-
326-  return runPsqlJson(sql);
327-}
328-
329-function updateManagerMajorItem(body) {
330-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
331:  const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");
332-  const updates = [];
333-
334-  if (body.major_item_name !== undefined) updates.push("major_item_name = " + sqlLiteral(String(body.major_item_name || "").trim()));
335-  if (body.major_item_description !== undefined) updates.push("major_item_description = " + aicmPmlwTextSql(body.major_item_description));
336-  if (body.aicm_president_policy_id !== undefined) updates.push("aicm_president_policy_id = " + aicmPmlwOptionalUuidSql(body.aicm_president_policy_id));
337-  if (body.aicm_user_company_department_id !== undefined) updates.push("aicm_user_company_department_id = " + aicmPmlwOptionalUuidSql(body.aicm_user_company_department_id));
338-  if (body.aicm_user_company_section_id !== undefined) updates.push("aicm_user_company_section_id = " + aicmPmlwOptionalUuidSql(body.aicm_user_company_section_id));
339-  if (body.manager_robot_label !== undefined) updates.push("manager_robot_label = " + aicmPmlwTextSql(body.manager_robot_label));
340-  if (body.assigned_leader_label !== undefined) updates.push("assigned_leader_label = " + aicmPmlwTextSql(body.assigned_leader_label));
341-  if (body.decomposition_status_code !== undefined) updates.push("decomposition_status_code = " + sqlLiteral(aicmPmlwMajorStatus(body.decomposition_status_code)));
342-  if (body.handoff_status_code !== undefined) updates.push("handoff_status_code = " + sqlLiteral(aicmPmlwHandoffStatus(body.handoff_status_code)));
343-  if (body.priority_code !== undefined) updates.push("priority_code = " + sqlLiteral(aicmPmlwPriority(body.priority_code)));
344-  if (body.due_date !== undefined) updates.push("due_date = " + aicmPmlwOptionalDateSql(body.due_date));
345-  if (body.reference_files_text !== undefined) updates.push("reference_files_text = " + aicmPmlwTextSql(body.reference_files_text));
346-  if (body.supplemental_materials_text !== undefined) updates.push("supplemental_materials_text = " + aicmPmlwTextSql(body.supplemental_materials_text));
347-  if (body.applicable_rules_text !== undefined) updates.push("applicable_rules_text = " + aicmPmlwTextSql(body.applicable_rules_text));
348-  if (body.note !== undefined) updates.push("note = " + aicmPmlwTextSql(body.note));
349-  if (body.handoff_link !== undefined) updates.push("handoff_link = " + aicmPmlwTextSql(body.handoff_link));
350-
351-  updates.push("updated_at = now()");
352-
353-  const sql = [
354-    "WITH updated AS (",
355:    "  UPDATE business.aicm_manager_major_work_item",
356-    "  SET " + updates.join(", "),
357:    "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
358-    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
359-    "  RETURNING *",
360-    ")",
361-    "SELECT jsonb_build_object(",
362-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
363-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
364:    "  'manager_major_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
365-    ")::text;"
366-  ].join("\n");
367-
368-  return runPsqlJson(sql);
369-}
370-
371-function archiveManagerMajorItem(body) {
372-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
373:  const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");
374-
375-  const sql = [
376-    "WITH archived AS (",
377:    "  UPDATE business.aicm_manager_major_work_item",
378-    "  SET decomposition_status_code = 'archived',",
379-    "      handoff_status_code = 'archived',",
380-    "      updated_at = now()",
381:    "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
382-    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
383-    "  RETURNING *",
384-    ")",
385-    "SELECT jsonb_build_object(",
386-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM archived) THEN 'ok' ELSE 'not_found' END,",
387-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
388:    "  'manager_major_item', COALESCE((SELECT to_jsonb(archived) FROM archived), '{}'::jsonb)",
389-    ")::text;"
390-  ].join("\n");
391-
392-  return runPsqlJson(sql);
393-}
394-
395-function importManagerMajorItemsCsv(body) {
396-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
397-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
398-  const rows = aicmPmlwCsvRows(body);
399-
400-  if (rows.length === 0) {
401:    return { result: "ok", api_identifier: SERVER_MARK, inserted_count: 0, manager_major_items: [] };
402-  }
403-
404-  const values = rows.map((row, index) => [
405-    "(",
406-    index,
407-    ", " + sqlLiteral(owner) + "::uuid",
408-    ", " + sqlLiteral(companyId) + "::uuid",
409-    ", " + sqlLiteral(row.department_name),
410-    ", " + sqlLiteral(row.section_name),
411-    ", " + sqlLiteral(row.major_item_name),
412-    ", " + sqlLiteral(row.major_item_description),
413-    ", " + sqlLiteral(row.assigned_leader_label),
414-    ", " + sqlLiteral(row.priority_code),
415-    ", " + aicmPmlwOptionalDateSql(row.due_date),
416-    ", " + sqlLiteral(row.note),
417-    ")"
418-  ].join("")).join(",\n    ");
419-
420-  const sql = [
421-    "WITH input_rows(row_order, owner_civilization_id, aicm_user_company_id, department_name, section_name, major_item_name, major_item_description, assigned_leader_label, priority_code, due_date, note) AS (",
422-    "  VALUES",
423-    "    " + values,
424-    "), resolved AS (",
425-    "  SELECT i.*, (",
426-    "    SELECT d.aicm_user_company_department_id",
427-    "    FROM business.aicm_user_company_department d",
428-    "    WHERE d.owner_civilization_id = i.owner_civilization_id",
429-    "      AND d.aicm_user_company_id = i.aicm_user_company_id",
430-    "      AND d.department_status = 'active'",
431-    "      AND (i.department_name = '' OR d.department_name = i.department_name)",
432-    "    ORDER BY CASE WHEN d.department_name = i.department_name THEN 0 ELSE 1 END, d.display_order, d.created_at",
433-    "    LIMIT 1",
434-    "  ) AS department_id",
435-    "  FROM input_rows i",
436-    "), resolved_section AS (",
437-    "  SELECT r.*, (",
438-    "    SELECT s.aicm_user_company_section_id",
439-    "    FROM business.aicm_user_company_section s",
440-    "    WHERE s.owner_civilization_id = r.owner_civilization_id",
441-    "      AND s.aicm_user_company_id = r.aicm_user_company_id",
442-    "      AND s.section_status = 'active'",
443-    "      AND (r.department_id IS NULL OR s.aicm_user_company_department_id = r.department_id)",
444-    "      AND (r.section_name = '' OR s.section_name = r.section_name)",
445-    "    ORDER BY CASE WHEN s.section_name = r.section_name THEN 0 ELSE 1 END, s.display_order, s.created_at",
446-    "    LIMIT 1",
447-    "  ) AS section_id",
448-    "  FROM resolved r",
449-    "), inserted AS (",
450:    "  INSERT INTO business.aicm_manager_major_work_item (",
451-    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
452-    "    major_item_name, major_item_description, source_route_code, assigned_leader_label,",
453-    "    decomposition_status_code, handoff_status_code, priority_code, due_date, note, display_order",
454-    "  )",
455-    "  SELECT owner_civilization_id, aicm_user_company_id, department_id, section_id,",
456-    "         major_item_name, major_item_description, 'csv_import', assigned_leader_label,",
457-    "         'not_started', 'draft', priority_code, due_date, note, 100 + row_order",
458-    "  FROM resolved_section",
459-    "  RETURNING *",
460-    ")",
461-    "SELECT jsonb_build_object(",
462-    "  'result', 'ok',",
463-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
464-    "  'inserted_count', (SELECT count(*) FROM inserted),",
465:    "  'manager_major_items', COALESCE((SELECT jsonb_agg(to_jsonb(inserted) ORDER BY display_order, created_at) FROM inserted), '[]'::jsonb)",
466-    ")::text;"
467-  ].join("\n");
468-
469-  return runPsqlJson(sql);
470-}
471-
472-
473-
474-// AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1
475-// Human review queue functions.
476-// Human review is limited to delivery summaries and exception summaries.
477-// AI review remains internal; only ai_review_result_text summary is shown.
478-
479-function aicmHumanReviewOptionalText(value) {
480-  return String(value || "").trim();
481-}
482-
483-function aicmHumanReviewTextSql(value) {
484-  return sqlLiteral(String(value || ""));
485-}
486-
487-function aicmHumanReviewOptionalUuidSql(value) {
488-  const text = String(value || "").trim();
489-  return text ? sqlLiteral(text) + "::uuid" : "NULL";
490-}
491-
492-function aicmHumanReviewOptionalDateSql(value) {
493-  const text = String(value || "").trim();
494-  return /^\\d{4}-\\d{2}-\\d{2}$/.test(text) ? sqlLiteral(text) + "::date" : "NULL";
495-}
496-
497-function aicmHumanReviewKind(value) {
498-  const text = String(value || "delivery_summary").trim();
499-  return [
500-    "design_delivery_summary",
501-    "implementation_delivery_summary",
502-    "exception_review",
503-    "final_delivery_summary",
504-    "delivery_summary"
505-  ].includes(text) ? text : "delivery_summary";
506-}
507-
508-function aicmHumanReviewArtifactKind(value) {
509-  const text = String(value || "design_doc").trim();
510-  return ["design_doc", "implementation", "exception", "delivery_package", "handoff"].includes(text) ? text : "design_doc";
511-}
512-
513-function aicmHumanReviewPriority(value) {
514-  const text = String(value || "normal").trim();
515-  return ["low", "normal", "high", "urgent"].includes(text) ? text : "normal";
516-}
517-
518-function createHumanReviewItem(body) {
519-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
520-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
521-  const title = requiredText(body.review_title || body.title, "review_title");
522-
523-  const sql = [
524-    "WITH inserted AS (",
525-    "  INSERT INTO business.aicm_human_review_item (",
526-    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
527:    "    related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id,",
528-    "    related_deliverable_requirement_id, related_worker_work_unit_id,",
529-    "    review_kind_code, artifact_kind_code, review_title,",
530-    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
531-    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
532-    "    display_order, metadata_jsonb",
533-    "  ) VALUES (",
534-    "    " + sqlLiteral(owner) + "::uuid,",
535-    "    " + sqlLiteral(companyId) + "::uuid,",
536-    "    " + aicmHumanReviewOptionalUuidSql(body.aicm_user_company_department_id) + ",",
537-    "    " + aicmHumanReviewOptionalUuidSql(body.aicm_user_company_section_id) + ",",
538-    "    " + aicmHumanReviewOptionalUuidSql(body.related_president_policy_id) + ",",
539:    "    " + aicmHumanReviewOptionalUuidSql(body.related_manager_major_work_item_id) + ",",
540-    "    " + aicmHumanReviewOptionalUuidSql(body.related_leader_middle_work_item_id) + ",",
541-    "    " + aicmHumanReviewOptionalUuidSql(body.related_deliverable_requirement_id) + ",",
542-    "    " + aicmHumanReviewOptionalUuidSql(body.related_worker_work_unit_id) + ",",
543-    "    " + sqlLiteral(aicmHumanReviewKind(body.review_kind_code)) + ",",
544-    "    " + sqlLiteral(aicmHumanReviewArtifactKind(body.artifact_kind_code)) + ",",
545-    "    " + sqlLiteral(title) + ",",
546-    "    " + aicmHumanReviewTextSql(body.delivery_summary_text) + ",",
547-    "    " + aicmHumanReviewTextSql(body.main_changes_text) + ",",
548-    "    " + aicmHumanReviewTextSql(body.ai_review_result_text) + ",",
549-    "    " + aicmHumanReviewTextSql(body.unresolved_issues_text) + ",",
550-    "    " + aicmHumanReviewTextSql(body.artifact_link) + ",",
551-    "    " + aicmHumanReviewTextSql(body.responsible_ai_label) + ",",
552-    "    " + aicmHumanReviewTextSql(body.requested_by_ai_label) + ",",
553-    "    'pending',",
554-    "    " + sqlLiteral(aicmHumanReviewPriority(body.priority_code)) + ",",
555-    "    " + aicmHumanReviewOptionalDateSql(body.due_date) + ",",
556-    "    COALESCE(NULLIF(" + sqlLiteral(String(body.display_order || "")) + ", '')::integer, 100),",
557-    "    '{}'::jsonb",
558-    "  )",
559-    "  RETURNING *",
560-    ")",
561-    "SELECT jsonb_build_object(",
562-    "  'result', 'ok',",
563-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
564-    "  'human_review_item', to_jsonb(inserted)",
565-    ")::text",
566-    "FROM inserted;"
567-  ].join("\n");
568-
569-  return runPsqlJson(sql);
570-}
571-
572-function approveHumanReviewItem(body) {
573-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
574-  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
575-
576-  const sql = [
577-    "WITH updated AS (",
578-    "  UPDATE business.aicm_human_review_item",
579-    "  SET human_review_status_code = 'approved',",
580-    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
581-    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
582-    "      reviewed_at = now(),",
583-    "      updated_at = now()",
584-    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
585-    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
586-    "  RETURNING *",
587-    ")",
588-    "SELECT jsonb_build_object(",
589-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
590-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
591-    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
592-    ")::text;"
593-  ].join("\n");
594-
595-  return runPsqlJson(sql);
596-}
597-
598-function returnHumanReviewItem(body) {
599-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
600-  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
601-
602-  const sql = [
603-    "WITH updated AS (",
604-    "  UPDATE business.aicm_human_review_item",
605-    "  SET human_review_status_code = 'returned',",
606-    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
607-    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
608-    "      reviewed_at = now(),",
609-    "      updated_at = now()",
610-    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
611-    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
612-    "  RETURNING *",
613-    ")",
614-    "SELECT jsonb_build_object(",
615-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
616-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
617-    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
618-    ")::text;"
619-  ].join("\n");
--
728-
729-  const sql = [
730-    "SELECT jsonb_build_object(",
731-    "  'result', 'ok',",
732-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
733-    "  'owner_civilization_id', " + sqlLiteral(owner) + ",",
734-    "  'companies', (",
735-    "    SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC), '[]'::jsonb)",
736-    "    FROM business.aicm_user_company c",
737-    "    WHERE c.owner_civilization_id::text = " + sqlLiteral(owner),
738-    "      AND c.company_status = 'active'",
739-    "  ),",
740-    "  'departments', (",
741-    "    SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.display_order, d.created_at), '[]'::jsonb)",
742-    "    FROM business.aicm_user_company_department d",
743-    "    WHERE d.owner_civilization_id::text = " + sqlLiteral(owner),
744-    "      AND d.department_status = 'active'",
745-    "  ),",
746-    "  'sections', (",
747-    "    SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.display_order, s.created_at), '[]'::jsonb)",
748-    "    FROM business.aicm_user_company_section s",
749-    "    WHERE s.owner_civilization_id::text = " + sqlLiteral(owner),
750-    "      AND s.section_status = 'active'",
751-    "  ),",
752-    "  'placements', (",
753-    "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb)",
754-    "    FROM business.vw_aicm_user_company_worker_placement_display p",
755-    "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
756-    "      AND p.status_code = 'active'",
757-    "  ),",
758:    "  'task_ledger', (",
759-    "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.display_order, t.created_at DESC), '[]'::jsonb)",
760:    "    FROM business.vw_aicm_user_company_department_task_ledger_display t",
761-    "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
762-    "      AND t.task_status_code <> 'archived'",
763-    "  ),",
764-    // AICM_PMLW_GETCONTEXT_SQL_EXTENSION_AQP_AQS_V1
765-    "  'pmlw_president_policies', (",
766-    "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.display_order ASC, p.updated_at DESC, p.created_at DESC), '[]'::jsonb)",
767-    "    FROM business.vw_aicm_pmlw_president_policy_display p",
768-    "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
769-    "  ),",
770-    "  'pmlw_major_items', (",
771-    "    SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order ASC, m.updated_at DESC, m.created_at DESC), '[]'::jsonb)",
772-    "    FROM business.vw_aicm_pmlw_major_work_display m",
773-    "    WHERE m.owner_civilization_id::text = " + sqlLiteral(owner),
774-    "  ),",
775-    "  'pmlw_middle_items', (",
776-    "    SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.display_order ASC, l.updated_at DESC, l.created_at DESC), '[]'::jsonb)",
777-    "    FROM business.vw_aicm_pmlw_leader_middle_display l",
778-    "    WHERE l.owner_civilization_id::text = " + sqlLiteral(owner),
779-    "  ),",
780-    "  'pmlw_deliverable_requirements', (",
781-    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.display_order ASC, r.updated_at DESC, r.created_at DESC), '[]'::jsonb)",
782-    "    FROM business.vw_aicm_pmlw_deliverable_requirement_display r",
783-    "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
784-    "  ),",
785-    "  'pmlw_worker_work_units', (",
786-    "    SELECT COALESCE(jsonb_agg(to_jsonb(w) ORDER BY w.display_order ASC, w.updated_at DESC, w.created_at DESC), '[]'::jsonb)",
787-    "    FROM business.vw_aicm_pmlw_worker_work_unit_display w",
788-    "    WHERE w.owner_civilization_id::text = " + sqlLiteral(owner),
789-    "  ),",
790-    "  'pmlw_workflow_tree', (",
791-    "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.last_updated_at DESC NULLS LAST), '[]'::jsonb)",
792-    "    FROM business.vw_aicm_pmlw_workflow_tree t",
793-    "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
794-    "  ),",
795-    // AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1_CONTEXT
796-    "  'review_wait_items', (",
797-    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.priority_code DESC, r.requested_at DESC, r.created_at DESC), '[]'::jsonb)",
798-    "    FROM business.vw_aicm_human_review_wait_display r",
799-    "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
800-    "  ),",
801-    "  'robot_catalog', (",
802-    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.aiworker_model_code), '[]'::jsonb)",
803-    "    FROM business.vw_ai_company_manager_system_robot_selector_options r",
804-    "  )",
805-    ")::text;"
806-  ].join("\n");
807-
808-  return runPsqlJson(sql);
809-}
810-
811-function createCompany(body) {
812-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
813-  const name = requiredText(body.company_name, "company_name");
814-  const domain = String(body.business_domain || "");
815-
816-  const sql = [
817-    "WITH inserted AS (",
818-    "  INSERT INTO business.aicm_user_company (",
819-    "    owner_civilization_id, company_name, business_domain, company_status, selected_flag",
820-    "  ) VALUES (",
821-    "    " + sqlLiteral(owner) + "::uuid,",
822-    "    " + sqlLiteral(name) + ",",
823-    "    " + sqlLiteral(domain) + ",",
824-    "    'active',",
825-    "    true",
826-    "  )",
827-    "  RETURNING *",
828-    ")",
829-    "SELECT jsonb_build_object(",
830-    "  'result', 'ok',",
831-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
832-    "  'company', to_jsonb(inserted)",
833-    ")::text",
834-    "FROM inserted;"
835-  ].join("\n");
836-
837-  return runPsqlJson(sql);
838-}
839-
840-function createDepartment(body) {
--
937-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
938-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
939-  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
940-  const sectionId = String(body.aicm_user_company_section_id || "").trim();
941-
942-  const deliverableName = requiredText(body.deliverable_name, "deliverable_name");
943-  const taskName = requiredText(body.task_name, "task_name");
944-  const workTypeCode = String(body.work_type_code || "design").trim() || "design";
945-  const responsibleRoleCode = String(body.responsible_role_code || "Manager").trim() || "Manager";
946-  const responsibleRobotLabel = String(body.responsible_robot_label || "");
947-  const taskStatusCode = String(body.task_status_code || "todo").trim() || "todo";
948-  const priorityCode = String(body.priority_code || "normal").trim() || "normal";
949-  const dueDate = String(body.due_date || "").trim();
950-
951-  const sectionSql = sectionId ? sqlLiteral(sectionId) + "::uuid" : "NULL";
952-  const dueDateSql = dueDate ? sqlLiteral(dueDate) + "::date" : "NULL";
953-
954-  const sql = [
955-    "WITH department_ok AS (",
956-    "  SELECT d.aicm_user_company_id, d.aicm_user_company_department_id",
957-    "  FROM business.aicm_user_company_department d",
958-    "  JOIN business.aicm_user_company c",
959-    "    ON c.aicm_user_company_id = d.aicm_user_company_id",
960-    "  WHERE d.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
961-    "    AND d.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
962-    "    AND d.aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
963-    "    AND d.department_status = 'active'",
964-    "    AND c.company_status = 'active'",
965-    "  LIMIT 1",
966-    "), inserted AS (",
967:    "  INSERT INTO business.aicm_user_company_department_task_ledger (",
968-    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
969-    "    deliverable_name, task_name, work_type_code, responsible_role_code, responsible_robot_label,",
970-    "    task_status_code, priority_code, due_date,",
971-    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
972-    "  )",
973-    "  SELECT",
974-    "    " + sqlLiteral(owner) + "::uuid,",
975-    "    aicm_user_company_id,",
976-    "    aicm_user_company_department_id,",
977-    "    " + sectionSql + ",",
978-    "    " + sqlLiteral(deliverableName) + ",",
979-    "    " + sqlLiteral(taskName) + ",",

============================================================
8. core safe scan
============================================================
CORE_LEADER_SEND_LABEL_COUNT=35
CORE_LEADER_AUTO_ROUTE_COUNT=1
CORE_TASK_LEDGER_SCREEN_COUNT=77
CORE_MANAGER_MAJOR_COUNT=128
CORE_LEADER_MIDDLE_COUNT=11
CORE_WORKER_UNIT_COUNT=32
CORE_BULK_SELECT_COUNT=3
CORE_CONFIRM_COUNT=11

---- core task-ledger / leader related nearby ----
103-    var message = error && error.message ? String(error.message) : String(error || "不明なエラーです。");
104-    message = message.replace(new RegExp("post" + "gres(?:ql)?://" + "[^\\s\'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");
105-    if (message.length > 500) {
106-      message = message.slice(0, 500) + "...";
107-    }
108-    return message;
109-  }
110-
111-  function endpointWithOwner() {
112-    return API.context + "?owner_civilization_id=" + encodeURIComponent(state.ownerCivilizationId);
113-  }
114-
115-  function requestJson(url, body) {
116-    var options = body ? {
117-      method: "POST",
118-      headers: { "content-type": "application/json" },
119-      body: JSON.stringify(body)
120-    } : {
121-      method: "GET"
122-    };
123-
124-    return window.fetch(url, options)
125-      .then(function (response) {
126-        return response.json().then(function (json) {
127-          if (!response.ok || !json || json.result !== "ok") {
128-            throw new Error(json && json.error_message ? json.error_message : "API error");
129-          }
130-          return json;
131-        });
132-      });
133-  }
134-
135-  
136-function normalizeContext(json) {
137-    json = json || {};
138-    return {
139-      companies: Array.isArray(json.companies) ? json.companies : [],
140-      departments: Array.isArray(json.departments) ? json.departments : [],
141-      sections: Array.isArray(json.sections) ? json.sections : [],
142-      placements: Array.isArray(json.placements) ? json.placements : [],
143:      taskLedger: Array.isArray(json.task_ledger) ? json.task_ledger : [],
144-      robotCatalog: Array.isArray(json.robot_catalog) ? json.robot_catalog : []
145-    };
146-  }
147-
148-  function getCompany(companyId) {
149-    return state.context.companies.find(function (company) {
150-      return company.aicm_user_company_id === companyId;
151-    }) || null;
152-  }
153-
154-  function getDepartment(departmentId) {
155-    return state.context.departments.find(function (department) {
156-      return department.aicm_user_company_department_id === departmentId;
157-    }) || null;
158-  }
159-
160-  function getSection(sectionId) {
161-    return state.context.sections.find(function (section) {
162-      return section.aicm_user_company_section_id === sectionId;
163-    }) || null;
164-  }
165-
166-  function companyDepartments(companyId) {
167-    return state.context.departments.filter(function (department) {
168-      return department.aicm_user_company_id === companyId;
169-    });
170-  }
171-
172-  function departmentSections(departmentId) {
173-    return state.context.sections.filter(function (section) {
174-      return section.aicm_user_company_department_id === departmentId;
175-    });
176-  }
177-
178-  function companyPlacements(companyId) {
179-    return state.context.placements.filter(function (placement) {
180-      return placement.aicm_user_company_id === companyId;
181-    });
182-  }
183-
184-  function selectedCompany() {
185-    return getCompany(state.selectedCompanyId);
186-  }
187-
188-  function selectedDepartment() {
189-    return getDepartment(state.selectedDepartmentId);
190-  }
191-
192-  function selectedSection() {
193-    return getSection(state.selectedSectionId);
194-  }
195-
196-  function hasCompany(companyId) {
197-    return !!getCompany(companyId);
198-  }
199-
200-  function hasDepartment(departmentId) {
201-    return !!getDepartment(departmentId);
202-  }
203-
204-  function setSelectedCompany(companyId) {
205-    if (hasCompany(companyId)) {
206-      state.selectedCompanyId = companyId;
207-      writeStorage(STORAGE.selectedCompanyId, companyId);
208-
209-      var departments = companyDepartments(companyId);
210-      if (!hasDepartment(state.selectedDepartmentId)) {
211-        state.selectedDepartmentId = departments[0] ? departments[0].aicm_user_company_department_id : "";
212-        writeStorage(STORAGE.selectedDepartmentId, state.selectedDepartmentId);
213-      }
214-    } else {
215-      state.selectedCompanyId = "";
216-      state.selectedDepartmentId = "";
217-      state.selectedSectionId = "";
218-      writeStorage(STORAGE.selectedCompanyId, "");
219-      writeStorage(STORAGE.selectedDepartmentId, "");
220-      writeStorage(STORAGE.selectedSectionId, "");
221-    }
222-  }
223-
224-  function setSelectedDepartment(departmentId) {
225-    if (hasDepartment(departmentId)) {
226-      state.selectedDepartmentId = departmentId;
227-      writeStorage(STORAGE.selectedDepartmentId, departmentId);
228-
229-      var sections = departmentSections(departmentId);
230-      if (!getSection(state.selectedSectionId)) {
231-        state.selectedSectionId = sections[0] ? sections[0].aicm_user_company_section_id : "";
232-        writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
233-      }
234-    } else {
235-      state.selectedDepartmentId = "";
236-      state.selectedSectionId = "";
237-      writeStorage(STORAGE.selectedDepartmentId, "");
238-      writeStorage(STORAGE.selectedSectionId, "");
239-    }
240-  }
241-
242-  function syncSelectionAfterContextLoad() {
243-    if (hasCompany(state.selectedCompanyId)) {
244-      setSelectedCompany(state.selectedCompanyId);
245-      return;
246-    }
247-
248-    if (state.context.companies[0]) {
249-      setSelectedCompany(state.context.companies[0].aicm_user_company_id);
250-      return;
251-    }
252-
253-    setSelectedCompany("");
254-  }
255-
256-  function loadContext() {
257-    state.loading = true;
258-    state.errorMessage = "";
259-    render();
260-
261-    return requestJson(endpointWithOwner())
262-      .then(function (json) {
263-        state.context = normalizeContext(json);
--
276-        state.booted = true;
277-        render();
278-      })
279-      .catch(function (error) {
280-        state.loading = false;
281-        state.errorMessage = publicErrorMessage(error);
282-        render();
283-      });
284-  }
285-
286-
287-// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_START
288-  function aicmR8ZFArrayFromContext(rawContext, targetContext, names) {
289-    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
290-    var target = targetContext && typeof targetContext === "object" ? targetContext : {};
291-    var current = state && state.context && typeof state.context === "object" ? state.context : {};
292-
293-    for (var i = 0; i < names.length; i += 1) {
294-      var key = names[i];
295-
296-      if (Array.isArray(raw[key])) return raw[key];
297-      if (Array.isArray(target[key])) return target[key];
298-      if (Array.isArray(current[key])) return current[key];
299-      if (Array.isArray(state && state[key])) return state[key];
300-    }
301-
302-    return [];
303-  }
304-
305-  function aicmNormalizePmlwContextR8ZF(rawContext, targetContext) {
306-    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
307-    var target = targetContext && typeof targetContext === "object" ? targetContext : {};
308-
309-    if (!target || typeof target !== "object") {
310-      target = {};
311-    }
312-
313-    var middleItems = aicmR8ZFArrayFromContext(raw, target, [
314-      "pmlw_middle_items",
315-      "pmlwMiddleItems",
316:      "leader_middle_items",
317:      "leaderMiddleItems"
318-    ]);
319-
320-    var deliverableRequirements = aicmR8ZFArrayFromContext(raw, target, [
321-      "pmlw_deliverable_requirements",
322-      "pmlwDeliverableRequirements",
323-      "deliverable_requirements",
324-      "deliverableRequirements"
325-    ]);
326-
327-    var workerWorkUnits = aicmR8ZFArrayFromContext(raw, target, [
328-      "pmlw_worker_work_units",
329-      "pmlwWorkerWorkUnits",
330-      "worker_work_units",
331-      "workerWorkUnits"
332-    ]);
333-
334-    var workflowTree = aicmR8ZFArrayFromContext(raw, target, [
335-      "pmlw_workflow_tree",
336-      "pmlwWorkflowTree",
337-      "workflow_tree",
338-      "workflowTree"
339-    ]);
340-
341-    target.pmlw_middle_items = middleItems;
342-    target.pmlwMiddleItems = middleItems;
343-
344-    target.pmlw_deliverable_requirements = deliverableRequirements;
345-    target.pmlwDeliverableRequirements = deliverableRequirements;
346-
347-    target.pmlw_worker_work_units = workerWorkUnits;
348-    target.pmlwWorkerWorkUnits = workerWorkUnits;
349-
350-    target.pmlw_workflow_tree = workflowTree;
351-    target.pmlwWorkflowTree = workflowTree;
352-
353-    if (state) {
354-      state.context = target;
355-
356-      state.pmlw_middle_items = middleItems;
357-      state.pmlwMiddleItems = middleItems;
358-
359-      state.pmlw_deliverable_requirements = deliverableRequirements;
360-      state.pmlwDeliverableRequirements = deliverableRequirements;
361-
362-      state.pmlw_worker_work_units = workerWorkUnits;
363-      state.pmlwWorkerWorkUnits = workerWorkUnits;
364-
365-      state.pmlw_workflow_tree = workflowTree;
366-      state.pmlwWorkflowTree = workflowTree;
367-    }
368-
369-    return target;
370-  }
371-
372-  if (typeof normalizeContext === "function" && !normalizeContext.__aicmR8ZF) {
373-    var aicmNormalizeContextBeforeR8ZF = normalizeContext;
374-
375-    normalizeContext = function normalizeContext(rawContext) {
376-      var normalizedContext = aicmNormalizeContextBeforeR8ZF.apply(this, arguments);
377-      return aicmNormalizePmlwContextR8ZF(rawContext, normalizedContext);
378-    };
379-
380-    normalizeContext.__aicmR8ZF = true;
381-  }
382-
383-  if (typeof loadContext === "function" && !loadContext.__aicmR8ZF) {
384-    var aicmLoadContextBeforeR8ZF = loadContext;
385-
386-    loadContext = async function loadContext() {
387-      var result = await aicmLoadContextBeforeR8ZF.apply(this, arguments);
388-
389-      if (state && state.context) {
390-        aicmNormalizePmlwContextR8ZF(state.context, state.context);
391-      }
392-
393-      return result;
394-    };
395-
396-    loadContext.__aicmR8ZF = true;
397-  }
398-// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_END
399-
400-
401-  function createCompany(payload) {
402-    return requestJson(API.createCompany, {
403-      owner_civilization_id: state.ownerCivilizationId,
404-      company_name: payload.companyName,
405-      business_domain: payload.businessDomain
406-    }).then(function (json) {
407-      if (json.company && json.company.aicm_user_company_id) {
408-        state.selectedCompanyId = json.company.aicm_user_company_id;
409-        writeStorage(STORAGE.selectedCompanyId, state.selectedCompanyId);
410-      }
411-      state.noticeMessage = "AI企業を作成しました。";
412-      return loadContext();
413-    });
414-  }
415-
416-  function createDepartment(payload) {
417-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
418-      throw new Error("先にv2のAI企業を作成・選択してください。");
419-    }
420-
421-    return requestJson(API.createDepartment, {
422-      owner_civilization_id: state.ownerCivilizationId,
423-      aicm_user_company_id: state.selectedCompanyId,
424-      department_name: payload.departmentName,
425-      purpose: payload.purpose
426-    }).then(function (json) {
427-      if (json.department && json.department.aicm_user_company_department_id) {
428-        state.selectedDepartmentId = json.department.aicm_user_company_department_id;
429-        writeStorage(STORAGE.selectedDepartmentId, state.selectedDepartmentId);
430-      }
431-      state.noticeMessage = "部門を作成しました。";
432-      return loadContext();
433-    });
434-  }
435-
436-  function createSection(payload) {
437-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
--
462-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
463-      throw new Error("先にv2のAI企業を作成・選択してください。");
464-    }
465-
466-    return requestJson(API.createPlacement, {
467-      owner_civilization_id: state.ownerCivilizationId,
468-      aicm_user_company_id: state.selectedCompanyId,
469-      aicm_user_company_department_id: payload.departmentId || "",
470-      aicm_user_company_section_id: payload.sectionId || "",
471-      target_level_code: payload.targetLevelCode,
472-      target_id: payload.targetId,
473-      role_code: payload.roleCode,
474-      robot_pool_id: payload.robotPoolId,
475-      aiworker_model_code: payload.aiworkerModelCode,
476-      internal_nickname: payload.internalNickname
477-    }).then(function () {
478-      state.noticeMessage = "Worker配置を作成しました。";
479-      return loadContext();
480-    });
481-  }
482-
483-  
484-function setMessage(kind, message) {
485-    if (kind === "ok") {
486-      state.noticeMessage = String(message || "");
487-      state.errorMessage = "";
488-      return;
489-    }
490-
491-    state.errorMessage = String(message || "");
492-    state.noticeMessage = "";
493-  }
494-
495-  function go(screen) {
496-    // AICM_TASK_LEDGER_FRESH_CONTEXT_NAV_CANONICAL_V1
497-    var nextScreen = String(screen || "dashboard");
498-
499-    state.screen = nextScreen;
500-    state.errorMessage = "";
501-
502:    if (nextScreen !== "task-ledger") {
503-      render();
504-      return;
505-    }
506-
507-    render();
508-
509-    if (state.__taskLedgerContextRefreshing) {
510-      return;
511-    }
512-
513-    if (typeof loadContext !== "function") {
514-      render();
515-      return;
516-    }
517-
518-    state.__taskLedgerContextRefreshing = true;
519-
520-    Promise.resolve()
521-      .then(function () {
522-        return loadContext();
523-      })
524-      .catch(function (error) {
525:        state.errorMessage = error && error.message ? error.message : "部門別タスク台帳の最新情報取得に失敗しました。";
526-      })
527-      .then(function () {
528-        state.__taskLedgerContextRefreshing = false;
529:        state.screen = "task-ledger";
530-        render();
531-      });
532-  }
533-
534-  function pageTitle() {
535-    if (state.screen === "company-new") return "AI企業新規追加";
536-    if (state.screen === "department-new") return "部門新規追加";
537-    if (state.screen === "section-new") return "課新規追加";
538-    if (state.screen === "placement-new") return "Worker配置";
539-    if (state.screen === "settings") return "AI企業設定";
540-    return "AI企業ダッシュボード";
541-  }
542-
543-  
544-// AICM_WORKER_RUNTIME_UI_NAV_AXT_R1_V1
545-function renderShell(content) {
546-    return [
547-      '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
548-      '  <header class="aicm-core-header">',
549-      '    <h1>AI企業運営アプリ</h1>',
550-      '  </header>',
551-      '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
552-      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
553:      '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳</button>',
554-      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
555-      '  <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
556-      '  </nav>',
557-      renderMessages(),
558-      '  <main class="aicm-core-main">',
559-      content,
560-      '  </main>',
561-      '</div>'
562-    ].join("");
563-  }
564-
565-  function renderMessages() {
566-    var parts = [];
567-
568-    if (state.loading) {
569-      parts.push('<div class="aicm-core-message">読込中...</div>');
570-    }
571-
572-    if (state.noticeMessage) {
573-      parts.push('<div class="aicm-core-message aicm-core-message-ok">' + escapeHtml(state.noticeMessage) + '</div>');
574-    }
575-
576-    if (state.errorMessage) {
577-      parts.push('<div class="aicm-core-message aicm-core-message-error">' + escapeHtml(state.errorMessage) + '</div>');
578-    }
579-
580-    return parts.join("");
581-  }
582-
583-  function renderCompanySelect() {
584-    if (state.context.companies.length === 0) {
585-      return '<p class="aicm-core-empty">v2会社はまだありません。AI企業新規追加から作成してください。</p>';
586-    }
587-
588-    return [
589-      '<label>AI企業</label>',
590-      '<select data-core-field="selectedCompanyId">',
591-      state.context.companies.map(function (company) {
592-        var selected = company.aicm_user_company_id === state.selectedCompanyId ? " selected" : "";
593-        return '<option value="' + escapeHtml(company.aicm_user_company_id) + '"' + selected + '>' + escapeHtml(company.company_name) + '</option>';
594-      }).join(""),
595-      '</select>'
596-    ].join("");
597-  }
598-
599-  function renderDepartmentSelect() {
600-    var departments = companyDepartments(state.selectedCompanyId);
601-
602-    if (departments.length === 0) {
603-      return '<p class="aicm-core-empty">この会社のv2部門はまだありません。</p>';
604-    }
605-
606-    return [
607-      '<label>部門</label>',
608-      '<select data-core-field="selectedDepartmentId">',
609-      departments.map(function (department) {
610-        var selected = department.aicm_user_company_department_id === state.selectedDepartmentId ? " selected" : "";
611-        return '<option value="' + escapeHtml(department.aicm_user_company_department_id) + '"' + selected + '>' + escapeHtml(department.department_name) + '</option>';
612-      }).join(""),
613-      '</select>'
614-    ].join("");
615-  }
616-
617-  
618-
619-function renderDashboard() {
620-    var company = selectedCompany();
621-    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
622-    var sections = departments.reduce(function (acc, department) {
623-      return acc.concat(departmentSections(department.aicm_user_company_department_id));
624-    }, []);
625-    var placements = company ? companyPlacements(company.aicm_user_company_id) : [];
626-
627-    return renderShell([
628-      '<section class="aicm-dashboard-grid aicm-dashboard-main-grid">',
629-      '  <div class="aicm-core-card aicm-card-primary">',
630-      '    <div class="aicm-card-title-row">',
631-      '      <div>',
632-      '        <p class="aicm-eyebrow">AI企業</p>',
633-      '        <h2>AI企業選択</h2>',
634-      '      </div>',
635-      '      <button type="button" data-core-action="reload">AI企業を表示</button>',
636-      '    </div>',
637-      renderCompanySelect(),
638-      company ? '<p class="aicm-selected-note">選択中: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
639-      '  </div>',
640-
641-      '  <div class="aicm-core-card">',
642-      '    <p class="aicm-eyebrow">会社概要</p>',
643-      '    <h2>会社概要</h2>',
644-      company ? renderCompanyOverview(company, departments, sections, placements) : renderNoCompanyCard(),
645-      '  </div>',
646-      '</section>',
647-
648-      '<section class="aicm-core-card">',
649-      '  <p class="aicm-eyebrow">部門 / 課</p>',
650-      '  <h2>部門 / 課</h2>',
651-      renderTree(departments),
652-      '</section>'
653-    ].join(""));
654-  }
655-
656-  
657-function metricCard(label, value, caption) {
658-    return [
659-      '<div class="aicm-metric-card">',
660-      '  <p>' + escapeHtml(label) + '</p>',
661-      '  <strong>' + escapeHtml(value) + '</strong>',
662-      '  <span>' + escapeHtml(caption) + '</span>',
663-      '</div>'
664-    ].join("");
665-  }
666-
667-  
668-
669-// AICM_ORG_UPDATE_UI_ARU_ARX_V1
670-// Company / Department / Section update UI.
671-// No bridge, no diagnostic layer, no legacy localStorage owner.
672-
673-function aicmOrgCtx() {
--
1164-    aicm_user_company_section_id: row.aicm_user_company_section_id || "",
1165-    robot_pool_id: row.robot_pool_id || "",
1166-    aiworker_model_code: row.aiworker_model_code || "unknown",
1167-    internal_nickname: row.internal_nickname || ""
1168-  };
1169-}
1170-
1171-function aicmAxcCompanyRolePlacements(company) {
1172-  var selected = aicmAxcSelectedRobotMeta("aicm-company-president-robot");
1173-  if (!company || !selected) return [];
1174-  var row = aicmAxcBuildRolePlacement({
1175-    role_code: "President",
1176-    target_level_code: "company",
1177-    target_id: company.aicm_user_company_id,
1178-    robot_pool_id: selected.robot_pool_id,
1179-    aiworker_model_code: selected.aiworker_model_code,
1180-    internal_nickname: aicmAxcInputValue("aicm-company-president-robot-nickname")
1181-  });
1182-  return row ? [row] : [];
1183-}
1184-
1185-function aicmAxcDepartmentRolePlacements(department) {
1186-  var selected = aicmAxcSelectedRobotMeta("aicm-department-manager-robot");
1187-  if (!department || !selected) return [];
1188-  var row = aicmAxcBuildRolePlacement({
1189-    role_code: "Manager",
1190-    target_level_code: "department",
1191-    target_id: department.aicm_user_company_department_id,
1192-    aicm_user_company_department_id: department.aicm_user_company_department_id,
1193-    robot_pool_id: selected.robot_pool_id,
1194-    aiworker_model_code: selected.aiworker_model_code,
1195-    internal_nickname: aicmAxcInputValue("aicm-department-manager-robot-nickname")
1196-  });
1197-  return row ? [row] : [];
1198-}
1199-
1200-function aicmAxcSectionRolePlacements(section) {
1201-  var rows = [];
1202-  if (!section) return rows;
1203-
1204:  var leader = aicmAxcSelectedRobotMeta("aicm-section-leader-robot");
1205:  var leaderRow = aicmAxcBuildRolePlacement({
1206:    role_code: "Leader",
1207-    target_level_code: "section",
1208-    target_id: section.aicm_user_company_section_id,
1209-    aicm_user_company_department_id: section.aicm_user_company_department_id,
1210-    aicm_user_company_section_id: section.aicm_user_company_section_id,
1211:    robot_pool_id: leader ? leader.robot_pool_id : "",
1212:    aiworker_model_code: leader ? leader.aiworker_model_code : "",
1213:    internal_nickname: aicmAxcInputValue("aicm-section-leader-robot-nickname")
1214-  });
1215:  if (leaderRow) rows.push(leaderRow);
1216-
1217-  var index = 0;
1218-  while (index < 30) {
1219-    var robotEl = aicmAxcFindElement([
1220-      "aicm-inline-worker-" + String(index) + "-robot",
1221-      "aicm-role-worker-robot-" + String(index),
1222-      "aicm-role-worker-section-robot-" + String(index),
1223-      "aicm-role-worker-section-new-robot-" + String(index)
1224-    ]);
1225-
1226-    var nickEl = aicmAxcFindElement([
1227-      "aicm-inline-worker-" + String(index) + "-nickname",
1228-      "aicm-role-worker-nickname-" + String(index),
1229-      "aicm-role-worker-section-nickname-" + String(index),
1230-      "aicm-role-worker-section-new-nickname-" + String(index)
1231-    ]);
1232-
1233-    if (!robotEl && !nickEl) break;
1234-
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
1305-    aicmAvdShowDbConfirm({
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
--
1614-
1615-    if (event && event.target && event.target.getAttribute) return event.target;
1616-
1617-    return null;
1618-  }
1619-
1620-
1621-  
1622-
1623-// AICM_EDIT_ROLE_SETTING_CARDS_ATM_ATP_V1
1624-// Role setting cards are UI navigation only in this phase.
1625-// Actual DB writes must go through confirmation screen in a later API-connected phase.
1626-
1627-function aicmPlacementRoleText(row) {
1628-    if (!row || typeof row !== "object") return "";
1629-    return [
1630-      row.role_code,
1631-      row.placement_role_code,
1632-      row.assignment_role_code,
1633-      row.worker_role_code,
1634-      row.role_name,
1635-      row.role_label,
1636-      row.position_code,
1637-      row.position_label,
1638-      row.display_role,
1639-      row.role_display_name
1640-    ].filter(Boolean).join(" ").toLowerCase();
1641-  }
1642-
1643-function aicmPlacementMatchesRole(row, roleCode) {
1644-    var text = aicmPlacementRoleText(row);
1645-
1646-    if (roleCode === "president") {
1647-      return text.indexOf("president") >= 0 || text.indexOf("社長") >= 0 || text.indexOf("プレジデント") >= 0;
1648-    }
1649-
1650-    if (roleCode === "manager") {
1651-      return text.indexOf("manager") >= 0 || text.indexOf("部長") >= 0 || text.indexOf("マネージャ") >= 0;
1652-    }
1653-
1654:    if (roleCode === "leader") {
1655:      return text.indexOf("leader") >= 0 || text.indexOf("課長") >= 0 || text.indexOf("リーダ") >= 0;
1656-    }
1657-
1658-    if (roleCode === "worker") {
1659-      return text.indexOf("worker") >= 0 || text.indexOf("従業員") >= 0 || text.indexOf("ワーカー") >= 0;
1660-    }
1661-
1662-    return false;

============================================================
9. classification
============================================================
FINAL_JUDGEMENT=V10L_A2_AUDIT_PASS_READY_FOR_UI_SPEC
NEXT_ACTION=V10L_B_PATCH_LEDGER_MULTI_SEND_TO_LEADER_UI
WARN_COUNT=0
WARNINGS=
TASK_LEDGER_COUNT=2
MANAGER_MAJOR_COUNT=38
LEADER_MIDDLE_COUNT=4
WORKER_UNIT_COUNT=4
REVIEW_PENDING_COUNT=0
AUTO_CHAIN_DATA_STATUS=AUTO_CHAIN_DATA_EXISTS
SERVER_LEADER_AUTO_ROUTE_COUNT=1
SERVER_LEADER_AUTO_FUNCTION_COUNT=2
CORE_LEADER_SEND_LABEL_COUNT=35
CORE_LEADER_AUTO_ROUTE_COUNT=1
CORE_BULK_SELECT_COUNT=3
CORE_CONFIRM_COUNT=11
LATEST_REPORT=/000_R8Z_V10L_A_LEADER_SEND_EXISTING_ROUTE_AUDIT_REPORT.md
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_a2_failed_salvage_and_safe_audit_20260504_074947/010_db_safe_audit.tsv
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_a2_failed_salvage_and_safe_audit_20260504_074947/020_server_safe_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_a2_failed_salvage_and_safe_audit_20260504_074947/030_core_safe_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_a2_failed_salvage_and_safe_audit_20260504_074947/040_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_a2_failed_salvage_and_safe_audit_20260504_074947/000_R8Z_V10L_A2_FAILED_SALVAGE_AND_SAFE_AUDIT_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
