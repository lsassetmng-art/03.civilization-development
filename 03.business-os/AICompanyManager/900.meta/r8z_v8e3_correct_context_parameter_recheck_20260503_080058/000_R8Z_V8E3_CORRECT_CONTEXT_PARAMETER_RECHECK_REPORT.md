
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- R8Z-V8BでDB上の既知request_id/titleは発見済み
- V8E rollback後も context API が500だった
- ただし500 bodyは:
  owner_civilization_id must be UUID
- server route実装は:
  getContext(url.searchParams.get("owner_civilization_id") || "")
- つまり、今までのcurl確認URLが owner_id/company_id で誤っていた可能性が高い

今回の作業:
1. server/core syntax確認
2. server context routeの実装paramを再確認
3. core側がどのparam名でcontextを呼ぶか確認
4. 正しい owner_civilization_id でcontext APIをGET
5. review_wait_items / 既知request_id / 既知title が出るか確認
6. DB上の既知targetが今もあるか軽く再確認

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8E3 correct context parameter recheck
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e3_correct_context_parameter_recheck_20260503_080058
DB_READ=YES
DB_WRITE=NO
API_GET=YES
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
3. route and core param scan
============================================================
---- server context route ----
226-      section_name: aicmPmlwOptionalText(row.section_name),
227-      major_item_name: majorName,
228-      major_item_description: aicmPmlwOptionalText(row.major_item_description || row.description || row.task_name || row.note),
229-      assigned_leader_label: aicmPmlwOptionalText(row.assigned_leader_label || row.leader_label || row.responsible_role_code),
230-      priority_code: aicmPmlwPriority(row.priority_code),
231-      due_date: aicmPmlwOptionalText(row.due_date),
232-      note: aicmPmlwOptionalText(row.note)
233-    };
234-  }).filter((row) => row.major_item_name.length > 0);
235-}
236-
237-function createPresidentPolicy(body) {
238:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
239-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
240-  const title = requiredText(body.policy_title || body.title, "policy_title");
241-  const text = requiredText(body.policy_text || body.president_policy_instruction_text || body.description, "policy_text");
242-
243-  const sql = [
244-    "WITH inserted AS (",
245-    "  INSERT INTO business.aicm_president_policy (",
246:    "    owner_civilization_id, aicm_user_company_id, source_route_code, policy_title, policy_text,",
247-    "    president_robot_label, requested_by_text, company_common_rules_snapshot,",
248-    "    policy_status_code, priority_code, due_date,",
249-    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
250-    "  ) VALUES (",
251-    "    " + sqlLiteral(owner) + "::uuid,",
252-    "    " + sqlLiteral(companyId) + "::uuid,",
253-    "    " + sqlLiteral(body.source_route_code || "user_to_president") + ",",
254-    "    " + sqlLiteral(title) + ",",
255-    "    " + sqlLiteral(text) + ",",
256-    "    " + aicmPmlwTextSql(body.president_robot_label) + ",",
257-    "    " + aicmPmlwTextSql(body.requested_by_text || "user") + ",",
258-    "    " + aicmPmlwTextSql(body.company_common_rules_snapshot) + ",",
--
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
282:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
283-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
284-  const majorName = requiredText(body.major_item_name || body.deliverable_name || body.task_name, "major_item_name");
285-
286-  const sql = [
287-    "WITH inserted AS (",
288-    "  INSERT INTO business.aicm_manager_major_work_item (",
289:    "    owner_civilization_id, aicm_user_company_id, aicm_president_policy_id,",
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
--
318-    "SELECT jsonb_build_object(",
319-    "  'result', 'ok',",
320-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
321-    "  'manager_major_item', to_jsonb(inserted)",
322-    ")::text",
323-    "FROM inserted;"
324-  ].join("\n");
325-
326-  return runPsqlJson(sql);
327-}
328-
329-function updateManagerMajorItem(body) {
330:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
331-  const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");
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
--
346-  if (body.supplemental_materials_text !== undefined) updates.push("supplemental_materials_text = " + aicmPmlwTextSql(body.supplemental_materials_text));
347-  if (body.applicable_rules_text !== undefined) updates.push("applicable_rules_text = " + aicmPmlwTextSql(body.applicable_rules_text));
348-  if (body.note !== undefined) updates.push("note = " + aicmPmlwTextSql(body.note));
349-  if (body.handoff_link !== undefined) updates.push("handoff_link = " + aicmPmlwTextSql(body.handoff_link));
350-
351-  updates.push("updated_at = now()");
352-
353-  const sql = [
354-    "WITH updated AS (",
355-    "  UPDATE business.aicm_manager_major_work_item",
356-    "  SET " + updates.join(", "),
357-    "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
358:    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
359-    "  RETURNING *",
360-    ")",
361-    "SELECT jsonb_build_object(",
362-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
363-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
364-    "  'manager_major_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
365-    ")::text;"
366-  ].join("\n");
367-
368-  return runPsqlJson(sql);
369-}
370-
371-function archiveManagerMajorItem(body) {
372:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
373-  const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");
374-
375-  const sql = [
376-    "WITH archived AS (",
377-    "  UPDATE business.aicm_manager_major_work_item",
378-    "  SET decomposition_status_code = 'archived',",
379-    "      handoff_status_code = 'archived',",
380-    "      updated_at = now()",
381-    "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
382:    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
383-    "  RETURNING *",
384-    ")",
385-    "SELECT jsonb_build_object(",
386-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM archived) THEN 'ok' ELSE 'not_found' END,",
387-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
388-    "  'manager_major_item', COALESCE((SELECT to_jsonb(archived) FROM archived), '{}'::jsonb)",
389-    ")::text;"
390-  ].join("\n");
391-
392-  return runPsqlJson(sql);
393-}
394-
395-function importManagerMajorItemsCsv(body) {
396:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
397-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
398-  const rows = aicmPmlwCsvRows(body);
399-
400-  if (rows.length === 0) {
401-    return { result: "ok", api_identifier: SERVER_MARK, inserted_count: 0, manager_major_items: [] };
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
421:    "WITH input_rows(row_order, owner_civilization_id, aicm_user_company_id, department_name, section_name, major_item_name, major_item_description, assigned_leader_label, priority_code, due_date, note) AS (",
422-    "  VALUES",
423-    "    " + values,
424-    "), resolved AS (",
425-    "  SELECT i.*, (",
426-    "    SELECT d.aicm_user_company_department_id",
427-    "    FROM business.aicm_user_company_department d",
428:    "    WHERE d.owner_civilization_id = i.owner_civilization_id",
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
440:    "    WHERE s.owner_civilization_id = r.owner_civilization_id",
441-    "      AND s.aicm_user_company_id = r.aicm_user_company_id",
442-    "      AND s.section_status = 'active'",
443-    "      AND (r.department_id IS NULL OR s.aicm_user_company_department_id = r.department_id)",
444-    "      AND (r.section_name = '' OR s.section_name = r.section_name)",
445-    "    ORDER BY CASE WHEN s.section_name = r.section_name THEN 0 ELSE 1 END, s.display_order, s.created_at",
446-    "    LIMIT 1",
447-    "  ) AS section_id",
448-    "  FROM resolved r",
449-    "), inserted AS (",
450-    "  INSERT INTO business.aicm_manager_major_work_item (",
451:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
452-    "    major_item_name, major_item_description, source_route_code, assigned_leader_label,",
453-    "    decomposition_status_code, handoff_status_code, priority_code, due_date, note, display_order",
454-    "  )",
455:    "  SELECT owner_civilization_id, aicm_user_company_id, department_id, section_id,",
456-    "         major_item_name, major_item_description, 'csv_import', assigned_leader_label,",
457-    "         'not_started', 'draft', priority_code, due_date, note, 100 + row_order",
458-    "  FROM resolved_section",
459-    "  RETURNING *",
460-    ")",
461-    "SELECT jsonb_build_object(",
462-    "  'result', 'ok',",
463-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
464-    "  'inserted_count', (SELECT count(*) FROM inserted),",
465-    "  'manager_major_items', COALESCE((SELECT jsonb_agg(to_jsonb(inserted) ORDER BY display_order, created_at) FROM inserted), '[]'::jsonb)",
466-    ")::text;"
467-  ].join("\n");
--
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
519:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
520-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
521-  const title = requiredText(body.review_title || body.title, "review_title");
522-
523-  const sql = [
524-    "WITH inserted AS (",
525-    "  INSERT INTO business.aicm_human_review_item (",
526:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
527-    "    related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id,",
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
--
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
573:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
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
585:    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
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
599:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
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
611:    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
612-    "  RETURNING *",
613-    ")",
614-    "SELECT jsonb_build_object(",
615-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
616-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
617-    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
618-    ")::text;"
619-  ].join("\n");
620-
621-  return runPsqlJson(sql);
622-}
623-
--
633-}
634-
635-function aicmOrgUpdateTextSql(value) {
636-  return sqlLiteral(String(value || ""));
637-}
638-
639-function aicmOrgUpdateStatus(value, allowed, fallback) {
640-  const text = String(value || fallback).trim();
641-  return allowed.includes(text) ? text : fallback;
642-}
643-
644-function updateCompany(body) {
645:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
646-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
647-  const name = requiredText(body.company_name || body.companyName, "company_name");
648-
649-  const sql = [
650-    "WITH updated AS (",
651-    "  UPDATE business.aicm_user_company",
652-    "  SET company_name = " + sqlLiteral(name) + ",",
653-    "      business_domain = " + aicmOrgUpdateTextSql(body.business_domain || body.businessDomain) + ",",
654-    "      company_common_rules_text = " + aicmOrgUpdateTextSql(body.company_common_rules_text || body.companyCommonRulesText) + ",",
655-    "      president_policy_instruction_text = " + aicmOrgUpdateTextSql(body.president_policy_instruction_text || body.presidentPolicyInstructionText) + ",",
656-    "      updated_at = now()",
657-    "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
658:    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
659-    "  RETURNING *",
660-    ")",
661-    "SELECT jsonb_build_object(",
662-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
663-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
664-    "  'company', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
665-    ")::text;"
666-  ].join("\n");
667-
668-  return runPsqlJson(sql);
669-}
670-
671-function updateDepartment(body) {
672:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
673-  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
674-  const name = requiredText(body.department_name || body.departmentName, "department_name");
675-  const status = aicmOrgUpdateStatus(body.department_status || body.department_status_code, ["active", "inactive", "archived"], "active");
676-
677-  const sql = [
678-    "WITH updated AS (",
679-    "  UPDATE business.aicm_user_company_department",
680-    "  SET department_name = " + sqlLiteral(name) + ",",
681-    "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
682-    "      department_status = " + sqlLiteral(status) + ",",
683-    "      updated_at = now()",
684-    "  WHERE aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
685:    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
686-    "  RETURNING *",
687-    ")",
688-    "SELECT jsonb_build_object(",
689-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
690-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
691-    "  'department', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
692-    ")::text;"
693-  ].join("\n");
694-
695-  return runPsqlJson(sql);
696-}
697-
698-function updateSection(body) {
699:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
700-  const sectionId = requiredUuid(body.aicm_user_company_section_id, "aicm_user_company_section_id");
701-  const name = requiredText(body.section_name || body.sectionName, "section_name");
702-  const status = aicmOrgUpdateStatus(body.section_status || body.section_status_code, ["active", "inactive", "archived"], "active");
703-
704-  const sql = [
705-    "WITH updated AS (",
706-    "  UPDATE business.aicm_user_company_section",
707-    "  SET section_name = " + sqlLiteral(name) + ",",
708-    "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
709-    "      section_status = " + sqlLiteral(status) + ",",
710-    "      updated_at = now()",
711-    "  WHERE aicm_user_company_section_id = " + sqlLiteral(sectionId) + "::uuid",
712:    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
713-    "  RETURNING *",
714-    ")",
715-    "SELECT jsonb_build_object(",
716-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
717-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
718-    "  'section', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
719-    ")::text;"
720-  ].join("\n");
721-
722-  return runPsqlJson(sql);
723-}
724-
725-
726:function getContext(ownerCivilizationId) {
727:  const owner = requiredUuid(ownerCivilizationId, "owner_civilization_id");
728-
729-  const sql = [
730-    "SELECT jsonb_build_object(",
731-    "  'result', 'ok',",
732-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
733:    "  'owner_civilization_id', " + sqlLiteral(owner) + ",",
734-    "  'companies', (",
735-    "    SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC), '[]'::jsonb)",
736-    "    FROM business.aicm_user_company c",
737:    "    WHERE c.owner_civilization_id::text = " + sqlLiteral(owner),
738-    "      AND c.company_status = 'active'",
739-    "  ),",
740-    "  'departments', (",
741-    "    SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.display_order, d.created_at), '[]'::jsonb)",
742-    "    FROM business.aicm_user_company_department d",
743:    "    WHERE d.owner_civilization_id::text = " + sqlLiteral(owner),
744-    "      AND d.department_status = 'active'",
745-    "  ),",
746-    "  'sections', (",
747-    "    SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.display_order, s.created_at), '[]'::jsonb)",
748-    "    FROM business.aicm_user_company_section s",
749:    "    WHERE s.owner_civilization_id::text = " + sqlLiteral(owner),
750-    "      AND s.section_status = 'active'",
751-    "  ),",
752-    "  'placements', (",
753-    "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb)",
754-    "    FROM business.vw_aicm_user_company_worker_placement_display p",
755:    "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
756-    "      AND p.status_code = 'active'",
757-    "  ),",
758-    "  'task_ledger', (",
759-    "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.display_order, t.created_at DESC), '[]'::jsonb)",
760-    "    FROM business.vw_aicm_user_company_department_task_ledger_display t",
761:    "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
762-    "      AND t.task_status_code <> 'archived'",
763-    "  ),",
764-    // AICM_PMLW_GETCONTEXT_SQL_EXTENSION_AQP_AQS_V1
765-    "  'pmlw_president_policies', (",
766-    "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.display_order ASC, p.updated_at DESC, p.created_at DESC), '[]'::jsonb)",
767-    "    FROM business.vw_aicm_pmlw_president_policy_display p",
768:    "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
769-    "  ),",
770-    "  'pmlw_major_items', (",
771-    "    SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order ASC, m.updated_at DESC, m.created_at DESC), '[]'::jsonb)",
772-    "    FROM business.vw_aicm_pmlw_major_work_display m",
773:    "    WHERE m.owner_civilization_id::text = " + sqlLiteral(owner),
774-    "  ),",
775-    "  'pmlw_middle_items', (",
776-    "    SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.display_order ASC, l.updated_at DESC, l.created_at DESC), '[]'::jsonb)",
777-    "    FROM business.vw_aicm_pmlw_leader_middle_display l",
778:    "    WHERE l.owner_civilization_id::text = " + sqlLiteral(owner),
779-    "  ),",
780-    "  'pmlw_deliverable_requirements', (",
781-    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.display_order ASC, r.updated_at DESC, r.created_at DESC), '[]'::jsonb)",
782-    "    FROM business.vw_aicm_pmlw_deliverable_requirement_display r",
783:    "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
784-    "  ),",
785-    "  'pmlw_worker_work_units', (",
786-    "    SELECT COALESCE(jsonb_agg(to_jsonb(w) ORDER BY w.display_order ASC, w.updated_at DESC, w.created_at DESC), '[]'::jsonb)",
787-    "    FROM business.vw_aicm_pmlw_worker_work_unit_display w",
788:    "    WHERE w.owner_civilization_id::text = " + sqlLiteral(owner),
789-    "  ),",
790-    "  'pmlw_workflow_tree', (",
791-    "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.last_updated_at DESC NULLS LAST), '[]'::jsonb)",
792-    "    FROM business.vw_aicm_pmlw_workflow_tree t",
793:    "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
794-    "  ),",
795-    // AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1_CONTEXT
796-    "  'review_wait_items', (",
797-    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.priority_code DESC, r.requested_at DESC, r.created_at DESC), '[]'::jsonb)",
798-    "    FROM business.vw_aicm_human_review_wait_display r",
799:    "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
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
812:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
813-  const name = requiredText(body.company_name, "company_name");
814-  const domain = String(body.business_domain || "");
815-
816-  const sql = [
817-    "WITH inserted AS (",
818-    "  INSERT INTO business.aicm_user_company (",
819:    "    owner_civilization_id, company_name, business_domain, company_status, selected_flag",
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
841:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
842-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
843-  const name = requiredText(body.department_name, "department_name");
844-  const purpose = String(body.purpose || "");
845-
846-  const sql = [
847-    "WITH company_ok AS (",
848-    "  SELECT aicm_user_company_id",
849-    "  FROM business.aicm_user_company",
850:    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
851-    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
852-    "    AND company_status = 'active'",
853-    "  LIMIT 1",
854-    "), inserted AS (",
855-    "  INSERT INTO business.aicm_user_company_department (",
856:    "    owner_civilization_id, aicm_user_company_id, department_name, purpose, department_status",
857-    "  )",
858-    "  SELECT",
859-    "    " + sqlLiteral(owner) + "::uuid,",
860-    "    aicm_user_company_id,",
861-    "    " + sqlLiteral(name) + ",",
862-    "    " + sqlLiteral(purpose) + ",",
863-    "    'active'",
864-    "  FROM company_ok",
865-    "  RETURNING *",
866-    ")",
867-    "SELECT CASE",
868-    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
--
875-    "    jsonb_build_object(",
876-    "      'result', 'error',",
877-    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
878-    "      'error_message', '先にv2のAI企業を作成・選択してください。旧ローカル会社IDでは部門保存できません。'",
879-    "    )::text",
880-    "END;"
881-  ].join("\n");
882-
883-  return runPsqlJson(sql);
884-}
885-
886-function createSection(body) {
887:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
888-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
889-  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
890-  const name = requiredText(body.section_name, "section_name");
891-  const purpose = String(body.purpose || "");
892-
893-  const sql = [
894-    "WITH department_ok AS (",
895-    "  SELECT aicm_user_company_id, aicm_user_company_department_id",
896-    "  FROM business.aicm_user_company_department",
897:    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
898-    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
899-    "    AND aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
900-    "    AND department_status = 'active'",
901-    "  LIMIT 1",
902-    "), inserted AS (",
903-    "  INSERT INTO business.aicm_user_company_section (",
904:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, section_name, purpose, section_status",
905-    "  )",
906-    "  SELECT",
907-    "    " + sqlLiteral(owner) + "::uuid,",
908-    "    aicm_user_company_id,",
909-    "    aicm_user_company_department_id,",
910-    "    " + sqlLiteral(name) + ",",
911-    "    " + sqlLiteral(purpose) + ",",
912-    "    'active'",
913-    "  FROM department_ok",
914-    "  RETURNING *",
915-    ")",
916-    "SELECT CASE",
--
925-    "      'result', 'error',",
926-    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
927-    "      'error_message', '先にv2のAI企業と部門を作成・選択してください。旧ローカルIDでは課保存できません。'",
928-    "    )::text",
929-    "END;"
930-  ].join("\n");
931-
932-  return runPsqlJson(sql);
933-}
934-
935-
936-function createTaskLedger(body) {
937:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
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
960:    "  WHERE d.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
961-    "    AND d.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
962-    "    AND d.aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
963-    "    AND d.department_status = 'active'",
964-    "    AND c.company_status = 'active'",
965-    "  LIMIT 1",
966-    "), inserted AS (",
967-    "  INSERT INTO business.aicm_user_company_department_task_ledger (",
968:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
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
980-    "    " + sqlLiteral(workTypeCode) + ",",
--
1003-    "      'result', 'error',",
1004-    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
1005-    "      'error_message', '先にv2のAI企業と部門を作成・選択してください。'",
1006-    "    )::text",
1007-    "END;"
1008-  ].join("\n");
1009-
1010-  return runPsqlJson(sql);
1011-}
1012-
1013-
1014-function createPlacement(body) {
1015:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
1016-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1017-  const roleCode = requiredText(body.role_code, "role_code");
1018-  const modelCode = requiredText(body.aiworker_model_code, "aiworker_model_code");
1019-
1020-  const departmentId = String(body.aicm_user_company_department_id || "").trim();
1021-  const sectionId = String(body.aicm_user_company_section_id || "").trim();
1022-  const targetLevelCode = requiredText(body.target_level_code || "company", "target_level_code");
1023-  const targetId = String(body.target_id || "").trim();
1024-  const robotPoolId = String(body.robot_pool_id || "").trim();
1025-  const nickname = String(body.internal_nickname || "");
1026-
1027-  const departmentSql = departmentId ? sqlLiteral(departmentId) + "::uuid" : "NULL";
1028-  const sectionSql = sectionId ? sqlLiteral(sectionId) + "::uuid" : "NULL";
1029-  const targetSql = targetId ? sqlLiteral(targetId) + "::uuid" : "NULL";
1030-  const robotPoolSql = robotPoolId ? sqlLiteral(robotPoolId) + "::uuid" : "NULL";
1031-
1032-  const sql = [
1033-    "WITH company_ok AS (",
1034-    "  SELECT aicm_user_company_id",
1035-    "  FROM business.aicm_user_company",
1036:    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
1037-    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1038-    "    AND company_status = 'active'",
1039-    "  LIMIT 1",
1040-    "), inserted AS (",
1041-    "  INSERT INTO business.aicm_user_company_worker_placement (",
1042:    "    owner_civilization_id, aicm_user_company_id,",
1043-    "    aicm_user_company_department_id, aicm_user_company_section_id,",
1044-    "    target_level_code, target_id, app_code, role_code, robot_pool_id,",
1045-    "    aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code",
1046-    "  )",
1047-    "  SELECT",
1048-    "    " + sqlLiteral(owner) + "::uuid,",
1049-    "    aicm_user_company_id,",
1050-    "    " + departmentSql + ",",
1051-    "    " + sectionSql + ",",
1052-    "    " + sqlLiteral(targetLevelCode) + ",",
1053-    "    " + targetSql + ",",
1054-    "    'AICompanyManager',",
--
1121-      target_level_code: targetLevelCode,
1122-      aicm_user_company_department_id: String(row.aicm_user_company_department_id || row.departmentId || "").trim(),
1123-      aicm_user_company_section_id: String(row.aicm_user_company_section_id || row.sectionId || row.organizationId || "").trim(),
1124-      target_id: String(row.target_id || row.targetId || "").trim(),
1125-      robot_pool_id: String(row.robot_pool_id || row.robotPoolId || "").trim(),
1126-      aiworker_model_code: String(row.aiworker_model_code || row.aiworkerModelCode || "").trim(),
1127-      internal_nickname: String(row.internal_nickname || row.internalNickname || "").trim()
1128-    };
1129-  });
1130-}
1131-
1132-function syncRoleSettings(body) {
1133:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
1134-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1135-  const submittedRows = aicmRoleSyncRows(body);
1136-
1137-  const targetKeys = [];
1138-  const insertRows = [];
1139-
1140-  for (const row of submittedRows) {
1141-    const targetId = row.target_id ||
1142-      (row.target_level_code === "company" ? companyId : "") ||
1143-      (row.target_level_code === "department" ? row.aicm_user_company_department_id : "") ||
1144-      (row.target_level_code === "section" ? row.aicm_user_company_section_id : "");
1145-
--
1200-    ", " + aicmRoleSyncOptionalUuidSql(row.robot_pool_id),
1201-    ", " + sqlLiteral(row.aiworker_model_code),
1202-    ", " + sqlLiteral(row.internal_nickname),
1203-    ")"
1204-  ].join("")).join(",\n    ") : "";
1205-
1206-  const insertCte = insertRows.length ? [
1207-    "), insert_rows(row_order, target_level_code, target_id, role_code, aicm_user_company_department_id, aicm_user_company_section_id, robot_pool_id, aiworker_model_code, internal_nickname) AS (",
1208-    "  VALUES",
1209-    "    " + insertValues,
1210-    "), inserted AS (",
1211-    "  INSERT INTO business.aicm_user_company_worker_placement (",
1212:    "    owner_civilization_id, aicm_user_company_id,",
1213-    "    aicm_user_company_department_id, aicm_user_company_section_id,",
1214-    "    target_level_code, target_id, app_code, role_code, robot_pool_id,",
1215-    "    aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code",
1216-    "  )",
1217-    "  SELECT",
1218-    "  -- AICM_ROLE_SYNC_UUID_CAST_AXM_V1",
1219-    "    " + sqlLiteral(owner) + "::uuid,",
1220-    "    c.aicm_user_company_id,",
1221-    "    i.aicm_user_company_department_id::uuid,",
1222-    "    i.aicm_user_company_section_id::uuid,",
1223-    "    i.target_level_code,",
1224-    "    i.target_id,",
--
1235-    "  RETURNING *"
1236-  ].join("\n") : [
1237-    "), inserted AS (",
1238-    "  SELECT *",
1239-    "  FROM business.aicm_user_company_worker_placement",
1240-    "  WHERE false"
1241-  ].join("\n");
1242-
1243-  const sql = [
1244-    "WITH company_ok AS (",
1245-    "  SELECT aicm_user_company_id",
1246-    "  FROM business.aicm_user_company",
1247:    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
1248-    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1249-    "    AND company_status = 'active'",
1250-    "  LIMIT 1",
1251-    "), target_keys(row_order, target_level_code, target_id, role_code, aicm_user_company_department_id, aicm_user_company_section_id) AS (",
1252-    "  VALUES",
1253-    "    " + targetValues,
1254-    "), archived AS (",
1255-    "  UPDATE business.aicm_user_company_worker_placement p",
1256-    "  SET status_code = 'archived',",
1257-    "      updated_at = now(),",
1258-    "      metadata_jsonb = COALESCE(p.metadata_jsonb, '{}'::jsonb) || jsonb_build_object('archived_by', 'AICompanyManager.role_settings_sync', 'archived_at', now()::text)",
1259-    "  FROM target_keys k",
1260:    "  WHERE p.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
1261-    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1262-    "    AND p.app_code = 'AICompanyManager'",
1263-    "    AND p.status_code = 'active'",
1264-    "    AND lower(p.target_level_code) = lower(k.target_level_code)",
1265-    "    AND p.target_id = k.target_id",
1266-    "    AND lower(p.role_code) = lower(k.role_code)",
1267-    "  RETURNING p.*",
1268-    insertCte,
1269-    ")",
1270-    "SELECT jsonb_build_object(",
1271-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM company_ok) THEN 'ok' ELSE 'error' END,",
1272-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
--
1375-  return base.replace(/\/+$/, "");
1376-}
1377-
1378-function aicmWorkerRuntimeAuthToken() {
1379-  const token = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN);
1380-  if (!token) {
1381-    throw new Error("PERSONA_AIWORKEROS_AUTH_TOKEN is not set");
1382-  }
1383-  return token;
1384-}
1385-
1386-function getAicmWorkerRuntimePlacement(body) {
1387:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
1388-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1389-  const placementId = requiredUuid(body.aicm_user_company_worker_placement_id, "aicm_user_company_worker_placement_id");
1390-
1391-  const sql = [
1392-    "WITH placement AS (",
1393-    "  SELECT",
1394-    "    p.aicm_user_company_worker_placement_id,",
1395:    "    p.owner_civilization_id,",
1396-    "    p.aicm_user_company_id,",
1397-    "    p.aicm_user_company_department_id,",
1398-    "    p.aicm_user_company_section_id,",
1399-    "    p.target_level_code,",
1400-    "    p.target_id,",
1401-    "    p.app_code,",
1402-    "    p.role_code,",
1403-    "    p.robot_pool_id,",
1404-    "    p.aiworker_model_code,",
1405-    "    p.internal_nickname,",
1406-    "    p.status_code,",
1407-    "    COALESCE(v.display_label, NULLIF(p.internal_nickname, '') || '@' || p.role_code, p.aiworker_model_code || '@' || p.role_code) AS display_label",
1408-    "  FROM business.aicm_user_company_worker_placement p",
1409-    "  LEFT JOIN business.vw_aicm_user_company_worker_placement_display v",
1410-    "    ON v.aicm_user_company_worker_placement_id = p.aicm_user_company_worker_placement_id",
1411:    "  WHERE p.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
1412-    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1413-    "    AND p.aicm_user_company_worker_placement_id = " + sqlLiteral(placementId) + "::uuid",
1414-    "    AND p.app_code = 'AICompanyManager'",
1415-    "    AND p.status_code = 'active'",
1416-    "    AND lower(p.role_code) = lower('Worker')",
1417-    "  LIMIT 1",
1418-    ")",
1419-    "SELECT jsonb_build_object(",
1420-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM placement) THEN 'ok' ELSE 'not_found' END,",
1421-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
1422-    "  'placement', COALESCE((SELECT to_jsonb(placement) FROM placement), '{}'::jsonb)",
1423-    ")::text;"
--
1640-function aicmR8zAutoVersion(value) {
1641-  const text = aicmR8zAutoText(value);
1642-  return text || "r8z_v1";
1643-}
1644-
1645-function aicmR8zAutoLimit(value) {
1646-  const num = Number(value);
1647-  if (!Number.isFinite(num) || num < 1) return 1;
1648-  return Math.min(10, Math.floor(num));
1649-}
1650-
1651-function runLeaderAutoDecomposition(body) {
1652:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
1653-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1654-  const mode = aicmR8zAutoMode(body.mode);
1655-  const limit = aicmR8zAutoLimit(body.limit);
1656-  const version = aicmR8zAutoVersion(body.auto_decomposition_version);
1657-  const sourceAppRef = aicmR8zAutoText(body.source_app_ref) || "AICompanyManager";
1658-  const majorId = body.aicm_manager_major_work_item_id
1659-    ? requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")
1660-    : "";
1661-
1662-  if (mode === "single" && !majorId) {
1663-    throw new Error("aicm_manager_major_work_item_id is required for single mode");
1664-  }
1665-
1666-  const targetWhere = mode === "single"
1667-    ? "    AND m.aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid"
1668-    : "    AND m.aicm_manager_major_work_item_id IS NOT NULL";
1669-
1670-  const sql = [
1671-    "WITH input_request AS (",
1672-    "  SELECT",
1673:    "    " + sqlLiteral(owner) + "::uuid AS owner_civilization_id,",
1674-    "    " + sqlLiteral(companyId) + "::uuid AS aicm_user_company_id,",
1675-    "    " + sqlLiteral(version) + "::text AS auto_decomposition_version,",
1676-    "    " + sqlLiteral(sourceAppRef) + "::text AS source_app_ref,",
1677-    "    " + String(limit) + "::int AS max_count",
1678-    "), target_major AS (",
1679-    "  SELECT m.*",
1680-    "  FROM business.aicm_manager_major_work_item m",
1681-    "  JOIN input_request r",
1682:    "    ON r.owner_civilization_id = m.owner_civilization_id",
1683-    "   AND r.aicm_user_company_id = m.aicm_user_company_id",
1684-    "  WHERE m.decomposition_status_code = " + sqlLiteral("assigned_to_leader"),
1685-    "    AND m.handoff_status_code = " + sqlLiteral("handed_off"),
1686-    targetWhere,
1687-    "    AND NOT EXISTS (",
1688-    "      SELECT 1",
1689-    "      FROM business.aicm_leader_middle_work_item existing",
1690-    "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",
1691:    "        AND existing.owner_civilization_id = m.owner_civilization_id",
1692-    "        AND existing.aicm_user_company_id = m.aicm_user_company_id",
1693-    "        AND existing.breakdown_status_code <> " + sqlLiteral("archived"),
1694-    "    )",
1695-    "  ORDER BY m.updated_at, m.display_order, m.created_at",
1696-    "  LIMIT (SELECT max_count FROM input_request)",
1697-    "), selected_worker AS (",
1698-    "  SELECT DISTINCT ON (tm.aicm_manager_major_work_item_id)",
1699-    "    tm.aicm_manager_major_work_item_id,",
1700-    "    p.aiworker_model_code,",
1701-    "    COALESCE(NULLIF(p.internal_nickname, ''), p.aiworker_model_code, " + sqlLiteral("未割当") + ") AS worker_label",
1702-    "  FROM target_major tm",
1703-    "  LEFT JOIN business.aicm_user_company_worker_placement p",
1704:    "    ON p.owner_civilization_id = tm.owner_civilization_id",
1705-    "   AND p.aicm_user_company_id = tm.aicm_user_company_id",
1706-    "   AND p.role_code = " + sqlLiteral("Worker"),
1707-    "   AND p.status_code = " + sqlLiteral("active"),
1708-    "  ORDER BY",
1709-    "    tm.aicm_manager_major_work_item_id,",
1710-    "    CASE",
1711-    "      WHEN p.aicm_user_company_section_id IS NOT NULL AND p.aicm_user_company_section_id = tm.aicm_user_company_section_id THEN 1",
1712-    "      WHEN p.aicm_user_company_department_id IS NOT NULL AND p.aicm_user_company_department_id = tm.aicm_user_company_department_id THEN 2",
1713-    "      WHEN p.target_level_code = " + sqlLiteral("company") + " THEN 3",
1714-    "      ELSE 9",
1715-    "    END,",
1716-    "    p.created_at",
1717-    "), inserted_middle AS (",
1718-    "  INSERT INTO business.aicm_leader_middle_work_item (",
1719:    "    owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id,",
1720-    "    aicm_user_company_department_id, aicm_user_company_section_id,",
1721-    "    middle_item_name, middle_item_description, leader_robot_label,",
1722-    "    breakdown_status_code, handoff_status_code, priority_code, due_date,",
1723-    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",
1724-    "  )",
1725-    "  SELECT",
1726:    "    tm.owner_civilization_id, tm.aicm_user_company_id, tm.aicm_manager_major_work_item_id,",
1727-    "    tm.aicm_user_company_department_id, tm.aicm_user_company_section_id,",
1728-    "    tm.major_item_name, tm.major_item_description,",
1729-    "    COALESCE(NULLIF(tm.assigned_leader_label, ''), " + sqlLiteral("自動割当") + "),",
1730-    "    " + sqlLiteral("worker_units_created") + ", " + sqlLiteral("handed_off") + ", tm.priority_code, tm.due_date,",
1731-    "    tm.reference_files_text, tm.supplemental_materials_text, tm.applicable_rules_text,",
1732-    "    " + sqlLiteral("R8Z auto-generated from Manager大項目") + ", '', tm.display_order,",
1733-    "    jsonb_build_object(",
1734-    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
1735-    "      " + sqlLiteral("auto_decomposition_source") + ", " + sqlLiteral("manager_major") + ",",
1736-    "      " + sqlLiteral("source_app_ref") + ", (SELECT source_app_ref FROM input_request),",
1737-    "      " + sqlLiteral("source_manager_major_work_item_id") + ", tm.aicm_manager_major_work_item_id::text",
1738-    "    )",
1739-    "  FROM target_major tm",
1740-    "  RETURNING *",
1741-    "), inserted_requirement AS (",
1742-    "  INSERT INTO business.aicm_leader_deliverable_requirement (",
1743:    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id,",
1744-    "    deliverable_name, deliverable_type_code, deliverable_description,",
1745-    "    required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code,",
1746-    "    priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",
1747-    "  )",
1748-    "  SELECT",
1749:    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id,",
1750-    "    im.middle_item_name || " + sqlLiteral(" 成果物") + ", " + sqlLiteral("operation") + ", im.middle_item_description,",
1751-    "    " + sqlLiteral("会社共通ルールと該当業務ルールに従い、後続Workerが実行可能な成果物にする") + ",",
1752-    "    " + sqlLiteral("大項目の目的を満たし、レビュー可能な作業結果が作成されていること") + ",",
1753-    "    true, " + sqlLiteral("ready_for_worker") + ", im.priority_code, im.due_date,",
1754-    "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",
1755-    "    " + sqlLiteral("R8Z auto-generated deliverable requirement") + ", '', im.display_order,",
1756-    "    jsonb_build_object(",
1757-    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
1758-    "      " + sqlLiteral("source_leader_middle_work_item_id") + ", im.aicm_leader_middle_work_item_id::text,",
1759-    "      " + sqlLiteral("source_manager_major_work_item_id") + ", im.aicm_manager_major_work_item_id::text",
1760-    "    )",
1761-    "  FROM inserted_middle im",
1762-    "  RETURNING *",
1763-    "), inserted_worker_unit AS (",
1764-    "  INSERT INTO business.aicm_worker_work_unit (",
1765:    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,",
1766-    "    work_unit_name, work_unit_description, work_type_code,",
1767-    "    assigned_worker_label, worker_model_code, work_status_code, review_status_code,",
1768-    "    priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link,",
1769-    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, display_order, metadata_jsonb",
1770-    "  )",
1771-    "  SELECT",
1772:    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,",
1773-    "    im.middle_item_name || " + sqlLiteral(" 作業") + ", im.middle_item_description, " + sqlLiteral("operation") + ",",
1774-    "    COALESCE(sw.worker_label, " + sqlLiteral("未割当") + "), COALESCE(sw.aiworker_model_code, ''), " + sqlLiteral("todo") + ", " + sqlLiteral("required") + ",",
1775-    "    im.priority_code, im.due_date,",
1776-    "    " + sqlLiteral("Manager大項目: ") + " || im.middle_item_name || E'\\n' || im.middle_item_description,",
1777-    "    " + sqlLiteral("指定された大項目について、実行可能な成果物または作業結果を作成する") + ",",
1778-    "    '', '',",
1779-    "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",
1780-    "    CASE WHEN sw.aiworker_model_code IS NULL THEN " + sqlLiteral("Worker未割当。配置後に再割当対象。") + " ELSE " + sqlLiteral("R8Z auto-generated worker work unit") + " END,",
1781-    "    im.display_order,",
1782-    "    jsonb_build_object(",
1783-    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
1784-    "      " + sqlLiteral("source_leader_middle_work_item_id") + ", im.aicm_leader_middle_work_item_id::text,",
--
1795-    "      handoff_status_code = " + sqlLiteral("completed") + ",",
1796-    "      metadata_jsonb = COALESCE(m.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
1797-    "        " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
1798-    "        " + sqlLiteral("auto_decomposition_completed_at") + ", now()::text",
1799-    "      ),",
1800-    "      updated_at = now()",
1801-    "  FROM inserted_middle im",
1802-    "  WHERE m.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",
1803-    "  RETURNING m.*",
1804-    "), skipped_existing AS (",
1805-    "  SELECT m.aicm_manager_major_work_item_id",
1806-    "  FROM business.aicm_manager_major_work_item m",
1807:    "  JOIN input_request r ON r.owner_civilization_id = m.owner_civilization_id AND r.aicm_user_company_id = m.aicm_user_company_id",
1808-    "  WHERE m.decomposition_status_code = " + sqlLiteral("assigned_to_leader"),
1809-    "    AND m.handoff_status_code = " + sqlLiteral("handed_off"),
1810-    targetWhere,
1811-    "    AND EXISTS (",
1812-    "      SELECT 1",
1813-    "      FROM business.aicm_leader_middle_work_item existing",
1814-    "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",
1815-    "        AND existing.breakdown_status_code <> " + sqlLiteral("archived"),
1816-    "    )",
1817-    "), final_items AS (",
1818-    "  SELECT im.aicm_manager_major_work_item_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id, iw.aicm_worker_work_unit_id, " + sqlLiteral("created") + "::text AS status",
1819-    "  FROM inserted_middle im",
--
1850-}
1851-
1852-function aicmR8ZIOptionalUuidSql(value) {
1853-  const text = aicmR8ZIText(value);
1854-  return text ? sqlLiteral(text) + "::uuid" : "NULL";
1855-}
1856-
1857-function aicmR8ZIJsonSql(value) {
1858-  return sqlLiteral(JSON.stringify(value || {})) + "::jsonb";
1859-}
1860-
1861-function workerAutoExecutionCandidatesR8ZI(body) {
1862:  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
1863-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1864-  const managerMajorId = aicmR8ZIText(body.aicm_manager_major_work_item_id || body.related_manager_major_work_item_id);
1865-  const workerWorkUnitId = aicmR8ZIText(body.aicm_worker_work_unit_id || body.related_worker_work_unit_id);
1866-  const limit = Math.max(1, Math.min(20, Number(body.limit || 10)));
1867-
1868-  const managerFilter = managerMajorId
1869-    ? "    AND w.aicm_manager_major_work_item_id = " + sqlLiteral(managerMajorId) + "::uuid"
1870-    : "";
1871-
1872-  const workerFilter = workerWorkUnitId
1873-    ? "    AND w.aicm_worker_work_unit_id = " + sqlLiteral(workerWorkUnitId) + "::uuid"
1874-    : "";
1875-
1876-  const sql = [
1877-    "WITH target_units AS (",
1878-    "  SELECT w.*",
1879-    "  FROM business.vw_aicm_pmlw_worker_work_unit_display w",
1880:    "  WHERE w.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
1881-    "    AND w.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1882-    "    AND COALESCE(w.work_status_code, '') = 'todo'",
1883-    "    AND COALESCE(w.worker_model_code, '') <> ''",
1884-    "    AND COALESCE(w.assigned_worker_label, '') <> ''",
1885-    managerFilter,
1886-    workerFilter,
1887-    "  ORDER BY w.priority_code DESC, w.created_at ASC, w.display_order ASC",
1888-    "  LIMIT " + String(limit),
1889-    "), worker_candidates AS (",
1890-    "  SELECT",
1891-    "    u.aicm_worker_work_unit_id,",
1892-    "    p.aicm_user_company_worker_placement_id,",
1893:    "    p.owner_civilization_id,",
1894-    "    p.aicm_user_company_id,",
1895-    "    p.aicm_user_company_department_id,",
1896-    "    p.aicm_user_company_section_id,",
1897-    "    p.aiworker_model_code,",
1898-    "    p.internal_nickname,",
1899-    "    COALESCE(v.display_label, NULLIF(p.internal_nickname, '') || '@' || p.role_code, p.aiworker_model_code || '@' || p.role_code) AS display_label,",
1900-    "    CASE",
1901-    "      WHEN p.aiworker_model_code = u.worker_model_code AND COALESCE(NULLIF(p.internal_nickname, ''), '') = u.assigned_worker_label THEN 100",
1902-    "      WHEN p.aiworker_model_code = u.worker_model_code THEN 80",
1903-    "      WHEN COALESCE(NULLIF(p.internal_nickname, ''), '') = u.assigned_worker_label THEN 60",
1904-    "      ELSE 10",
1905-    "    END AS match_score",
1906-    "  FROM target_units u",
1907-    "  JOIN business.aicm_user_company_worker_placement p",
1908:    "    ON p.owner_civilization_id = u.owner_civilization_id",
1909-    "   AND p.aicm_user_company_id = u.aicm_user_company_id",
1910-    "   AND p.role_code = 'Worker'",
1911-    "   AND p.status_code = 'active'",
1912-    "  LEFT JOIN business.vw_aicm_user_company_worker_placement_display v",
1913-    "    ON v.aicm_user_company_worker_placement_id = p.aicm_user_company_worker_placement_id",
1914-    "), ranked AS (",
1915-    "  SELECT *, row_number() OVER (PARTITION BY aicm_worker_work_unit_id ORDER BY match_score DESC, aicm_user_company_worker_placement_id) AS rn",
1916-    "  FROM worker_candidates",
1917-    ")",
1918-    "SELECT COALESCE(jsonb_agg(",
1919-    "  jsonb_build_object(",
1920-    "    'worker_work_unit', to_jsonb(u),",
--
1946-    unit.expected_output_text,
1947-    aicmR8ZIText(unit.reference_files_text) ? "参照ファイル: " + aicmR8ZIText(unit.reference_files_text) : "",
1948-    aicmR8ZIText(unit.supplemental_materials_text) ? "補足資料: " + aicmR8ZIText(unit.supplemental_materials_text) : "",
1949-    aicmR8ZIText(unit.applicable_rules_text) ? "会社共通ルール/適用ルール: " + aicmR8ZIText(unit.applicable_rules_text) : ""
1950-  ].map(aicmR8ZIText).filter(Boolean);
1951-
1952-  if (!unitId) throw new Error("worker_work_unit_id missing");
1953-  if (!placementId) throw new Error("worker placement missing for " + unitId);
1954-  if (!modelCode) throw new Error("model_code missing for " + unitId);
1955-  if (!instructionParts.length) throw new Error("instruction missing for " + unitId);
1956-
1957-  return {
1958:    owner_civilization_id: aicmR8ZIText(unit.owner_civilization_id),
1959-    aicm_user_company_id: aicmR8ZIText(unit.aicm_user_company_id),
1960-    aicm_user_company_department_id: aicmR8ZIText(placement.aicm_user_company_department_id || unit.aicm_user_company_department_id),
1961-    aicm_user_company_section_id: aicmR8ZIText(placement.aicm_user_company_section_id || unit.aicm_user_company_section_id),
1962-    aicm_user_company_worker_placement_id: placementId,
1963-    model_code: modelCode,
1964-    task_domain_code: aicmR8ZIText(unit.work_type_code) || "business_operation",
1965-    title,
1966-    instruction: instructionParts.join("\n\n"),
1967-    source_request_ref: "aicm_worker_work_unit:" + unitId,
1968-    source_app_ref: "AICompanyManager",
1969-    related_worker_work_unit_id: unitId,
1970-    related_leader_middle_work_item_id: aicmR8ZIText(unit.aicm_leader_middle_work_item_id),
--
2153-    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
2154-      const body = await readBody(req);
2155-      sendJson(res, 200, updateSection(body));
2156-      return true;
2157-    }
2158-
2159-    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
2160-      const body = await readBody(req);
2161-      sendJson(res, 200, updateSection(body));
2162-      return true;
2163-    }
2164-
2165:if (route === "/api/aicm/v2/context" && req.method === "GET") {
2166:      sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
2167-      return true;
2168-    }
2169-
2170-    if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
2171-      sendJson(res, 200, createCompany(await readBody(req)));
2172-      return true;
2173-    }
2174-
2175-    if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
2176-      const payload = createDepartment(await readBody(req));
2177-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2178-      return true;
---- core context fetch / param usage ----
29-    selectedDepartmentId: "AICM_V2_SELECTED_DEPARTMENT_ID",
30-    selectedSectionId: "AICM_V2_SELECTED_SECTION_ID",
31-    contextCache: "AICM_V2_SELECTED_COMPANY_CONTEXT"
32-  };
33-
34-  var DEFAULT_OWNER_CIVILIZATION_ID = "00000000-0000-4000-8000-000000000001";
35-
36-  var API = {
37:    context: "/api/aicm/v2/context",
38-    createCompany: "/api/aicm/v2/company/create",
39-    createDepartment: "/api/aicm/v2/department/create",
40-    createSection: "/api/aicm/v2/section/create",
41-    createPlacement: "/api/aicm/v2/placement/create"
42-  };
43-
44-  var root = null;
45-
--
104-    message = message.replace(new RegExp("post" + "gres(?:ql)?://" + "[^\\s\'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");
105-    if (message.length > 500) {
106-      message = message.slice(0, 500) + "...";
107-    }
108-    return message;
109-  }
110-
111-  function endpointWithOwner() {
112:    return API.context + "?owner_civilization_id=" + encodeURIComponent(state.ownerCivilizationId);
113-  }
114-
115-  function requestJson(url, body) {
116-    var options = body ? {
117-      method: "POST",
118-      headers: { "content-type": "application/json" },
119-      body: JSON.stringify(body)
120-    } : {
--
280-        state.loading = false;
281-        state.errorMessage = publicErrorMessage(error);
282-        render();
283-      });
284-  }
285-
286-
287-// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_START
288:  function aicmR8ZFArrayFromContext(rawContext, targetContext, names) {
289-    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
290:    var target = targetContext && typeof targetContext === "object" ? targetContext : {};
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
305:  function aicmNormalizePmlwContextR8ZF(rawContext, targetContext) {
306-    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
307:    var target = targetContext && typeof targetContext === "object" ? targetContext : {};
308-
309-    if (!target || typeof target !== "object") {
310-      target = {};
311-    }
312-
313-    var middleItems = aicmR8ZFArrayFromContext(raw, target, [
314-      "pmlw_middle_items",
315-      "pmlwMiddleItems",
--
395-
396-    loadContext.__aicmR8ZF = true;
397-  }
398-// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_END
399-
400-
401-  function createCompany(payload) {
402-    return requestJson(API.createCompany, {
403:      owner_civilization_id: state.ownerCivilizationId,
404-      company_name: payload.companyName,
405-      business_domain: payload.businessDomain
406-    }).then(function (json) {
407-      if (json.company && json.company.aicm_user_company_id) {
408-        state.selectedCompanyId = json.company.aicm_user_company_id;
409-        writeStorage(STORAGE.selectedCompanyId, state.selectedCompanyId);
410-      }
411-      state.noticeMessage = "AI企業を作成しました。";
--
414-  }
415-
416-  function createDepartment(payload) {
417-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
418-      throw new Error("先にv2のAI企業を作成・選択してください。");
419-    }
420-
421-    return requestJson(API.createDepartment, {
422:      owner_civilization_id: state.ownerCivilizationId,
423-      aicm_user_company_id: state.selectedCompanyId,
424-      department_name: payload.departmentName,
425-      purpose: payload.purpose
426-    }).then(function (json) {
427-      if (json.department && json.department.aicm_user_company_department_id) {
428-        state.selectedDepartmentId = json.department.aicm_user_company_department_id;
429-        writeStorage(STORAGE.selectedDepartmentId, state.selectedDepartmentId);
430-      }
--
438-      throw new Error("先にv2のAI企業を作成・選択してください。");
439-    }
440-
441-    if (!state.selectedDepartmentId || !hasDepartment(state.selectedDepartmentId)) {
442-      throw new Error("先にv2の部門を作成・選択してください。");
443-    }
444-
445-    return requestJson(API.createSection, {
446:      owner_civilization_id: state.ownerCivilizationId,
447-      aicm_user_company_id: state.selectedCompanyId,
448-      aicm_user_company_department_id: state.selectedDepartmentId,
449-      section_name: payload.sectionName,
450-      purpose: payload.purpose
451-    }).then(function (json) {
452-      if (json.section && json.section.aicm_user_company_section_id) {
453-        state.selectedSectionId = json.section.aicm_user_company_section_id;
454-        writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
--
459-  }
460-
461-  function createPlacement(payload) {
462-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
463-      throw new Error("先にv2のAI企業を作成・選択してください。");
464-    }
465-
466-    return requestJson(API.createPlacement, {
467:      owner_civilization_id: state.ownerCivilizationId,
468-      aicm_user_company_id: state.selectedCompanyId,
469-      aicm_user_company_department_id: payload.departmentId || "",
470-      aicm_user_company_section_id: payload.sectionId || "",
471-      target_level_code: payload.targetLevelCode,
472-      target_id: payload.targetId,
473-      role_code: payload.roleCode,
474-      robot_pool_id: payload.robotPoolId,
475-      aiworker_model_code: payload.aiworkerModelCode,
--
671-// No bridge, no diagnostic layer, no legacy localStorage owner.
672-
673-function aicmOrgCtx() {
674-    return state.context || state || {};
675-  }
676-
677-  function aicmOrgOwnerId() {
678-    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
679:    if (state && state.owner_civilization_id) return state.owner_civilization_id;
680:    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
681-    return "00000000-0000-4000-8000-000000000001";
682-  }
683-
684-  function aicmOrgCompanies() {
685-    var ctx = aicmOrgCtx();
686-    var rows = ctx.companies || state.companies || [];
687-    return Array.isArray(rows) ? rows : [];
688-  }
--
789-    }
790-
791-    if (typeof loadContext === "function") {
792-      await loadContext();
793-return;
794-    }
795-
796-    var owner = encodeURIComponent(aicmOrgOwnerId());
797:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
798-    var json = await response.json();
799-
800-    if (json && json.result === "ok") state.context = json;
801-    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
802-    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
803-      aicmHydrateManagerMajorContextArraysR8M(
804-        typeof json !== "undefined" ? json :
805-        (typeof data !== "undefined" ? data :
--
978-    if (kind === "company") return "企業変更";
979-    if (kind === "department") return "部門変更";
980-    if (kind === "section") return "課変更";
981-    return "変更";
982-  }
983-
984-  function aicmOrgUpdateBodyRows(body) {
985-    var keys = Object.keys(body || {}).filter(function (key) {
986:      return key !== "owner_civilization_id" &&
987-        key.indexOf("_id") === -1 &&
988-        key !== "aicm_user_company_id" &&
989-        key !== "aicm_user_company_department_id" &&
990-        key !== "aicm_user_company_section_id";
991-    });
992-
993-    if (!keys.length) return '<p class="aicm-core-empty">表示できる変更項目がありません。</p>';
994-
--
1263-  var companyId = body.aicm_user_company_id || "";
1264-
1265-  if (!companyId && state && state.selectedCompanyId) {
1266-    companyId = state.selectedCompanyId;
1267-  }
1268-
1269-  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
1270-    // AICM_ROLE_SYNC_OWNER_RESOLVER_AXK_V1
1271:    owner_civilization_id: (
1272-      typeof aicmAvdOwnerId === "function"
1273-        ? aicmAvdOwnerId()
1274-        : ((typeof state !== "undefined" && state && state.ownerCivilizationId) ? state.ownerCivilizationId : "")
1275-    ),
1276-    aicm_user_company_id: companyId,
1277-    role_placements: rows
1278-  });
1279-}
--
1283-    var companyId = aicmAvdTextById("aicm-company-edit-id");
1284-
1285-    if (!companyId) {
1286-      setMessage("error", "変更対象の企業が見つかりません。");
1287-      return;
1288-    }
1289-
1290-    var body = {
1291:      owner_civilization_id: aicmAvdOwnerId(),
1292-      aicm_user_company_id: companyId,
1293-      company_name: aicmAvdTextById("aicm-company-edit-name"),
1294-      business_domain: aicmAvdTextById("aicm-company-edit-domain"),
1295-      company_status: aicmAvdTextById("aicm-company-edit-status") || "active"
1296-    };
1297-
1298-    var rows = [
1299-      ["操作", "企業変更"],
--
1321-    var companyId = aicmAvdTextById("aicm-department-edit-company-id");
1322-
1323-    if (!departmentId || !companyId) {
1324-      setMessage("error", "変更対象の部門が見つかりません。");
1325-      return;
1326-    }
1327-
1328-    var body = {
1329:      owner_civilization_id: aicmAvdOwnerId(),
1330-      aicm_user_company_id: companyId,
1331-      aicm_user_company_department_id: departmentId,
1332-      department_name: aicmAvdTextById("aicm-department-edit-name"),
1333-      purpose: aicmAvdTextById("aicm-department-edit-purpose"),
1334-      department_status: aicmAvdTextById("aicm-department-edit-status") || "active"
1335-    };
1336-
1337-    var rows = [
--
1361-    var departmentId = aicmAvdTextById("aicm-section-edit-department-id");
1362-
1363-    if (!sectionId || !companyId || !departmentId) {
1364-      setMessage("error", "変更対象の課が見つかりません。");
1365-      return;
1366-    }
1367-
1368-    var body = {
1369:      owner_civilization_id: aicmAvdOwnerId(),
1370-      aicm_user_company_id: companyId,
1371-      aicm_user_company_department_id: departmentId,
1372-      aicm_user_company_section_id: sectionId,
1373-      section_name: aicmAvdTextById("aicm-section-edit-name"),
1374-      purpose: aicmAvdTextById("aicm-section-edit-purpose"),
1375-      section_status: aicmAvdTextById("aicm-section-edit-status") || "active"
1376-    };
1377-
--
2493-  }
2494-
2495-function aicmAvdArray(value) {
2496-    return Array.isArray(value) ? value : [];
2497-  }
2498-
2499-function aicmAvdOwnerId() {
2500-    var c = aicmAvdCtx();
2501:    if (c.owner_civilization_id) return c.owner_civilization_id;
2502:    if (typeof state !== "undefined" && state && state.owner_civilization_id) return state.owner_civilization_id;
2503-    if (typeof state !== "undefined" && state && state.ownerCivilizationId) return state.ownerCivilizationId;
2504-    return "00000000-0000-4000-8000-000000000001";
2505-  }
2506-
2507-function aicmAvdCurrentCompany() {
2508-    var c = aicmAvdCtx();
2509-    var rows = aicmAvdArray(c.companies);
2510-    var selected = null;
--
3179-
3180-    if (!deliverableName || !taskName) {
3181-      setMessage("error", "成果物名と作業名を入力してください。");
3182-      render();
3183-      return;
3184-    }
3185-
3186-    var payload = {
3187:      owner_civilization_id: ownerCivilizationId(),
3188-      aicm_user_company_id: company.aicm_user_company_id,
3189-      aicm_user_company_department_id: departmentEl.value,
3190-      aicm_user_company_section_id: sectionEl ? sectionEl.value : "",
3191-      deliverable_name: deliverableName,
3192-      task_name: taskName,
3193-      work_type_code: valueOf("aicm-ledger-work-type") || "design",
3194-      responsible_role_code: valueOf("aicm-ledger-role") || "Manager",
3195-      priority_code: valueOf("aicm-ledger-priority") || "normal",
--
3426-      if (!row.task_name) errors.push("作業名が空欄です");
3427-
3428-      return {
3429-        row_number: row.row_number,
3430-        source: row,
3431-        valid: errors.length === 0,
3432-        errors: errors,
3433-        payload: {
3434:          owner_civilization_id: ownerCivilizationId(),
3435-          aicm_user_company_id: company.aicm_user_company_id,
3436-          aicm_user_company_department_id: department ? department.aicm_user_company_department_id : "",
3437-          aicm_user_company_section_id: section ? section.aicm_user_company_section_id : "",
3438-          deliverable_name: row.deliverable_name || "",
3439-          task_name: row.task_name || "",
3440-          work_type_code: row.work_type_code || "design",
3441-          responsible_role_code: row.responsible_role_code || "Manager",
3442-          task_status_code: row.task_status_code || "todo",
--
3455-  
3456-
3457-
3458-
3459-// AICM_PMLW_CSV_CONNECT_ARB_ARE_V1
3460-// PMLW CSV/UI connector. Uses existing clean core state and selectedCompany().
3461-function aicmPmlwOwnerId() {
3462-    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
3463:    if (state && state.owner_civilization_id) return state.owner_civilization_id;
3464:    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
3465-    return "00000000-0000-4000-8000-000000000001";
3466-  }
3467-
3468-  async function aicmPmlwPostJson(path, body) {
3469-    var response = await fetch(path, {
3470-      method: "POST",
3471-      headers: { "Content-Type": "application/json" },
3472-      body: JSON.stringify(body || {})
--
3495-    }
3496-
3497-    if (typeof refreshContext === "function") {
3498-      await refreshContext();
3499-      return;
3500-    }
3501-
3502-    var owner = encodeURIComponent(aicmPmlwOwnerId());
3503:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
3504-    var json = await response.json();
3505-
3506-    if (json && json.result === "ok") {
3507-      state.context = json;
3508-    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
3509-    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
3510-      aicmHydrateManagerMajorContextArraysR8M(
3511-        typeof json !== "undefined" ? json :
--
3673-      var rows = parseAicmCsv(text);
3674-
3675-      if (!rows.length) {
3676-        setMessage("error", "取り込めるCSV行がありません。");
3677-        return;
3678-      }
3679-
3680-      var result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", {
3681:        owner_civilization_id: aicmPmlwOwnerId(),
3682-        aicm_user_company_id: company.aicm_user_company_id,
3683-        rows: rows
3684-      });
3685-
3686-      var count = result.inserted_count || 0;
3687-      state.csvImportLastResult = "CSV取り込み完了: " + count + "件";
3688-      setMessage("ok", state.csvImportLastResult);
3689-
--
3984-// Worker Runtime requestはここでは作らない。
3985-// DB書込は既存確認画面を通して /api/aicm/v2/manager-major/update で実行する。
3986-function aicmAxuR1Text(value) {
3987-    return String(value === undefined || value === null ? "" : value).trim();
3988-  }
3989-
3990-function aicmAxuR1OwnerId() {
3991-    if (state && state.ownerCivilizationId) return aicmAxuR1Text(state.ownerCivilizationId);
3992:    if (state && state.context && state.context.owner_civilization_id) return aicmAxuR1Text(state.context.owner_civilization_id);
3993-    return "00000000-0000-4000-8000-000000000001";
3994-  }
3995-
3996-function aicmAxuR1MajorId(row) {
3997-    row = row || {};
3998-    return aicmAxuR1Text(
3999-      row.aicm_manager_major_work_item_id ||
4000-      row.manager_major_work_item_id ||
--
4119-    }
4120-
4121-    return {
4122-      kind: "manager-major-leader-handoff",
4123-      title: "課長へ送る確認",
4124-      endpoint: "/api/aicm/v2/manager-major/update",
4125-      backScreen: "task-ledger",
4126-      body: {
4127:        owner_civilization_id: aicmAxuR1OwnerId(),
4128-        aicm_manager_major_work_item_id: majorId,
4129-        assigned_leader_label: leaderLabel,
4130-        decomposition_status_code: "assigned_to_leader",
4131-        handoff_status_code: "handed_off",
4132-        note: aicmAxuR1Text(row.note)
4133-      }
4134-    };
4135-  }
--
4509-  // AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_START
4510-  function aicmLeaderHandoffTextR8S(value) {
4511-    if (value === null || typeof value === "undefined") return "";
4512-    return String(value).trim();
4513-  }
4514-
4515-  function aicmLeaderHandoffOwnerIdR8S(payload) {
4516-    var p = payload && typeof payload === "object" ? payload : {};
4517:    if (p.owner_civilization_id) return aicmLeaderHandoffTextR8S(p.owner_civilization_id);
4518-    if (p.ownerCivilizationId) return aicmLeaderHandoffTextR8S(p.ownerCivilizationId);
4519-    if (state && state.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.ownerCivilizationId);
4520:    if (state && state.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.owner_civilization_id);
4521:    if (state && state.context && state.context.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.context.owner_civilization_id);
4522-    if (state && state.context && state.context.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.context.ownerCivilizationId);
4523-    if (typeof aicmHumanReviewOwnerId === "function") return aicmLeaderHandoffTextR8S(aicmHumanReviewOwnerId());
4524-    return "00000000-0000-4000-8000-000000000001";
4525-  }
4526-
4527-  function aicmLeaderHandoffActionTargetR8S(ev, btn) {
4528-    if (typeof aicmActionTargetSafe === "function") {
4529-      var safeTarget = aicmActionTargetSafe(ev, btn);
--
4699-    if (!payload || !payload.majorId) {
4700-      setMessage("error", "課長へ送る対象がありません。");
4701-      render();
4702-      return;
4703-    }
4704-
4705-    var ownerCivilizationId = aicmLeaderHandoffOwnerIdR8S(payload);
4706-    if (!ownerCivilizationId) {
4707:      setMessage("error", "owner_civilization_idを特定できません。");
4708-      render();
4709-      return;
4710-    }
4711-
4712-    try {
4713-      var body = {
4714:        owner_civilization_id: ownerCivilizationId,
4715-        aicm_manager_major_work_item_id: payload.majorId,
4716-        decomposition_status_code: "assigned_to_leader",
4717-        handoff_status_code: "handed_off"
4718-      };
4719-
4720-      if (payload.leaderRaw) {
4721-        body.assigned_leader_label = payload.leaderRaw;
4722-      }
--
5196-    if (!owner && typeof aicmPmlwOwnerId === "function") {
5197-      owner = String(aicmPmlwOwnerId() || "");
5198-    }
5199-
5200-    if (!owner) {
5201-      owner = "00000000-0000-4000-8000-000000000001";
5202-    }
5203-
5204:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner) + "&v=" + Date.now());
5205-    var json = await response.json();
5206-
5207-    if (json && json.result === "ok") {
5208-      aicmHydrateManagerMajorContextArraysR8M(json);
5209-    }
5210-
5211-    return json;
5212-  }
--
5778-// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_START
5779-  function aicmR8ZBText(value) {
5780-    if (value === null || typeof value === "undefined") return "";
5781-    return String(value).trim();
5782-  }
5783-
5784-  function aicmR8ZBOwnerId() {
5785-    if (state && state.ownerCivilizationId) return aicmR8ZBText(state.ownerCivilizationId);
5786:    if (state && state.owner_civilization_id) return aicmR8ZBText(state.owner_civilization_id);
5787:    if (state && state.context && state.context.owner_civilization_id) return aicmR8ZBText(state.context.owner_civilization_id);
5788-    if (typeof aicmHumanReviewOwnerId === "function") {
5789-      try {
5790-        var ownerFromReview = aicmHumanReviewOwnerId();
5791-        if (ownerFromReview) return aicmR8ZBText(ownerFromReview);
5792-      } catch (_) {}
5793-    }
5794-    return "00000000-0000-4000-8000-000000000001";
5795-  }
--
5835-      safeMajorId = aicmR8ZBText(
5836-        state.managerMajorLeaderHandoffConfirm.majorId ||
5837-        state.managerMajorLeaderHandoffConfirm.aicm_manager_major_work_item_id ||
5838-        state.managerMajorLeaderHandoffConfirm.manager_major_work_item_id
5839-      );
5840-    }
5841-
5842-    var companyId = aicmR8ZBCompanyId();
5843:    var ownerId = aicmR8ZBOwnerId();
5844-
5845-    if (!safeMajorId) {
5846-      return {
5847-        ok: false,
5848-        message: "Leader自動分解対象のManager大項目IDを特定できません。"
5849-      };
5850-    }
5851-
--
5858-
5859-    try {
5860-      var response = await fetch("/api/aicm/v2/leader-auto-decomposition/run", {
5861-        method: "POST",
5862-        headers: {
5863-          "content-type": "application/json"
5864-        },
5865-        body: JSON.stringify({
5866:          owner_civilization_id: ownerId,
5867-          aicm_user_company_id: companyId,
5868-          aicm_manager_major_work_item_id: safeMajorId,
5869-          mode: "single",
5870-          source_app_ref: "AICompanyManager",
5871-          auto_decomposition_version: "r8z_v1"
5872-        })
5873-      });
5874-
--
5901-      };
5902-    }
5903-  }
5904-
5905-
5906-// AICM_R8Z_I_WORKER_AUTO_EXECUTION_CORE_START
5907-  async function aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(majorId) {
5908-    var body = {
5909:      owner_civilization_id: state && state.ownerCivilizationId ? state.ownerCivilizationId : "00000000-0000-4000-8000-000000000001",
5910-      aicm_user_company_id: state && state.selectedCompanyId ? state.selectedCompanyId : "",
5911-      aicm_manager_major_work_item_id: majorId || "",
5912-      limit: 10
5913-    };
5914-
5915-    var response = await fetch("/api/aicm/v2/worker-auto-execution/run", {
5916-      method: "POST",
5917-      headers: {
--
6464-  
6465-// AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1
6466-// Human review queue UI.
6467-// Human review only shows delivery summaries / exception summaries.
6468-// AI review remains internal; the UI displays ai_review_result_text summary only.
6469-
6470-function aicmHumanReviewOwnerId() {
6471-    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
6472:    if (state && state.owner_civilization_id) return state.owner_civilization_id;
6473:    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
6474-    return "00000000-0000-4000-8000-000000000001";
6475-  }
6476-
6477-  function aicmHumanReviewRows() {
6478-    var ctx = state.context || state || {};
6479-    var rows = ctx.review_wait_items || state.review_wait_items || [];
6480-    return Array.isArray(rows) ? rows : [];
6481-  }
--
6516-    }
6517-
6518-    if (typeof loadContext === "function") {
6519-      await loadContext();
6520-      return;
6521-    }
6522-
6523-    var owner = encodeURIComponent(aicmHumanReviewOwnerId());
6524:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
6525-    var json = await response.json();
6526-
6527-    if (json && json.result === "ok") state.context = json;
6528-    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
6529-    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
6530-      aicmHydrateManagerMajorContextArraysR8M(
6531-        typeof json !== "undefined" ? json :
6532-        (typeof data !== "undefined" ? data :
--
6542-
6543-    if (!reviewId) {
6544-      setMessage("error", "レビュー項目を特定できません。");
6545-      return;
6546-    }
6547-
6548-    try {
6549-      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/approve", {
6550:        owner_civilization_id: aicmHumanReviewOwnerId(),
6551-        aicm_human_review_item_id: reviewId,
6552-        human_reviewer_label: "user",
6553-        human_review_note: ""
6554-      });
6555-
6556-      setMessage("ok", "レビューを承認しました。");
6557-      await aicmHumanReviewReload();
6558-    } catch (error) {
--
6573-    try {
6574-      if (typeof window !== "undefined" && window.prompt) {
6575-        note = window.prompt("差し戻し理由を入力してください。", "") || "";
6576-      }
6577-    } catch (_) {}
6578-
6579-    try {
6580-      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/return", {
6581:        owner_civilization_id: aicmHumanReviewOwnerId(),
6582-        aicm_human_review_item_id: reviewId,
6583-        human_reviewer_label: "user",
6584-        human_review_note: note
6585-      });
6586-
6587-      setMessage("ok", "レビューを差し戻しました。");
6588-      await aicmHumanReviewReload();
6589-    } catch (error) {
--
7379-
7380-    var sourceRef = aicmWrtValue("aicm-worker-runtime-source-ref") || aicmWrtDefaultSourceRequestRef();
7381-    var idempotencyKey = aicmWrtBuildIdempotencyKey(sourceRef, placementId);
7382-
7383-    return {
7384-      endpoint: "/api/aicm/v2/worker-runtime/request",
7385-      worker_label: aicmWrtWorkerLabel(worker),
7386-      body: {
7387:        owner_civilization_id: aicmWrtOwnerId(),
7388-        aicm_user_company_id: aicmWrtText(company.aicm_user_company_id),
7389-        aicm_user_company_department_id: aicmWrtText(worker.aicm_user_company_department_id),
7390-        aicm_user_company_section_id: aicmWrtText(worker.aicm_user_company_section_id),
7391-        aicm_user_company_worker_placement_id: placementId,
7392-        model_code: aicmWrtText(worker.aiworker_model_code),
7393-        robot_pool_id: aicmWrtText(worker.robot_pool_id),
7394-        app_surface_code: "ai_company_manager",
7395-        task_domain_code: aicmWrtValue("aicm-worker-runtime-task-domain") || "business_operation",
--
7802-    if (!Array.isArray(rows) || rows.length === 0) {
7803-      setMessage("error", "取り込めるCSV行がありません。ヘッダーとデータ行を確認してください。");
7804-      render();
7805-      return;
7806-    }
7807-
7808-    try {
7809-      var payload = {
7810:        owner_civilization_id: typeof aicmPmlwOwnerId === "function" ? aicmPmlwOwnerId() : ownerCivilizationId(),
7811-        aicm_user_company_id: company.aicm_user_company_id,
7812-        rows: rows
7813-      };
7814-
7815-      var result;
7816-
7817-      if (typeof aicmPmlwPostJson === "function") {
7818-        result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", payload);
--
7958-    if (!Array.isArray(rows) || rows.length === 0) {
7959-      setMessage("error", "取り込めるCSV行がありません。ヘッダーとデータ行を確認してください。");
7960-      render();
7961-      return;
7962-    }
7963-
7964-    try {
7965-      var payload = {
7966:        owner_civilization_id: typeof aicmPmlwOwnerId === "function" ? aicmPmlwOwnerId() : ownerCivilizationId(),
7967-        aicm_user_company_id: company.aicm_user_company_id,
7968-        rows: rows
7969-      };
7970-
7971-      var result;
7972-
7973-      if (typeof aicmPmlwPostJson === "function") {
7974-        result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", payload);
--
8084-    if (!Array.isArray(rows) || rows.length === 0) {
8085-      setMessage("error", "取り込めるCSV行がありません。ヘッダーとデータ行を確認してください。");
8086-      render();
8087-      return;
8088-    }
8089-
8090-    try {
8091-      var payload = {
8092:        owner_civilization_id: typeof aicmPmlwOwnerId === "function" ? aicmPmlwOwnerId() : ownerCivilizationId(),
8093-        aicm_user_company_id: company.aicm_user_company_id,
8094-        rows: rows
8095-      };
8096-
8097-      var result;
8098-
8099-      if (typeof aicmPmlwPostJson === "function") {
8100-        result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", payload);
--
9140-    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
9141-    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
9142-    else if (Array.isArray(state.review_wait_items)) rows = state.review_wait_items;
9143-
9144-    ctx.review_wait_items = rows;
9145-    state.context = ctx;
9146-    state.review_wait_items = rows;
9147-
9148:    if (ctx.owner_civilization_id) state.owner_civilization_id = ctx.owner_civilization_id;
9149-    if (ctx.aicm_user_company_id) state.selectedCompanyId = ctx.aicm_user_company_id;
9150-
9151-    return ctx;
9152-  }
9153-
9154-  function r8zV5dReviewRows() {
9155-    var state = r8zV5dState();
9156-    var ctx = r8zV5dNormalizeContext(r8zV5dContext());
--
9173-
9174-    return [];
9175-  }
9176-
9177-  function r8zV5dOwnerId() {
9178-    var state = r8zV5dState();
9179-    var ctx = r8zV5dContext();
9180-    return r8zV5dText(
9181:      state.owner_civilization_id ||
9182-      state.ownerCivilizationId ||
9183:      ctx.owner_civilization_id ||
9184-      ctx.ownerCivilizationId ||
9185-      "00000000-0000-4000-8000-000000000001"
9186-    );
9187-  }
9188-
9189-  function r8zV5dCompanyId() {
9190-    var state = r8zV5dState();
9191-    var ctx = r8zV5dContext();
--
9249-    var owner = r8zV5dOwnerId();
9250-    var company = r8zV5dCompanyId();
9251-
9252-    if (!owner || !company || typeof fetch !== "function") return;
9253-
9254-    state.aicmR8zV5dHydrating = true;
9255-
9256-    var params = new URLSearchParams();
9257:    params.set("owner_civilization_id", owner);
9258-    params.set("aicm_user_company_id", company);
9259-    params.set("v", "r8z_v5d_" + Date.now());
9260-
9261:    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9262-      .then(function (res) {
9263-        return res.text().then(function (bodyText) {
9264-          var payload = {};
9265-          try {
9266-            payload = bodyText ? JSON.parse(bodyText) : {};
9267-          } catch (error) {
9268-            payload = {};
9269-          }
--
9421-    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
9422-    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
9423-    else if (Array.isArray(appState.review_wait_items)) rows = appState.review_wait_items;
9424-
9425-    ctx.review_wait_items = rows;
9426-    appState.context = ctx;
9427-    appState.review_wait_items = rows;
9428-
9429:    if (ctx.owner_civilization_id) appState.owner_civilization_id = ctx.owner_civilization_id;
9430-    if (ctx.aicm_user_company_id) appState.selectedCompanyId = ctx.aicm_user_company_id;
9431-
9432-    return ctx;
9433-  }
9434-
9435-  function ctx(appState) {
9436-    appState = appState || {};
9437-    return normalize(appState, appState.context && typeof appState.context === "object" ? appState.context : {});
--
9453-        return candidates[i].filter(function (row) {
9454-          return row && typeof row === "object";
9455-        });
9456-      }
9457-    }
9458-    return [];
9459-  }
9460-
9461:  function ownerId(appState) {
9462-    appState = appState || {};
9463-    var c = appState.context || {};
9464:    return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
9465-  }
9466-
9467-  function companyId(appState) {
9468-    appState = appState || {};
9469-    var c = appState.context || {};
9470-    return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id);
9471-  }
9472-
--
9493-    if (typeof window.aicmRender === "function") return window.aicmRender();
9494-  }
9495-
9496-  function hydrateIfNeeded(appState) {
9497-    appState = appState || {};
9498-    if (appState.aicmR8zV7Hydrating) return;
9499-    if (rows(appState).length > 0) return;
9500-
9501:    var owner = ownerId(appState);
9502-    var company = companyId(appState);
9503-
9504-    if (!owner || !company || typeof fetch !== "function") {
9505-      appState.aicmR8zV7HydrationError = "missing owner/company owner=" + owner + " company=" + company;
9506-      return;
9507-    }
9508-
9509-    appState.aicmR8zV7Hydrating = true;
9510-
9511-    var params = new URLSearchParams();
9512:    params.set("owner_civilization_id", owner);
9513-    params.set("aicm_user_company_id", company);
9514-    params.set("v", "r8z_v7_" + Date.now());
9515-
9516:    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9517-      .then(function (res) {
9518-        return res.text().then(function (bodyText) {
9519-          var payload = {};
9520-          try {
9521-            payload = bodyText ? JSON.parse(bodyText) : {};
9522-          } catch (_error) {
9523-            payload = {};
9524-          }
--
9551-  window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
9552-    appState = appState || {};
9553-    var list = rows(appState);
9554-
9555-    if (!list.length) hydrateIfNeeded(appState);
9556-
9557-    var debug = [
9558-      "selectedCompanyId=" + companyId(appState),
9559:      "owner=" + ownerId(appState),
9560-      "rows=" + String(list.length),
9561-      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
9562-      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : ""
9563-    ].filter(Boolean).join(" / ");
9564-
9565-    var html = [
9566-      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
9567-      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
PASS: server context route requires owner_civilization_id

============================================================
4. context API probe: wrong param as control
============================================================
WRONG_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa
WRONG_HTTP=500
{
  "result": "error",
  "api_identifier": "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1",
  "error_message": "owner_civilization_id must be UUID"
}
PASS: wrong owner_id param reproduces expected 500

============================================================
5. context API probe: correct owner_civilization_id
============================================================
CORRECT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001
CORRECT_HTTP=200
PASS: context API returned 200 with owner_civilization_id
top_keys=result,sections,companies,placements,departments,task_ledger,robot_catalog,api_identifier,pmlw_major_items,pmlw_middle_items,review_wait_items,pmlw_workflow_tree,owner_civilization_id,pmlw_worker_work_units,pmlw_president_policies,pmlw_deliverable_requirements
review_wait_items_hits=1
review_wait_items_counts=2
review_wait_items_max=2
review_wait_items_0_titles=納品サマリー確認: AI企業業務開始導線の整備 作業 | 納品サマリー確認: Manager大項目台帳運用の整備 作業
interesting_array_0_path=$.robot_catalog
interesting_array_0_length=44
interesting_array_0_keys=app_code,company_id,updated_at,status_code,display_name,robot_pool_id,selector_label,usable_quantity,manufacturer_code,aiworker_model_code,contracted_quantity,aiworker_series_code,assignment_mode_code,entitlement_scope_code,recommended_role_codes,company_robot_entitlement_id
interesting_array_0_sample={"app_code":"AICompanyManager","company_id":"00000000-0000-4000-8000-1db11893cb24","updated_at":"2026-04-27T13:19:09.265285+00:00","status_code":"active","display_name":"ASIC Workers1","robot_pool_id":"7a56e9c4-8f08-42a7-8c37-19f11d8840a0","selector_label":"ASIC Workers1 / BYD1-001","usable_quantity
interesting_array_1_path=$.pmlw_major_items
interesting_array_1_length=38
interesting_array_1_keys=note,due_date,created_at,updated_at,company_name,handoff_link,policy_title,section_name,display_order,priority_code,metadata_jsonb,department_name,major_item_name,source_route_code,policy_status_code,handoff_status_code,manager_robot_label,aicm_user_company_id,reference_files_text,applicable_rules_text,assigned_leader_label,owner_civilization_id,major_item_description,aicm_president_policy_id,decomposition_status_code
interesting_array_1_sample={"note":"起点整理","due_date":null,"created_at":"2026-05-02T11:13:35.610793+00:00","updated_at":"2026-05-02T12:58:21.312419+00:00","company_name":"ウルフ","handoff_link":"","policy_title":null,"section_name":null,"display_order":1,"priority_code":"urgent","metadata_jsonb":{"auto_decomposition_version":"r8z
interesting_array_2_path=$.pmlw_worker_work_units[0].metadata_jsonb.output_collection_payload.candidate_preview
interesting_array_2_length=20
interesting_array_2_keys=path,score,value
interesting_array_2_sample={"path":"handoff_packet_board.0.handoff_payload_jsonb.task_instruction_ja","score":90,"value":"President方針をManager大項目へ変換して開発業務を開始する流れを整理する Manager大項目: AI企業業務開始導線の整備 President方針をManager大項目へ変換して開発業務を開始する流れを整理する 指定された大項目について、実行可能な成果物または作業結果を作成する"}
interesting_array_3_path=$.placements
interesting_array_3_length=8
interesting_array_3_keys=app_code,role_code,target_id,created_at,updated_at,status_code,company_name,section_name,display_label,robot_pool_id,department_name,internal_nickname,target_level_code,placement_quantity,aiworker_model_code,placement_mode_code,aicm_user_company_id,owner_civilization_id,aicm_user_company_section_id,aicm_user_company_department_id,aicm_user_company_worker_placement_id
interesting_array_3_sample={"app_code":"AICompanyManager","role_code":"Worker","target_id":"22e61c25-2778-4f61-98a2-3612efa26d89","created_at":"2026-04-30T21:56:48.662381+00:00","updated_at":"2026-04-30T21:56:48.662381+00:00","status_code":"active","company_name":"ウルフ","section_name":"遠吠え課？","display_label":"ウーン@Worker","robo
interesting_array_4_path=$.sections
interesting_array_4_length=2
interesting_array_4_keys=purpose,created_at,updated_at,section_name,display_order,metadata_jsonb,section_status,parent_section_id,aicm_user_company_id,leader_robot_pool_id,owner_civilization_id,leader_internal_nickname,leader_aiworker_model_code,aicm_user_company_section_id,aicm_user_company_department_id
interesting_array_4_sample={"purpose":"","created_at":"2026-04-30T02:26:42.671938+00:00","updated_at":"2026-04-30T02:26:42.671938+00:00","section_name":"課","display_order":100,"metadata_jsonb":{},"section_status":"active","parent_section_id":null,"aicm_user_company_id":"5bb29236-1f03-44c3-8e57-f1301cadfdec","leader_robot_pool
interesting_array_5_path=$.departments
interesting_array_5_length=2
interesting_array_5_keys=purpose,created_at,updated_at,display_order,metadata_jsonb,department_name,department_status,aicm_user_company_id,manager_robot_pool_id,owner_civilization_id,manager_internal_nickname,manager_aiworker_model_code,aicm_user_company_department_id
interesting_array_5_sample={"purpose":"","created_at":"2026-04-30T02:26:30.815821+00:00","updated_at":"2026-04-30T02:26:30.815821+00:00","display_order":100,"metadata_jsonb":{},"department_name":"部門","department_status":"active","aicm_user_company_id":"5bb29236-1f03-44c3-8e57-f1301cadfdec","manager_robot_pool_id":null,"owner_
interesting_array_6_path=$.pmlw_middle_items
interesting_array_6_length=2
interesting_array_6_keys=note,due_date,created_at,updated_at,company_name,handoff_link,section_name,display_order,priority_code,metadata_jsonb,department_name,major_item_name,middle_item_name,leader_robot_label,handoff_status_code,aicm_user_company_id,reference_files_text,applicable_rules_text,breakdown_status_code,owner_civilization_id,middle_item_description,supplemental_materials_text,aicm_user_company_section_id,aicm_leader_middle_work_item_id,aicm_manager_major_work_item_id
interesting_array_6_sample={"note":"R8Z auto-generated from Manager大項目","due_date":null,"created_at":"2026-05-02T12:58:21.312419+00:00","updated_at":"2026-05-02T12:58:21.312419+00:00","company_name":"ウルフ","handoff_link":"","section_name":null,"display_order":1,"priority_code":"urgent","metadata_jsonb":{"source_app_ref":"AICom
interesting_array_7_path=$.review_wait_items
interesting_array_7_length=2
interesting_array_7_keys=due_date,created_at,updated_at,reviewed_at,company_name,requested_at,review_title,section_name,artifact_link,display_order,priority_code,metadata_jsonb,department_name,review_kind_code,human_review_note,main_changes_text,review_kind_label,artifact_kind_code,artifact_kind_label,aicm_user_company_id,human_reviewer_label,responsible_ai_label,ai_review_result_text,delivery_summary_text,owner_civilization_id
interesting_array_7_sample={"due_date":null,"created_at":"2026-05-02T20:52:59.265325+00:00","updated_at":"2026-05-02T20:52:59.265325+00:00","reviewed_at":null,"company_name":"ウルフ","requested_at":"2026-05-02T20:52:59.265325+00:00","review_title":"納品サマリー確認: AI企業業務開始導線の整備 作業","section_name":null,"artifact_link":"","display_order
interesting_array_8_path=$.pmlw_worker_work_units
interesting_array_8_length=2
interesting_array_8_keys=note,due_date,created_at,updated_at,company_name,handoff_link,display_order,priority_code,metadata_jsonb,work_type_code,work_unit_name,major_item_name,deliverable_name,middle_item_name,work_status_code,worker_model_code,input_context_text,review_status_code,result_summary_text,aicm_user_company_id,expected_output_text,reference_files_text,applicable_rules_text,assigned_worker_label,deliverable_type_code
interesting_array_8_sample={"note":"R8Z auto-generated worker work unit","due_date":null,"created_at":"2026-05-02T12:58:21.312419+00:00","updated_at":"2026-05-02T20:43:54.356995+00:00","company_name":"ウルフ","handoff_link":"","display_order":1,"priority_code":"urgent","metadata_jsonb":{"started_at":"2026-05-02T13:48:19.028Z","a
interesting_array_9_path=$.pmlw_deliverable_requirements
interesting_array_9_length=2
interesting_array_9_keys=note,due_date,created_at,updated_at,company_name,handoff_link,display_order,priority_code,metadata_jsonb,major_item_name,deliverable_name,middle_item_name,aicm_user_company_id,reference_files_text,review_required_flag,applicable_rules_text,deliverable_type_code,owner_civilization_id,required_quality_text,deliverable_description,requirement_status_code,acceptance_criteria_text,supplemental_materials_text,aicm_leader_middle_work_item_id,aicm_manager_major_work_item_id
interesting_array_9_sample={"note":"R8Z auto-generated deliverable requirement","due_date":null,"created_at":"2026-05-02T12:58:21.312419+00:00","updated_at":"2026-05-02T12:58:21.312419+00:00","company_name":"ウルフ","handoff_link":"","display_order":1,"priority_code":"urgent","metadata_jsonb":{"auto_decomposition_version":"r8z_d
interesting_array_10_path=$.task_ledger
interesting_array_10_length=1
interesting_array_10_keys=note,due_date,task_name,created_at,updated_at,company_name,handoff_link,section_name,display_order,priority_code,metadata_jsonb,work_type_code,business_domain,department_name,deliverable_name,task_status_code,aicm_user_company_id,reference_files_text,applicable_rules_text,owner_civilization_id,responsible_role_code,responsible_robot_label,supplemental_materials_text,aicm_user_company_section_id,aicm_user_company_department_id
interesting_array_10_sample={"note":"","due_date":null,"task_name":"うんこさん","created_at":"2026-04-30T05:48:52.625415+00:00","updated_at":"2026-04-30T05:48:52.625415+00:00","company_name":"新規","handoff_link":"","section_name":"課","display_order":100,"priority_code":"normal","metadata_jsonb":{},"work_type_code":"implementation","
interesting_array_11_path=$.robot_catalog[0].recommended_role_codes
interesting_array_11_length=1
interesting_array_11_keys=
interesting_array_11_sample=Worker
interesting_array_12_path=$.pmlw_worker_work_units[0].metadata_jsonb.output_collection_payload.aiworker_app_read_payload
interesting_array_12_length=1
interesting_array_12_keys=model_no,model_code,request_id,task_title,series_code,request_code,model_name_ja,series_name_ja,role_layer_code,app_surface_code,task_domain_code,request_created_at,role_layer_name_ja,app_surface_name_ja,delivery_created_at,request_status_code,delivery_status_code,app_read_payload_jsonb,full_pipeline_safe_internal_flag
interesting_array_12_sample={"model_no":"BYD1-003","model_code":"byd1_003_asic_workers3","request_id":"569fc089-2771-4616-9c3b-0a93698b203a","task_title":"AI企業業務開始導線の整備 作業","series_code":"beyond_series","request_code":"RER_7bf9ad62611f4f89a147dc6b37ead433","model_name_ja":"ASIC Workers3","series_name_ja":"Beyondシリーズ","role_lay
interesting_array_13_path=$.pmlw_worker_work_units[0].metadata_jsonb.output_collection_payload.aiworker_full_pipeline_board
interesting_array_13_length=1
interesting_array_13_keys=model_no,model_code,request_id,task_title,series_code,request_code,model_name_ja,series_name_ja,output_title_ja,role_layer_code,app_surface_code,task_domain_code,output_created_at,output_result_code,output_status_code,proposal_count_max,request_created_at,role_layer_name_ja,safety_result_code,app_surface_name_ja,delivery_created_at,operation_mode_code,request_status_code,delivery_result_code,delivery_status_code
interesting_array_13_sample={"model_no":"BYD1-003","model_code":"byd1_003_asic_workers3","request_id":"569fc089-2771-4616-9c3b-0a93698b203a","task_title":"AI企業業務開始導線の整備 作業","series_code":"beyond_series","request_code":"RER_7bf9ad62611f4f89a147dc6b37ead433","model_name_ja":"ASIC Workers3","series_name_ja":"Beyondシリーズ","output_t
interesting_array_14_path=$.pmlw_worker_work_units[0].metadata_jsonb.output_collection_payload.aiworker_handoff_packet_board
interesting_array_14_length=1
interesting_array_14_keys=model_no,created_at,handoff_id,model_code,request_id,task_title,updated_at,handoff_code,request_code,model_name_ja,from_actor_ref,app_surface_code,handoff_title_ja,task_domain_code,to_role_layer_code,handoff_format_code,handoff_status_code,handoff_payload_jsonb
interesting_array_14_sample={"model_no":"BYD1-003","created_at":"2026-05-02T13:48:19.638748+00:00","handoff_id":"63741476-3609-4188-8232-bacc8c703be4","model_code":"byd1_003_asic_workers3","request_id":"569fc089-2771-4616-9c3b-0a93698b203a","task_title":"AI企業業務開始導線の整備 作業","updated_at":"2026-05-02T13:48:19.638748+00:00","handof
interesting_array_15_path=$.pmlw_worker_work_units[0].metadata_jsonb.output_collection_payload.aiworker_runtime_handoff_packet
interesting_array_15_length=1
interesting_array_15_keys=created_at,handoff_id,request_id,updated_at,handoff_code,from_actor_ref,handoff_title_ja,to_role_layer_code,artifact_refs_jsonb,handoff_format_code,handoff_status_code,handoff_payload_jsonb
interesting_array_15_sample={"created_at":"2026-05-02T13:48:19.638748+00:00","handoff_id":"63741476-3609-4188-8232-bacc8c703be4","request_id":"569fc089-2771-4616-9c3b-0a93698b203a","updated_at":"2026-05-02T13:48:19.638748+00:00","handoff_code":"RHP_ef7315e52038464d87fed58fba54c6ce","from_actor_ref":"AICompanyManager","handoff_
interesting_array_16_path=$.pmlw_workflow_tree
interesting_array_16_length=0
interesting_array_16_keys=
interesting_array_16_sample=
interesting_array_17_path=$.pmlw_president_policies
interesting_array_17_length=0
interesting_array_17_keys=
interesting_array_17_sample=
contains_req1=true
contains_req2=true
contains_company=true
contains_nouhin=true
contains_ai_company_start=true
contains_manager_major=true

============================================================
6. DB direct confirmation for known target
============================================================
--- request id direct hits ---
aiworker.runtime_review_gate_log|request_id|4
aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1|app_read_payload_jsonb|2
aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1|request_id|2
aiworker.vw_app_aiworker_runtime_execution_gate_board_v1|request_id|4
aiworker.vw_app_aiworker_runtime_execution_intake_payload_v1|intake_payload_jsonb|2
aiworker.vw_app_aiworker_runtime_execution_intake_payload_v1|request_id|2
aiworker.vw_app_aiworker_runtime_execution_request_board_v1|request_id|2
aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1|request_id|2
aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1|handoff_payload_jsonb|2
aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1|request_id|2
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_decision_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_activation_review_export_latest_items"
ERROR:  infinite recursion detected in rules for relation "v_access_human_review_latest_action_log"
--- title direct hits ---
aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1|app_read_payload_jsonb|2
aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1|task_title|2
aiworker.vw_app_aiworker_runtime_execution_gate_board_v1|task_title|4
aiworker.vw_app_aiworker_runtime_execution_intake_payload_v1|intake_payload_jsonb|2
aiworker.vw_app_aiworker_runtime_execution_request_board_v1|task_title|2
aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1|task_title|2
aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1|handoff_payload_jsonb|2
aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1|task_title|2
business.aicm_human_review_item|ai_review_result_text|2
business.aicm_human_review_item|delivery_summary_text|2
business.aicm_human_review_item|review_title|2
business.aicm_leader_deliverable_requirement|deliverable_name|2
business.aicm_worker_work_unit|input_context_text|2
business.aicm_worker_work_unit|metadata_jsonb|2
business.aicm_worker_work_unit|result_summary_text|2
business.aicm_worker_work_unit|work_unit_name|2
business.vw_aicm_human_review_wait_display|ai_review_result_text|2
business.vw_aicm_human_review_wait_display|delivery_summary_text|2
business.vw_aicm_human_review_wait_display|review_title|2
business.vw_aicm_pmlw_deliverable_requirement_display|deliverable_name|2
business.vw_aicm_pmlw_deliverable_requirement_display|major_item_name|2
business.vw_aicm_pmlw_deliverable_requirement_display|middle_item_name|2
business.vw_aicm_pmlw_leader_middle_display|major_item_name|2
business.vw_aicm_pmlw_leader_middle_display|middle_item_name|2
business.vw_aicm_pmlw_major_work_display|major_item_name|3
business.vw_aicm_pmlw_worker_work_unit_display|deliverable_name|2
business.vw_aicm_pmlw_worker_work_unit_display|input_context_text|2
business.vw_aicm_pmlw_worker_work_unit_display|major_item_name|2
business.vw_aicm_pmlw_worker_work_unit_display|metadata_jsonb|2
business.vw_aicm_pmlw_worker_work_unit_display|middle_item_name|2
business.vw_aicm_pmlw_worker_work_unit_display|result_summary_text|2
business.vw_aicm_pmlw_worker_work_unit_display|work_unit_name|2
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
PASS: DB request_id target still found
PASS: DB title target still found

============================================================
7. final judgement
============================================================
WRONG_HTTP=500
CORRECT_HTTP=200
REVIEW_WAIT_MAX=2
CONTEXT_HAS_KNOWN=YES
CONTEXT_HAS_COMPANY=YES
DB_REQUEST_FOUND=YES
DB_TITLE_FOUND=YES
PASS_COUNT=9
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=CONTEXT_ALREADY_EXPOSES_TARGET_WITH_CORRECT_PARAM_BROWSER_CHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e3_correct_context_parameter_recheck_20260503_080058/000_R8Z_V8E3_CORRECT_CONTEXT_PARAMETER_RECHECK_REPORT.md
SERVER_CONTEXT_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e3_correct_context_parameter_recheck_20260503_080058/020_server_context_route_snip.txt
CORE_CONTEXT_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e3_correct_context_parameter_recheck_20260503_080058/021_core_context_fetch_snip.txt
CONTEXT_OWNER_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e3_correct_context_parameter_recheck_20260503_080058/031_context_owner_civilization_id_parse.txt
DB_CONFIRM=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e3_correct_context_parameter_recheck_20260503_080058/040_db_known_target_confirm.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- CONTEXT_ALREADY_EXPOSES_TARGET_WITH_CORRECT_PARAM_BROWSER_CHECK:
  パッチ不要。ブラウザ側が正しいparamで呼んでいるか/キャッシュを確認。

- CONTEXT_CONTAINS_TARGET_BUT_NOT_REVIEW_WAIT_KEY_CORE_SHAPE_MERGE_FIX:
  serverには対象がある。coreのreview-listが読む review_wait_items へshape mergeだけ最小修正。

- DB_HAS_TARGET_BUT_CONTEXT_CORRECT_PARAM_MISSING_TARGET_PREPARE_V8F_PAYLOAD_MERGE:
  DBには対象があるがcontext payloadに出ていない。
  次はinterceptorではなく、getContext返却payload生成直後に review_wait_items をmergeするserver最小patch。

- CORRECT_OWNER_CIVILIZATION_ID_CONTEXT_STILL_NOT_200:
  context route本体/getContextのowner処理を確認。
