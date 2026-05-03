WITH worker_rows AS (
  SELECT
    w.aicm_worker_work_unit_id::text AS aicm_worker_work_unit_id,
    w.aicm_leader_middle_work_item_id::text AS aicm_leader_middle_work_item_id,
    w.aicm_leader_deliverable_requirement_id::text AS aicm_leader_deliverable_requirement_id,
    w.aicm_manager_major_work_item_id::text AS aicm_manager_major_work_item_id,
    w.work_unit_name,
    w.work_unit_description,
    w.assigned_worker_label,
    w.worker_model_code,
    w.work_status_code,
    w.review_status_code,
    w.priority_code,
    w.result_summary_text,
    w.handoff_link,
    w.updated_at::text AS updated_at,
    COALESCE(w.metadata_jsonb #>> '{runtime_result,runtime_request,request_id}', w.metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}', '') AS request_id,
    COALESCE(w.metadata_jsonb #>> '{runtime_result,runtime_request,source_request_ref}', w.metadata_jsonb #>> '{source_request_ref}', '') AS source_request_ref,
    COALESCE(w.metadata_jsonb #>> '{runtime_result,aiworker_response,status}', '') AS aiworker_status,
    COALESCE(w.metadata_jsonb #>> '{runtime_result,aiworker_response,result}', '') AS aiworker_result,
    COALESCE(w.metadata_jsonb #>> '{runtime_result,result}', '') AS runtime_result,
    w.metadata_jsonb AS metadata_jsonb
  FROM business.vw_aicm_pmlw_worker_work_unit_display w
  WHERE w.owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND w.aicm_user_company_id = '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12'::uuid
    AND (
      w.work_status_code IN ('in_progress', 'review_waiting', 'done')
      OR w.metadata_jsonb ? 'runtime_result'
      OR w.metadata_jsonb ->> 'auto_execution' = 'worker_runtime_request'
    )
  ORDER BY w.updated_at DESC, w.display_order
  LIMIT 30
)
SELECT jsonb_build_object(
  'result', 'ok',
  'owner_civilization_id', '00000000-0000-4000-8000-000000000001',
  'aicm_user_company_id', '8f3c2e6a-9c1b-4c7a-a5d2-1c8c4b7f9e12',
  'worker_unit_count', (SELECT count(*) FROM worker_rows),
  'request_id_count', (SELECT count(*) FROM worker_rows WHERE request_id <> ''),
  'worker_units', COALESCE((SELECT jsonb_agg(to_jsonb(worker_rows)) FROM worker_rows), '[]'::jsonb)
)::text;
