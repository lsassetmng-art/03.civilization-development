\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 220

select
  r.request_id,
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
where r.request_id = '47b50183-3a62-4b99-8b84-21e6c594599d'::uuid;

select
  o.output_id,
  o.request_id,
  o.output_title_ja,
  length(coalesce(o.output_body_ja, '')) as output_body_len,
  length(coalesce(o.output_summary_ja, '')) as output_summary_len,
  o.output_payload_jsonb->>'deliverable_link' as deliverable_link,
  jsonb_array_length(coalesce(o.output_payload_jsonb->'generated_artifacts', '[]'::jsonb)) as generated_artifacts_count,
  o.output_payload_jsonb->'deliverable_package'->>'file_name' as package_file_name,
  o.output_payload_jsonb->'deliverable_package'->>'zip_link' as package_zip_link,
  o.created_at
from aiworker.runtime_worker_output o
where o.output_id = '7d8f1f7d-4dd5-4a2c-8676-189a2d28b85d'::uuid;
