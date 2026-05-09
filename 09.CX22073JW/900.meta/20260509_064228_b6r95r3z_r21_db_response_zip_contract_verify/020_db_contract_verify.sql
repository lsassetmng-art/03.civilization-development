\set ON_ERROR_STOP on
SET default_transaction_read_only = on;

SELECT
  '01_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only;

SELECT
  '02_request_by_idempotency' AS section,
  request_id,
  request_code,
  app_surface_code,
  model_code,
  task_domain_code,
  request_status_code,
  source_route_code,
  idempotency_key,
  created_at,
  updated_at
FROM aiworker.runtime_execution_request
WHERE idempotency_key = 'B6R95R3Z_R20_TAIKA_E2E_20260509_060449'
   OR request_id::text = 'a97837f5-3947-479a-b167-ae05ed90a1d8'
ORDER BY created_at DESC
LIMIT 10;

SELECT
  '03_event_log' AS section,
  event_type_code,
  event_status_code,
  event_title_ja,
  event_detail_jsonb,
  created_at
FROM aiworker.runtime_execution_event_log
WHERE request_id IN (
  SELECT request_id
  FROM aiworker.runtime_execution_request
  WHERE idempotency_key = 'B6R95R3Z_R20_TAIKA_E2E_20260509_060449'
     OR request_id::text = 'a97837f5-3947-479a-b167-ae05ed90a1d8'
)
ORDER BY created_at;

SELECT
  '04_worker_output_board' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.vw_app_aiworker_runtime_worker_output_board_v1 t
WHERE request_id IN (
  SELECT request_id
  FROM aiworker.runtime_execution_request
  WHERE idempotency_key = 'B6R95R3Z_R20_TAIKA_E2E_20260509_060449'
     OR request_id::text = 'a97837f5-3947-479a-b167-ae05ed90a1d8'
)
LIMIT 20;

SELECT
  '05_delivery_board' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.vw_app_aiworker_runtime_delivery_board_v1 t
WHERE request_id IN (
  SELECT request_id
  FROM aiworker.runtime_execution_request
  WHERE idempotency_key = 'B6R95R3Z_R20_TAIKA_E2E_20260509_060449'
     OR request_id::text = 'a97837f5-3947-479a-b167-ae05ed90a1d8'
)
LIMIT 20;

SELECT
  '06_full_pipeline_board' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1 t
WHERE request_id IN (
  SELECT request_id
  FROM aiworker.runtime_execution_request
  WHERE idempotency_key = 'B6R95R3Z_R20_TAIKA_E2E_20260509_060449'
     OR request_id::text = 'a97837f5-3947-479a-b167-ae05ed90a1d8'
)
LIMIT 20;

\echo '============================================================'
\echo '07_DYNAMIC_OUTPUT_PAYLOAD_TABLES'
\echo '============================================================'

SELECT format(
  $fmt$
SELECT
  %L AS section,
  %L AS table_name,
  to_jsonb(t) AS row_json
FROM %I.%I t
WHERE request_id IN (
  SELECT request_id
  FROM aiworker.runtime_execution_request
  WHERE idempotency_key = %L
     OR request_id::text = %L
)
LIMIT 20;
$fmt$,
  '07_dynamic_output_payload_rows',
  c.table_schema || '.' || c.table_name,
  c.table_schema,
  c.table_name,
  'B6R95R3Z_R20_TAIKA_E2E_20260509_060449',
  'a97837f5-3947-479a-b167-ae05ed90a1d8'
)
FROM information_schema.columns c
WHERE c.table_schema = 'aiworker'
  AND c.column_name = 'request_id'
  AND c.table_name IN (
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'aiworker'
      AND (
           column_name ILIKE '%payload%'
        OR column_name ILIKE '%artifact%'
        OR column_name ILIKE '%deliverable%'
        OR column_name ILIKE '%output%'
        OR column_name ILIKE '%summary%'
      )
  )
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_schema, c.table_name
\gexec
