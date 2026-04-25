-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: clerical_execution
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: case_clerk
-- actual_view_code: AV_ADMIN_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_audit_context TO aiemp_role__case_clerk;

-- ------------------------------------------------------------
-- role_code: case_clerk
-- actual_view_code: AV_ADMIN_CASE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_case_context TO aiemp_role__case_clerk;

-- ------------------------------------------------------------
-- role_code: case_clerk
-- actual_view_code: AV_ADMIN_DOCUMENT_FORM_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_document_form_context TO aiemp_role__case_clerk;

-- ------------------------------------------------------------
-- role_code: case_clerk
-- actual_view_code: AV_ADMIN_PROCESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_process_context TO aiemp_role__case_clerk;

-- ------------------------------------------------------------
-- role_code: case_clerk
-- actual_view_code: AV_ADMIN_REFERENCE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_reference_context TO aiemp_role__case_clerk;

-- ------------------------------------------------------------
-- role_code: document_clerk
-- actual_view_code: AV_ADMIN_CASE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_case_context TO aiemp_role__document_clerk;

-- ------------------------------------------------------------
-- role_code: document_clerk
-- actual_view_code: AV_ADMIN_DOCUMENT_FORM_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_document_form_context TO aiemp_role__document_clerk;

-- ------------------------------------------------------------
-- role_code: document_clerk
-- actual_view_code: AV_ADMIN_PROCESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_process_context TO aiemp_role__document_clerk;

-- ------------------------------------------------------------
-- role_code: filing_clerk
-- actual_view_code: AV_ADMIN_CASE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_case_context TO aiemp_role__filing_clerk;

-- ------------------------------------------------------------
-- role_code: filing_clerk
-- actual_view_code: AV_ADMIN_DOCUMENT_FORM_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_document_form_context TO aiemp_role__filing_clerk;

-- ------------------------------------------------------------
-- role_code: filing_clerk
-- actual_view_code: AV_ADMIN_PROCESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_process_context TO aiemp_role__filing_clerk;

-- ------------------------------------------------------------
-- role_code: form_clerk
-- actual_view_code: AV_ADMIN_CASE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_case_context TO aiemp_role__form_clerk;

-- ------------------------------------------------------------
-- role_code: form_clerk
-- actual_view_code: AV_ADMIN_DOCUMENT_FORM_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_document_form_context TO aiemp_role__form_clerk;

-- ------------------------------------------------------------
-- role_code: form_clerk
-- actual_view_code: AV_ADMIN_PROCESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_process_context TO aiemp_role__form_clerk;

-- ------------------------------------------------------------
-- role_code: inquiry_clerk
-- actual_view_code: AV_ADMIN_CASE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_case_context TO aiemp_role__inquiry_clerk;

-- ------------------------------------------------------------
-- role_code: inquiry_clerk
-- actual_view_code: AV_ADMIN_PROCESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_process_context TO aiemp_role__inquiry_clerk;

-- ------------------------------------------------------------
-- role_code: inquiry_clerk
-- actual_view_code: AV_ADMIN_REFERENCE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_reference_context TO aiemp_role__inquiry_clerk;

-- ------------------------------------------------------------
-- role_code: schedule_clerk
-- actual_view_code: AV_ADMIN_CASE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_case_context TO aiemp_role__schedule_clerk;

-- ------------------------------------------------------------
-- role_code: schedule_clerk
-- actual_view_code: AV_ADMIN_PROCESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_process_context TO aiemp_role__schedule_clerk;

