\pset pager off
\x off
BEGIN READ ONLY;
SET LOCAL statement_timeout = '30s';

WITH candidate_tables AS (
  SELECT DISTINCT
    table_schema,
    table_name
  FROM information_schema.tables
  WHERE table_schema IN ('aiworker','business')
    AND table_type = 'BASE TABLE'
    AND (
      table_name ILIKE '%runtime%'
      OR table_name ILIKE '%request%'
      OR table_name ILIKE '%execution%'
      OR table_name ILIKE '%output%'
      OR table_name ILIKE '%deliverable%'
      OR table_name ILIKE '%result%'
      OR table_name ILIKE '%payload%'
    )
  ORDER BY table_schema, table_name
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

COMMIT;
