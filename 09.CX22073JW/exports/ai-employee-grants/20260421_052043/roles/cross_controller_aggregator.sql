-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: cross_controller_aggregator
-- suggested_db_role_name: aiemp_role__cross_controller_aggregator
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: senior_clerical_control
-- actual_view_code: AV_SENIOR_CONTROL_AGGREGATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_aggregation_context TO aiemp_role__cross_controller_aggregator;

-- ------------------------------------------------------------
-- domain_code: senior_clerical_control
-- actual_view_code: AV_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_approval_request_context TO aiemp_role__cross_controller_aggregator;

-- ------------------------------------------------------------
-- domain_code: senior_clerical_control
-- actual_view_code: AV_SENIOR_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_audit_context TO aiemp_role__cross_controller_aggregator;

-- ------------------------------------------------------------
-- domain_code: senior_clerical_control
-- actual_view_code: AV_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_policy_draft_context TO aiemp_role__cross_controller_aggregator;

