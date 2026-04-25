-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: essay_or_oral_support
-- suggested_db_role_name: aiemp_role__essay_or_oral_support
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_ANSWER_EXPLANATION
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_answer_explanation TO aiemp_role__essay_or_oral_support;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_ESSAY_ORAL_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_essay_oral_context TO aiemp_role__essay_or_oral_support;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_SYLLABUS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_syllabus_context TO aiemp_role__essay_or_oral_support;

