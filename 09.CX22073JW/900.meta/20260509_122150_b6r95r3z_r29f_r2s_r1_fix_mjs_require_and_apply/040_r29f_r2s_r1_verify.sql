\set ON_ERROR_STOP on
BEGIN READ ONLY;

select
  'verify_01_readonly_guard' as section,
  current_setting('transaction_read_only') as transaction_read_only,
  current_setting('default_transaction_read_only') as default_transaction_read_only,
  current_database() as database_name,
  current_user as db_user;

select
  'verify_02_canon_table_rows' as section,
  identifier_scope_code,
  count(*) as row_count
from aiworker.robot_material_model_identifier_canon
group by identifier_scope_code
order by identifier_scope_code;

select
  'verify_03_canon_view_byd2_003' as section,
  count(*) as total_rows,
  count(*) filter (where legacy_material_model_code = 'BYD2-003') as direct_byd_rows,
  count(*) filter (where legacy_material_model_code = 'SERIES:Beyond') as series_beyond_rows,
  count(*) filter (where to_jsonb(v)::text ilike '%大化%') as taika_rows
from aiworker.vw_robot_readable_brain_runtime_material_canon_v1 v
where v.model_code = 'byd2_003_asic_leader3';

select
  'verify_04_unresolved_legacy_material_codes' as section,
  q.model_code as unresolved_legacy_material_model_code,
  count(*) as row_count
from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
left join aiworker.robot_material_model_identifier_canon c
  on c.legacy_material_model_code = q.model_code
where c.legacy_material_model_code is null
group by q.model_code
order by row_count desc, q.model_code
limit 20;

select
  'verify_05_sample_byd2_003_taika_rows' as section,
  jsonb_pretty(to_jsonb(v)) as row_json
from aiworker.vw_robot_readable_brain_runtime_material_canon_v1 v
where v.model_code = 'byd2_003_asic_leader3'
  and to_jsonb(v)::text ilike '%大化%'
order by
  v.verified_canon_priority desc nulls last,
  v.data_depth_level desc nulls last,
  v.full_load_priority desc nulls last
limit 3;

COMMIT;
