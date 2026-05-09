\pset pager off
\pset border 2

BEGIN READ ONLY;

SELECT
  '01_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only,
  current_database() AS database_name,
  current_user AS db_user;

SELECT
  '02_model_public_registry_identifier_sample' AS section,
  registry_code,
  manufacturer_code,
  series_code,
  model_no AS public_model_no,
  model_code AS runtime_model_code,
  model_name_ja,
  status_code,
  app_reference_allowed_flag,
  public_display_allowed_flag
FROM aiworker.model_public_registry
WHERE model_no ILIKE 'BYD%'
   OR model_code ILIKE 'byd%'
   OR registry_code ILIKE '%byd%'
ORDER BY model_no, model_code
LIMIT 80;

WITH material_models AS (
  SELECT 'quality_overlay_v1' AS material_view, model_code::text AS legacy_material_model_code, count(*) AS row_count
  FROM aiworker.vw_robot_brain_runtime_material_quality_overlay_v1
  GROUP BY model_code

  UNION ALL
  SELECT 'runtime_material_v1', model_code::text, count(*)
  FROM aiworker.vw_robot_readable_brain_runtime_material_v1
  GROUP BY model_code

  UNION ALL
  SELECT 'runtime_material_v2', model_code::text, count(*)
  FROM aiworker.vw_robot_readable_brain_runtime_material_v2
  GROUP BY model_code

  UNION ALL
  SELECT 'runtime_material_v3', model_code::text, count(*)
  FROM aiworker.vw_robot_readable_brain_runtime_material_v3
  GROUP BY model_code
),
classified AS (
  SELECT
    mm.material_view,
    mm.legacy_material_model_code,
    mm.row_count,

    by_runtime.registry_code AS match_by_runtime_registry_code,
    by_runtime.model_no AS match_by_runtime_public_model_no,
    by_runtime.model_code AS match_by_runtime_model_code,

    by_public.registry_code AS match_by_public_registry_code,
    by_public.model_no AS match_by_public_model_no,
    by_public.model_code AS match_by_public_runtime_model_code,

    by_registry.registry_code AS match_by_registry_code,
    by_registry.model_no AS match_by_registry_public_model_no,
    by_registry.model_code AS match_by_registry_runtime_model_code,

    CASE
      WHEN by_runtime.registry_code IS NOT NULL THEN 'MATCH_RUNTIME_MODEL_CODE'
      WHEN by_public.registry_code IS NOT NULL THEN 'MATCH_PUBLIC_MODEL_NO'
      WHEN by_registry.registry_code IS NOT NULL THEN 'MATCH_REGISTRY_CODE'
      ELSE 'NO_MASTER_MATCH'
    END AS identifier_shape
  FROM material_models mm
  LEFT JOIN LATERAL (
    SELECT registry_code, model_no, model_code
    FROM aiworker.model_public_registry m
    WHERE m.model_code = mm.legacy_material_model_code
    ORDER BY sort_order, registry_code
    LIMIT 1
  ) by_runtime ON true
  LEFT JOIN LATERAL (
    SELECT registry_code, model_no, model_code
    FROM aiworker.model_public_registry m
    WHERE m.model_no = mm.legacy_material_model_code
    ORDER BY sort_order, registry_code
    LIMIT 1
  ) by_public ON true
  LEFT JOIN LATERAL (
    SELECT registry_code, model_no, model_code
    FROM aiworker.model_public_registry m
    WHERE m.registry_code = mm.legacy_material_model_code
    ORDER BY sort_order, registry_code
    LIMIT 1
  ) by_registry ON true
)
SELECT
  '03_material_model_identifier_classification' AS section,
  material_view,
  legacy_material_model_code,
  row_count,
  identifier_shape,
  coalesce(match_by_runtime_registry_code, match_by_public_registry_code, match_by_registry_code) AS canonical_registry_code,
  coalesce(match_by_runtime_public_model_no, match_by_public_model_no, match_by_registry_public_model_no) AS canonical_public_model_no,
  coalesce(match_by_runtime_model_code, match_by_public_runtime_model_code, match_by_registry_runtime_model_code) AS canonical_runtime_model_code
FROM classified
ORDER BY
  CASE identifier_shape
    WHEN 'NO_MASTER_MATCH' THEN 0
    WHEN 'MATCH_PUBLIC_MODEL_NO' THEN 1
    WHEN 'MATCH_REGISTRY_CODE' THEN 2
    WHEN 'MATCH_RUNTIME_MODEL_CODE' THEN 3
    ELSE 9
  END,
  material_view,
  row_count DESC,
  legacy_material_model_code
LIMIT 240;

WITH material_models AS (
  SELECT model_code::text AS legacy_material_model_code, count(*) AS row_count
  FROM aiworker.vw_robot_readable_brain_runtime_material_v3
  GROUP BY model_code
),
classified AS (
  SELECT
    mm.*,
    CASE
      WHEN EXISTS (SELECT 1 FROM aiworker.model_public_registry m WHERE m.model_code = mm.legacy_material_model_code) THEN 'MATCH_RUNTIME_MODEL_CODE'
      WHEN EXISTS (SELECT 1 FROM aiworker.model_public_registry m WHERE m.model_no = mm.legacy_material_model_code) THEN 'MATCH_PUBLIC_MODEL_NO'
      WHEN EXISTS (SELECT 1 FROM aiworker.model_public_registry m WHERE m.registry_code = mm.legacy_material_model_code) THEN 'MATCH_REGISTRY_CODE'
      ELSE 'NO_MASTER_MATCH'
    END AS identifier_shape
  FROM material_models mm
)
SELECT
  '04_identifier_shape_count_v3' AS section,
  identifier_shape,
  count(*) AS distinct_model_code_count,
  sum(row_count) AS material_rows
