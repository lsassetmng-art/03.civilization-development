\pset pager off
\x on
BEGIN READ ONLY;
SET LOCAL statement_timeout = '45s';

\echo '============================================================'
\echo 'function definition'
\echo '============================================================'

SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_get_function_result(p.oid) AS result_type,
  pg_get_functiondef(p.oid) AS function_def
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'aiworker'
  AND p.proname = 'fn_runtime_execution_create_request_with_route_v1';

\echo '============================================================'
\echo 'candidate runtime request columns'
\echo '============================================================'

SELECT
  c.table_schema,
  c.table_name,
  c.ordinal_position,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'aiworker'
  AND (
    c.table_name ILIKE '%runtime%'
    OR c.table_name ILIKE '%request%'
    OR c.table_name ILIKE '%execution%'
  )
ORDER BY c.table_schema, c.table_name, c.ordinal_position;

\echo '============================================================'
\echo 'recent runtime/request rows, safe preview only'
\echo '============================================================'

WITH candidate_tables AS (
  SELECT DISTINCT table_schema, table_name
  FROM information_schema.tables
  WHERE table_schema = 'aiworker'
    AND table_type = 'BASE TABLE'
    AND (
      table_name ILIKE '%runtime%'
      OR table_name ILIKE '%request%'
      OR table_name ILIKE '%execution%'
    )
  ORDER BY table_name
  LIMIT 20
)
SELECT format(
  'SELECT %L AS schema_table, count(*) AS row_count FROM %I.%I;',
  table_schema || '.' || table_name,
  table_schema,
  table_name
)
FROM candidate_tables
\gexec

COMMIT;
