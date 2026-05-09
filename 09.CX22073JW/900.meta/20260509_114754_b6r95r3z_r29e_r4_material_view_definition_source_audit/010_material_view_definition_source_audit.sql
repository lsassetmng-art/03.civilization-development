\pset pager off
\pset border 2

BEGIN READ ONLY;

SELECT
  '01_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only,
  current_database() AS database_name,
  current_user AS db_user;

WITH target_views AS (
  SELECT *
  FROM (VALUES
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v1'),
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v2'),
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v3'),
    ('old_direct', 'aiworker', 'vw_robot_brain_runtime_material_quality_overlay_v1'),
    ('dependent',  'aiworker', 'vw_robot_brain_runtime_material_scoring_base_v1'),
    ('dependent',  'aiworker', 'vw_robot_readable_brain_knowledge_material_v1'),
    ('dependent',  'aiworker', 'vw_robot_readable_brain_runtime_material_coverage_v1')
  ) AS v(view_group, schema_name, view_name)
)
SELECT
  '02_target_view_exists' AS section,
  tv.view_group,
  tv.schema_name,
  tv.view_name,
  c.relkind,
  CASE WHEN c.oid IS NULL THEN 'MISSING' ELSE 'FOUND' END AS exists_status
FROM target_views tv
LEFT JOIN pg_namespace n
  ON n.nspname = tv.schema_name
LEFT JOIN pg_class c
  ON c.relnamespace = n.oid
 AND c.relname = tv.view_name
ORDER BY tv.view_group, tv.view_name;

WITH target_views AS (
  SELECT *
  FROM (VALUES
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v1'),
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v2'),
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v3'),
    ('old_direct', 'aiworker', 'vw_robot_brain_runtime_material_quality_overlay_v1'),
    ('dependent',  'aiworker', 'vw_robot_brain_runtime_material_scoring_base_v1'),
    ('dependent',  'aiworker', 'vw_robot_readable_brain_knowledge_material_v1'),
    ('dependent',  'aiworker', 'vw_robot_readable_brain_runtime_material_coverage_v1')
  ) AS v(view_group, schema_name, view_name)
)
SELECT
  '03_target_view_columns' AS section,
  tv.view_group,
  tv.view_name,
  string_agg(a.attname, ', ' ORDER BY a.attnum) AS columns
FROM target_views tv
JOIN pg_namespace n
  ON n.nspname = tv.schema_name
JOIN pg_class c
  ON c.relnamespace = n.oid
 AND c.relname = tv.view_name
JOIN pg_attribute a
  ON a.attrelid = c.oid
 AND a.attnum > 0
 AND NOT a.attisdropped
GROUP BY tv.view_group, tv.view_name
ORDER BY tv.view_group, tv.view_name;

WITH target_views AS (
  SELECT *
  FROM (VALUES
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v1'),
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v2'),
    ('old_direct', 'aiworker', 'vw_robot_readable_brain_runtime_material_v3'),
    ('old_direct', 'aiworker', 'vw_robot_brain_runtime_material_quality_overlay_v1'),
    ('dependent',  'aiworker', 'vw_robot_brain_runtime_material_scoring_base_v1'),
    ('dependent',  'aiworker', 'vw_robot_readable_brain_knowledge_material_v1'),
    ('dependent',  'aiworker', 'vw_robot_readable_brain_runtime_material_coverage_v1')
  ) AS v(view_group, schema_name, view_name)
)
SELECT
  '04_target_view_definition' AS section,
  tv.view_group,
  tv.schema_name,
  tv.view_name,
  pg_get_viewdef(format('%I.%I', tv.schema_name, tv.view_name)::regclass, true) AS view_definition
FROM target_views tv
JOIN pg_namespace n
  ON n.nspname = tv.schema_name
JOIN pg_class c
  ON c.relnamespace = n.oid
 AND c.relname = tv.view_name
ORDER BY tv.view_group, tv.view_name;

