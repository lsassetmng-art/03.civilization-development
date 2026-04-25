-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: explanation_instructor
-- suggested_db_role_name: aiemp_role__explanation_instructor
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
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_answer_explanation TO aiemp_role__explanation_instructor;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_SYLLABUS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_syllabus_context TO aiemp_role__explanation_instructor;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_WEAK_AREA_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_weak_area_context TO aiemp_role__explanation_instructor;

