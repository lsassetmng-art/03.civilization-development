-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: document_writer
-- suggested_db_role_name: aiemp_role__document_writer
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: utility_assist
-- actual_view_code: AV_UTILITY_MASKED_USER_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_masked_user_context TO aiemp_role__document_writer;

-- ------------------------------------------------------------
-- domain_code: utility_assist
-- actual_view_code: AV_UTILITY_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__document_writer;

-- ------------------------------------------------------------
-- domain_code: utility_assist
-- actual_view_code: AV_UTILITY_WRITING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_writing_context TO aiemp_role__document_writer;

