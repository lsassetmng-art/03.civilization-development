\set ON_ERROR_STOP on
SET default_transaction_read_only = on;

SELECT
  '01_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only,
  current_database() AS database_name,
  current_user AS db_user;

SELECT
  '02_function_kind' AS section,
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  CASE p.provolatile
    WHEN 'i' THEN 'immutable'
    WHEN 's' THEN 'stable'
    WHEN 'v' THEN 'volatile'
    ELSE p.provolatile::text
  END AS volatility,
  p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'aiworker'
  AND p.proname IN (
    'fn_runtime_execution_create_request',
    'fn_runtime_execution_create_request_with_route_v1',
    'fn_runtime_execution_start_request',
    'fn_runtime_execution_submit_worker_output'
  )
ORDER BY p.proname;

SELECT
  '03_function_definition_readonly_relevant_lines' AS section,
  n.nspname AS schema_name,
  p.proname AS function_name,
  regexp_replace(
    pg_get_functiondef(p.oid),
    E'\\n',
    E'\n',
    'g'
  ) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'aiworker'
  AND p.proname IN (
    'fn_runtime_execution_create_request',
    'fn_runtime_execution_create_request_with_route_v1'
  )
ORDER BY p.proname;

SELECT
  '04_runtime_request_table_exists' AS section,
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_schema = 'aiworker'
  AND table_name = 'runtime_execution_request';

SELECT
  '05_runtime_request_recent_readonly_sample' AS section,
  request_code,
  app_surface_code,
  model_code,
  task_domain_code,
  request_status_code,
  created_at
FROM aiworker.runtime_execution_request
ORDER BY created_at DESC
LIMIT 10;
