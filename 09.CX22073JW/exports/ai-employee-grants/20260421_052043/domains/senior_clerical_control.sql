-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: senior_clerical_control
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: approval_request_compiler
-- actual_view_code: AV_SENIOR_CONTROL_AGGREGATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_aggregation_context TO aiemp_role__approval_request_compiler;

-- ------------------------------------------------------------
-- role_code: approval_request_compiler
-- actual_view_code: AV_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_approval_request_context TO aiemp_role__approval_request_compiler;

-- ------------------------------------------------------------
-- role_code: approval_request_compiler
-- actual_view_code: AV_SENIOR_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_audit_context TO aiemp_role__approval_request_compiler;

-- ------------------------------------------------------------
-- role_code: approval_request_compiler
-- actual_view_code: AV_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_policy_draft_context TO aiemp_role__approval_request_compiler;

-- ------------------------------------------------------------
-- role_code: cross_controller_aggregator
-- actual_view_code: AV_SENIOR_CONTROL_AGGREGATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_aggregation_context TO aiemp_role__cross_controller_aggregator;

-- ------------------------------------------------------------
-- role_code: cross_controller_aggregator
-- actual_view_code: AV_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_approval_request_context TO aiemp_role__cross_controller_aggregator;

-- ------------------------------------------------------------
-- role_code: cross_controller_aggregator
-- actual_view_code: AV_SENIOR_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_audit_context TO aiemp_role__cross_controller_aggregator;

-- ------------------------------------------------------------
-- role_code: cross_controller_aggregator
-- actual_view_code: AV_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_policy_draft_context TO aiemp_role__cross_controller_aggregator;

-- ------------------------------------------------------------
-- role_code: master_controller
-- actual_view_code: AV_SENIOR_CONTROL_AGGREGATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_aggregation_context TO aiemp_role__master_controller;

-- ------------------------------------------------------------
-- role_code: master_controller
-- actual_view_code: AV_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_approval_request_context TO aiemp_role__master_controller;

-- ------------------------------------------------------------
-- role_code: master_controller
-- actual_view_code: AV_SENIOR_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_audit_context TO aiemp_role__master_controller;

-- ------------------------------------------------------------
-- role_code: master_controller
-- actual_view_code: AV_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_policy_draft_context TO aiemp_role__master_controller;

-- ------------------------------------------------------------
-- role_code: strategic_assignment_planner
-- actual_view_code: AV_SENIOR_CONTROL_AGGREGATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_aggregation_context TO aiemp_role__strategic_assignment_planner;

-- ------------------------------------------------------------
-- role_code: strategic_assignment_planner
-- actual_view_code: AV_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_approval_request_context TO aiemp_role__strategic_assignment_planner;

-- ------------------------------------------------------------
-- role_code: strategic_assignment_planner
-- actual_view_code: AV_SENIOR_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_audit_context TO aiemp_role__strategic_assignment_planner;

-- ------------------------------------------------------------
-- role_code: strategic_assignment_planner
-- actual_view_code: AV_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_policy_draft_context TO aiemp_role__strategic_assignment_planner;

-- ------------------------------------------------------------
-- role_code: top_level_reporting_controller
-- actual_view_code: AV_SENIOR_CONTROL_AGGREGATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_aggregation_context TO aiemp_role__top_level_reporting_controller;

-- ------------------------------------------------------------
-- role_code: top_level_reporting_controller
-- actual_view_code: AV_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_approval_request_context TO aiemp_role__top_level_reporting_controller;

-- ------------------------------------------------------------
-- role_code: top_level_reporting_controller
-- actual_view_code: AV_SENIOR_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_audit_context TO aiemp_role__top_level_reporting_controller;

-- ------------------------------------------------------------
-- role_code: top_level_reporting_controller
-- actual_view_code: AV_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_senior_control_policy_draft_context TO aiemp_role__top_level_reporting_controller;

