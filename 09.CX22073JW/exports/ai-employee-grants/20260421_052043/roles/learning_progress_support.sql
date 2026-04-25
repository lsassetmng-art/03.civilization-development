-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: learning_progress_support
-- suggested_db_role_name: aiemp_role__learning_progress_support
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_MASKED_LEARNER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_masked_learner_context TO aiemp_role__learning_progress_support;

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_PROGRESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_progress_context TO aiemp_role__learning_progress_support;

