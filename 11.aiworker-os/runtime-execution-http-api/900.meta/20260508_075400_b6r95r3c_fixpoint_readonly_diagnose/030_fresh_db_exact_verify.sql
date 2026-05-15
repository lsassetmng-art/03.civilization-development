\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 240

select
  now() as collected_at,
  '92b5c8ed-1377-4f06-a855-5882c305a640'::uuid as request_id,
  'c010fe89-3e5f-4a97-a6bf-0a8ae641a970'::uuid as output_id;

select
  r.request_id,
  r.app_surface_code,
  r.source_app_ref,
  r.source_request_ref,
  r.source_route_code,
  r.request_status_code,
  r.model_code,
  r.task_domain_code,
  r.task_title,
  r.idempotency_key,
  r.created_at
from aiworker.runtime_execution_request r
where r.request_id = '92b5c8ed-1377-4f06-a855-5882c305a640'::uuid;

select
  o.output_id,
  o.request_id,
  o.output_status_code,
  o.output_result_code,
  o.output_title_ja,
  length(coalesce(o.output_body_ja, '')) as output_body_len,
  left(o.output_body_ja, 1200) as output_body_head,
  length(coalesce(o.output_summary_ja, '')) as output_summary_len,
  left(o.output_summary_ja, 700) as output_summary_head,
  o.output_payload_jsonb->>'contract_name' as contract_name,
  o.output_payload_jsonb->>'contract_version' as contract_version,
  o.output_payload_jsonb ? 'robot_context' as has_robot_context,
  o.output_payload_jsonb ? 'generation_basis' as has_generation_basis,
  o.output_payload_jsonb ? 'quality_notes' as has_quality_notes,
  o.output_payload_jsonb ? 'unresolved_issues' as has_unresolved_issues,
  o.output_payload_jsonb ? 'next_steps' as has_next_steps,
  o.external_execution_performed_flag,
  o.pg_apply_performed_flag,
  o.destructive_action_performed_flag,
  o.created_at
from aiworker.runtime_worker_output o
where o.output_id = 'c010fe89-3e5f-4a97-a6bf-0a8ae641a970'::uuid;

select
  count(*)::bigint as artifact_count
from aiworker.runtime_output_artifact a
where a.output_id = 'c010fe89-3e5f-4a97-a6bf-0a8ae641a970'::uuid;

select
  a.artifact_id,
  a.output_id,
  a.artifact_kind_code,
  a.artifact_title_ja,
  a.artifact_status_code,
  a.artifact_payload_jsonb ? 'body_markdown' as artifact_has_body_markdown,
  a.artifact_payload_jsonb ? 'summary_text' as artifact_has_summary_text,
  a.artifact_payload_jsonb ? 'robot_context' as artifact_has_robot_context,
  a.artifact_payload_jsonb ? 'generation_basis' as artifact_has_generation_basis,
  left(a.artifact_payload_jsonb::text, 1000) as artifact_payload_head,
  a.created_at
from aiworker.runtime_output_artifact a
where a.output_id = 'c010fe89-3e5f-4a97-a6bf-0a8ae641a970'::uuid
order by a.created_at;

select
  p.request_id,
  jsonb_array_length(coalesce(p.app_read_payload_jsonb->'outputs', '[]'::jsonb)) as outputs_count,
  jsonb_array_length(coalesce(p.app_read_payload_jsonb->'artifacts', '[]'::jsonb)) as artifacts_count,
  left((p.app_read_payload_jsonb->'outputs')::text, 1000) as outputs_payload_head,
  left((p.app_read_payload_jsonb->'artifacts')::text, 1000) as artifacts_payload_head
from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p
where p.request_id = '92b5c8ed-1377-4f06-a855-5882c305a640'::uuid;
