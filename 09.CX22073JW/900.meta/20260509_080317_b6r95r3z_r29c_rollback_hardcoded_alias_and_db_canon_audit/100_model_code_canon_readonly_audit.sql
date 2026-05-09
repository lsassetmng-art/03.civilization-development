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
\echo '02 MODEL CODE COLUMN INVENTORY'
\echo '============================================================'
SELECT
  '02_model_code_column_inventory' AS section,
  table_schema,
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema IN ('aiworker', 'business', 'cx22073jw')
  AND (
       column_name ILIKE '%model_code%'
    OR column_name ILIKE '%model_no%'
    OR column_name ILIKE '%public_model%'
    OR column_name ILIKE '%runtime_model%'
    OR column_name ILIKE '%aiworker_model_code%'
  )
ORDER BY table_schema, table_name, column_name;

\echo '============================================================'
\echo '03 LIKELY MODEL REGISTRY TABLES'
\echo '============================================================'
SELECT
  '03_likely_model_registry_tables' AS section,
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_schema = 'aiworker'
  AND table_name IN (
    'model_public_registry',
    'model_identity_spec',
    'worker_model_catalog',
    'president_model_catalog',
    'robot_model_code_deprecation_map',
    'robot_model_capability_profile',
    'worker_model_extension_catalog',
    'model_runtime_control_override'
  )
ORDER BY table_name;

\echo '============================================================'
\echo '04 EXISTING MODEL IDENTIFIER SAMPLES'
\echo '============================================================'
SELECT
  '04_worker_model_catalog_sample' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.worker_model_catalog t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 10;

SELECT
  '04_model_public_registry_sample' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.model_public_registry t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 10;

SELECT
  '04_model_identity_spec_sample' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.model_identity_spec t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 10;

\echo '============================================================'
\echo '05 RUNTIME MATERIAL MODEL CODE SHAPE'
\echo '============================================================'
SELECT
  '05_runtime_material_model_code_shape' AS section,
  model_code,
  COUNT(*) AS row_count
FROM aiworker.vw_robot_readable_brain_runtime_material_v3
WHERE model_code ILIKE '%BYD2%'
   OR model_code ILIKE '%byd2%'
GROUP BY model_code
ORDER BY row_count DESC, model_code
LIMIT 30;

\echo '============================================================'
\echo '06 RUNTIME REQUEST MODEL CODE SHAPE'
\echo '============================================================'
SELECT
  '06_runtime_request_model_code_shape' AS section,
  app_surface_code,
  model_code,
  COUNT(*) AS row_count
FROM aiworker.runtime_execution_request
WHERE model_code ILIKE '%BYD2%'
   OR model_code ILIKE '%byd2%'
GROUP BY app_surface_code, model_code
ORDER BY row_count DESC, app_surface_code, model_code
LIMIT 50;

\echo '============================================================'
\echo '07 CURRENT BLOCKER CONFIRMATION'
\echo '============================================================'
SELECT
  '07_current_blocker_confirmation' AS section,
  'runtime material uses public code BYD2-003, runtime request may use internal normalized code byd2_003_asic_leader3' AS finding;
