WITH rows AS (
  SELECT
    w.aicm_worker_work_unit_id::text AS aicm_worker_work_unit_id,
    w.aicm_leader_middle_work_item_id::text AS aicm_leader_middle_work_item_id,
    w.aicm_leader_deliverable_requirement_id::text AS aicm_leader_deliverable_requirement_id,
    w.work_unit_name,
    w.work_unit_description,
    w.input_context_text,
    w.expected_output_text,
    w.result_summary_text,
    w.handoff_link,
    w.work_status_code,
    w.review_status_code,
    w.assigned_worker_label,
    w.worker_model_code,
    w.priority_code,
    COALESCE(
      w.metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
      w.metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
      ''
    ) AS request_id,
    COALESCE(
      w.metadata_jsonb #>> '{runtime_result,runtime_request,source_request_ref}',
      w.metadata_jsonb #>> '{source_request_ref}',
      ''
    ) AS source_request_ref,
    COALESCE(
      w.metadata_jsonb #>> '{runtime_result,aiworker_response,status}',
      ''
    ) AS aiworker_status,
    w.metadata_jsonb AS metadata_jsonb
  FROM business.aicm_worker_work_unit w
  WHERE w.owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND w.aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    AND COALESCE(
      w.metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
      w.metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
      ''
    ) <> ''
  ORDER BY w.updated_at DESC
)
SELECT jsonb_build_object(
  'result', 'ok',
  'owner_civilization_id', '00000000-0000-4000-8000-000000000001',
  'aicm_user_company_id', '8b9be487-7b74-4517-9b59-6c84a82ae6aa',
  'request_id_count', (SELECT count(*) FROM rows),
  'rows', COALESCE((SELECT jsonb_agg(to_jsonb(rows)) FROM rows), '[]'::jsonb)
)::text;
