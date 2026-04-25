-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: daily_task_assist
-- suggested_db_role_name: aiemp_role__daily_task_assist
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: utility_assist
-- actual_view_code: AV_UTILITY_DAILY_TASK_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_daily_task_context TO aiemp_role__daily_task_assist;

-- ------------------------------------------------------------
-- domain_code: utility_assist
-- actual_view_code: AV_UTILITY_MASKED_USER_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_masked_user_context TO aiemp_role__daily_task_assist;

-- ------------------------------------------------------------
-- domain_code: utility_assist
-- actual_view_code: AV_UTILITY_SUMMARY_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__daily_task_assist;

