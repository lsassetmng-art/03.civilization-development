\pset pager off
\x on
BEGIN READ ONLY;
SET LOCAL statement_timeout = '45s';

\echo '============================================================'
\echo 'Find runtime control/profile related tables'
\echo '============================================================'

SELECT
  t.table_schema,
  t.table_name,
  t.table_type
FROM information_schema.tables t
WHERE t.table_schema = 'aiworker'
  AND (
    t.table_name ILIKE '%runtime%control%'
    OR t.table_name ILIKE '%control%profile%'
    OR t.table_name ILIKE '%runtime%profile%'
    OR t.table_name ILIKE '%execution%profile%'
    OR t.table_name ILIKE '%model%profile%'
    OR t.table_name ILIKE '%profile%'
  )
ORDER BY t.table_schema, t.table_name;

\echo '============================================================'
\echo 'Columns for profile/control candidate tables'
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
    c.table_name ILIKE '%runtime%control%'
    OR c.table_name ILIKE '%control%profile%'
    OR c.table_name ILIKE '%runtime%profile%'
    OR c.table_name ILIKE '%execution%profile%'
    OR c.table_name ILIKE '%model%profile%'
    OR c.table_name ILIKE '%profile%'
  )
ORDER BY c.table_schema, c.table_name, c.ordinal_position;

\echo '============================================================'
\echo 'Candidate profile table row counts'
\echo '============================================================'

WITH candidate_tables AS (
  SELECT DISTINCT
    table_schema,
    table_name
  FROM information_schema.tables
  WHERE table_schema = 'aiworker'
    AND table_type = 'BASE TABLE'
    AND (
      table_name ILIKE '%runtime%control%'
      OR table_name ILIKE '%control%profile%'
      OR table_name ILIKE '%runtime%profile%'
      OR table_name ILIKE '%execution%profile%'
      OR table_name ILIKE '%model%profile%'
      OR table_name ILIKE '%profile%'
    )
  ORDER BY table_name
  LIMIT 80
)
SELECT format(
  'SELECT %L AS schema_table, count(*) AS row_count FROM %I.%I;',
  table_schema || '.' || table_name,
  table_schema,
  table_name
)
FROM candidate_tables
\gexec

\echo '============================================================'
\echo 'Rows containing ai_company_manager if any'
\echo '============================================================'

WITH candidate_tables AS (
  SELECT DISTINCT
    table_schema,
    table_name
  FROM information_schema.columns
  WHERE table_schema = 'aiworker'
    AND column_name IN ('app_surface_code','model_code')
  ORDER BY table_name
  LIMIT 80
)
SELECT format(
  'SELECT %L AS schema_table, to_jsonb(t) AS row_json FROM %I.%I t WHERE COALESCE(to_jsonb(t)->>''app_surface_code'', '''') = ''ai_company_manager'' LIMIT 50;',
  table_schema || '.' || table_name,
  table_schema,
  table_name
)
FROM candidate_tables
\gexec

\echo '============================================================'
\echo 'Rows containing model-like codes around HD/BYD'
\echo '============================================================'

WITH candidate_tables AS (
  SELECT DISTINCT
    table_schema,
    table_name
  FROM information_schema.columns
  WHERE table_schema = 'aiworker'
    AND column_name = 'model_code'
  ORDER BY table_name
  LIMIT 80
)
SELECT format(
  'SELECT %L AS schema_table, to_jsonb(t) AS row_json FROM %I.%I t WHERE COALESCE(to_jsonb(t)->>''model_code'', '''') ILIKE ANY (ARRAY[''%%HD%%'',''%%hd%%'',''%%BYD%%'',''%%byd%%'']) LIMIT 80;',
  table_schema || '.' || table_name,
  table_schema,
  table_name
)
FROM candidate_tables
\gexec

\echo '============================================================'
\echo 'Function exact error source'
\echo '============================================================'

SELECT
  p.proname,
  pg_get_functiondef(p.oid) AS function_def
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'aiworker'
  AND p.proname IN (
    'fn_runtime_execution_create_request',
    'fn_runtime_execution_create_request_with_route_v1'
  )
ORDER BY p.proname;

COMMIT;
