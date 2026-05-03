
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V7 route bridgeは画面に出ている
- 画面は rows=0 / hydrating=YES
- 直前確認:
  FINAL_JUDGEMENT=NO_CONTEXT_AND_DB_COUNT_UNCLEAR_CHECK_DB_VIEW_OR_IDS
  BEST_CONTEXT_COUNT=0
  DB_HAS_TWO=NO

今回の目的:
- UI/core/serverを修正せず、DBとcontext APIの実態を再特定する
- 既知request_id 2件と既知タイトル文字列をDB全体から横断検索する
- review/human/delivery/work_unit系 relation/view を再確認する
- 「本当に2件が残っている場所」を特定してから次の最小修正を決める

禁止:
- DB write
- API POST
- core/server patch
- window override追加
- render関数置換

レビュー:
- 佐藤(DB担当): READ ONLY確認のみ

============================================================
1. ENV / TARGET
============================================================
PHASE=R8Z-V8B DB/view/ID direct locate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
REQ1=1c2fceb2-4f1a-4dd4-8cc7-63d7d529e6aa
REQ2=569fc089-2771-4616-9c3b-0a93698b203a
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714
DB_READ=YES
DB_WRITE=NO
API_GET=YES
API_POST=NO
PATCH=NO
PASS: core exists
PASS: server exists

============================================================
2. syntax check
============================================================
PASS: node --check core PASS
PASS: node --check server PASS

