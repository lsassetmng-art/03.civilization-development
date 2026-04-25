-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: task_worker
-- suggested_db_role_name: aiemp_role__task_worker
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: workforce_execution
-- actual_view_code: AV_WORKFORCE_APP_OPERATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_app_operation_context TO aiemp_role__task_worker;

-- ------------------------------------------------------------
-- domain_code: workforce_execution
-- actual_view_code: AV_WORKFORCE_MASKED_WORK_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_masked_work_context TO aiemp_role__task_worker;

-- ------------------------------------------------------------
-- domain_code: workforce_execution
-- actual_view_code: AV_WORKFORCE_WORK_ORDER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_workforce_work_order_context TO aiemp_role__task_worker;

