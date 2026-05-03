\pset pager off
\echo '============================================================'
\echo 'AICompanyManager robot selector source exact diagnosis'
\echo '============================================================'
BEGIN READ ONLY;

\echo '------------------------------------------------------------'
\echo '1. relation existence'
\echo '------------------------------------------------------------'
WITH rels(relname) AS (
  VALUES
    ('business.company_robot_entitlement'),
    ('business.company_robot_placement'),
    ('business.company_robot_placement_event'),
    ('business.vw_company_robot_selector_options'),
    ('business.vw_company_robot_placement_display'),
    ('business.vw_company_robot_placement_status'),
    ('business.vw_aicm_company_robot_assignment_display'),
    ('business.vw_aicm_company_robot_active_assignment_display'),
    ('business.aicm_company'),
    ('business.aicm_department'),
    ('business.aicm_organization')
)
SELECT
  relname,
  CASE WHEN to_regclass(relname) IS NULL THEN 'missing' ELSE 'exists' END AS status
FROM rels
ORDER BY relname;

\echo '------------------------------------------------------------'
\echo '2. row counts'
\echo '------------------------------------------------------------'
SELECT 'business.company_robot_entitlement' AS relation_name, count(*) AS total_rows FROM business.company_robot_entitlement;
SELECT 'business.company_robot_placement' AS relation_name, count(*) AS total_rows FROM business.company_robot_placement;
SELECT 'business.vw_company_robot_selector_options' AS relation_name, count(*) AS total_rows FROM business.vw_company_robot_selector_options;
SELECT 'business.vw_company_robot_placement_display' AS relation_name, count(*) AS total_rows FROM business.vw_company_robot_placement_display;
SELECT 'business.vw_company_robot_placement_status' AS relation_name, count(*) AS total_rows FROM business.vw_company_robot_placement_status;
SELECT 'business.vw_aicm_company_robot_assignment_display' AS relation_name, count(*) AS total_rows FROM business.vw_aicm_company_robot_assignment_display;
SELECT 'business.vw_aicm_company_robot_active_assignment_display' AS relation_name, count(*) AS total_rows FROM business.vw_aicm_company_robot_active_assignment_display;

\echo '------------------------------------------------------------'
\echo '3. selector view definition'
\echo '------------------------------------------------------------'
SELECT pg_get_viewdef('business.vw_company_robot_selector_options'::regclass, true) AS selector_viewdef;

\echo '------------------------------------------------------------'
\echo '4. placement table columns'
\echo '------------------------------------------------------------'
SELECT
  ordinal_position,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'business'
  AND table_name = 'company_robot_placement'
ORDER BY ordinal_position;

\echo '------------------------------------------------------------'
\echo '5. entitlement table columns'
\echo '------------------------------------------------------------'
SELECT
  ordinal_position,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'business'
  AND table_name = 'company_robot_entitlement'
ORDER BY ordinal_position;

\echo '------------------------------------------------------------'
\echo '6. placement sample rows'
\echo '------------------------------------------------------------'
SELECT *
FROM business.company_robot_placement
ORDER BY company_id, company_robot_placement_id
LIMIT 20;

\echo '------------------------------------------------------------'
\echo '7. placement display sample rows'
\echo '------------------------------------------------------------'
SELECT *
FROM business.vw_company_robot_placement_display
LIMIT 20;

\echo '------------------------------------------------------------'
\echo '8. active assignment display sample rows'
\echo '------------------------------------------------------------'
SELECT *
FROM business.vw_aicm_company_robot_active_assignment_display
LIMIT 20;

\echo '------------------------------------------------------------'
\echo '9. company / department / organization rows'
\echo '------------------------------------------------------------'
SELECT * FROM business.aicm_company ORDER BY company_id LIMIT 20;
SELECT * FROM business.aicm_department ORDER BY company_id, department_id LIMIT 20;
SELECT * FROM business.aicm_organization ORDER BY company_id, department_id, organization_id LIMIT 20;

ROLLBACK;
