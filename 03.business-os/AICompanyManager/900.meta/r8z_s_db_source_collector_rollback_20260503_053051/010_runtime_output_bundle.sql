\pset format unaligned
\pset tuples_only on
\pset null ''

WITH worker_rows AS (
  SELECT
    w.aicm_worker_work_unit_id,
    w.aicm_user_company_id,
    w.owner_civilization_id,
    w.aicm_leader_middle_work_item_id,
    w.aicm_leader_deliverable_requirement_id,
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
    w.metadata_jsonb
  FROM business.aicm_worker_work_unit w
  WHERE w.owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND w.aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    AND COALESCE(
      w.metadata_jsonb #>> '{runtime_result,runtime_request,request_id}',
      w.metadata_jsonb #>> '{runtime_result,aiworker_response,request_id}',
      ''
    ) IN ('1c2fceb2-4f1a-4dd4-8cc7-63d7d529e6aa', '569fc089-2771-4616-9c3b-0a93698b203a')
)
SELECT jsonb_build_object(
  'result', 'ok',
  'owner_civilization_id', '00000000-0000-4000-8000-000000000001',
  'aicm_user_company_id', '8b9be487-7b74-4517-9b59-6c84a82ae6aa',
  'request_id_1', '1c2fceb2-4f1a-4dd4-8cc7-63d7d529e6aa',
  'request_id_2', '569fc089-2771-4616-9c3b-0a93698b203a',
  'worker_row_count', (SELECT count(*) FROM worker_rows),
  'rows',
  COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'business_worker', to_jsonb(wr),
        'aiworker_runtime_request',
          COALESCE((
            SELECT jsonb_agg(to_jsonb(r))
            FROM aiworker.runtime_execution_request r
            WHERE r.request_id = wr.request_id::uuid
          ), '[]'::jsonb),
        'aiworker_runtime_event_log',
          COALESCE((
            SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at)
            FROM aiworker.runtime_execution_event_log e
            WHERE e.request_id = wr.request_id::uuid
          ), '[]'::jsonb),
        'aiworker_runtime_handoff_packet',
          COALESCE((
            SELECT jsonb_agg(to_jsonb(h))
            FROM aiworker.runtime_handoff_packet h
            WHERE h.request_id = wr.request_id::uuid
          ), '[]'::jsonb),
        'aiworker_app_read_payload',
          COALESCE((
            SELECT jsonb_agg(to_jsonb(v))
            FROM aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 v
            WHERE v.request_id = wr.request_id::uuid
          ), '[]'::jsonb),
        'aiworker_handoff_packet_board',
          COALESCE((
            SELECT jsonb_agg(to_jsonb(v))
            FROM aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1 v
            WHERE v.request_id = wr.request_id::uuid
          ), '[]'::jsonb),
        'aiworker_full_pipeline_board',
          COALESCE((
            SELECT jsonb_agg(to_jsonb(v))
            FROM aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1 v
            WHERE v.request_id = wr.request_id::uuid
          ), '[]'::jsonb)
      )
      ORDER BY wr.work_unit_name
    )
    FROM worker_rows wr
  ), '[]'::jsonb)
)::text;
