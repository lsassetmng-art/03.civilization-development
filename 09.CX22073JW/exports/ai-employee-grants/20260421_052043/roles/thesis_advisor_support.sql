-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: thesis_advisor_support
-- suggested_db_role_name: aiemp_role__thesis_advisor_support
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_LAB_RESEARCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_lab_research_context TO aiemp_role__thesis_advisor_support;

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_MASKED_LEARNER_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_masked_learner_context TO aiemp_role__thesis_advisor_support;

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_PRIVILEGED_CONTEXT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_edu_privileged_context TO aiemp_role__thesis_advisor_support;

