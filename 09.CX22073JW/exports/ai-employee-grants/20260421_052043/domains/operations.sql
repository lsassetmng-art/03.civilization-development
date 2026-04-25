-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: operations
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: audit_support
-- actual_view_code: AV_OPS_AUDIT_DIGEST
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_audit_digest TO aiemp_role__audit_support;

-- ------------------------------------------------------------
-- role_code: audit_support
-- actual_view_code: AV_OPS_PRIVILEGED_INCIDENT_CONTEXT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_privileged_incident_context TO aiemp_role__audit_support;

-- ------------------------------------------------------------
-- role_code: audit_support
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__audit_support;

-- ------------------------------------------------------------
-- role_code: consult_support
-- actual_view_code: AV_SHARED_APP_HELP
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_app_help TO aiemp_role__consult_support;

-- ------------------------------------------------------------
-- role_code: consult_support
-- actual_view_code: AV_OPS_MASKED_RECORD_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_masked_record_context TO aiemp_role__consult_support;

-- ------------------------------------------------------------
-- role_code: consult_support
-- actual_view_code: AV_SHARED_PUBLIC_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_public_guide TO aiemp_role__consult_support;

-- ------------------------------------------------------------
-- role_code: consult_support
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__consult_support;

-- ------------------------------------------------------------
-- role_code: draft_assist
-- actual_view_code: AV_SHARED_APP_HELP
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_app_help TO aiemp_role__draft_assist;

-- ------------------------------------------------------------
-- role_code: draft_assist
-- actual_view_code: AV_OPS_MASKED_RECORD_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_masked_record_context TO aiemp_role__draft_assist;

-- ------------------------------------------------------------
-- role_code: draft_assist
-- actual_view_code: AV_SHARED_PUBLIC_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_public_guide TO aiemp_role__draft_assist;

-- ------------------------------------------------------------
-- role_code: draft_assist
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__draft_assist;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_SHARED_APP_HELP
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_app_help TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_OPS_APPROVAL_ROUTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_approval_routing_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_OPS_AUDIT_DIGEST
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_audit_digest TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_OPS_FAILURE_SUMMARY
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_failure_summary TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_OPS_MASKED_RECORD_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_masked_record_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_SHARED_PUBLIC_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_public_guide TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_OPS_QUEUE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_queue_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_OPS_RETRY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_retry_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operation_orchestration
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__operation_orchestration;

-- ------------------------------------------------------------
-- role_code: operator_help
-- actual_view_code: AV_SHARED_APP_HELP
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_app_help TO aiemp_role__operator_help;

-- ------------------------------------------------------------
-- role_code: operator_help
-- actual_view_code: AV_OPS_MASKED_ERROR_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_masked_error_context TO aiemp_role__operator_help;

-- ------------------------------------------------------------
-- role_code: operator_help
-- actual_view_code: AV_OPS_MASKED_RECORD_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_masked_record_context TO aiemp_role__operator_help;

-- ------------------------------------------------------------
-- role_code: operator_help
-- actual_view_code: AV_SHARED_PUBLIC_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_public_guide TO aiemp_role__operator_help;

-- ------------------------------------------------------------
-- role_code: privileged_assist
-- actual_view_code: AV_OPS_APPROVAL_ROUTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_approval_routing_context TO aiemp_role__privileged_assist;

-- ------------------------------------------------------------
-- role_code: privileged_assist
-- actual_view_code: AV_OPS_AUDIT_DIGEST
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_audit_digest TO aiemp_role__privileged_assist;

-- ------------------------------------------------------------
-- role_code: privileged_assist
-- actual_view_code: AV_OPS_PRIVILEGED_INCIDENT_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_privileged_incident_context TO aiemp_role__privileged_assist;

-- ------------------------------------------------------------
-- role_code: privileged_assist
-- actual_view_code: AV_OPS_QUEUE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_queue_context TO aiemp_role__privileged_assist;

-- ------------------------------------------------------------
-- role_code: privileged_assist
-- actual_view_code: AV_OPS_RETRY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_retry_context TO aiemp_role__privileged_assist;

-- ------------------------------------------------------------
-- role_code: privileged_assist
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__privileged_assist;

-- ------------------------------------------------------------
-- role_code: queue_support
-- actual_view_code: AV_OPS_APPROVAL_ROUTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_approval_routing_context TO aiemp_role__queue_support;

-- ------------------------------------------------------------
-- role_code: queue_support
-- actual_view_code: AV_OPS_AUDIT_DIGEST
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_audit_digest TO aiemp_role__queue_support;

-- ------------------------------------------------------------
-- role_code: queue_support
-- actual_view_code: AV_OPS_QUEUE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_queue_context TO aiemp_role__queue_support;

-- ------------------------------------------------------------
-- role_code: queue_support
-- actual_view_code: AV_OPS_RETRY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_retry_context TO aiemp_role__queue_support;

-- ------------------------------------------------------------
-- role_code: queue_support
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__queue_support;

-- ------------------------------------------------------------
-- role_code: retry_support
-- actual_view_code: AV_OPS_APPROVAL_ROUTING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_approval_routing_context TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- role_code: retry_support
-- actual_view_code: AV_OPS_AUDIT_DIGEST
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_audit_digest TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- role_code: retry_support
-- actual_view_code: AV_OPS_MASKED_RECORD_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_masked_record_context TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- role_code: retry_support
-- actual_view_code: AV_OPS_QUEUE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_queue_context TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- role_code: retry_support
-- actual_view_code: AV_OPS_RETRY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_retry_context TO aiemp_role__retry_support;

-- ------------------------------------------------------------
-- role_code: retry_support
-- actual_view_code: AV_OPS_REVIEW_PACKAGE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_review_package_context TO aiemp_role__retry_support;

