-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: workforce_execution
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: app_worker
-- actual_view_code: AV_WORKFORCE_APP_OPERATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_app_operation_context TO aiemp_role__app_worker;

-- ------------------------------------------------------------
-- role_code: app_worker
-- actual_view_code: AV_WORKFORCE_MASKED_WORK_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_masked_work_context TO aiemp_role__app_worker;

-- ------------------------------------------------------------
-- role_code: app_worker
-- actual_view_code: AV_WORKFORCE_WORK_ORDER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_work_order_context TO aiemp_role__app_worker;

-- ------------------------------------------------------------
-- role_code: document_worker
-- actual_view_code: AV_WORKFORCE_APP_OPERATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_app_operation_context TO aiemp_role__document_worker;

-- ------------------------------------------------------------
-- role_code: document_worker
-- actual_view_code: AV_WORKFORCE_MASKED_WORK_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_masked_work_context TO aiemp_role__document_worker;

-- ------------------------------------------------------------
-- role_code: document_worker
-- actual_view_code: AV_WORKFORCE_WORK_ORDER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_work_order_context TO aiemp_role__document_worker;

-- ------------------------------------------------------------
-- role_code: external_app_worker
-- actual_view_code: AV_WORKFORCE_APP_OPERATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_app_operation_context TO aiemp_role__external_app_worker;

-- ------------------------------------------------------------
-- role_code: external_app_worker
-- actual_view_code: AV_WORKFORCE_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_audit_context TO aiemp_role__external_app_worker;

-- ------------------------------------------------------------
-- role_code: external_app_worker
-- actual_view_code: AV_WORKFORCE_MASKED_WORK_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_masked_work_context TO aiemp_role__external_app_worker;

-- ------------------------------------------------------------
-- role_code: external_app_worker
-- actual_view_code: AV_WORKFORCE_WORK_ORDER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_work_order_context TO aiemp_role__external_app_worker;

-- ------------------------------------------------------------
-- role_code: research_worker
-- actual_view_code: AV_WORKFORCE_RESEARCH_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_research_summary_context TO aiemp_role__research_worker;

-- ------------------------------------------------------------
-- role_code: research_worker
-- actual_view_code: AV_WORKFORCE_WORK_ORDER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_work_order_context TO aiemp_role__research_worker;

-- ------------------------------------------------------------
-- role_code: summary_worker
-- actual_view_code: AV_WORKFORCE_RESEARCH_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_research_summary_context TO aiemp_role__summary_worker;

-- ------------------------------------------------------------
-- role_code: summary_worker
-- actual_view_code: AV_WORKFORCE_WORK_ORDER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_work_order_context TO aiemp_role__summary_worker;

-- ------------------------------------------------------------
-- role_code: task_worker
-- actual_view_code: AV_WORKFORCE_APP_OPERATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_app_operation_context TO aiemp_role__task_worker;

-- ------------------------------------------------------------
-- role_code: task_worker
-- actual_view_code: AV_WORKFORCE_MASKED_WORK_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_masked_work_context TO aiemp_role__task_worker;

-- ------------------------------------------------------------
-- role_code: task_worker
-- actual_view_code: AV_WORKFORCE_WORK_ORDER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_work_order_context TO aiemp_role__task_worker;

