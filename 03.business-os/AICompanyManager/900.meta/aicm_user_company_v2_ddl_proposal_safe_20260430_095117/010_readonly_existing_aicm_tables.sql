\pset pager off
\echo '============================================================'
\echo 'AICompanyManager existing AICM / robot tables read-only inventory'
\echo '============================================================'
BEGIN READ ONLY;

\echo '------------------------------------------------------------'
\echo '1. existing AICM/company/robot related tables/views'
\echo '------------------------------------------------------------'
SELECT
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'business'
  AND (
    table_name LIKE 'aicm_%'
    OR table_name LIKE 'ai_company_manager_%'
    OR table_name LIKE '%robot%'
    OR table_name LIKE '%company%'
  )
ORDER BY table_schema, table_name;

\echo '------------------------------------------------------------'
\echo '2. proposed relation existence'
\echo '------------------------------------------------------------'
WITH proposed(relname) AS (
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
  CASE
    WHEN to_regclass(relname) IS NULL THEN 'not_exists_ok_for_add_only'
    ELSE 'already_exists_review_required'
  END AS status
FROM proposed
ORDER BY relname;

ROLLBACK;
