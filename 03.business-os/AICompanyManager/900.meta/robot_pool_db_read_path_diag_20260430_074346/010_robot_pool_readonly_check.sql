\pset pager off
\echo '============================================================'
\echo 'AICompanyManager robot pool read-only DB check'
\echo '============================================================'
BEGIN READ ONLY;

\echo '------------------------------------------------------------'
\echo '1. candidate robot/company selector relations'
\echo '------------------------------------------------------------'
WITH rels(relname) AS (
  VALUES
    ('business.vw_company_robot_selector_options'),
    ('business.vw_company_robot_placement_status'),
    ('business.vw_company_robot_placement_display'),
    ('business.vw_aicm_company_robot_assignment_display'),
    ('business.vw_aicm_company_robot_active_assignment_display'),
    ('business.company_robot_entitlement'),
    ('business.company_robot_placement'),
    ('business.company_robot_placement_event'),
    ('business.aicm_company'),
    ('business.aicm_department'),
    ('business.aicm_organization'),
    ('aiworker.robot_pool'),
    ('aiworker.robot_catalog'),
    ('aiworker.aiworker_robot'),
    ('aiworker.worker_model'),
    ('aiworker.robot_model')
)
SELECT
  relname,
  CASE WHEN to_regclass(relname) IS NULL THEN 'missing' ELSE 'exists' END AS status
FROM rels
ORDER BY relname;

\echo '------------------------------------------------------------'
\echo '2. row counts for existing candidate relations'
\echo '------------------------------------------------------------'
WITH rels(relname) AS (
  VALUES
    ('business.vw_company_robot_selector_options'),
    ('business.vw_company_robot_placement_status'),
    ('business.vw_company_robot_placement_display'),
    ('business.vw_aicm_company_robot_assignment_display'),
    ('business.vw_aicm_company_robot_active_assignment_display'),
    ('business.company_robot_entitlement'),
    ('business.company_robot_placement'),
    ('business.company_robot_placement_event'),
    ('business.aicm_company'),
    ('business.aicm_department'),
    ('business.aicm_organization'),
    ('aiworker.robot_pool'),
    ('aiworker.robot_catalog'),
    ('aiworker.aiworker_robot'),
    ('aiworker.worker_model'),
    ('aiworker.robot_model')
)
SELECT
  'SELECT ' || quote_literal(relname) || ' AS relation_name, count(*) AS total_rows FROM ' || relname || ';'
FROM rels
WHERE to_regclass(relname) IS NOT NULL
ORDER BY relname
\gexec

\echo '------------------------------------------------------------'
\echo '3. sample selector rows if view exists'
\echo '------------------------------------------------------------'
SELECT
  'SELECT * FROM business.vw_company_robot_selector_options LIMIT 20;'
WHERE to_regclass('business.vw_company_robot_selector_options') IS NOT NULL
\gexec

\echo '------------------------------------------------------------'
\echo '4. sample entitlement rows if table exists'
\echo '------------------------------------------------------------'
SELECT
  'SELECT * FROM business.company_robot_entitlement LIMIT 20;'
WHERE to_regclass('business.company_robot_entitlement') IS NOT NULL
\gexec

ROLLBACK;
