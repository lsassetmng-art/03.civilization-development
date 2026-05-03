\pset format aligned
\pset null '(null)'

SELECT
  'human_review_status_counts' AS section,
  human_review_status_code,
  review_kind_code,
  artifact_kind_code,
  count(*) AS count
FROM business.aicm_human_review_item
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
GROUP BY human_review_status_code, review_kind_code, artifact_kind_code
ORDER BY human_review_status_code, review_kind_code, artifact_kind_code;

SELECT
  'r8z_v2_review_rows' AS section,
  aicm_human_review_item_id,
  related_worker_work_unit_id,
  review_title,
  human_review_status_code,
  review_kind_code,
  artifact_kind_code,
  priority_code,
  left(delivery_summary_text, 240) AS delivery_summary_preview,
  metadata_jsonb ->> 'source_request_id' AS source_request_id,
  created_at,
  updated_at
FROM business.aicm_human_review_item
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
  AND metadata_jsonb ->> 'review_bridge_version' = 'r8z_v2'
ORDER BY created_at DESC;

SELECT
  'review_wait_display_rows' AS section,
  aicm_human_review_item_id,
  review_title,
  human_review_status_code,
  review_kind_code,
  artifact_kind_code,
  priority_code,
  left(delivery_summary_text, 240) AS delivery_summary_preview
FROM business.vw_aicm_human_review_wait_display
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
ORDER BY created_at DESC;
