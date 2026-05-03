\pset pager off
\echo '============================================================'
\echo 'Verify business.vw_ai_company_manager_system_robot_selector_options'
\echo '============================================================'

BEGIN READ ONLY;

\echo '------------------------------------------------------------'
\echo '1. view existence'
\echo '------------------------------------------------------------'
SELECT
  to_regclass('business.vw_ai_company_manager_system_robot_selector_options') AS view_regclass;

\echo '------------------------------------------------------------'
\echo '2. total rows'
\echo '------------------------------------------------------------'
SELECT
  count(*) AS total_rows
FROM business.vw_ai_company_manager_system_robot_selector_options;

\echo '------------------------------------------------------------'
\echo '3. company rows'
\echo '------------------------------------------------------------'
SELECT
  company_id,
  count(*) AS candidate_count
FROM business.vw_ai_company_manager_system_robot_selector_options
GROUP BY company_id
ORDER BY company_id;

\echo '------------------------------------------------------------'
\echo '4. role distribution'
\echo '------------------------------------------------------------'
SELECT
  role_code,
  count(*) AS candidate_count
FROM business.vw_ai_company_manager_system_robot_selector_options v
CROSS JOIN LATERAL unnest(v.recommended_role_codes) AS role_code
GROUP BY role_code
ORDER BY role_code;

\echo '------------------------------------------------------------'
\echo '5. sample rows'
\echo '------------------------------------------------------------'
SELECT
  company_id,
  robot_pool_id,
  aiworker_model_code,
  display_name,
  selector_label,
  aiworker_series_code,
  manufacturer_code,
  app_code,
  entitlement_scope_code,
  assignment_mode_code,
  status_code,
  recommended_role_codes
FROM business.vw_ai_company_manager_system_robot_selector_options
ORDER BY aiworker_model_code
LIMIT 30;

\echo '------------------------------------------------------------'
\echo '6. old entitlement selector remains unchanged'
\echo '------------------------------------------------------------'
SELECT
  count(*) AS old_entitlement_selector_rows
FROM business.vw_company_robot_selector_options;

ROLLBACK;
