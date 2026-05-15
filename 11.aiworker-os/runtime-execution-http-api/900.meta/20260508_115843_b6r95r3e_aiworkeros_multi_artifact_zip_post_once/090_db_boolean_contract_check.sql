\pset pager off
\pset null '(null)'
\pset format unaligned
\pset tuples_only on
\o /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260508_115843_b6r95r3e_aiworkeros_multi_artifact_zip_post_once/092_db_boolean_contract_check.json

with o as (
  select *
  from aiworker.runtime_worker_output
  where output_id = '40542feb-63c0-4148-a916-c05d583969bc'::uuid
),
a as (
  select count(*)::int as artifact_count
  from aiworker.runtime_output_artifact
  where output_id = '40542feb-63c0-4148-a916-c05d583969bc'::uuid
),
p as (
  select *
  from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1
  where request_id = '2aaddd2c-571b-4e5e-96fd-c678b72d96a8'::uuid
)
select jsonb_build_object(
  'output_row_exists', exists(select 1 from o),
  'request_id_matches', exists(select 1 from o where request_id = '2aaddd2c-571b-4e5e-96fd-c678b72d96a8'::uuid),
  'body_present', exists(select 1 from o where length(coalesce(output_body_ja, '')) > 100),
  'summary_present', exists(select 1 from o where length(coalesce(output_summary_ja, '')) > 20),
  'contract_name_ok', exists(select 1 from o where output_payload_jsonb->>'contract_name' = 'aiworkeros_common_requester_deliverable_contract'),
  'contract_version_ok', exists(select 1 from o where output_payload_jsonb->>'contract_version' = 'B6R95R3B-R3'),
  'generated_artifacts_present', exists(select 1 from o where jsonb_array_length(coalesce(output_payload_jsonb->'generated_artifacts', '[]'::jsonb)) > 0),
  'deliverable_package_present', exists(select 1 from o where output_payload_jsonb ? 'deliverable_package'),
  'deliverable_link_zip_present', exists(select 1 from o where coalesce(output_payload_jsonb->>'deliverable_link', '') like 'aiworkeros://runtime-deliverable-zip/%.zip'),
  'robot_context_present', exists(select 1 from o where output_payload_jsonb ? 'robot_context'),
  'generation_basis_present', exists(select 1 from o where output_payload_jsonb ? 'generation_basis'),
  'safety_flags_false', exists(select 1 from o where external_execution_performed_flag = false and pg_apply_performed_flag = false and destructive_action_performed_flag = false),
  'artifact_count_positive', exists(select 1 from a where artifact_count > 0),
  'app_read_outputs_positive', exists(select 1 from p where jsonb_array_length(coalesce(app_read_payload_jsonb->'outputs', '[]'::jsonb)) > 0),
  'app_read_artifacts_positive', exists(select 1 from p where jsonb_array_length(coalesce(app_read_payload_jsonb->'artifacts', '[]'::jsonb)) > 0)
)::text;
\o
