-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: seminar_facilitator
-- suggested_db_role_name: aiemp_role__seminar_facilitator
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
GRANT SELECT ON cx22073jw.vw_aiemp_edu_lab_research_context TO aiemp_role__seminar_facilitator;

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_PROGRESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_progress_context TO aiemp_role__seminar_facilitator;

-- ------------------------------------------------------------
-- domain_code: education
-- actual_view_code: AV_EDU_TEACHING_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_teaching_guide TO aiemp_role__seminar_facilitator;

