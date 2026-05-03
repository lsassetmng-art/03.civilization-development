\pset format aligned
\pset null '(null)'

SELECT
  'raw_worker_status_counts' AS section,
  work_status_code,
  review_status_code,
  count(*) AS count
FROM business.aicm_worker_work_unit
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12'::uuid
GROUP BY work_status_code, review_status_code
ORDER BY work_status_code, review_status_code;

SELECT
  'view_worker_status_counts' AS section,
  work_status_code,
  review_status_code,
  count(*) AS count
FROM business.vw_aicm_pmlw_worker_work_unit_display
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12'::uuid
GROUP BY work_status_code, review_status_code
ORDER BY work_status_code, review_status_code;

SELECT
  'raw_latest_worker_units' AS section,
  aicm_worker_work_unit_id,
  work_unit_name,
  assigned_worker_label,
  worker_model_code,
  work_status_code,
  review_status_code,
  metadata_jsonb ->> 'auto_execution' AS auto_execution,
  metadata_jsonb ->> 'auto_execution_version' AS auto_execution_version,
  COALESCE(
    metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
    metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
    ''
  ) AS request_id,
  COALESCE(
    metadata_jsonb #>> '{runtime_result,aiworker_response,status}',
    ''
  ) AS aiworker_status,
  updated_at
FROM business.aicm_worker_work_unit
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12'::uuid
ORDER BY updated_at DESC
LIMIT 20;

SELECT
  'view_latest_worker_units' AS section,
  aicm_worker_work_unit_id,
  work_unit_name,
  assigned_worker_label,
  worker_model_code,
  work_status_code,
  review_status_code,
  metadata_jsonb ->> 'auto_execution' AS auto_execution,
  metadata_jsonb ->> 'auto_execution_version' AS auto_execution_version,
  COALESCE(
    metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
    metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
    ''
  ) AS request_id,
  COALESCE(
    metadata_jsonb #>> '{runtime_result,aiworker_response,status}',
    ''
  ) AS aiworker_status,
  updated_at
FROM business.vw_aicm_pmlw_worker_work_unit_display
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12'::uuid
ORDER BY updated_at DESC
LIMIT 20;

\pset format unaligned
\pset tuples_only on

WITH raw_rows AS (
  SELECT
    aicm_worker_work_unit_id,
    work_unit_name,
    work_status_code,
    review_status_code,
    metadata_jsonb,
    COALESCE(
      metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
      metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
      ''
    ) AS request_id,
    COALESCE(metadata_jsonb ->> 'auto_execution', '') AS auto_execution,
    COALESCE(metadata_jsonb ->> 'auto_execution_version', '') AS auto_execution_version
  FROM business.aicm_worker_work_unit
  WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND aicm_user_company_id = '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12'::uuid
),
view_rows AS (
  SELECT
    aicm_worker_work_unit_id,
    work_unit_name,
    work_status_code,
    review_status_code,
    metadata_jsonb,
    COALESCE(
      metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
      metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
      ''
    ) AS request_id,
    COALESCE(metadata_jsonb ->> 'auto_execution', '') AS auto_execution,
    COALESCE(metadata_jsonb ->> 'auto_execution_version', '') AS auto_execution_version
  FROM business.vw_aicm_pmlw_worker_work_unit_display
  WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND aicm_user_company_id = '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12'::uuid
)
SELECT jsonb_build_object(
  'result', 'ok',
  'owner_civilization_id', '00000000-0000-4000-8000-000000000001',
  'aicm_user_company_id', '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12',
  'raw_total', (SELECT count(*) FROM raw_rows),
  'view_total', (SELECT count(*) FROM view_rows),
  'raw_in_progress', (SELECT count(*) FROM raw_rows WHERE work_status_code = 'in_progress'),
  'view_in_progress', (SELECT count(*) FROM view_rows WHERE work_status_code = 'in_progress'),
  'raw_request_id_count', (SELECT count(*) FROM raw_rows WHERE request_id <> ''),
  'view_request_id_count', (SELECT count(*) FROM view_rows WHERE request_id <> ''),
  'raw_auto_execution_count', (SELECT count(*) FROM raw_rows WHERE auto_execution <> ''),
  'view_auto_execution_count', (SELECT count(*) FROM view_rows WHERE auto_execution <> ''),
  'latest_raw_rows', COALESCE((
    SELECT jsonb_agg(to_jsonb(x))
    FROM (
      SELECT
        aicm_worker_work_unit_id,
        work_unit_name,
        work_status_code,
        review_status_code,
        request_id,
        auto_execution,
        auto_execution_version
      FROM raw_rows
      ORDER BY aicm_worker_work_unit_id
      LIMIT 10
    ) x
  ), '[]'::jsonb),
  'latest_view_rows', COALESCE((
    SELECT jsonb_agg(to_jsonb(x))
    FROM (
      SELECT
        aicm_worker_work_unit_id,
        work_unit_name,
        work_status_code,
        review_status_code,
        request_id,
        auto_execution,
        auto_execution_version
      FROM view_rows
      ORDER BY aicm_worker_work_unit_id
      LIMIT 10
    ) x
  ), '[]'::jsonb)
)::text;