============================================================
3. server env/context route scan
============================================================
---- DB env usage ----
8:const PORT = Number(process.env.AICM_LOCAL_UI_PORT || process.env.PORT || 8794);
21:  ".jpg": "image/jpeg",
67:  const pgProtocol = "post" + "gres(?:ql)?://";
68:  raw = raw.replace(new RegExp(pgProtocol + "[^\\s'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");
103:  const connection = process.env[DB_ENV_KEY];
168:// No new Pool, no new DB helper, no new connection path.
629:// No new Pool, no new DB helper, no new connection path.
1024:  const robotPoolId = String(body.robot_pool_id || "").trim();
1030:  const robotPoolSql = robotPoolId ? sqlLiteral(robotPoolId) + "::uuid" : "NULL";
1056:    "    " + robotPoolSql + ",",
1125:      robot_pool_id: String(row.robot_pool_id || row.robotPoolId || "").trim(),
1371:  const base = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_BASE_URL);
1379:  const token = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN);
1567:  return String(process.env.PERSONA_AIWORKEROS_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
1572:  const token = String(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "").trim();

---- context route / review exposure ----
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
530:    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
531:    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
535:    "    " + sqlLiteral(companyId) + "::uuid,",
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
1765:    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,",
1768:    "    priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link,",
1772:    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,",
1807:    "  JOIN input_request r ON r.owner_civilization_id = m.owner_civilization_id AND r.aicm_user_company_id = m.aicm_user_company_id",
1863:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1881:    "    AND w.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1894:    "    p.aicm_user_company_id,",
1909:    "   AND p.aicm_user_company_id = u.aicm_user_company_id",
1945:    unit.input_context_text,
1959:    aicm_user_company_id: aicmR8ZIText(unit.aicm_user_company_id),
2165:if (route === "/api/aicm/v2/context" && req.method === "GET") {
WARN: server scan did not show PERSONA_DATABASE_URL; verify server DB env source

============================================================
4. DB identity
============================================================
db_identity|postgres|postgres|public

============================================================
5. relation and column scan
============================================================
aiworker|app_runtime_control_policy|BASE TABLE
aiworker|chat_worker_v0_activation|BASE TABLE
aiworker|chat_worker_v0_allowed_reference|BASE TABLE
aiworker|chat_worker_v0_control_state|BASE TABLE
aiworker|chat_worker_v0_test_prompt|BASE TABLE
aiworker|leader_mock_review|BASE TABLE
aiworker|model_runtime_control_override|BASE TABLE
aiworker|president_runtime_activation_gate_log|BASE TABLE
aiworker|president_runtime_control|BASE TABLE
aiworker|role_runtime_control_default|BASE TABLE
aiworker|runtime_control_axis_catalog|BASE TABLE
aiworker|runtime_control_value_catalog|BASE TABLE
aiworker|runtime_delivery_package|BASE TABLE
aiworker|runtime_execution_app_api_contract|BASE TABLE
aiworker|runtime_execution_event_log|BASE TABLE
aiworker|runtime_execution_request|BASE TABLE
aiworker|runtime_execution_state_catalog|BASE TABLE
aiworker|runtime_execution_transition_log|BASE TABLE
aiworker|runtime_handoff_packet|BASE TABLE
aiworker|runtime_leader_review|BASE TABLE
aiworker|runtime_manager_gate|BASE TABLE
aiworker|runtime_output_artifact|BASE TABLE
aiworker|runtime_president_approval|BASE TABLE
aiworker|runtime_prompt_fragment_catalog|BASE TABLE
aiworker|runtime_review_gate_log|BASE TABLE
aiworker|runtime_worker_output|BASE TABLE
aiworker|series_runtime_control_default|BASE TABLE
aiworker|vw_app_aiworker_internal_pipeline_dashboard_v1|VIEW
aiworker|vw_app_aiworker_internal_pipeline_payload_v1|VIEW
aiworker|vw_app_aiworker_internal_pipeline_plan_detail_v1|VIEW
aiworker|vw_app_aiworker_model_capability_overlay_v1|VIEW
aiworker|vw_app_aiworker_model_selection_capability_card_v1|VIEW
aiworker|vw_app_aiworker_model_selection_directory_v1|VIEW
aiworker|vw_app_aiworker_model_selection_source_for_capability_v1|VIEW
aiworker|vw_app_aiworker_model_selection_summary_v1|VIEW
aiworker|vw_app_aiworker_read_surface_contract_v1|VIEW
aiworker|vw_app_aiworker_robot_selection_card_v1|VIEW
aiworker|vw_app_aiworker_runtime_control_profile_v1|VIEW
aiworker|vw_app_aiworker_runtime_control_prompt_fragment_v1|VIEW
aiworker|vw_app_aiworker_runtime_delivery_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_execution_api_contract_v1|VIEW
aiworker|vw_app_aiworker_runtime_execution_app_read_payload_v1|VIEW
aiworker|vw_app_aiworker_runtime_execution_endpoint_ready_v1|VIEW
aiworker|vw_app_aiworker_runtime_execution_gate_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_execution_intake_payload_v1|VIEW
aiworker|vw_app_aiworker_runtime_execution_persistent_smoke_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_execution_request_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_full_pipeline_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_handoff_packet_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_leader_review_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_manager_gate_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_president_approval_board_v1|VIEW
aiworker|vw_app_aiworker_runtime_worker_output_board_v1|VIEW
aiworker|vw_app_aiworker_series_selection_directory_v1|VIEW
aiworker|vw_beyond_series_leader_lineup_v1|VIEW
aiworker|vw_beyond_series_leader_quality_lineup_v1|VIEW
aiworker|vw_beyond_series_worker_lineup_v1|VIEW
aiworker|vw_beyond_series_worker_quality_lineup_v1|VIEW
aiworker|vw_chat_worker_v0_activation|VIEW
aiworker|vw_chat_worker_v0_cx_reference|VIEW
aiworker|vw_chat_worker_v0_mock_reply_all|VIEW
aiworker|vw_chat_worker_v0_prompt_context|VIEW
aiworker|vw_chat_worker_v0_runtime_context|VIEW
aiworker|vw_chat_worker_v0_test_prompt|VIEW
aiworker|vw_leader_mock_review_board_v1|VIEW
aiworker|vw_megami_worker_temporal_focus_v1|VIEW
aiworker|vw_president_manager_instruction_waiting_v1|VIEW
aiworker|vw_president_runtime_gate_v1|VIEW
aiworker|vw_worker_dialog_style_control|VIEW
aiworker|vw_worker_dialog_topic_bias|VIEW
aiworker|vw_worker_mock_output_board_v1|VIEW
aiworker|vw_worker_series_directory|VIEW
aiworker|vw_worker_series_lineup|VIEW
aiworker|vw_worker_series_search_directory|VIEW
aiworker|vw_worker_series_search_lineup|VIEW
aiworker|worker_assignment_fit_profile|BASE TABLE
aiworker|worker_assignment_history|BASE TABLE
aiworker|worker_assignment_state|BASE TABLE
aiworker|worker_availability_state|BASE TABLE
aiworker|worker_capability_snapshot|BASE TABLE
aiworker|worker_company_affinity|BASE TABLE
aiworker|worker_dispatch_reservation|BASE TABLE
aiworker|worker_domain_proficiency|BASE TABLE
aiworker|worker_exception_control_state|BASE TABLE
aiworker|worker_growth_event|BASE TABLE
aiworker|worker_growth_profile|BASE TABLE
aiworker|worker_manufacturer_extension_catalog|BASE TABLE
aiworker|worker_master|BASE TABLE
aiworker|worker_mock_output|BASE TABLE
aiworker|worker_model_capability_profile|BASE TABLE
aiworker|worker_model_catalog|BASE TABLE
aiworker|worker_model_extension_catalog|BASE TABLE
aiworker|worker_privileged_profile|BASE TABLE
aiworker|worker_queue_membership|BASE TABLE
aiworker|worker_rebuild_history|BASE TABLE
aiworker|worker_repair_history|BASE TABLE
aiworker|worker_restricted_handling_policy|BASE TABLE
aiworker|worker_role_class_catalog|BASE TABLE
aiworker|worker_role_proficiency|BASE TABLE
aiworker|worker_series_catalog|BASE TABLE
aiworker|worker_series_extension_catalog|BASE TABLE
aiworker|worker_series_tendency|BASE TABLE
aiworker|worker_state_change_log|BASE TABLE
aiworker|worker_user_affinity|BASE TABLE
business|ai_company_manager_approval|BASE TABLE
business|ai_company_manager_deliverable|BASE TABLE
business|ai_company_manager_delivery|BASE TABLE
business|ai_company_manager_review|BASE TABLE
business|aicm_aiworker_api_audit_log|BASE TABLE
business|aicm_aiworker_api_client|BASE TABLE
business|aicm_human_review_item|BASE TABLE
business|aicm_leader_deliverable_requirement|BASE TABLE
business|aicm_leader_middle_work_item|BASE TABLE
business|aicm_review_action|BASE TABLE
business|aicm_review_item|BASE TABLE
business|aicm_user_company_worker_placement|BASE TABLE
business|aicm_user_company_worker_placement_event|BASE TABLE
business|aicm_worker_work_unit|BASE TABLE
business|approval_action|BASE TABLE
business|approval_flow_definition|BASE TABLE
business|approval_flow_step_definition|BASE TABLE
business|approval_request|BASE TABLE
business|approval_step_instance|BASE TABLE
business|v_worker_rental_contract_summary|VIEW
business|v_worker_rental_entitlement_balance_active|VIEW
business|v_worker_rental_monthly_free_ticket_rule|VIEW
business|v_worker_rental_price_catalog_active|VIEW
business|v_worker_rental_service_catalog_active|VIEW
business|vw_aicm_aiworker_api_audit_recent|VIEW
business|vw_aicm_human_review_wait_display|VIEW
business|vw_aicm_pmlw_deliverable_requirement_display|VIEW
business|vw_aicm_pmlw_leader_middle_display|VIEW
business|vw_aicm_pmlw_major_work_display|VIEW
business|vw_aicm_pmlw_president_policy_display|VIEW
business|vw_aicm_pmlw_worker_work_unit_display|VIEW
business|vw_aicm_pmlw_workflow_tree|VIEW
business|vw_aicm_user_company_worker_placement_display|VIEW
business|worker_rental_contract|BASE TABLE
business|worker_rental_contract_line|BASE TABLE
business|worker_rental_end_summary|BASE TABLE
business|worker_rental_entitlement_balance|BASE TABLE
business|worker_rental_entitlement_grant|BASE TABLE
business|worker_rental_entitlement_usage|BASE TABLE
business|worker_rental_payment_intent|BASE TABLE
business|worker_rental_period|BASE TABLE
business|worker_rental_price_catalog|BASE TABLE
business|worker_rental_safety_event|BASE TABLE
business|worker_rental_service_catalog|BASE TABLE
business|worker_rental_status_history|BASE TABLE
business|worker_rental_unit_policy|BASE TABLE
business|worker_rental_usage_log|BASE TABLE
cx22073jw|access_activation_review_decision_batch|BASE TABLE
cx22073jw|access_activation_review_decision_item|BASE TABLE
cx22073jw|access_activation_review_export_item|BASE TABLE
cx22073jw|access_activation_review_export_run|BASE TABLE
cx22073jw|access_human_review_action_log|BASE TABLE
cx22073jw|access_runtime_ready_promotion_batch|BASE TABLE
cx22073jw|access_runtime_ready_promotion_item|BASE TABLE
cx22073jw|ai_employee_activation_review_decision_batch|VIEW
cx22073jw|ai_employee_activation_review_decision_item|VIEW
cx22073jw|ai_employee_activation_review_export_item|VIEW
cx22073jw|ai_employee_activation_review_export_run|VIEW
cx22073jw|ai_employee_human_review_action_log|VIEW
cx22073jw|ai_employee_runtime_ready_promotion_batch|VIEW
cx22073jw|ai_employee_runtime_ready_promotion_item|VIEW
cx22073jw|review_case_area|BASE TABLE
cx22073jw|source_review_registry|BASE TABLE
cx22073jw|staticart_delivery_closeout_run|BASE TABLE
cx22073jw|v_access_activation_review_decision_latest_batch_summary|VIEW
cx22073jw|v_access_activation_review_decision_latest_items|VIEW
cx22073jw|v_access_activation_review_export_latest_items|VIEW
cx22073jw|v_access_activation_review_export_latest_summary|VIEW
cx22073jw|v_access_human_review_latest_action_log|VIEW
cx22073jw|v_access_runtime_ready_promotion_latest_batch_summary|VIEW
cx22073jw|v_access_runtime_ready_promotion_latest_items|VIEW
cx22073jw|v_access_stub_view_runtime_catalog|VIEW
cx22073jw|v_ai_employee_activation_review_decision_latest_batch_summary|VIEW
cx22073jw|v_ai_employee_activation_review_decision_latest_items|VIEW
cx22073jw|v_ai_employee_activation_review_export_latest_items|VIEW
cx22073jw|v_ai_employee_activation_review_export_latest_summary|VIEW
cx22073jw|v_ai_employee_human_review_latest_action_log|VIEW
cx22073jw|v_ai_employee_runtime_ready_promotion_latest_batch_summary|VIEW
cx22073jw|v_ai_employee_runtime_ready_promotion_latest_items|VIEW
cx22073jw|v_ai_employee_stub_view_runtime_catalog|VIEW
cx22073jw|v_review_case_area_latest|VIEW
cx22073jw|v_staticart_delivery_closeout_summary|VIEW
cx22073jw|v_staticart_delivery_master_status|VIEW
cx22073jw|vw_aiemp_approval_routing_context|VIEW
cx22073jw|vw_aiemp_review_package_context|VIEW
cx22073jw|vw_aiemp_senior_control_approval_request_context|VIEW
aiworker|app_runtime_control_policy|app_surface_code, app_surface_name_ja, app_category_code, minimum_self_review_pass_count, proposal_count_min, proposal_count_max, response_style_code, required_checklist_code, context_scope_code, cx_reference_depth_code, handoff_format_code, review_required_flag, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, allowed_actions_jsonb, forbidden_actions_jsonb, prompt_fragment_codes_jsonb, policy_note_ja, status_code, sort_order, created_at, updated_at
aiworker|chat_worker_v0_activation|activation_id, activation_code, runtime_label, manufacturer_code, series_code, model_selector_text, service_code, conversation_profile_code, source_lineup_row_json, source_style_control_row_json, read_only_flag, write_disabled_flag, active_flag, created_at, updated_at
aiworker|chat_worker_v0_allowed_reference|allowed_reference_id, activation_code, source_system, source_view_code, material_family_code, topic_code, allow_flag, restriction_note, created_at
aiworker|chat_worker_v0_control_state|control_state_id, activation_code, enabled_flag, runtime_state_code, assignment_scope_code, cx_reference_enabled_flag, max_concurrent_session_count, current_load_band_code, last_enabled_at, last_disabled_at, updated_at
aiworker|chat_worker_v0_test_prompt|test_prompt_id, activation_code, prompt_order, prompt_code, prompt_text, expected_behavior, active_flag, created_at
aiworker|leader_mock_review|review_id, manager_plan_code, leader_task_code, worker_task_code, task_domain_code, review_result_code, review_summary, correction_note, risk_note, review_json, review_status_code, created_at, updated_at
aiworker|model_runtime_control_override|model_code, model_no, model_name_ja, operation_mode_code, self_review_pass_count, proposal_count_min, proposal_count_max, response_style_code, required_checklist_code, context_scope_code, cx_reference_depth_code, handoff_format_code, allowed_actions_jsonb, forbidden_actions_jsonb, prompt_fragment_codes_jsonb, model_focus_ja, control_note_ja, status_code, sort_order, created_at, updated_at
aiworker|president_runtime_activation_gate_log|gate_log_id, gate_code, president_model_code, activation_scope_code, human_go_confirmed_flag, internal_manager_distribution_allowed_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, gate_status_code, gate_summary, created_at, updated_at
aiworker|president_runtime_control|runtime_control_id, president_model_code, runtime_enabled_flag, authority_activation_status_code, operation_mode_code, human_go_required_flag, human_go_confirmed_flag, auto_strategy_cycle_allowed_flag, auto_manager_distribution_allowed_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, current_runtime_state_code, last_enabled_at, last_disabled_at, updated_at
aiworker|role_runtime_control_default|role_layer_code, role_layer_name_ja, operation_mode_code, self_review_pass_count, proposal_count_min, proposal_count_max, response_style_code, required_checklist_code, handoff_required_flag, review_required_flag, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, allowed_actions_jsonb, forbidden_actions_jsonb, prompt_fragment_codes_jsonb, control_note_ja, status_code, sort_order, created_at, updated_at
aiworker|runtime_control_axis_catalog|axis_code, axis_name_ja, axis_description_ja, status_code, sort_order, created_at, updated_at
aiworker|runtime_control_value_catalog|value_code, value_name_ja, value_rank, value_description_ja, status_code, sort_order, created_at, updated_at
aiworker|runtime_delivery_package|delivery_id, request_id, delivery_code, delivery_status_code, delivery_result_code, delivery_title_ja, delivery_summary_ja, delivery_payload_jsonb, human_go_confirmed_flag, external_execution_performed_flag, pg_apply_performed_flag, destructive_action_performed_flag, created_at, updated_at
aiworker|runtime_execution_app_api_contract|contract_code, api_surface_code, endpoint_method, endpoint_path, backing_db_object, app_facing_flag, read_only_flag, write_allowed_flag, internal_write_allowed_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, idempotency_required_flag, auth_required_flag, request_payload_example_jsonb, response_payload_example_jsonb, safety_jsonb, contract_note_ja, status_code, sort_order, created_at, updated_at
aiworker|runtime_execution_event_log|event_id, request_id, event_type_code, event_status_code, event_title_ja, event_detail_jsonb, created_at
aiworker|runtime_execution_request|request_id, request_code, app_surface_code, app_surface_name_ja, source_app_ref, source_request_ref, model_code, model_no, model_name_ja, series_code, series_name_ja, role_layer_code, role_layer_name_ja, task_domain_code, task_title, task_instruction_ja, requested_by_ref, idempotency_key, request_status_code, operation_mode_code, self_review_pass_count, proposal_count_min, proposal_count_max, response_style_code, required_checklist_code, context_scope_code, cx_reference_depth_code, handoff_format_code, handoff_required_flag, review_required_flag, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, allowed_actions_snapshot_jsonb, forbidden_actions_snapshot_jsonb, prompt_fragment_codes_snapshot_jsonb, runtime_control_snapshot_jsonb, created_at, updated_at
aiworker|runtime_execution_state_catalog|state_code, state_name_ja, state_description_ja, terminal_flag, status_code, sort_order, created_at, updated_at
aiworker|runtime_execution_transition_log|transition_id, request_id, from_status_code, to_status_code, transition_type_code, transition_summary_ja, transition_detail_jsonb, created_at
aiworker|runtime_handoff_packet|handoff_id, request_id, handoff_code, from_actor_ref, to_role_layer_code, handoff_status_code, handoff_format_code, handoff_title_ja, handoff_payload_jsonb, artifact_refs_jsonb, created_at, updated_at
aiworker|runtime_leader_review|leader_review_id, request_id, output_id, review_code, review_result_code, review_status_code, reviewer_role_layer_code, review_summary_ja, review_detail_jsonb, return_for_fix_flag, created_at, updated_at
aiworker|runtime_manager_gate|manager_gate_id, request_id, gate_code, gate_result_code, gate_status_code, gate_summary_ja, gate_detail_jsonb, return_for_fix_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, created_at, updated_at
aiworker|runtime_output_artifact|artifact_id, output_id, request_id, artifact_code, artifact_kind_code, artifact_title_ja, artifact_payload_jsonb, artifact_status_code, created_at, updated_at
aiworker|runtime_president_approval|president_approval_id, request_id, approval_code, approval_result_code, approval_status_code, approval_summary_ja, approval_detail_jsonb, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, created_at, updated_at
aiworker|runtime_prompt_fragment_catalog|prompt_fragment_code, prompt_fragment_name_ja, prompt_fragment_text_ja, prompt_kind_code, status_code, sort_order, created_at, updated_at
aiworker|runtime_review_gate_log|gate_id, request_id, gate_type_code, gate_status_code, gate_result_code, reviewer_role_layer_code, review_summary_ja, review_detail_jsonb, created_at, updated_at
aiworker|runtime_worker_output|output_id, request_id, output_code, output_status_code, output_result_code, output_title_ja, output_body_ja, output_summary_ja, output_payload_jsonb, safety_result_code, external_execution_performed_flag, pg_apply_performed_flag, destructive_action_performed_flag, created_by_role_layer_code, created_at, updated_at
aiworker|series_runtime_control_default|series_code, series_name_ja, operation_mode_code, self_review_pass_count, proposal_count_min, proposal_count_max, response_style_code, required_checklist_code, context_scope_code, cx_reference_depth_code, handoff_format_code, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, allowed_actions_jsonb, forbidden_actions_jsonb, prompt_fragment_codes_jsonb, control_note_ja, status_code, sort_order, created_at, updated_at
aiworker|vw_app_aiworker_internal_pipeline_dashboard_v1|acceptance_package_code, acceptance_status_code, president_model_no, president_model_code, president_runtime_state_code, check_count, pass_count, fail_count, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, plan_count, delivery_ready_internal_count, worker_done_count, leader_done_count, manager_gate_done_count, app_read_safe_flag, app_allowed_action_code, app_contract_note
aiworker|vw_app_aiworker_internal_pipeline_payload_v1|acceptance_package_code, response_payload_json
aiworker|vw_app_aiworker_internal_pipeline_plan_detail_v1|manager_plan_code, instruction_code, task_domain_code, plan_status_code, source_instruction_title, worker_task_code, worker_output_status_code, worker_output_title, worker_output_body, leader_task_code, leader_review_status_code, leader_review_summary, leader_correction_note, leader_risk_note, manager_gate_task_code, delivery_status_code, gate_result_code, final_summary, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, human_go_required_for_external_flag, app_display_ready_flag, app_usage_scope_code
aiworker|vw_app_aiworker_model_capability_overlay_v1|model_code, model_no, manufacturer_code, series_code, model_capability_override_jsonb, model_capability_override_summary_ja, override_count
aiworker|vw_app_aiworker_model_selection_capability_card_v1|registry_code, manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, model_category_code, public_summary_ja, capability_summary_ja, personality_summary_ja, safety_note_ja, public_traits_jsonb, recommended_usage_jsonb, source_layer_code, series_precision_ja, series_agility_ja, series_coordination_ja, series_continuity_ja, series_specialization_depth_ja, series_creativity_ja, series_review_depth_ja, series_stability_ja, series_capability_jsonb, model_capability_override_jsonb, model_capability_override_summary_ja, model_capability_override_count, capability_card_jsonb, app_selection_badge_ja, high_function_business_specialized_flag, sort_order
aiworker|vw_app_aiworker_model_selection_directory_v1|registry_code, manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, model_category_code, public_summary_ja, capability_summary_ja, personality_summary_ja, safety_note_ja, public_traits_jsonb, recommended_usage_jsonb, source_layer_code, sort_order
aiworker|vw_app_aiworker_model_selection_source_for_capability_v1|registry_code, manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, model_category_code, public_summary_ja, capability_summary_ja, personality_summary_ja, safety_note_ja, public_traits_jsonb, recommended_usage_jsonb, source_layer_code, sort_order
aiworker|vw_app_aiworker_model_selection_summary_v1|manufacturer_code, manufacturer_name, series_code, series_name_ja, model_count, worker_count, leader_count, manager_count, president_count, friend_count, lover_count, multi_role_count, sort_order
aiworker|vw_app_aiworker_read_surface_contract_v1|contract_code, app_surface_code, contract_name, contract_name_ja, read_only_flag, write_allowed_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, payload_contract_summary, status_code
aiworker|vw_app_aiworker_robot_selection_card_v1|registry_code, manufacturer_code, manufacturer_name_ja, series_code, series_name_ja, model_code, model_no, model_name_ja, role_layer_name_ja, model_category_code, app_selection_badge_ja, public_summary_ja, capability_summary_ja, personality_summary_ja, safety_note_ja, series_precision_ja, series_agility_ja, series_coordination_ja, series_continuity_ja, series_specialization_depth_ja, series_creativity_ja, series_review_depth_ja, series_stability_ja, model_capability_override_summary_ja, model_capability_override_count, high_function_business_specialized_flag, capability_card_jsonb, public_traits_jsonb, recommended_usage_jsonb, sort_order
aiworker|vw_app_aiworker_runtime_control_profile_v1|app_surface_code, app_surface_name_ja, app_category_code, manufacturer_code, manufacturer_name_ja, series_code, series_name_ja, model_code, model_no, model_name_ja, role_layer_code, role_layer_name_ja, model_category_code, app_selection_badge_ja, high_function_business_specialized_flag, operation_mode_code, self_review_pass_count, proposal_count_min, proposal_count_max, response_style_code, required_checklist_code, context_scope_code, cx_reference_depth_code, handoff_format_code, handoff_required_flag, review_required_flag, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, allowed_actions_jsonb, forbidden_actions_jsonb, prompt_fragment_codes_jsonb, capability_card_jsonb, model_capability_override_summary_ja, model_focus_ja, runtime_control_jsonb, model_sort_order, app_sort_order
aiworker|vw_app_aiworker_runtime_control_prompt_fragment_v1|app_surface_code, model_code, model_no, model_name_ja, role_layer_code, series_code, prompt_fragment_code, prompt_fragment_name_ja, prompt_fragment_text_ja, prompt_kind_code, sort_order
aiworker|vw_app_aiworker_runtime_delivery_board_v1|delivery_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, delivery_code, delivery_status_code, delivery_result_code, delivery_title_ja, delivery_summary_ja, human_go_confirmed_flag, external_execution_performed_flag, pg_apply_performed_flag, destructive_action_performed_flag, delivery_safe_internal_flag, created_at, updated_at
aiworker|vw_app_aiworker_runtime_execution_api_contract_v1|contract_code, api_surface_code, endpoint_method, endpoint_path, backing_db_object, app_facing_flag, read_only_flag, write_allowed_flag, internal_write_allowed_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, idempotency_required_flag, auth_required_flag, request_payload_example_jsonb, response_payload_example_jsonb, safety_jsonb, contract_note_ja, sort_order
aiworker|vw_app_aiworker_runtime_execution_app_read_payload_v1|request_id, request_code, app_surface_code, app_surface_name_ja, model_code, model_no, model_name_ja, series_code, series_name_ja, role_layer_code, role_layer_name_ja, task_domain_code, task_title, request_status_code, delivery_status_code, full_pipeline_safe_internal_flag, app_read_payload_jsonb, request_created_at, delivery_created_at
aiworker|vw_app_aiworker_runtime_execution_endpoint_ready_v1|contract_count, read_endpoint_count, write_endpoint_count, internal_write_endpoint_count, all_external_execution_blocked, all_pg_apply_blocked, all_destructive_action_blocked, all_auth_required, latest_contract_updated_at
aiworker|vw_app_aiworker_runtime_execution_gate_board_v1|gate_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, gate_type_code, gate_status_code, gate_result_code, reviewer_role_layer_code, review_summary_ja, created_at, updated_at
aiworker|vw_app_aiworker_runtime_execution_intake_payload_v1|request_id, request_code, intake_payload_jsonb, created_at
aiworker|vw_app_aiworker_runtime_execution_persistent_smoke_board_v1|request_id, request_code, app_surface_code, app_surface_name_ja, model_code, model_no, model_name_ja, series_code, series_name_ja, role_layer_code, role_layer_name_ja, task_domain_code, task_title, request_status_code, operation_mode_code, self_review_pass_count, proposal_count_max, review_required_flag, human_go_required_flag, request_external_execution_allowed_flag, request_pg_apply_allowed_flag, request_destructive_action_allowed_flag, output_status_code, output_result_code, output_title_ja, safety_result_code, leader_review_result_code, leader_review_status_code, leader_return_for_fix_flag, manager_gate_result_code, manager_gate_status_code, manager_return_for_fix_flag, president_approval_result_code, president_approval_status_code, president_human_go_required_flag, delivery_status_code, delivery_result_code, human_go_confirmed_flag, external_execution_performed_flag, pg_apply_performed_flag, destructive_action_performed_flag, full_pipeline_safe_internal_flag, request_created_at, output_created_at, leader_review_created_at, manager_gate_created_at, president_approval_created_at, delivery_created_at
aiworker|vw_app_aiworker_runtime_execution_request_board_v1|request_id, request_code, app_surface_code, app_surface_name_ja, source_app_ref, source_request_ref, model_code, model_no, model_name_ja, series_code, series_name_ja, role_layer_code, role_layer_name_ja, task_domain_code, task_title, requested_by_ref, idempotency_key, request_status_code, operation_mode_code, self_review_pass_count, proposal_count_min, proposal_count_max, response_style_code, required_checklist_code, context_scope_code, cx_reference_depth_code, handoff_format_code, handoff_required_flag, review_required_flag, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, internal_safe_flag, created_at, updated_at
aiworker|vw_app_aiworker_runtime_full_pipeline_board_v1|request_id, request_code, app_surface_code, app_surface_name_ja, model_code, model_no, model_name_ja, series_code, series_name_ja, role_layer_code, role_layer_name_ja, task_domain_code, task_title, request_status_code, operation_mode_code, self_review_pass_count, proposal_count_max, review_required_flag, human_go_required_flag, request_external_execution_allowed_flag, request_pg_apply_allowed_flag, request_destructive_action_allowed_flag, output_status_code, output_result_code, output_title_ja, safety_result_code, leader_review_result_code, leader_review_status_code, leader_return_for_fix_flag, manager_gate_result_code, manager_gate_status_code, manager_return_for_fix_flag, president_approval_result_code, president_approval_status_code, president_human_go_required_flag, delivery_status_code, delivery_result_code, human_go_confirmed_flag, external_execution_performed_flag, pg_apply_performed_flag, destructive_action_performed_flag, full_pipeline_safe_internal_flag, request_created_at, output_created_at, leader_review_created_at, manager_gate_created_at, president_approval_created_at, delivery_created_at
aiworker|vw_app_aiworker_runtime_handoff_packet_board_v1|handoff_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, handoff_code, from_actor_ref, to_role_layer_code, handoff_status_code, handoff_format_code, handoff_title_ja, handoff_payload_jsonb, created_at, updated_at
aiworker|vw_app_aiworker_runtime_leader_review_board_v1|leader_review_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, review_code, review_result_code, review_status_code, reviewer_role_layer_code, review_summary_ja, return_for_fix_flag, created_at, updated_at
aiworker|vw_app_aiworker_runtime_manager_gate_board_v1|manager_gate_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, gate_code, gate_result_code, gate_status_code, gate_summary_ja, return_for_fix_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, created_at, updated_at
aiworker|vw_app_aiworker_runtime_president_approval_board_v1|president_approval_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, approval_code, approval_result_code, approval_status_code, approval_summary_ja, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, created_at, updated_at
aiworker|vw_app_aiworker_runtime_worker_output_board_v1|output_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, series_code, series_name_ja, role_layer_code, role_layer_name_ja, task_domain_code, task_title, output_code, output_status_code, output_result_code, output_title_ja, output_summary_ja, safety_result_code, external_execution_performed_flag, pg_apply_performed_flag, destructive_action_performed_flag, created_at, updated_at
aiworker|vw_app_aiworker_series_selection_directory_v1|registry_code, manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, series_category_code, public_summary_ja, public_scope_note_ja, initiative_ja, initiative_code, user_influence_ja, user_influence_code, action_restriction_ja, action_restriction_code, tendency_json, app_reference_allowed_flag
aiworker|vw_beyond_series_leader_lineup_v1|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, capability_summary, max_managed_worker_count, task_complexity_code, single_task_allowed_flag, repetitive_task_allowed_flag, complex_task_allowed_flag, sort_order
aiworker|vw_beyond_series_leader_quality_lineup_v1|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, capability_summary, quality_level_code, quality_level_no, quality_level_label_ja, public_quality_label_ja, public_quality_summary_ja, quality_axes_jsonb, strengths_jsonb, recommended_usage_jsonb, public_difference_note_ja, task_complexity_code, single_task_allowed_flag, repetitive_task_allowed_flag, complex_task_allowed_flag, sort_order
aiworker|vw_beyond_series_worker_lineup_v1|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, capability_summary, max_managed_worker_count, task_complexity_code, single_task_allowed_flag, repetitive_task_allowed_flag, complex_task_allowed_flag, sort_order
aiworker|vw_beyond_series_worker_quality_lineup_v1|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, capability_summary, quality_level_code, quality_level_no, quality_level_label_ja, public_quality_label_ja, public_quality_summary_ja, quality_axes_jsonb, strengths_jsonb, recommended_usage_jsonb, public_difference_note_ja, task_complexity_code, single_task_allowed_flag, repetitive_task_allowed_flag, complex_task_allowed_flag, sort_order
aiworker|vw_chat_worker_v0_activation|activation_id, activation_code, runtime_label, manufacturer_code, series_code, model_selector_text, service_code, conversation_profile_code, read_only_flag, write_disabled_flag, active_flag, updated_at
aiworker|vw_chat_worker_v0_cx_reference|activation_code, material_family_code, topic_code, restriction_note, cx_material_row_json
aiworker|vw_chat_worker_v0_mock_reply_all|out_activation_code, out_prompt_code, out_prompt_text, out_reply_text, out_safety_result, out_used_cx_material_count, out_response_json
aiworker|vw_chat_worker_v0_prompt_context|activation_code, prompt_order, prompt_code, prompt_text, expected_behavior, runtime_label, manufacturer_code, series_code, model_selector_text, service_code, conversation_profile_code, enabled_flag, runtime_state_code, cx_reference_enabled_flag, read_only_flag, write_disabled_flag, startable_flag, cx_material_count, cx_materials_json, prompt_context_json
aiworker|vw_chat_worker_v0_runtime_context|activation_code, runtime_label, manufacturer_code, series_code, model_selector_text, service_code, conversation_profile_code, enabled_flag, runtime_state_code, assignment_scope_code, cx_reference_enabled_flag, max_concurrent_session_count, current_load_band_code, read_only_flag, write_disabled_flag, startable_flag, updated_at
aiworker|vw_chat_worker_v0_test_prompt|activation_code, prompt_order, prompt_code, prompt_text, expected_behavior, active_flag
aiworker|vw_leader_mock_review_board_v1|manager_plan_code, leader_task_code, worker_task_code, task_domain_code, review_result_code, review_status_code, review_summary, correction_note, risk_note, review_json
aiworker|vw_megami_worker_temporal_focus_v1|manufacturer_code, series_code, model_code, model_no, model_name_ja, temporal_focus_code, temporal_focus_label_ja, worker_mode_summary_ja, recommended_usage_jsonb
aiworker|vw_president_manager_instruction_waiting_v1|distribution_code, instruction_code, president_model_code, president_model_no, strategy_cycle_code, bridge_status_code, bridge_note, source_actor_type, source_authority_role_code, source_manager_level_no, target_authority_role_code, target_manager_level_no, target_actor_ref, task_domain_code, instruction_title, priority_code, human_confirmed_flag, hierarchy_authorized_flag, instruction_status_code, authority_decision_code, authority_decision_summary, manager_can_accept_flag
aiworker|vw_president_runtime_gate_v1|president_model_code, president_model_name_ja, catalog_status_code, authority_registration_status_code, authority_activation_status_code, runtime_enabled_flag, current_runtime_state_code, operation_mode_code, human_go_required_flag, human_go_confirmed_flag, auto_strategy_cycle_allowed_flag, auto_manager_distribution_allowed_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, president_runtime_executable_flag, runtime_gate_note
aiworker|vw_worker_dialog_style_control|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, machine_name, machine_name_ja, product_name, product_name_ja, role_class_code, role_class_name, role_class_name_ja, service_code, service_name, service_name_ja, style_code, style_no, style_name, style_name_ja, style_summary, initiative_code, warmth_code, tempo_code, closeness_code, opener_overlay, followup_overlay, closing_overlay, redirect_overlay, dialog_control_search_text, sort_order
aiworker|vw_worker_dialog_topic_bias|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, machine_name_ja, product_name_ja, role_class_code, role_class_name_ja, service_code, service_name_ja, style_code, style_no, style_name_ja, topic_code, topic_group_code, weight_value, note_text, enabled, sort_order
aiworker|vw_worker_mock_output_board_v1|manager_plan_code, worker_task_code, task_domain_code, output_title, safety_result_code, output_status_code, output_body, output_json
aiworker|vw_worker_series_directory|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, series_summary, initiative_posture_code, initiative_posture_label, reasoning_guardrail_code, reasoning_guardrail_label, risk_posture_code, risk_posture_label, tendency_summary, enabled_model_count, series_search_text
aiworker|vw_worker_series_lineup|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, role_class_code, role_class_name, role_class_name_ja, governance_rank_no, combat_related, model_code, model_no, machine_name, machine_name_ja, product_name, product_name_ja, model_summary, initiative_posture_code, initiative_posture_label, reasoning_guardrail_code, reasoning_guardrail_label, risk_posture_code, risk_posture_label, tendency_summary, lineup_group_code, lineup_group_name_ja, model_search_text, sort_order
aiworker|vw_worker_series_search_directory|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, series_summary, enabled_model_count, style_count, male_model_count, female_model_count, live_enabled_model_count, series_search_text
aiworker|vw_worker_series_search_lineup|manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, machine_name, machine_name_ja, product_name, product_name_ja, model_summary, role_class_code, role_class_name, role_class_name_ja, governance_rank_no, combat_related, series_prefix_code, style_no, presentation_gender_code, version_no, style_code, style_name, style_name_ja, style_summary, initiative_code, warmth_code, tempo_code, closeness_code, public_series_name, public_stage_name, live_activity_enabled, public_profile_summary, public_disclosure_note, public_metrics, model_search_text, sort_order
aiworker|worker_assignment_fit_profile|worker_assignment_fit_profile_id, worker_id, app_scope_code, assignment_fit_score, fit_reason_summary_code, updated_at
aiworker|worker_assignment_history|worker_assignment_history_id, worker_id, tenant_company_id, tenant_user_id, app_scope_code, assignment_state_code, started_at, ended_at, recorded_at
aiworker|worker_assignment_state|worker_assignment_state_id, worker_id, tenant_company_id, tenant_user_id, assigned_app_scope_code, assigned_project_id, assignment_state_code, assignment_lane_scope_code, effective_from, effective_to, updated_at
aiworker|worker_availability_state|worker_availability_state_id, worker_id, availability_state_code, concurrent_capacity, current_load_band_code, effective_from, effective_to, updated_at
aiworker|worker_capability_snapshot|worker_capability_snapshot_id, worker_id, snapshot_at, capability_band_code, specialization_summary_code, confidence_band_code, recorded_at
aiworker|worker_company_affinity|worker_company_affinity_id, worker_id, tenant_company_id, company_fit_score, trust_alignment_score, communication_fit_score, updated_at
aiworker|worker_dispatch_reservation|worker_dispatch_reservation_id, business_request_id, worker_id, reservation_state_code, reserved_from, reserved_to, priority_band_code, created_at, updated_at
aiworker|worker_domain_proficiency|worker_domain_proficiency_id, worker_id, domain_code, proficiency_score, score_band_code, measured_at, updated_at
aiworker|worker_exception_control_state|worker_exception_control_state_id, worker_id, exception_state_code, exception_reason_code, opened_at, closed_at, updated_at
aiworker|worker_growth_event|worker_growth_event_id, worker_id, growth_event_type, event_score_delta, summary_code, occurred_at, recorded_at
aiworker|worker_growth_profile|worker_growth_profile_id, worker_id, growth_level, stability_score, recovery_learning_score, suggestion_effectiveness_score, escalation_accuracy_score, updated_at
aiworker|worker_manufacturer_extension_catalog|manufacturer_code, manufacturer_name, manufacturer_name_ja, manufacturer_summary, status_code, created_at, updated_at
aiworker|worker_master|worker_id, worker_code, display_label, employee_type, rank_code, domain_code, role_code, lifecycle_status, provider_company_id, company_style_profile_code, repairable_flag, rebuildable_flag, active_flag, suspended_flag, retired_flag, created_at, updated_at
aiworker|worker_mock_output|output_id, manager_plan_code, worker_task_code, task_domain_code, output_title, output_body, output_json, safety_result_code, output_status_code, created_at, updated_at
aiworker|worker_model_capability_profile|capability_profile_id, model_code, capability_code, capability_label_ja, capability_detail_ja, status_code, sort_order, created_at, updated_at
aiworker|worker_model_catalog|model_code, manufacturer_code, series_code, role_class_code, model_no, machine_name, machine_name_ja, product_name, product_name_ja, model_summary, enabled, sort_order, created_at, updated_at
aiworker|worker_model_extension_catalog|manufacturer_code, series_code, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, capability_summary, max_managed_worker_count, task_complexity_code, single_task_allowed_flag, repetitive_task_allowed_flag, complex_task_allowed_flag, status_code, sort_order, created_at, updated_at
aiworker|worker_privileged_profile|worker_privileged_profile_id, worker_id, privileged_context_code, privileged_gate_code, active_flag, updated_at
aiworker|worker_queue_membership|worker_queue_membership_id, worker_id, queue_family_code, queue_priority_band_code, queue_position, last_assignment_at, current_load_band_code, updated_at
aiworker|worker_rebuild_history|worker_rebuild_history_id, worker_id, rebuild_ticket_code, rebuild_state_code, rebuild_reason_code, opened_at, closed_at, recorded_at
aiworker|worker_repair_history|worker_repair_history_id, worker_id, repair_ticket_code, repair_state_code, repair_reason_code, opened_at, closed_at, recorded_at
aiworker|worker_restricted_handling_policy|worker_restricted_handling_policy_id, worker_id, restricted_domain_code, handling_policy_code, escalation_required_flag, updated_at
aiworker|worker_role_class_catalog|role_class_code, role_class_name, role_class_name_ja, role_summary, governance_rank_no, combat_related, enabled, sort_order, created_at, updated_at
aiworker|worker_role_proficiency|worker_role_proficiency_id, worker_id, role_code, proficiency_score, score_band_code, measured_at, updated_at
aiworker|worker_series_catalog|series_code, manufacturer_code, series_name, series_name_ja, series_summary, enabled, sort_order, created_at, updated_at
aiworker|worker_series_extension_catalog|manufacturer_code, series_code, series_name, series_name_ja, series_summary, status_code, created_at, updated_at
aiworker|worker_series_tendency|series_code, initiative_posture_code, initiative_posture_label, reasoning_guardrail_code, reasoning_guardrail_label, risk_posture_code, risk_posture_label, tendency_summary, enabled, created_at, updated_at
aiworker|worker_state_change_log|worker_state_change_log_id, worker_id, state_family_code, old_state_code, new_state_code, change_reason_code, changed_at, changed_by
aiworker|worker_user_affinity|worker_user_affinity_id, worker_id, tenant_user_id, user_fit_score, trust_alignment_score, communication_fit_score, updated_at
business|ai_company_manager_approval|approval_id, project_id, pipeline_run_id, deliverable_id, approver_user_id, approval_status, approval_comment, approved_at, created_at, updated_at
business|ai_company_manager_deliverable|deliverable_id, pipeline_run_id, parent_deliverable_id, produced_by_role, produced_by_ref, deliverable_title, deliverable_type, content_ref, content_text, deliverable_status, version_no, created_at, updated_at
business|ai_company_manager_delivery|delivery_id, project_id, pipeline_run_id, approval_id, deliverable_id, delivery_status, delivery_format, delivery_ref, delivered_at, accepted_at, created_at, updated_at
business|ai_company_manager_review|review_id, deliverable_id, pipeline_run_id, reviewer_role, reviewer_ref, review_status, review_comment, quality_score, reviewed_at, created_at, updated_at
business|aicm_aiworker_api_audit_log|api_audit_log_id, request_id, api_client_id, client_code, company_id, endpoint_code, action_code, dry_run_flag, allowed_flag, status_code, error_code, reason, actor_type, request_jsonb, response_jsonb, request_ip, user_agent, metadata_jsonb, created_at
business|aicm_aiworker_api_client|api_client_id, client_code, display_name, token_sha256, token_hint, status_code, allowed_scope_code, note, metadata_jsonb, created_at, updated_at
business|aicm_human_review_item|aicm_human_review_item_id, owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id, related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id, related_deliverable_requirement_id, related_worker_work_unit_id, review_kind_code, artifact_kind_code, review_title, delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link, responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date, human_reviewer_label, human_review_note, requested_at, reviewed_at, display_order, metadata_jsonb, created_at, updated_at
business|aicm_leader_deliverable_requirement|aicm_leader_deliverable_requirement_id, owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, deliverable_name, deliverable_type_code, deliverable_description, required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code, priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb, created_at, updated_at
business|aicm_leader_middle_work_item|aicm_leader_middle_work_item_id, owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id, aicm_user_company_department_id, aicm_user_company_section_id, middle_item_name, middle_item_description, leader_robot_label, breakdown_status_code, handoff_status_code, priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb, created_at, updated_at
business|aicm_review_action|review_action_id, review_item_id, company_id, action_type, action_status_after, actor_user_id, actor_role, idempotency_key, comment, created_at
business|aicm_review_item|review_item_id, company_id, department_id, ledger_row_id, review_title, target_name, review_status, note, created_at, updated_at
business|aicm_user_company_worker_placement|aicm_user_company_worker_placement_id, owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id, target_level_code, target_id, app_code, role_code, robot_pool_id, aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code, metadata_jsonb, created_at, updated_at
business|aicm_user_company_worker_placement_event|aicm_user_company_worker_placement_event_id, owner_civilization_id, aicm_user_company_id, aicm_user_company_worker_placement_id, event_type_code, event_note, before_jsonb, after_jsonb, actor_type_code, actor_id, created_at
business|aicm_worker_work_unit|aicm_worker_work_unit_id, owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id, work_unit_name, work_unit_description, work_type_code, assigned_worker_label, worker_model_code, work_status_code, review_status_code, priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link, reference_files_text, supplemental_materials_text, applicable_rules_text, note, display_order, metadata_jsonb, created_at, updated_at
business|approval_action|action_id, request_id, step_order, actor_id, action, comment, meta, acted_at
business|approval_flow_definition|flow_code, description, is_active, created_at
business|approval_flow_step_definition|flow_code, step_order, role_code, sla_hours, is_required, created_at
business|approval_request|request_id, request_type, flow_code, reference_schema, reference_table, reference_id, payload, status, current_step, created_by, created_at, updated_at, due_at
business|approval_step_instance|request_id, step_order, role_code, status, due_at, escalated_count, last_escalated_at, decided_by, decided_at
business|v_worker_rental_contract_summary|rental_contract_id, owner_civilization_id, user_id, target_company_id, erp_company_id, app_code, service_code, worker_owner_schema, worker_id, worker_type, worker_snapshot_id, aiworker_model_code, role_code, rental_unit_kind, rental_unit_count, rental_total_minutes, rental_starts_at, rental_ends_at, base_price_jpy, applied_entitlement_count, free_unit_count, paid_unit_count, final_price_jpy, contract_status, price_version, locale, created_at, updated_at
business|v_worker_rental_entitlement_balance_active|entitlement_balance_id, entitlement_grant_id, owner_civilization_id, user_id, app_code, service_code, grant_period, entitlement_kind, entitlement_source_rule, entitlement_unit_kind, entitlement_unit_count, entitlement_minutes_each, granted_quantity, used_quantity, remaining_quantity, remaining_total_units, remaining_total_minutes, balance_status, created_at, updated_at
business|v_worker_rental_monthly_free_ticket_rule|rental_unit_kind, display_name, max_unit_count, max_total_minutes, max_human_label, is_active, created_at, updated_at
business|v_worker_rental_price_catalog_active|price_catalog_id, app_code, service_code, price_version, worker_owner_schema, worker_type_scope, worker_id_scope, rental_unit_kind, rental_unit_count, rental_total_minutes, base_price_jpy, currency_code, is_active, effective_from, effective_to
business|v_worker_rental_service_catalog_active|service_catalog_id, app_code, service_code, service_name, service_category, worker_owner_schema, supports_minute, supports_hour, supports_day, supports_month, supports_year, minimum_contract_unit_kind, minimum_contract_unit_count, app_max_contract_unit_kind, app_max_contract_unit_count, minimum_contract_minutes, app_max_contract_minutes, monthly_free_ticket_enabled, monthly_free_ticket_quantity, monthly_free_ticket_source_rule, monthly_free_ticket_unit_kind, monthly_free_ticket_unit_count, monthly_free_ticket_carryover_enabled, is_active
business|vw_aicm_aiworker_api_audit_recent|api_audit_log_id, request_id, client_code, company_id, endpoint_code, action_code, dry_run_flag, allowed_flag, status_code, error_code, reason, created_at
business|vw_aicm_human_review_wait_display|aicm_human_review_item_id, owner_civilization_id, aicm_user_company_id, company_name, aicm_user_company_department_id, department_name, aicm_user_company_section_id, section_name, related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id, related_deliverable_requirement_id, related_worker_work_unit_id, review_kind_code, review_kind_label, artifact_kind_code, artifact_kind_label, review_title, delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link, responsible_ai_label, requested_by_ai_label, human_review_status_code, human_review_status_label, priority_code, due_date, human_reviewer_label, human_review_note, requested_at, reviewed_at, display_order, created_at, updated_at, metadata_jsonb
business|vw_aicm_pmlw_deliverable_requirement_display|aicm_leader_deliverable_requirement_id, owner_civilization_id, aicm_user_company_id, company_name, aicm_leader_middle_work_item_id, middle_item_name, aicm_manager_major_work_item_id, major_item_name, deliverable_name, deliverable_type_code, deliverable_description, required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code, priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb, created_at, updated_at
business|vw_aicm_pmlw_leader_middle_display|aicm_leader_middle_work_item_id, owner_civilization_id, aicm_user_company_id, company_name, aicm_manager_major_work_item_id, major_item_name, aicm_user_company_department_id, department_name, aicm_user_company_section_id, section_name, middle_item_name, middle_item_description, leader_robot_label, breakdown_status_code, handoff_status_code, priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb, created_at, updated_at
business|vw_aicm_pmlw_major_work_display|aicm_manager_major_work_item_id, owner_civilization_id, aicm_user_company_id, company_name, aicm_president_policy_id, policy_title, policy_status_code, aicm_user_company_department_id, department_name, aicm_user_company_section_id, section_name, major_item_name, major_item_description, source_route_code, manager_robot_label, assigned_leader_label, decomposition_status_code, handoff_status_code, priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb, created_at, updated_at
business|vw_aicm_pmlw_president_policy_display|aicm_president_policy_id, owner_civilization_id, aicm_user_company_id, company_name, source_route_code, policy_title, policy_text, president_robot_label, requested_by_text, policy_status_code, priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb, created_at, updated_at
business|vw_aicm_pmlw_worker_work_unit_display|aicm_worker_work_unit_id, owner_civilization_id, aicm_user_company_id, company_name, aicm_leader_middle_work_item_id, middle_item_name, aicm_manager_major_work_item_id, major_item_name, aicm_leader_deliverable_requirement_id, deliverable_name, deliverable_type_code, work_unit_name, work_unit_description, work_type_code, assigned_worker_label, worker_model_code, work_status_code, review_status_code, priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link, reference_files_text, supplemental_materials_text, applicable_rules_text, note, display_order, metadata_jsonb, created_at, updated_at
business|vw_aicm_pmlw_workflow_tree|owner_civilization_id, aicm_user_company_id, company_name, aicm_president_policy_id, policy_title, policy_status_code, aicm_manager_major_work_item_id, major_item_name, manager_decomposition_status_code, manager_handoff_status_code, department_name, section_name, aicm_leader_middle_work_item_id, middle_item_name, leader_breakdown_status_code, leader_handoff_status_code, aicm_leader_deliverable_requirement_id, deliverable_name, deliverable_type_code, requirement_status_code, aicm_worker_work_unit_id, work_unit_name, assigned_worker_label, work_status_code, review_status_code, last_updated_at
business|vw_aicm_user_company_worker_placement_display|owner_civilization_id, aicm_user_company_id, company_name, aicm_user_company_department_id, department_name, aicm_user_company_section_id, section_name, aicm_user_company_worker_placement_id, target_level_code, target_id, app_code, role_code, robot_pool_id, aiworker_model_code, internal_nickname, display_label, placement_quantity, placement_mode_code, status_code, created_at, updated_at
business|worker_rental_contract|rental_contract_id, owner_civilization_id, user_id, target_company_id, erp_company_id, app_code, service_code, worker_owner_schema, worker_id, worker_type, worker_snapshot_id, aiworker_model_code, role_code, rental_unit_kind, rental_unit_count, rental_total_minutes, rental_starts_at, rental_ends_at, base_price_jpy, applied_entitlement_count, free_unit_count, paid_unit_count, final_price_jpy, contract_status, price_version, locale, metadata_jsonb, created_at, updated_at
business|worker_rental_contract_line|rental_contract_line_id, rental_contract_id, owner_civilization_id, line_type, rental_unit_kind, rental_unit_count, quantity, unit_price_jpy, amount_jpy, note, created_at
business|worker_rental_end_summary|rental_end_summary_id, rental_contract_id, rental_period_id, owner_civilization_id, user_id, app_code, service_code, worker_owner_schema, worker_id, worker_type, ended_reason, used_seconds, summary_text, created_at
business|worker_rental_entitlement_balance|entitlement_balance_id, entitlement_grant_id, owner_civilization_id, user_id, app_code, service_code, grant_period, entitlement_kind, entitlement_source_rule, entitlement_unit_kind, entitlement_unit_count, entitlement_minutes_each, granted_quantity, used_quantity, remaining_quantity, remaining_total_units, remaining_total_minutes, balance_status, created_at, updated_at
business|worker_rental_entitlement_grant|entitlement_grant_id, owner_civilization_id, user_id, app_code, service_code, grant_period, entitlement_kind, entitlement_source_rule, entitlement_unit_kind, entitlement_unit_count, granted_quantity, total_granted_units, carryover_enabled, grant_status, granted_at, expires_at, created_at, updated_at
business|worker_rental_entitlement_usage|entitlement_usage_id, entitlement_grant_id, entitlement_balance_id, rental_contract_id, rental_period_id, owner_civilization_id, user_id, app_code, service_code, entitlement_kind, entitlement_source_rule, used_quantity, used_unit_kind, used_unit_count, discounted_amount_jpy, final_price_jpy, usage_status, used_at, created_at
business|worker_rental_payment_intent|rental_payment_intent_id, rental_contract_id, owner_civilization_id, user_id, amount_jpy, currency_code, payment_status, provider_code, provider_reference, created_at, updated_at
business|worker_rental_period|rental_period_id, rental_contract_id, owner_civilization_id, user_id, worker_owner_schema, worker_id, worker_type, period_status, starts_at, ends_at, actual_started_at, actual_ended_at, remaining_seconds_snapshot, created_at, updated_at
business|worker_rental_price_catalog|price_catalog_id, app_code, service_code, price_version, worker_owner_schema, worker_type_scope, worker_id_scope, rental_unit_kind, rental_unit_count, base_price_jpy, currency_code, is_active, effective_from, effective_to, created_at, updated_at
business|worker_rental_safety_event|rental_safety_event_id, rental_contract_id, rental_period_id, owner_civilization_id, user_id, app_code, service_code, worker_owner_schema, worker_id, worker_type, safety_state, safety_code, event_summary, created_at
business|worker_rental_service_catalog|service_catalog_id, app_code, service_code, service_name, service_category, worker_owner_schema, service_description, supports_minute, supports_hour, supports_day, supports_month, supports_year, minimum_contract_unit_kind, minimum_contract_unit_count, app_max_contract_unit_kind, app_max_contract_unit_count, generic_max_rental_years, monthly_free_ticket_enabled, monthly_free_ticket_quantity, monthly_free_ticket_source_rule, monthly_free_ticket_unit_kind, monthly_free_ticket_unit_count, monthly_free_ticket_carryover_enabled, is_active, created_at, updated_at
business|worker_rental_status_history|rental_status_history_id, rental_contract_id, owner_civilization_id, from_status, to_status, reason, created_at
business|worker_rental_unit_policy|rental_unit_kind, display_name, max_unit_count, max_total_minutes, max_human_label, is_active, created_at, updated_at
business|worker_rental_usage_log|rental_usage_log_id, rental_contract_id, rental_period_id, owner_civilization_id, user_id, app_code, service_code, worker_owner_schema, worker_id, worker_type, usage_unit_kind, usage_unit_count, usage_seconds, event_count, safety_event_count, created_at
cx22073jw|access_activation_review_decision_batch|activation_review_decision_batch_id, batch_code, source_export_run_code, source_export_root_path, request_count, item_count, approved_candidate_count, gate_hold_count, scope_hold_count, rank_hold_count, rejected_hold_count, batch_status, actor_name, note_text, created_at, updated_at, ended_at
cx22073jw|access_activation_review_decision_item|activation_review_decision_item_id, activation_review_decision_batch_id, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, source_decision_status, source_action_hint, review_bucket, human_review_status, governed_apply_ready, review_note, created_at
cx22073jw|access_activation_review_export_item|activation_review_export_item_id, activation_review_export_run_id, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, decision_status, gate_needed, decision_action_hint, created_at
cx22073jw|access_activation_review_export_run|activation_review_export_run_id, run_code, export_root_path, manifest_md_path, request_summary_tsv_path, decision_matrix_tsv_path, apply_plan_sql_path, gate_rejected_tsv_path, export_summary_json_path, request_count, decision_count, allowed_count, gate_count, scope_count, rank_count, rejected_count, run_status, actor_name, note_text, created_at, updated_at, ended_at
cx22073jw|access_human_review_action_log|human_review_action_log_id, activation_review_decision_batch_id, request_code, actual_view_code, logical_view_name, previous_human_review_status, new_human_review_status, reviewer_name, review_note, created_at
cx22073jw|access_runtime_ready_promotion_batch|runtime_ready_promotion_batch_id, batch_code, source_queue_batch_code, target_request_code, promoted_count, skipped_gate_count, unchanged_count, batch_status, actor_name, note_text, created_at, updated_at, ended_at
cx22073jw|access_runtime_ready_promotion_item|runtime_ready_promotion_item_id, runtime_ready_promotion_batch_id, queue_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, previous_runtime_apply_ready, new_runtime_apply_ready, gate_check_required, action_status, note_text, created_at
cx22073jw|ai_employee_activation_review_decision_batch|activation_review_decision_batch_id, batch_code, source_export_run_code, source_export_root_path, request_count, item_count, approved_candidate_count, gate_hold_count, scope_hold_count, rank_hold_count, rejected_hold_count, batch_status, actor_name, note_text, created_at, updated_at, ended_at
cx22073jw|ai_employee_activation_review_decision_item|activation_review_decision_item_id, activation_review_decision_batch_id, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, source_decision_status, source_action_hint, review_bucket, human_review_status, governed_apply_ready, review_note, created_at
cx22073jw|ai_employee_activation_review_export_item|activation_review_export_item_id, activation_review_export_run_id, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, decision_status, gate_needed, decision_action_hint, created_at
cx22073jw|ai_employee_activation_review_export_run|activation_review_export_run_id, run_code, export_root_path, manifest_md_path, request_summary_tsv_path, decision_matrix_tsv_path, apply_plan_sql_path, gate_rejected_tsv_path, export_summary_json_path, request_count, decision_count, allowed_count, gate_count, scope_count, rank_count, rejected_count, run_status, actor_name, note_text, created_at, updated_at, ended_at
cx22073jw|ai_employee_human_review_action_log|human_review_action_log_id, activation_review_decision_batch_id, request_code, actual_view_code, logical_view_name, previous_human_review_status, new_human_review_status, reviewer_name, review_note, created_at
cx22073jw|ai_employee_runtime_ready_promotion_batch|runtime_ready_promotion_batch_id, batch_code, source_queue_batch_code, target_request_code, promoted_count, skipped_gate_count, unchanged_count, batch_status, actor_name, note_text, created_at, updated_at, ended_at
cx22073jw|ai_employee_runtime_ready_promotion_item|runtime_ready_promotion_item_id, runtime_ready_promotion_batch_id, queue_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, previous_runtime_apply_ready, new_runtime_apply_ready, gate_check_required, action_status, note_text, created_at
cx22073jw|review_case_area|row_id, subject_key, source_system, source_app, canonical_owner_system, canonical_ref_key, lifecycle_status, projection_payload, policy_context_payload, meta, created_at, updated_at
cx22073jw|source_review_registry|source_registry_code, source_type, source_title, review_status, trust_score, review_note, meta, created_at, updated_at
cx22073jw|staticart_delivery_closeout_run|delivery_closeout_run_id, run_code, overall_status, release_code, release_status, export_code, export_status, export_root_path, sample_run_status, readiness_gate_status, total_target_count, released_target_count, blocked_target_count, actor_name, note_text, created_at, updated_at
cx22073jw|v_access_activation_review_decision_latest_batch_summary|batch_code, source_export_run_code, source_export_root_path, request_count, item_count, approved_candidate_count, gate_hold_count, scope_hold_count, rank_hold_count, rejected_hold_count, batch_status, note_text, created_at, ended_at
cx22073jw|v_access_activation_review_decision_latest_items|batch_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, source_decision_status, source_action_hint, review_bucket, human_review_status, governed_apply_ready, review_note, created_at
cx22073jw|v_access_activation_review_export_latest_items|run_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, decision_status, gate_needed, decision_action_hint
cx22073jw|v_access_activation_review_export_latest_summary|run_code, export_root_path, request_count, decision_count, allowed_count, gate_count, scope_count, rank_count, rejected_count, run_status, note_text, created_at, ended_at
cx22073jw|v_access_human_review_latest_action_log|batch_code, request_code, actual_view_code, logical_view_name, previous_human_review_status, new_human_review_status, reviewer_name, review_note, created_at
cx22073jw|v_access_runtime_ready_promotion_latest_batch_summary|batch_code, source_queue_batch_code, target_request_code, promoted_count, skipped_gate_count, unchanged_count, batch_status, note_text, created_at, ended_at
cx22073jw|v_access_runtime_ready_promotion_latest_items|batch_code, queue_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, previous_runtime_apply_ready, new_runtime_apply_ready, gate_check_required, action_status, note_text, created_at
cx22073jw|v_access_stub_view_runtime_catalog|domain_code, view_family_code, actual_view_code, logical_view_name, sensitivity_code, exposure_scope, gate_required, stub_view_exists
cx22073jw|v_ai_employee_activation_review_decision_latest_batch_summary|batch_code, source_export_run_code, source_export_root_path, request_count, item_count, approved_candidate_count, gate_hold_count, scope_hold_count, rank_hold_count, rejected_hold_count, batch_status, note_text, created_at, ended_at
cx22073jw|v_ai_employee_activation_review_decision_latest_items|batch_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, source_decision_status, source_action_hint, review_bucket, human_review_status, governed_apply_ready, review_note, created_at
cx22073jw|v_ai_employee_activation_review_export_latest_items|run_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, decision_status, gate_needed, decision_action_hint
cx22073jw|v_ai_employee_activation_review_export_latest_summary|run_code, export_root_path, request_count, decision_count, allowed_count, gate_count, scope_count, rank_count, rejected_count, run_status, note_text, created_at, ended_at
cx22073jw|v_ai_employee_human_review_latest_action_log|batch_code, request_code, actual_view_code, logical_view_name, previous_human_review_status, new_human_review_status, reviewer_name, review_note, created_at
cx22073jw|v_ai_employee_runtime_ready_promotion_latest_batch_summary|batch_code, source_queue_batch_code, target_request_code, promoted_count, skipped_gate_count, unchanged_count, batch_status, note_text, created_at, ended_at
cx22073jw|v_ai_employee_runtime_ready_promotion_latest_items|batch_code, queue_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, previous_runtime_apply_ready, new_runtime_apply_ready, gate_check_required, action_status, note_text, created_at
cx22073jw|v_ai_employee_stub_view_runtime_catalog|domain_code, view_family_code, actual_view_code, logical_view_name, sensitivity_code, exposure_scope, gate_required, stub_view_exists
cx22073jw|v_review_case_area_latest|row_id, subject_key, source_system, source_app, canonical_owner_system, canonical_ref_key, lifecycle_status, projection_payload, policy_context_payload, meta, created_at, updated_at
cx22073jw|v_staticart_delivery_closeout_summary|run_code, overall_status, release_code, release_status, export_code, export_status, export_root_path, sample_run_status, readiness_gate_status, total_target_count, released_target_count, blocked_target_count, note_text, created_at
cx22073jw|v_staticart_delivery_master_status|certificate_code, certificate_status, release_code, release_status, export_code, export_status, package_code, package_status, closeout_run_code, export_root_path, total_target_count, released_target_count, blocked_target_count, file_count, note_text, created_at
cx22073jw|vw_aiemp_approval_routing_context|actual_view_code, domain_code, view_family_code, logical_view_name, sensitivity_code, exposure_scope, gate_required, subject_key, summary_text, context_payload, policy_payload, audit_payload, masking_note, priority_rank, source_updated_at, purpose_text, stub_version
cx22073jw|vw_aiemp_review_package_context|actual_view_code, domain_code, view_family_code, logical_view_name, sensitivity_code, exposure_scope, gate_required, subject_key, summary_text, context_payload, policy_payload, audit_payload, masking_note, priority_rank, source_updated_at, purpose_text, stub_version
cx22073jw|vw_aiemp_senior_control_approval_request_context|actual_view_code, domain_code, view_family_code, logical_view_name, sensitivity_code, exposure_scope, gate_required, subject_key, summary_text, context_payload, policy_payload, audit_payload, masking_note, priority_rank, source_updated_at, purpose_text, stub_version

============================================================
6. known relation direct scan
============================================================
--- known relation existence ---
business.human_review|f
business.human_review_item|f
business.aicm_human_review|f
business.aicm_human_review_item|t
business.review_wait_items|f
business.aicm_review_wait_items|f
business.vw_review_wait_display|f
business.view_review_wait_display|f
business.vw_aicm_review_wait_display|f
business.vw_human_review_wait_display|f
business.view_wait_display|f
business.vw_wait_display|f
business.vw_aicm_human_review_wait_display|t
business.pmlw_worker_work_units|f
business.pmlw_worker_work_unit|f
business.worker_work_units|f
business.worker_work_unit|f
--- known relation count if exists: company only / owner+company when available ---
--- known relation target status counts if exists ---

============================================================
7. known request_id cross scan
============================================================
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
PASS: known request_id found in DB candidates

============================================================
8. known title/text cross scan
============================================================
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
PASS: known review title text found in DB candidates

============================================================
9. broad status count scan
============================================================
--- review_status_code count by relation with company_id ---
--- work_status_code count by relation with company_id ---

============================================================
10. current context raw shape
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 2 ms: Could not connect to server
GET http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP_CONTEXT=000
WARN: context API did not return 200

============================================================
11. FINAL JUDGEMENT
============================================================
REQUEST_FOUND=YES
TITLE_FOUND=YES
STATUS_HAS_REVIEW_WAITING=NO
CONTEXT_HAS_KNOWN=NO
PASS_COUNT=6
WARN_COUNT=2
FAIL_COUNT=0
FINAL_JUDGEMENT=DB_TARGET_FOUND_CONTEXT_EXPOSURE_OR_FILTER_MISMATCH
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/000_R8Z_V8B_DB_VIEW_ID_DIRECT_LOCATE_REPORT.md
SERVER_ENV_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/010_server_env_and_context_route_scan.txt
REL_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/020_relation_scan.txt
COL_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/021_column_scan.txt
KNOWN_REL_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/022_known_relation_scan.txt
REQ_HIT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/030_request_id_hit_scan.txt
TITLE_HIT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/031_title_hit_scan.txt
STATUS_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/032_status_count_scan.txt
CONTEXT_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/041_context_parse.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT_BRANCH:
- CONTEXT_CONTAINS_TARGET_BUT_KEY_SHAPE_MISMATCH_NEXT_CORE_MERGE_FIX:
  contextには対象がある。core側のmerge/renderer参照keyだけ最小修正。

- DB_TARGET_FOUND_CONTEXT_EXPOSURE_OR_FILTER_MISMATCH:
  DBには対象があるがcontextに出ていない。server context routeの露出/filterだけ最小修正。

- STATUS_ROWS_EXIST_BUT_TARGET_TEXT_NOT_FOUND_CHECK_RELATION_DETAIL:
  review_waiting系行はある。relation detailを読む専用確認へ進む。

- TARGET_NOT_FOUND_IN_CURRENT_PERSONA_DB_CHECK_DB_CONNECTION_OR_DATA_WAS_ROLLED_BACK:
  現在のPERSONA_DATABASE_URL上に既知request_id/titleが見つからない。
  DB接続先、会社ID、またはR8Z-T/V2の永続反映が別DB/別会社/rollbackだった可能性を確認。
