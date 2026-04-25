-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: operation_orchestration
-- suggested_db_role_name: aiemp_role__operation_orchestration
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_SHARED_APP_HELP
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_app_help TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_APPROVAL_ROUTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_approval_routing_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_AUDIT_DIGEST
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_audit_digest TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_FAILURE_SUMMARY
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_failure_summary TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_MASKED_RECORD_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_masked_record_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_SHARED_PUBLIC_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_public_guide TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_QUEUE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_queue_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_RETRY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_retry_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__operation_orchestration;

