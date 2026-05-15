\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 240

select
  r.request_id,
  r.request_code,
  r.app_surface_code,
  r.source_app_ref,
  r.source_request_ref,
  r.source_route_code,
  r.request_status_code,
  r.model_code,
  r.role_layer_code,
  r.task_domain_code,
  r.task_title,
  r.idempotency_key,
  r.created_at
from aiworker.runtime_execution_request r
where r.idempotency_key = 'b6r95r3i_zip_final_20260508_120930'
order by r.created_at desc;

select
  o.output_id,
  o.request_id,
  o.output_code,
  o.output_status_code,
  o.output_result_code,
  o.output_title_ja,
  length(coalesce(o.output_body_ja, '')) as output_body_len,
  length(coalesce(o.output_summary_ja, '')) as output_summary_len,
  left(o.output_summary_ja, 700) as output_summary_head,
  o.output_payload_jsonb->>'contract_name' as contract_name,
  o.output_payload_jsonb->>'contract_version' as contract_version,
  jsonb_array_length(coalesce(o.output_payload_jsonb->'generated_artifacts', '[]'::jsonb)) as generated_artifacts_count,
  o.output_payload_jsonb->'deliverable_package' as deliverable_package,
  o.output_payload_jsonb->>'deliverable_link' as output_payload_deliverable_link,
  o.output_payload_jsonb->'robot_context' as robot_context,
  o.output_payload_jsonb->'generation_basis' as generation_basis,
  o.external_execution_performed_flag,
  o.pg_apply_performed_flag,
  o.destructive_action_performed_flag,
  o.created_at
from aiworker.runtime_worker_output o
where o.output_id = '0c3f7ba4-fb72-422a-8f91-2417b30f9534'::uuid;

select
  count(*)::bigint as artifact_count
from aiworker.runtime_output_artifact a
where a.output_id = '0c3f7ba4-fb72-422a-8f91-2417b30f9534'::uuid;

select
  a.artifact_id,
  a.output_id,
  a.artifact_kind_code,
  a.artifact_title_ja,
  a.artifact_status_code,
  jsonb_array_length(coalesce(a.artifact_payload_jsonb->'generated_artifacts', '[]'::jsonb)) as artifact_generated_artifacts_count,
  a.artifact_payload_jsonb->'deliverable_package' as artifact_deliverable_package,
  a.artifact_payload_jsonb->>'deliverable_link' as artifact_deliverable_link,
  left(a.artifact_payload_jsonb::text, 1000) as artifact_payload_head,
  a.created_at
from aiworker.runtime_output_artifact a
where a.output_id = '0c3f7ba4-fb72-422a-8f91-2417b30f9534'::uuid
order by a.created_at;

select
  p.request_id,
  jsonb_array_length(coalesce(p.app_read_payload_jsonb->'outputs', '[]'::jsonb)) as outputs_count,
  jsonb_array_length(coalesce(p.app_read_payload_jsonb->'artifacts', '[]'::jsonb)) as artifacts_count,
  left((p.app_read_payload_jsonb->'outputs')::text, 1200) as outputs_payload_head,
  left((p.app_read_payload_jsonb->'artifacts')::text, 1200) as artifacts_payload_head
from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p
where p.request_id = 'bf537111-30c1-4bb1-bcf4-a7468c3544d9'::uuid;