WITH target_views AS (
  SELECT *
  FROM (VALUES
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v1'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v2'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v3'),
    ('aiworker', 'vw_robot_brain_runtime_material_quality_overlay_v1'),
    ('aiworker', 'vw_robot_brain_runtime_material_scoring_base_v1'),
    ('aiworker', 'vw_robot_readable_brain_knowledge_material_v1'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_coverage_v1')
  ) AS v(schema_name, view_name)
),
deps AS (
  SELECT DISTINCT
    tv.schema_name AS view_schema,
    tv.view_name,
    n2.nspname AS referenced_schema,
    c2.relname AS referenced_name,
    c2.relkind AS referenced_relkind
  FROM target_views tv
  JOIN pg_namespace n1
    ON n1.nspname = tv.schema_name
  JOIN pg_class c1
    ON c1.relnamespace = n1.oid
   AND c1.relname = tv.view_name
  JOIN pg_rewrite r
    ON r.ev_class = c1.oid
  JOIN pg_depend d
    ON d.objid = r.oid
  JOIN pg_class c2
    ON c2.oid = d.refobjid
  JOIN pg_namespace n2
    ON n2.oid = c2.relnamespace
  WHERE c2.oid <> c1.oid
    AND n2.nspname NOT IN ('pg_catalog', 'information_schema')
)
SELECT
  '05_view_dependency_graph' AS section,
  view_schema,
  view_name,
  referenced_schema,
  referenced_name,
  referenced_relkind
FROM deps
ORDER BY view_name, referenced_schema, referenced_name;

WITH target_views AS (
  SELECT *
  FROM (VALUES
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v1'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v2'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v3'),
    ('aiworker', 'vw_robot_brain_runtime_material_quality_overlay_v1'),
    ('aiworker', 'vw_robot_brain_runtime_material_scoring_base_v1'),
    ('aiworker', 'vw_robot_readable_brain_knowledge_material_v1'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_coverage_v1')
  ) AS v(schema_name, view_name)
),
deps AS (
  SELECT DISTINCT
    n2.nspname AS referenced_schema,
    c2.relname AS referenced_name,
    c2.relkind AS referenced_relkind
  FROM target_views tv
  JOIN pg_namespace n1
    ON n1.nspname = tv.schema_name
  JOIN pg_class c1
    ON c1.relnamespace = n1.oid
   AND c1.relname = tv.view_name
  JOIN pg_rewrite r
    ON r.ev_class = c1.oid
  JOIN pg_depend d
    ON d.objid = r.oid
  JOIN pg_class c2
    ON c2.oid = d.refobjid
  JOIN pg_namespace n2
    ON n2.oid = c2.relnamespace
  WHERE c2.oid <> c1.oid
    AND n2.nspname NOT IN ('pg_catalog', 'information_schema')
)
SELECT
  '06_source_table_candidate_columns' AS section,
  d.referenced_schema,
  d.referenced_name,
  d.referenced_relkind,
  string_agg(a.attname, ', ' ORDER BY a.attnum) AS columns
FROM deps d
JOIN pg_namespace n
  ON n.nspname = d.referenced_schema
JOIN pg_class c
  ON c.relnamespace = n.oid
 AND c.relname = d.referenced_name
JOIN pg_attribute a
  ON a.attrelid = c.oid
 AND a.attnum > 0
 AND NOT a.attisdropped
GROUP BY d.referenced_schema, d.referenced_name, d.referenced_relkind
ORDER BY d.referenced_schema, d.referenced_name;

WITH candidates AS (
  SELECT
    c.table_schema,
    c.table_name,
    string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) AS columns,
    max(CASE WHEN c.column_name = 'model_code' THEN 1 ELSE 0 END) AS has_model_code,
    max(CASE WHEN c.column_name = 'model_no' THEN 1 ELSE 0 END) AS has_model_no,
    max(CASE WHEN c.column_name = 'registry_code' THEN 1 ELSE 0 END) AS has_registry_code,
    max(CASE WHEN c.column_name = 'public_model_no' THEN 1 ELSE 0 END) AS has_public_model_no,
    max(CASE WHEN c.column_name = 'runtime_model_code' THEN 1 ELSE 0 END) AS has_runtime_model_code,
    max(CASE WHEN c.column_name = 'legacy_material_model_code' THEN 1 ELSE 0 END) AS has_legacy_material_model_code
  FROM information_schema.columns c
  WHERE c.table_schema IN ('aiworker', 'cx22073jw')
    AND (
      c.table_name ILIKE '%brain%material%'
      OR c.table_name ILIKE '%runtime%material%'
      OR c.table_name ILIKE '%knowledge%material%'
      OR c.table_name ILIKE '%reference%material%'
      OR c.table_name ILIKE '%material%'
    )
  GROUP BY c.table_schema, c.table_name
)
SELECT
  '07_material_table_identifier_column_audit' AS section,
  table_schema,
  table_name,
  has_model_code,
  has_model_no,
  has_registry_code,
  has_public_model_no,
  has_runtime_model_code,
  has_legacy_material_model_code,
  columns
FROM candidates
ORDER BY
  has_model_code DESC,
  has_model_no DESC,
  table_schema,
  table_name;

COMMIT;
