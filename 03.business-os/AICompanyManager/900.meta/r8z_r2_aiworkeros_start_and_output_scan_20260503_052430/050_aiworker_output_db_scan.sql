\pset format aligned
\pset null '(null)'

SELECT
  'candidate_tables' AS section,
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_schema IN ('aiworker', 'business', 'cx22073jw')
  AND table_type IN ('BASE TABLE', 'VIEW')
  AND (
    table_name ILIKE '%runtime%'
    OR table_name ILIKE '%execution%'
    OR table_name ILIKE '%request%'
    OR table_name ILIKE '%pipeline%'
    OR table_name ILIKE '%output%'
    OR table_name ILIKE '%delivery%'
    OR table_name ILIKE '%result%'
    OR table_name ILIKE '%review%'
    OR table_name ILIKE '%work%'
  )
ORDER BY table_schema, table_name;

SELECT
  'candidate_columns' AS section,
  table_schema,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema IN ('aiworker', 'business', 'cx22073jw')
  AND (
    column_name ILIKE '%request%'
    OR column_name ILIKE '%runtime%'
    OR column_name ILIKE '%output%'
    OR column_name ILIKE '%delivery%'
    OR column_name ILIKE '%result%'
    OR column_name ILIKE '%summary%'
    OR column_name ILIKE '%payload%'
    OR column_name ILIKE '%status%'
    OR column_name ILIKE '%idempotency%'
  )
ORDER BY table_schema, table_name, ordinal_position;
