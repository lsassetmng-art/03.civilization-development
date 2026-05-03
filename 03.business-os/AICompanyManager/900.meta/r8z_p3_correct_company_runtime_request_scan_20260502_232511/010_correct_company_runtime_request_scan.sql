\pset format aligned
\pset null '(null)'

SELECT
  'company_check' AS section,
  c.aicm_user_company_id,
  c.company_name,
  c.owner_civilization_id,
  c.created_at,
  c.updated_at
FROM business.aicm_user_company c
WHERE c.owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND c.aicm_user_company_id IN (
    '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    , '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12'::uuid
  )
ORDER BY c.updated_at DESC;

SELECT
  'raw_worker_status_counts_correct_company' AS section,
  work_status_code,
  review_status_code,
  count(*) AS count
FROM business.aicm_worker_work_unit
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
GROUP BY work_status_code, review_status_code
ORDER BY work_status_code, review_status_code;

SELECT
  'raw_latest_worker_units_correct_company' AS section,
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
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
ORDER BY updated_at DESC
LIMIT 20;

\pset format unaligned
\pset fieldsep '\t'
\pset tuples_only on

SELECT
  aicm_worker_work_unit_id::text,
  COALESCE(
    metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
    metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
    ''
  ) AS request_id,
  work_unit_name,
  work_status_code,
  review_status_code,
  COALESCE(metadata_jsonb #>> '{runtime_result,aiworker_response,status}', '') AS aiworker_status
FROM business.aicm_worker_work_unit
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
  AND COALESCE(
    metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
    metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
    ''
  ) <> ''
ORDER BY updated_at DESC;

\pset format unaligned
\pset tuples_only on

WITH rows AS (
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
    COALESCE(metadata_jsonb ->> 'auto_execution_version', '') AS auto_execution_version,
    COALESCE(metadata_jsonb #>> '{runtime_result,aiworker_response,status}', '') AS aiworker_status
  FROM business.aicm_worker_work_unit
  WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
)
SELECT jsonb_build_object(
  'result', 'ok',
  'owner_civilization_id', '00000000-0000-4000-8000-000000000001',
  'correct_company_id', '8b9be487-7b74-4517-9b59-6c84a82ae6aa',
  'env_company_id', '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12',
  'raw_total', (SELECT count(*) FROM rows),
  'in_progress_count', (SELECT count(*) FROM rows WHERE work_status_code = 'in_progress'),
  'request_id_count', (SELECT count(*) FROM rows WHERE request_id <> ''),
  'runtime_ok_count', (SELECT count(*) FROM rows WHERE aiworker_status = 'REQUESTED_INTERNAL_ONLY'),
  'auto_execution_count', (SELECT count(*) FROM rows WHERE auto_execution <> ''),
  'latest_rows', COALESCE((
    SELECT jsonb_agg(to_jsonb(x))
    FROM (
      SELECT
        aicm_worker_work_unit_id,
        work_unit_name,
        work_status_code,
        review_status_code,
        request_id,
        aiworker_status,
        auto_execution,
        auto_execution_version
      FROM rows
      ORDER BY aicm_worker_work_unit_id
      LIMIT 20
    ) x
  ), '[]'::jsonb)
)::text;
