\pset format aligned
\pset null '(null)'

WITH worker_ready AS (
  SELECT
    w.aicm_worker_work_unit_id,
    w.work_unit_name,
    w.assigned_worker_label,
    w.worker_model_code,
    w.work_status_code,
    w.review_status_code,
    w.priority_code,
    w.result_summary_text,
    w.metadata_jsonb,
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
existing_review AS (
  SELECT
    h.related_worker_work_unit_id
  FROM business.aicm_human_review_item h
  WHERE h.owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND h.aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    AND h.human_review_status_code <> 'archived'
    AND h.related_worker_work_unit_id IS NOT NULL
),
candidates AS (
  SELECT r.*
  FROM worker_ready r
  LEFT JOIN existing_review e
    ON e.related_worker_work_unit_id = r.aicm_worker_work_unit_id
  WHERE e.related_worker_work_unit_id IS NULL
)
SELECT 'worker_ready_count' AS section, count(*) AS count FROM worker_ready
UNION ALL
SELECT 'existing_review_count' AS section, count(*) AS count FROM existing_review
UNION ALL
SELECT 'new_review_candidate_count' AS section, count(*) AS count FROM candidates;

SELECT
  'candidate_rows' AS section,
  c.aicm_worker_work_unit_id,
  c.work_unit_name,
  c.assigned_worker_label,
  c.worker_model_code,
  c.work_status_code,
  c.review_status_code,
  left(c.result_summary_text, 220) AS result_summary_preview,
  c.metadata_jsonb #>> '{runtime_result,runtime_request,request_id}' AS request_id
FROM (
  SELECT r.*
  FROM worker_ready r
  LEFT JOIN existing_review e
    ON e.related_worker_work_unit_id = r.aicm_worker_work_unit_id
  WHERE e.related_worker_work_unit_id IS NULL
) c
ORDER BY c.work_unit_name;
