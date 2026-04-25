-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: clerical_control
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: escalation_controller
-- actual_view_code: AV_ADMIN_CONTROL_ASSIGNMENT_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_assignment_context TO aiemp_role__escalation_controller;

-- ------------------------------------------------------------
-- role_code: escalation_controller
-- actual_view_code: AV_ADMIN_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_audit_context TO aiemp_role__escalation_controller;

-- ------------------------------------------------------------
-- role_code: escalation_controller
-- actual_view_code: AV_ADMIN_CONTROL_POLICY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_policy_context TO aiemp_role__escalation_controller;

-- ------------------------------------------------------------
-- role_code: escalation_controller
-- actual_view_code: AV_ADMIN_CONTROL_REPORTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_reporting_context TO aiemp_role__escalation_controller;

-- ------------------------------------------------------------
-- role_code: queue_controller
-- actual_view_code: AV_ADMIN_CONTROL_ASSIGNMENT_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_assignment_context TO aiemp_role__queue_controller;

-- ------------------------------------------------------------
-- role_code: queue_controller
-- actual_view_code: AV_ADMIN_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_audit_context TO aiemp_role__queue_controller;

-- ------------------------------------------------------------
-- role_code: queue_controller
-- actual_view_code: AV_ADMIN_CONTROL_POLICY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_policy_context TO aiemp_role__queue_controller;

-- ------------------------------------------------------------
-- role_code: queue_controller
-- actual_view_code: AV_ADMIN_CONTROL_WORKFORCE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_workforce_context TO aiemp_role__queue_controller;

-- ------------------------------------------------------------
-- role_code: reporting_controller
-- actual_view_code: AV_ADMIN_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_audit_context TO aiemp_role__reporting_controller;

-- ------------------------------------------------------------
-- role_code: reporting_controller
-- actual_view_code: AV_ADMIN_CONTROL_POLICY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_policy_context TO aiemp_role__reporting_controller;

-- ------------------------------------------------------------
-- role_code: reporting_controller
-- actual_view_code: AV_ADMIN_CONTROL_REPORTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_reporting_context TO aiemp_role__reporting_controller;

-- ------------------------------------------------------------
-- role_code: reporting_controller
-- actual_view_code: AV_ADMIN_CONTROL_WORKFORCE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_workforce_context TO aiemp_role__reporting_controller;

-- ------------------------------------------------------------
-- role_code: task_allocator
-- actual_view_code: AV_ADMIN_CONTROL_ASSIGNMENT_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_assignment_context TO aiemp_role__task_allocator;

-- ------------------------------------------------------------
-- role_code: task_allocator
-- actual_view_code: AV_ADMIN_CONTROL_POLICY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_policy_context TO aiemp_role__task_allocator;

-- ------------------------------------------------------------
-- role_code: task_allocator
-- actual_view_code: AV_ADMIN_CONTROL_WORKFORCE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_workforce_context TO aiemp_role__task_allocator;

-- ------------------------------------------------------------
-- role_code: workload_controller
-- actual_view_code: AV_ADMIN_CONTROL_ASSIGNMENT_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_assignment_context TO aiemp_role__workload_controller;

-- ------------------------------------------------------------
-- role_code: workload_controller
-- actual_view_code: AV_ADMIN_CONTROL_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_audit_context TO aiemp_role__workload_controller;

-- ------------------------------------------------------------
-- role_code: workload_controller
-- actual_view_code: AV_ADMIN_CONTROL_POLICY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_policy_context TO aiemp_role__workload_controller;

-- ------------------------------------------------------------
-- role_code: workload_controller
-- actual_view_code: AV_ADMIN_CONTROL_REPORTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_reporting_context TO aiemp_role__workload_controller;

-- ------------------------------------------------------------
-- role_code: workload_controller
-- actual_view_code: AV_ADMIN_CONTROL_WORKFORCE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_control_workforce_context TO aiemp_role__workload_controller;