FROM classified
GROUP BY identifier_shape
ORDER BY identifier_shape;

WITH target_views AS (
  SELECT *
  FROM (VALUES
    ('aiworker', 'vw_robot_readable_brain_source_registry_v1'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v1'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v2'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v3'),
    ('aiworker', 'vw_robot_brain_runtime_material_scoring_base_v1'),
    ('aiworker', 'vw_robot_brain_runtime_material_quality_overlay_v1'),
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
  '05_direct_dependency_graph_including_source_registry' AS section,
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
    ('aiworker', 'vw_robot_readable_brain_source_registry_v1'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v1'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v2'),
    ('aiworker', 'vw_robot_readable_brain_runtime_material_v3'),
    ('aiworker', 'vw_robot_brain_runtime_material_scoring_base_v1'),
    ('aiworker', 'vw_robot_brain_runtime_material_quality_overlay_v1'),
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
),
cols AS (
  SELECT
    d.referenced_schema,
    d.referenced_name,
    d.referenced_relkind,
    string_agg(a.attname, ', ' ORDER BY a.attnum) AS columns,
    max(CASE WHEN a.attname = 'model_code' THEN 1 ELSE 0 END) AS has_model_code,
    max(CASE WHEN a.attname = 'model_no' THEN 1 ELSE 0 END) AS has_model_no,
    max(CASE WHEN a.attname = 'registry_code' THEN 1 ELSE 0 END) AS has_registry_code,
    max(CASE WHEN a.attname = 'public_model_no' THEN 1 ELSE 0 END) AS has_public_model_no,
    max(CASE WHEN a.attname = 'runtime_model_code' THEN 1 ELSE 0 END) AS has_runtime_model_code,
    max(CASE WHEN a.attname = 'legacy_material_model_code' THEN 1 ELSE 0 END) AS has_legacy_material_model_code
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
)
SELECT
  '06_dependency_identifier_column_shape' AS section,
  referenced_schema,
  referenced_name,
  referenced_relkind,
  has_model_code,
  has_model_no,
  has_registry_code,
  has_public_model_no,
  has_runtime_model_code,
  has_legacy_material_model_code,
  columns
FROM cols
ORDER BY
  referenced_relkind,
  has_model_code DESC,
  has_model_no DESC,
  referenced_schema,
  referenced_name;

SELECT
  '07_source_registry_view_definition' AS section,
  pg_get_viewdef('aiworker.vw_robot_readable_brain_source_registry_v1'::regclass, true) AS view_definition;

WITH real_tables AS (
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
  JOIN information_schema.tables t
    ON t.table_schema = c.table_schema
   AND t.table_name = c.table_name
   AND t.table_type = 'BASE TABLE'
  WHERE c.table_schema IN ('aiworker', 'cx22073jw')
    AND (
      c.table_name ILIKE '%brain%'
      OR c.table_name ILIKE '%robot%'
      OR c.table_name ILIKE '%runtime%'
      OR c.table_name ILIKE '%material%'
      OR c.table_name ILIKE '%reference%'
    )
  GROUP BY c.table_schema, c.table_name
)
SELECT
  '08_real_table_identifier_candidates' AS section,
  table_schema,
  table_name,
  has_model_code,
  has_model_no,
  has_registry_code,
  has_public_model_no,
  has_runtime_model_code,
  has_legacy_material_model_code,
  columns
FROM real_tables
WHERE has_model_code = 1
   OR has_model_no = 1
   OR table_name IN (
      'robot_breadth_domain_runtime_policy',
      'brain_detail_expansion_unit',
      'brain_reference_quality_metadata'
   )
ORDER BY
  has_model_code DESC,
  table_schema,
  table_name;

SELECT
  '09_model_public_registry_unique_indexes' AS section,
  i.relname AS index_name,
  ix.indisprimary,
  ix.indisunique,
  string_agg(a.attname, ', ' ORDER BY x.ordinality) AS index_columns
FROM pg_class t
JOIN pg_namespace n
  ON n.oid = t.relnamespace
JOIN pg_index ix
  ON ix.indrelid = t.oid
JOIN pg_class i
  ON i.oid = ix.indexrelid
JOIN unnest(ix.indkey) WITH ORDINALITY AS x(attnum, ordinality)
  ON true
JOIN pg_attribute a
  ON a.attrelid = t.oid
 AND a.attnum = x.attnum
WHERE n.nspname = 'aiworker'
  AND t.relname = 'model_public_registry'
GROUP BY i.relname, ix.indisprimary, ix.indisunique
ORDER BY ix.indisprimary DESC, ix.indisunique DESC, i.relname;

COMMIT;
