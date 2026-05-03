\pset pager off
\echo '============================================================'
\echo 'Verify AICM user-company v2 objects after apply'
\echo '============================================================'
BEGIN READ ONLY;

\echo '------------------------------------------------------------'
\echo '1. relation existence'
\echo '------------------------------------------------------------'
WITH expected(relname) AS (
  VALUES
    ('business.aicm_user_company'),
    ('business.aicm_user_company_department'),
    ('business.aicm_user_company_section'),
    ('business.aicm_user_company_worker_placement'),
    ('business.aicm_user_company_worker_placement_event'),
    ('business.vw_aicm_user_company_tree'),
    ('business.vw_aicm_user_company_worker_placement_display')
)
SELECT
  relname,
  to_regclass(relname) AS regclass,
  CASE WHEN to_regclass(relname) IS NULL THEN 'missing' ELSE 'exists' END AS status
FROM expected
ORDER BY relname;

\echo '------------------------------------------------------------'
\echo '2. row counts'
\echo '------------------------------------------------------------'
SELECT 'business.aicm_user_company' AS relname, count(*) AS rows FROM business.aicm_user_company
UNION ALL
SELECT 'business.aicm_user_company_department', count(*) FROM business.aicm_user_company_department
UNION ALL
SELECT 'business.aicm_user_company_section', count(*) FROM business.aicm_user_company_section
UNION ALL
SELECT 'business.aicm_user_company_worker_placement', count(*) FROM business.aicm_user_company_worker_placement
UNION ALL
SELECT 'business.aicm_user_company_worker_placement_event', count(*) FROM business.aicm_user_company_worker_placement_event
ORDER BY relname;

\echo '------------------------------------------------------------'
\echo '3. key columns'
\echo '------------------------------------------------------------'
SELECT
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'business'
  AND table_name IN (
    'aicm_user_company',
    'aicm_user_company_department',
    'aicm_user_company_section',
    'aicm_user_company_worker_placement',
    'aicm_user_company_worker_placement_event'
  )
ORDER BY table_name, ordinal_position;

\echo '------------------------------------------------------------'
\echo '4. view smoke select'
\echo '------------------------------------------------------------'
SELECT count(*) AS tree_rows FROM business.vw_aicm_user_company_tree;
SELECT count(*) AS placement_display_rows FROM business.vw_aicm_user_company_worker_placement_display;

ROLLBACK;
