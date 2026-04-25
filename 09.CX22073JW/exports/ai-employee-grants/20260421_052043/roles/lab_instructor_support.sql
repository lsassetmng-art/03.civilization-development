-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: lab_instructor_support
-- suggested_db_role_name: aiemp_role__lab_instructor_support
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
GRANT SELECT ON cx22073jw.vw_aiemp_edu_lab_research_context TO aiemp_role__lab_instructor_support;

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_LEVEL_ADAPTIVE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_level_adaptive_context TO aiemp_role__lab_instructor_support;

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_TEACHING_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_teaching_guide TO aiemp_role__lab_instructor_support;

