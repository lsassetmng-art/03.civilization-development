\pset format aligned
\pset null '(null)'

SELECT
  'verify_worker_status_counts' AS section,
  work_status_code,
  review_status_code,
  count(*) AS count
FROM business.aicm_worker_work_unit
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
GROUP BY work_status_code, review_status_code
ORDER BY work_status_code, review_status_code;

SELECT
  'verify_output_collection_mark_count' AS section,
  count(*) AS count
FROM business.aicm_worker_work_unit
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
  AND metadata_jsonb ->> 'output_collection_version' = 'r8z_q';
