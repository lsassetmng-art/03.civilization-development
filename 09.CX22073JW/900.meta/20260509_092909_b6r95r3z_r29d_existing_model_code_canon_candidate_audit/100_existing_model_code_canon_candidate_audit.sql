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
\echo '02 CANDIDATE TABLE COLUMN SUMMARY'
\echo '============================================================'
SELECT
  '02_candidate_table_column_summary' AS section,
  table_schema,
  table_name,
  string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema = 'aiworker'
  AND table_name IN (
    'model_public_registry',
    'model_identity_spec',
    'worker_model_catalog',
    'worker_model_extension_catalog',
    'robot_model_code_deprecation_map',
    'robot_model_capability_profile',
    'model_runtime_control_override',
    'control_policy_package',
    'model_service_assignment',
    'model_style_assignment',
    'president_model_catalog'
  )
GROUP BY table_schema, table_name
ORDER BY table_name;

\echo '============================================================'
\echo '03 BYD RELATED ROWS BY CANDIDATE TABLE'
\echo '============================================================'

SELECT
  '03_model_public_registry' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.model_public_registry t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

SELECT
  '03_model_identity_spec' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.model_identity_spec t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

SELECT
  '03_worker_model_catalog' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.worker_model_catalog t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

SELECT
  '03_worker_model_extension_catalog' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.worker_model_extension_catalog t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

SELECT
  '03_robot_model_code_deprecation_map' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.robot_model_code_deprecation_map t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

\echo '============================================================'
\echo '04 EXISTING CANON SUITABILITY SIGNALS'
\echo '============================================================'
SELECT
  '04_existing_canon_suitability_signals' AS section,
  c.table_name,
  MAX(CASE WHEN c.column_name = 'model_code' THEN 1 ELSE 0 END) AS has_model_code,
  MAX(CASE WHEN c.column_name = 'model_no' THEN 1 ELSE 0 END) AS has_model_no,
  MAX(CASE WHEN c.column_name = 'public_model_code' THEN 1 ELSE 0 END) AS has_public_model_code,
  MAX(CASE WHEN c.column_name = 'runtime_model_code' THEN 1 ELSE 0 END) AS has_runtime_model_code,
  MAX(CASE WHEN c.column_name = 'aiworker_model_code' THEN 1 ELSE 0 END) AS has_aiworker_model_code,
  MAX(CASE WHEN c.column_name = 'active_flag' THEN 1 ELSE 0 END) AS has_active_flag
FROM information_schema.columns c
WHERE c.table_schema = 'aiworker'
  AND c.table_name IN (
    'model_public_registry',
    'model_identity_spec',
    'worker_model_catalog',
    'worker_model_extension_catalog',
    'robot_model_code_deprecation_map',
    'robot_model_capability_profile',
    'model_runtime_control_override',
    'control_policy_package',
    'model_service_assignment',
    'model_style_assignment',
    'president_model_catalog'
  )
GROUP BY c.table_name
ORDER BY
  has_public_model_code DESC,
  has_runtime_model_code DESC,
  has_model_no DESC,
  has_model_code DESC,
  c.table_name;

\echo '============================================================'
\echo '05 VALUE SHAPE COMPARISON'
\echo '============================================================'
SELECT
  '05_material_view_byd_values' AS section,
  model_code,
  COUNT(*) AS row_count
FROM aiworker.vw_robot_readable_brain_runtime_material_v3
WHERE model_code ILIKE '%BYD2%'
   OR model_code ILIKE '%byd2%'
GROUP BY model_code
ORDER BY row_count DESC, model_code
LIMIT 40;

SELECT
  '05_runtime_request_byd_values' AS section,
  app_surface_code,
  model_code,
  COUNT(*) AS row_count
FROM aiworker.runtime_execution_request
WHERE model_code ILIKE '%BYD2%'
   OR model_code ILIKE '%byd2%'
GROUP BY app_surface_code, model_code
ORDER BY row_count DESC, app_surface_code, model_code
LIMIT 60;

\echo '============================================================'
\echo '06 DECISION HINT'
\echo '============================================================'
SELECT
  '06_decision_hint' AS section,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'aiworker'
        AND table_name IN ('model_identity_spec', 'model_public_registry', 'worker_model_catalog')
        AND column_name IN ('public_model_code', 'runtime_model_code')
    )
    THEN 'EXISTING_TABLE_MAY_BE_EXTENDABLE_OR_USABLE_REVIEW_REQUIRED'
    ELSE 'NO_CLEAR_PUBLIC_RUNTIME_MAPPING_COLUMNS_FOUND_ADD_ONLY_RESOLVER_TABLE_RECOMMENDED'
  END AS recommendation;
