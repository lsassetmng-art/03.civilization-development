\pset format aligned
\pset null '(null)'

BEGIN;

WITH worker_ready AS (
  SELECT
    w.*,
    lm.aicm_manager_major_work_item_id,
    lm.aicm_user_company_department_id,
    lm.aicm_user_company_section_id
  FROM business.aicm_worker_work_unit w
  LEFT JOIN business.aicm_leader_middle_work_item lm
    ON lm.aicm_leader_middle_work_item_id = w.aicm_leader_middle_work_item_id
  WHERE w.owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND w.aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    AND w.work_status_code = 'review_waiting'
    AND w.review_status_code = 'waiting'
    AND COALESCE(w.result_summary_text, '') <> ''
    AND w.metadata_jsonb ->> 'output_collection_persist_version' = 'r8z_t'
),
candidates AS (
  SELECT r.*
  FROM worker_ready r
  WHERE NOT EXISTS (
    SELECT 1
    FROM business.aicm_human_review_item h
    WHERE h.owner_civilization_id = r.owner_civilization_id
      AND h.aicm_user_company_id = r.aicm_user_company_id
      AND h.related_worker_work_unit_id = r.aicm_worker_work_unit_id
      AND h.human_review_status_code <> 'archived'
  )
),
inserted AS (
  INSERT INTO business.aicm_human_review_item (
    owner_civilization_id,
    aicm_user_company_id,
    aicm_user_company_department_id,
    aicm_user_company_section_id,
    related_manager_major_work_item_id,
    related_leader_middle_work_item_id,
    related_deliverable_requirement_id,
    related_worker_work_unit_id,
    review_kind_code,
    artifact_kind_code,
    review_title,
    delivery_summary_text,
    ai_review_result_text,
    priority_code,
    human_review_status_code,
    metadata_jsonb
  )
  SELECT
    c.owner_civilization_id,
    c.aicm_user_company_id,
    c.aicm_user_company_department_id,
    c.aicm_user_company_section_id,
    c.aicm_manager_major_work_item_id,
    c.aicm_leader_middle_work_item_id,
    c.aicm_leader_deliverable_requirement_id,
    c.aicm_worker_work_unit_id,
    'delivery_summary',
    'delivery_package',
    left('納品サマリー確認: ' || c.work_unit_name, 180),
    c.result_summary_text,
    'AIWorkerOS成果物回収済み。Worker自動実行後の納品サマリー確認待ち。',
    COALESCE(NULLIF(c.priority_code, ''), 'normal'),
    'pending',
    jsonb_build_object(
      'review_bridge_version', 'r8z_v2',
      'review_bridge_source', 'worker_output_collection',
      'source_worker_work_unit_id', c.aicm_worker_work_unit_id::text,
      'source_request_id', COALESCE(c.metadata_jsonb #>> '{runtime_result,runtime_request,request_id}', ''),
      'output_collection_version', COALESCE(c.metadata_jsonb ->> 'output_collection_version', ''),
      'output_collection_persist_version', COALESCE(c.metadata_jsonb ->> 'output_collection_persist_version', ''),
      'created_by', 'AICompanyManager R8Z-V2 rollback smoke'
    )
  FROM candidates c
  RETURNING aicm_human_review_item_id
)
SELECT
  'rollback_insert_preview' AS section,
  count(*) AS inserted_count
FROM inserted;

ROLLBACK;

SELECT
  'after_rollback_review_bridge_count' AS section,
  count(*) AS count
FROM business.aicm_human_review_item
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
  AND metadata_jsonb ->> 'review_bridge_version' = 'r8z_v2';
