-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: utility_assist
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: calculation_assist
-- actual_view_code: AV_UTILITY_CALCULATION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_calculation_context TO aiemp_role__calculation_assist;

-- ------------------------------------------------------------
-- role_code: calculation_assist
-- actual_view_code: AV_UTILITY_SUMMARY_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__calculation_assist;

-- ------------------------------------------------------------
-- role_code: daily_task_assist
-- actual_view_code: AV_UTILITY_DAILY_TASK_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_daily_task_context TO aiemp_role__daily_task_assist;

-- ------------------------------------------------------------
-- role_code: daily_task_assist
-- actual_view_code: AV_UTILITY_MASKED_USER_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_masked_user_context TO aiemp_role__daily_task_assist;

-- ------------------------------------------------------------
-- role_code: daily_task_assist
-- actual_view_code: AV_UTILITY_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__daily_task_assist;

-- ------------------------------------------------------------
-- role_code: document_writer
-- actual_view_code: AV_UTILITY_MASKED_USER_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_masked_user_context TO aiemp_role__document_writer;

-- ------------------------------------------------------------
-- role_code: document_writer
-- actual_view_code: AV_UTILITY_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__document_writer;

-- ------------------------------------------------------------
-- role_code: document_writer
-- actual_view_code: AV_UTILITY_WRITING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_writing_context TO aiemp_role__document_writer;

-- ------------------------------------------------------------
-- role_code: meal_planner
-- actual_view_code: AV_UTILITY_MASKED_USER_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_masked_user_context TO aiemp_role__meal_planner;

-- ------------------------------------------------------------
-- role_code: meal_planner
-- actual_view_code: AV_UTILITY_MEAL_PLANNING_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_meal_planning_context TO aiemp_role__meal_planner;

-- ------------------------------------------------------------
-- role_code: research_assist
-- actual_view_code: AV_UTILITY_RESEARCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_research_context TO aiemp_role__research_assist;

-- ------------------------------------------------------------
-- role_code: research_assist
-- actual_view_code: AV_UTILITY_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__research_assist;

-- ------------------------------------------------------------
-- role_code: research_assist
-- actual_view_code: AV_UTILITY_WRITING_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_writing_context TO aiemp_role__research_assist;

-- ------------------------------------------------------------
-- role_code: summary_assist
-- actual_view_code: AV_UTILITY_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__summary_assist;

-- ------------------------------------------------------------
-- role_code: summary_assist
-- actual_view_code: AV_UTILITY_WRITING_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_writing_context TO aiemp_role__summary_assist;

