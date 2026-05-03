\pset format aligned
\pset null '(null)'

SELECT
  'worker_status_counts' AS section,
  work_status_code,
  review_status_code,
  count(*) AS count
FROM business.aicm_worker_work_unit
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
GROUP BY work_status_code, review_status_code
ORDER BY work_status_code, review_status_code;

SELECT
  'display_view_rows' AS section,
  aicm_worker_work_unit_id,
  work_unit_name,
  assigned_worker_label,
  worker_model_code,
  work_status_code,
  review_status_code,
  left(result_summary_text, 240) AS result_summary_preview,
  metadata_jsonb ->> 'output_collection' AS output_collection,
  metadata_jsonb ->> 'output_collection_version' AS output_collection_version,
  metadata_jsonb ->> 'output_collection_persist_version' AS output_collection_persist_version,
  updated_at
FROM business.vw_aicm_pmlw_worker_work_unit_display
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
  AND metadata_jsonb ->> 'output_collection_persist_version' = 'r8z_t'
ORDER BY updated_at DESC;
