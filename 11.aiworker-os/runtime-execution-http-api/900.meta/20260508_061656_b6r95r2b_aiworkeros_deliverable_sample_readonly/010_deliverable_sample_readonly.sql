\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 220

select
  now() as collected_at,
  current_database() as database_name,
  current_user as current_user_name;

-- ============================================================
-- 1. Existing output / artifact / delivery row counts
-- ============================================================

select 'aiworker.runtime_execution_request' as relation_name, count(*)::bigint as row_count
from aiworker.runtime_execution_request;

select 'aiworker.runtime_worker_output' as relation_name, count(*)::bigint as row_count
from aiworker.runtime_worker_output;

select 'aiworker.runtime_output_artifact' as relation_name, count(*)::bigint as row_count
from aiworker.runtime_output_artifact;

select 'aiworker.runtime_delivery_package' as relation_name, count(*)::bigint as row_count
from aiworker.runtime_delivery_package;

select 'business.ai_company_manager_deliverable' as relation_name, count(*)::bigint as row_count
from business.ai_company_manager_deliverable;

select 'business.aicm_worker_work_unit' as relation_name, count(*)::bigint as row_count
from business.aicm_worker_work_unit;

select 'business.aicm_human_review_item' as relation_name, count(*)::bigint as row_count
from business.aicm_human_review_item;

-- ============================================================
-- 2. Latest runtime requests from AICompanyManager-ish sources
-- ============================================================

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
  left(r.task_instruction_ja, 300) as task_instruction_head,
  length(coalesce(r.task_instruction_ja, '')) as task_instruction_len,
  r.created_at,
  r.updated_at
from aiworker.runtime_execution_request r
where
  r.app_surface_code ilike '%AICM%'
  or r.app_surface_code ilike '%AICompanyManager%'
  or r.source_app_ref ilike '%AICM%'
  or r.source_app_ref ilike '%AICompanyManager%'
  or r.source_route_code is not null
order by r.created_at desc
limit 30;

-- ============================================================
-- 3. Latest output rows with actual body length/sample
--    This is the key check: output_body_ja is the real body column.
-- ============================================================

select
  o.output_id,
  o.request_id,
  r.request_code,
  r.app_surface_code,
  r.source_app_ref,
  r.source_route_code,
  r.task_title,
  o.output_code,
  o.output_status_code,
  o.output_result_code,
  o.output_title_ja,
  length(coalesce(o.output_body_ja, '')) as output_body_len,
  left(o.output_body_ja, 700) as output_body_head,
  o.output_summary_ja,
  length(coalesce(o.output_summary_ja, '')) as output_summary_len,
  o.safety_result_code,
  o.created_by_role_layer_code,
  o.created_at
from aiworker.runtime_worker_output o
join aiworker.runtime_execution_request r
  on r.request_id = o.request_id
order by o.created_at desc
limit 20;

-- ============================================================
-- 4. Latest artifact rows with payload keys/sample
-- ============================================================

select
  a.artifact_id,
  a.output_id,
  a.request_id,
  r.request_code,
  r.app_surface_code,
  r.source_app_ref,
  r.source_route_code,
  r.task_title,
  a.artifact_code,
  a.artifact_kind_code,
  a.artifact_title_ja,
  a.artifact_status_code,
  jsonb_typeof(a.artifact_payload_jsonb) as artifact_payload_type,
  left(a.artifact_payload_jsonb::text, 900) as artifact_payload_head,
  a.created_at
from aiworker.runtime_output_artifact a
join aiworker.runtime_execution_request r
  on r.request_id = a.request_id
order by a.created_at desc
limit 20;

-- ============================================================
-- 5. Latest delivery rows with payload keys/sample
-- ============================================================

select
  d.delivery_id,
  d.request_id,
  r.request_code,
  r.app_surface_code,
  r.source_app_ref,
  r.source_route_code,
  r.task_title,
  d.delivery_code,
  d.delivery_status_code,
  d.delivery_result_code,
  d.delivery_title_ja,
  d.delivery_summary_ja,
  jsonb_typeof(d.delivery_payload_jsonb) as delivery_payload_type,
  left(d.delivery_payload_jsonb::text, 900) as delivery_payload_head,
  d.human_go_confirmed_flag,
  d.external_execution_performed_flag,
  d.pg_apply_performed_flag,
  d.destructive_action_performed_flag,
  d.created_at
from aiworker.runtime_delivery_package d
join aiworker.runtime_execution_request r
  on r.request_id = d.request_id
order by d.created_at desc
limit 20;

-- ============================================================
-- 6. App-read payload current exposure check
--    Confirms whether app-read payload exposes body or only summary.
-- ============================================================

select
  p.request_id,
  p.request_code,
  p.app_surface_code,
  p.task_title,
  p.request_status_code,
  p.delivery_status_code,
  jsonb_array_length(coalesce(p.app_read_payload_jsonb->'outputs', '[]'::jsonb)) as outputs_count,
  jsonb_array_length(coalesce(p.app_read_payload_jsonb->'artifacts', '[]'::jsonb)) as artifacts_count,
  left((p.app_read_payload_jsonb->'outputs')::text, 900) as outputs_payload_head,
  left((p.app_read_payload_jsonb->'artifacts')::text, 900) as artifacts_payload_head,
  (
    p.app_read_payload_jsonb::text ilike '%output_body_ja%'
    or p.app_read_payload_jsonb::text ilike '%body_markdown%'
    or p.app_read_payload_jsonb::text ilike '%body_text%'
    or p.app_read_payload_jsonb::text ilike '%artifact_payload_jsonb%'
  ) as app_read_payload_has_body_like_key,
  p.request_created_at,
  p.delivery_created_at
from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p
order by p.request_created_at desc
limit 30;

-- ============================================================
-- 7. Function availability exact confirmation
-- ============================================================

select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  pg_get_function_result(p.oid) as result_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'aiworker'
  and p.proname in (
    'fn_runtime_execution_create_request_with_route_v1',
    'fn_runtime_execution_submit_worker_output',
    'fn_runtime_execution_mark_delivery_ready'
  )
order by p.proname;

-- ============================================================
-- 8. BusinessOS existing deliverable table sample
-- ============================================================

select
  deliverable_id,
  pipeline_run_id,
  produced_by_role,
  produced_by_ref,
  deliverable_title,
  deliverable_type,
  content_ref,
  length(coalesce(content_text, '')) as content_text_len,
  left(content_text, 700) as content_text_head,
  deliverable_status,
  version_no,
  created_at
from business.ai_company_manager_deliverable
order by created_at desc
limit 20;

-- ============================================================
-- 9. Human review metadata currently linked to runtime_request_id
-- ============================================================

select
  h.aicm_human_review_item_id,
  h.review_title,
  h.review_kind_code,
  h.artifact_kind_code,
  left(h.delivery_summary_text, 500) as delivery_summary_head,
  h.artifact_link,
  h.human_review_status_code,
  h.related_worker_work_unit_id,
  h.metadata_jsonb->>'runtime_request_id' as metadata_runtime_request_id,
  h.metadata_jsonb->>'runtime_result_summary_text' as metadata_runtime_result_summary_text,
  h.created_at
from business.aicm_human_review_item h
where h.metadata_jsonb ? 'runtime_request_id'
order by h.created_at desc
limit 30;
