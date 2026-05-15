\pset pager off
\pset null '(null)'
\pset format unaligned
\pset tuples_only on
\o /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260508_120229_b6r95r3g_aiworkeros_multi_artifact_zip_post_once_after_link_fix/092_db_boolean_contract_check.json

with o as (
  select *
  from aiworker.runtime_worker_output
  where output_id = '984d7a38-c762-4e7e-b6cc-61593c43cc9a'::uuid
),
a as (
  select count(*)::int as artifact_count
  from aiworker.runtime_output_artifact
  where output_id = '984d7a38-c762-4e7e-b6cc-61593c43cc9a'::uuid
),
p as (
  select *
  from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1
  where request_id = '63a893c7-f7d1-47c9-a06c-7ee9cb383395'::uuid
)
select jsonb_build_object(
  'output_row_exists', exists(select 1 from o),
  'request_id_matches', exists(select 1 from o where request_id = '63a893c7-f7d1-47c9-a06c-7ee9cb383395'::uuid),
  'body_present', exists(select 1 from o where length(coalesce(output_body_ja, '')) > 100),
  'summary_present', exists(select 1 from o where length(coalesce(output_summary_ja, '')) > 20),
  'contract_name_ok', exists(select 1 from o where output_payload_jsonb->>'contract_name' = 'aiworkeros_common_requester_deliverable_contract'),
  'contract_version_ok', exists(select 1 from o where output_payload_jsonb->>'contract_version' = 'B6R95R3B-R3'),
  'generated_artifacts_present', exists(select 1 from o where jsonb_array_length(coalesce(output_payload_jsonb->'generated_artifacts', '[]'::jsonb)) > 0),
  'deliverable_package_present', exists(select 1 from o where output_payload_jsonb ? 'deliverable_package'),
  'deliverable_link_zip_present', exists(select 1 from o where coalesce(output_payload_jsonb->>'deliverable_link', '') like 'aiworkeros://runtime-deliverable-zip/%.zip'),
  'db_deliverable_link_matches_response_link', exists(select 1 from o where output_payload_jsonb->>'deliverable_link' = 'aiworkeros://runtime-deliverable-zip/B6R95R3G_ZIP_LINK_ACTUAL_FILE_TEST_B6R95R3G_zip_1778209356656_467ab070-6351-404e.zip'),
  'robot_context_present', exists(select 1 from o where output_payload_jsonb ? 'robot_context'),
  'generation_basis_present', exists(select 1 from o where output_payload_jsonb ? 'generation_basis'),
  'safety_flags_false', exists(select 1 from o where external_execution_performed_flag = false and pg_apply_performed_flag = false and destructive_action_performed_flag = false),
  'artifact_count_positive', exists(select 1 from a where artifact_count > 0),
  'app_read_outputs_positive', exists(select 1 from p where jsonb_array_length(coalesce(app_read_payload_jsonb->'outputs', '[]'::jsonb)) > 0),
  'app_read_artifacts_positive', exists(select 1 from p where jsonb_array_length(coalesce(app_read_payload_jsonb->'artifacts', '[]'::jsonb)) > 0)
)::text;
\o
