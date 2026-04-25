-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: summary_assist
-- suggested_db_role_name: aiemp_role__summary_assist
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: utility_assist
-- actual_view_code: AV_UTILITY_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__summary_assist;

-- ------------------------------------------------------------
-- domain_code: utility_assist
-- actual_view_code: AV_UTILITY_WRITING_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_writing_context TO aiemp_role__summary_assist;

