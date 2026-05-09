\set ON_ERROR_STOP on
SET default_transaction_read_only = on;

SELECT
  '00_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_database() AS database_name,
  current_user AS db_user;

SELECT
  '01_target_error' AS section,
  'cx22073jw_direct_smoke' AS missing_app_surface_code,
  'BYD2-003' AS missing_model_code,
  'Runtime control profile not found' AS error_reason;

SELECT
  '02_functions' AS section,
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname ILIKE '%runtime_execution%'
   OR p.proname ILIKE '%control_profile%'
   OR p.proname ILIKE '%runtime_control%'
ORDER BY n.nspname, p.proname;

SELECT
  '03_tables_with_profile_surface_model_columns' AS section,
  c.table_schema,
  c.table_name,
  string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) AS matching_columns
FROM information_schema.columns c
WHERE c.table_schema IN ('aiworker', 'cx22073jw', 'business', 'public')
  AND (
       c.column_name ILIKE '%app_surface%'
    OR c.column_name ILIKE '%surface_code%'
    OR c.column_name ILIKE '%model_code%'
    OR c.column_name ILIKE '%control_profile%'
    OR c.column_name ILIKE '%runtime_profile%'
    OR c.column_name ILIKE '%task_domain%'
  )
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_schema, c.table_name;

SELECT
  '04_candidate_tables_exact_app_surface_and_model' AS section,
  c.table_schema,
  c.table_name
FROM information_schema.columns c
WHERE c.table_schema IN ('aiworker', 'cx22073jw', 'business', 'public')
  AND c.column_name IN ('app_surface_code', 'model_code')
GROUP BY c.table_schema, c.table_name
HAVING count(DISTINCT c.column_name) = 2
ORDER BY c.table_schema, c.table_name;

\echo '============================================================'
\echo '05_DYNAMIC_SAMPLES_FROM_TABLES_WITH_APP_SURFACE_AND_MODEL'
\echo '============================================================'

SELECT format(
  $fmt$
SELECT
  %L AS section,
  %L AS table_name,
  app_surface_code,
  model_code,
  count(*) AS row_count
FROM %I.%I
GROUP BY app_surface_code, model_code
ORDER BY app_surface_code, model_code
LIMIT 80;
$fmt$,
  '05_profile_pair_sample',
  c.table_schema || '.' || c.table_name,
  c.table_schema,
  c.table_name
)
FROM information_schema.columns c
WHERE c.table_schema IN ('aiworker', 'cx22073jw', 'business', 'public')
  AND c.column_name IN ('app_surface_code', 'model_code')
GROUP BY c.table_schema, c.table_name
HAVING count(DISTINCT c.column_name) = 2
ORDER BY c.table_schema, c.table_name
\gexec

\echo '============================================================'
\echo '06_DYNAMIC_BYD2_003_CANDIDATE_PROFILE_ROWS'
\echo '============================================================'

SELECT format(
  $fmt$
SELECT
  %L AS section,
  %L AS table_name,
  to_jsonb(t) AS row_json
FROM %I.%I t
WHERE model_code = 'BYD2-003'
LIMIT 30;
$fmt$,
  '06_byd2003_candidate_rows',
  c.table_schema || '.' || c.table_name,
  c.table_schema,
  c.table_name
)
FROM information_schema.columns c
WHERE c.table_schema IN ('aiworker', 'cx22073jw', 'business', 'public')
  AND c.column_name IN ('app_surface_code', 'model_code')
GROUP BY c.table_schema, c.table_name
HAVING count(DISTINCT c.column_name) = 2
ORDER BY c.table_schema, c.table_name
\gexec

\echo '============================================================'
\echo '07_DYNAMIC_CX22073JW_SURFACE_CANDIDATE_ROWS'
\echo '============================================================'

SELECT format(
  $fmt$
SELECT
  %L AS section,
  %L AS table_name,
  to_jsonb(t) AS row_json
FROM %I.%I t
WHERE app_surface_code ILIKE '%%cx%%'
   OR app_surface_code ILIKE '%%aiworker%%'
   OR app_surface_code ILIKE '%%aicm%%'
   OR app_surface_code ILIKE '%%direct%%'
LIMIT 30;
$fmt$,
  '07_surface_candidate_rows',
  c.table_schema || '.' || c.table_name,
  c.table_schema,
  c.table_name
)
FROM information_schema.columns c
WHERE c.table_schema IN ('aiworker', 'cx22073jw', 'business', 'public')
  AND c.column_name IN ('app_surface_code', 'model_code')
GROUP BY c.table_schema, c.table_name
HAVING count(DISTINCT c.column_name) = 2
ORDER BY c.table_schema, c.table_name
\gexec

\echo '============================================================'
\echo '08_FUNCTION_DEFINITION_CREATE_REQUEST'
\echo '============================================================'

SELECT
  '08_function_definition' AS section,
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname IN (
  'fn_runtime_execution_create_request',
  'fn_runtime_execution_create_request_with_route_v1'
)
ORDER BY n.nspname, p.proname;

\echo '============================================================'
\echo '09_SUMMARY_HINT'
\echo '============================================================'

SELECT
  '09_summary_hint' AS section,
  'Use one existing app_surface_code + model_code pair for R13 instead of creating new profile without review.' AS note;
