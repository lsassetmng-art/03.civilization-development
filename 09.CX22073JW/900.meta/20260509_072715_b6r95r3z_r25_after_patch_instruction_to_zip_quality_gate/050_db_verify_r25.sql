\set ON_ERROR_STOP on
SET default_transaction_read_only = on;

SELECT
  '01_request' AS section,
  request_id,
  request_code,
  app_surface_code,
  model_code,
  task_domain_code,
  request_status_code,
  source_route_code,
  created_at,
  updated_at
FROM aiworker.runtime_execution_request
WHERE idempotency_key = 'B6R95R3Z_R25_TAIKA_AFTER_PATCH_20260509_072715'
ORDER BY created_at DESC
LIMIT 5;

SELECT
  '02_worker_output_board' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.vw_app_aiworker_runtime_worker_output_board_v1 t
WHERE request_id IN (
  SELECT request_id
  FROM aiworker.runtime_execution_request
  WHERE idempotency_key = 'B6R95R3Z_R25_TAIKA_AFTER_PATCH_20260509_072715'
)
LIMIT 10;

SELECT
  '03_delivery_board' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.vw_app_aiworker_runtime_delivery_board_v1 t
WHERE request_id IN (
  SELECT request_id
  FROM aiworker.runtime_execution_request
  WHERE idempotency_key = 'B6R95R3Z_R25_TAIKA_AFTER_PATCH_20260509_072715'
)
LIMIT 10;
