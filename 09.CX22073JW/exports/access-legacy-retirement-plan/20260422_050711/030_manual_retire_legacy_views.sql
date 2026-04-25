-- ============================================================
-- ACCESS LEGACY MANUAL RETIRE SQL
-- ============================================================
-- run_code: access_legacy_retirement_plan_20260422_050711
-- source_gate_run_code: access_legacy_cutover_gate_20260422_050123
-- readiness_status_snapshot: ready
-- generated_at: 20260422_050711
-- manual review required
-- ============================================================

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_request_compiled_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_request_intersection_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_request_latest_decisions;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_request_latest_intersection_decisions;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_request_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_review_decision_latest_batch_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_review_decision_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_review_export_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_activation_review_export_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_actual_view_family_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_actual_view_registry_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_app_scope_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_db_role_provision_latest_batch_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_db_role_provision_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_db_role_registry_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_domain_bootstrap_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_final_handoff_export_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_final_handoff_export_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_gate_controlled_actual_views;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_governed_apply_attempt_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_governed_apply_batch_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_governed_apply_batch_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_governed_apply_execution_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_governed_apply_execution_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_governed_apply_queue_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_governed_apply_queue_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_grant_export_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_grant_export_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_human_review_latest_action_log;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_manual_apply_receipt_latest_batch_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_manual_apply_receipt_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_post_apply_verification_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_post_apply_verification_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_privileged_family_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_rank_registry_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_role_access_bundle_item_matrix;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_role_access_bundle_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_role_actual_view_grant_matrix;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_role_policy_matrix;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_runtime_ready_promotion_latest_batch_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_runtime_ready_promotion_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_stub_smoke_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_stub_smoke_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_stub_view_generation_latest_items;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_stub_view_generation_latest_summary;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_stub_view_missing;

DROP VIEW IF EXISTS cx22073jw.v_ai_employee_stub_view_runtime_catalog;

