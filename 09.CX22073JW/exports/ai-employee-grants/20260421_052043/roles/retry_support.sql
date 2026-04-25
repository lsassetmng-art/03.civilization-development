-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: retry_support
-- suggested_db_role_name: aiemp_role__retry_support
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_APPROVAL_ROUTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_approval_routing_context TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_AUDIT_DIGEST
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_audit_digest TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_MASKED_RECORD_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_masked_record_context TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_QUEUE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_queue_context TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_RETRY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_retry_context TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- domain_code: operations
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__retry_support;

