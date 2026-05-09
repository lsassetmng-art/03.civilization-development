\set ON_ERROR_STOP on
SET default_transaction_read_only = on;

\echo '============================================================'
\echo '01 READONLY GUARD'
\echo '============================================================'
SELECT
  '01_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only,
  current_database() AS database_name,
  current_user AS db_user;

\echo '============================================================'
\echo '02 OLD VIEW EXISTENCE'
\echo '============================================================'
WITH target(view_schema, view_name) AS (
  VALUES
    ('aiworker','vw_robot_readable_brain_runtime_material_v1'),
    ('aiworker','vw_robot_readable_brain_runtime_material_v2'),
    ('aiworker','vw_robot_readable_brain_runtime_material_v3'),
    ('aiworker','vw_robot_brain_runtime_material_quality_overlay_v1')
)
SELECT
  '02_old_view_existence' AS section,
  t.view_schema,
  t.view_name,
  c.oid IS NOT NULL AS exists_flag,
  c.relkind,
  obj_description(c.oid, 'pg_class') AS comment
FROM target t
LEFT JOIN pg_namespace n ON n.nspname = t.view_schema
LEFT JOIN pg_class c ON c.relnamespace = n.oid AND c.relname = t.view_name
ORDER BY t.view_name;

\echo '============================================================'
\echo '03 OLD VIEW DEFINITIONS'
\echo '============================================================'
SELECT
  '03_old_view_definition' AS section,
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'aiworker'
  AND viewname IN (
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_brain_runtime_material_quality_overlay_v1'
  )
ORDER BY viewname;

\echo '============================================================'
\echo '04 DB VIEW DEPENDENCIES ON OLD VIEWS'
\echo '============================================================'
WITH target AS (
  SELECT
    n.oid AS target_schema_oid,
    n.nspname AS target_schema,
    c.oid AS target_oid,
    c.relname AS target_name
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'aiworker'
    AND c.relname IN (
      'vw_robot_readable_brain_runtime_material_v1',
      'vw_robot_readable_brain_runtime_material_v2',
      'vw_robot_readable_brain_runtime_material_v3',
      'vw_robot_brain_runtime_material_quality_overlay_v1'
    )
),
view_deps AS (
  SELECT DISTINCT
    t.target_schema,
    t.target_name,
    dep_ns.nspname AS dependent_schema,
    dep_cls.relname AS dependent_name,
    dep_cls.relkind AS dependent_relkind,
    d.deptype
  FROM target t
  JOIN pg_depend d ON d.refobjid = t.target_oid
  JOIN pg_rewrite rw ON rw.oid = d.objid
  JOIN pg_class dep_cls ON dep_cls.oid = rw.ev_class
  JOIN pg_namespace dep_ns ON dep_ns.oid = dep_cls.relnamespace
  WHERE dep_cls.oid <> t.target_oid
)
SELECT
  '04_db_view_dependencies' AS section,
  *
FROM view_deps
ORDER BY target_name, dependent_schema, dependent_name;

\echo '============================================================'
\echo '05 FUNCTION SOURCE REFERENCES'
\echo '============================================================'
SELECT
  '05_function_source_reference' AS section,
  n.nspname AS function_schema,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  CASE
    WHEN p.prosrc ILIKE '%vw_robot_readable_brain_runtime_material_v1%' THEN 'v1'
    WHEN p.prosrc ILIKE '%vw_robot_readable_brain_runtime_material_v2%' THEN 'v2'
    WHEN p.prosrc ILIKE '%vw_robot_readable_brain_runtime_material_v3%' THEN 'v3'
    WHEN p.prosrc ILIKE '%vw_robot_brain_runtime_material_quality_overlay_v1%' THEN 'quality_overlay_v1'
    ELSE 'unknown'
  END AS matched_old_view
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.prosrc ILIKE '%vw_robot_readable_brain_runtime_material_v1%'
   OR p.prosrc ILIKE '%vw_robot_readable_brain_runtime_material_v2%'
   OR p.prosrc ILIKE '%vw_robot_readable_brain_runtime_material_v3%'
   OR p.prosrc ILIKE '%vw_robot_brain_runtime_material_quality_overlay_v1%'
ORDER BY function_schema, function_name;

\echo '============================================================'
\echo '06 VIEW TEXT REFERENCES'
\echo '============================================================'
SELECT
  '06_view_text_reference' AS section,
  schemaname,
  viewname,
  CASE
    WHEN definition ILIKE '%vw_robot_readable_brain_runtime_material_v1%' THEN 'v1'
    WHEN definition ILIKE '%vw_robot_readable_brain_runtime_material_v2%' THEN 'v2'
    WHEN definition ILIKE '%vw_robot_readable_brain_runtime_material_v3%' THEN 'v3'
    WHEN definition ILIKE '%vw_robot_brain_runtime_material_quality_overlay_v1%' THEN 'quality_overlay_v1'
    ELSE 'unknown'
  END AS matched_old_view
