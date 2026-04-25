-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: study_planner
-- suggested_db_role_name: aiemp_role__study_planner
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_CATALOG
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_catalog TO aiemp_role__study_planner;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_STUDY_PLAN_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_study_plan_context TO aiemp_role__study_planner;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_SYLLABUS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_syllabus_context TO aiemp_role__study_planner;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_WEAK_AREA_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_weak_area_context TO aiemp_role__study_planner;

