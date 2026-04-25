-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: reporting_controller
-- suggested_db_role_name: aiemp_role__reporting_controller
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: clerical_control
-- actual_view_code: AV_ADMIN_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_audit_context TO aiemp_role__reporting_controller;

-- ------------------------------------------------------------
-- domain_code: clerical_control
-- actual_view_code: AV_ADMIN_CONTROL_POLICY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_policy_context TO aiemp_role__reporting_controller;

-- ------------------------------------------------------------
-- domain_code: clerical_control
-- actual_view_code: AV_ADMIN_CONTROL_REPORTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_reporting_context TO aiemp_role__reporting_controller;

-- ------------------------------------------------------------
-- domain_code: clerical_control
-- actual_view_code: AV_ADMIN_CONTROL_WORKFORCE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_workforce_context TO aiemp_role__reporting_controller;