FROM pg_views
WHERE definition ILIKE '%vw_robot_readable_brain_runtime_material_v1%'
   OR definition ILIKE '%vw_robot_readable_brain_runtime_material_v2%'
   OR definition ILIKE '%vw_robot_readable_brain_runtime_material_v3%'
   OR definition ILIKE '%vw_robot_brain_runtime_material_quality_overlay_v1%'
ORDER BY schemaname, viewname;

\echo '============================================================'
\echo '07 CANONICAL REPLACEMENT VIEW CANDIDATES'
\echo '============================================================'
SELECT
  '07_canonical_replacement_candidates' AS section,
  schemaname,
  viewname
FROM pg_views
WHERE schemaname IN ('aiworker','cx22073jw')
  AND (
    viewname ILIKE '%runtime_material%canon%'
    OR viewname ILIKE '%runtime_material%v4%'
    OR viewname ILIKE '%identifier%canon%'
    OR viewname ILIKE '%readable_brain%canon%'
  )
ORDER BY schemaname, viewname;

\echo '============================================================'
\echo '08 MODEL CODE COLUMN SOURCE CANDIDATES'
\echo '============================================================'
SELECT
  '08_model_columns_in_possible_material_tables' AS section,
  table_schema,
  table_name,
  string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema IN ('aiworker','cx22073jw')
  AND (
    table_name ILIKE '%brain%'
    OR table_name ILIKE '%material%'
    OR table_name ILIKE '%knowledge%'
    OR table_name ILIKE '%reference%'
  )
  AND column_name IN (
    'model_code',
    'model_no',
    'registry_code',
    'public_model_no',
    'runtime_model_code',
    'legacy_material_model_code',
    'aiworker_model_code'
  )
GROUP BY table_schema, table_name
ORDER BY table_schema, table_name;

\echo '============================================================'
\echo '09 OLD VIEW ROW COUNTS'
\echo '============================================================'
SELECT '09_old_view_row_count' AS section, 'vw_robot_readable_brain_runtime_material_v1' AS view_name, COUNT(*) AS row_count FROM aiworker.vw_robot_readable_brain_runtime_material_v1
UNION ALL
SELECT '09_old_view_row_count', 'vw_robot_readable_brain_runtime_material_v2', COUNT(*) FROM aiworker.vw_robot_readable_brain_runtime_material_v2
UNION ALL
SELECT '09_old_view_row_count', 'vw_robot_readable_brain_runtime_material_v3', COUNT(*) FROM aiworker.vw_robot_readable_brain_runtime_material_v3
UNION ALL
SELECT '09_old_view_row_count', 'vw_robot_brain_runtime_material_quality_overlay_v1', COUNT(*) FROM aiworker.vw_robot_brain_runtime_material_quality_overlay_v1;

\echo '============================================================'
\echo '10 DELETE READINESS SUMMARY'
\echo '============================================================'
WITH target AS (
  SELECT
    n.nspname AS target_schema,
    c.oid AS target_oid,
    c.relname AS target_name
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'aiworker'
    AND c.relname IN (
      'vw_robot_readable_brain_runtime_material_v1',
      'vw_robot_readable_brain_runtime_material_v2',
      'vw_robot_readable_brain_runtime_material_v3',
      'vw_robot_brain_runtime_material_quality_overlay_v1'
    )
),
view_dep_count AS (
  SELECT
    t.target_name,
    COUNT(DISTINCT dep_cls.oid) AS dependent_view_count
  FROM target t
  LEFT JOIN pg_depend d ON d.refobjid = t.target_oid
  LEFT JOIN pg_rewrite rw ON rw.oid = d.objid
  LEFT JOIN pg_class dep_cls ON dep_cls.oid = rw.ev_class AND dep_cls.oid <> t.target_oid
  GROUP BY t.target_name
),
func_ref_count AS (
  SELECT
    t.target_name,
    COUNT(DISTINCT p.oid) AS function_reference_count
  FROM target t
  LEFT JOIN pg_proc p ON p.prosrc ILIKE '%' || t.target_name || '%'
  GROUP BY t.target_name
)
SELECT
  '10_delete_readiness_summary' AS section,
  t.target_schema,
  t.target_name,
  COALESCE(v.dependent_view_count, 0) AS dependent_view_count,
  COALESCE(f.function_reference_count, 0) AS function_reference_count,
  CASE
    WHEN COALESCE(v.dependent_view_count, 0) = 0
     AND COALESCE(f.function_reference_count, 0) = 0
    THEN 'DB_SIDE_DELETE_CANDIDATE_AFTER_CODE_SWITCH'
    ELSE 'DO_NOT_DROP_DEPENDENCIES_EXIST'
  END AS db_side_readiness
FROM target t
LEFT JOIN view_dep_count v ON v.target_name = t.target_name
LEFT JOIN func_ref_count f ON f.target_name = t.target_name
ORDER BY t.target_name;
