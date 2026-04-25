-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: filing_clerk
-- suggested_db_role_name: aiemp_role__filing_clerk
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: clerical_execution
-- actual_view_code: AV_ADMIN_CASE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_case_context TO aiemp_role__filing_clerk;

-- ------------------------------------------------------------
-- domain_code: clerical_execution
-- actual_view_code: AV_ADMIN_DOCUMENT_FORM_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_document_form_context TO aiemp_role__filing_clerk;

-- ------------------------------------------------------------
-- domain_code: clerical_execution
-- actual_view_code: AV_ADMIN_PROCESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_admin_process_context TO aiemp_role__filing_clerk;

