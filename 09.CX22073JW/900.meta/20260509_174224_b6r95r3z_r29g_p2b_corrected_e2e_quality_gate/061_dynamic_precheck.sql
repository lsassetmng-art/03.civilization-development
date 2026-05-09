BEGIN READ ONLY;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

with canon as (
  select
    model_code,
    registry_code,
    public_model_no,
    runtime_model_code,
    legacy_material_model_code,
    identifier_scope_code,
    series_code,
    (coalesce(profile_source_type::text, '') || ' ' || coalesce(model_code::text, '') || ' ' || coalesce(registry_code::text, '') || ' ' || coalesce(public_model_no::text, '') || ' ' || coalesce(runtime_model_code::text, '') || ' ' || coalesce(legacy_material_model_code::text, '') || ' ' || coalesce(identifier_scope_code::text, '') || ' ' || coalesce(series_code::text, '') || ' ' || coalesce(role_code::text, '') || ' ' || coalesce(brain_data_code::text, '') || ' ' || coalesce(brain_domain_code::text, '') || ' ' || coalesce(brain_domain_label_ja::text, '') || ' ' || coalesce(depth_code::text, '') || ' ' || coalesce(risk_class_code::text, '') || ' ' || coalesce(granularity_code::text, '') || ' ' || coalesce(access_decision_code::text, '') || ' ' || coalesce(unit_code::text, '') || ' ' || coalesce(unit_title_ja::text, '') || ' ' || coalesce(unit_summary_ja::text, '') || ' ' || coalesce(unit_detail_ja::text, '') || ' ' || coalesce(practical_use_ja::text, '') || ' ' || coalesce(example_prompt_ja::text, '') || ' ' || coalesce(safety_boundary_ja::text, '') || ' ' || coalesce(material_source_kind::text, '') || ' ' || coalesce(canon_status::text, '') || ' ' || coalesce(reference_tier::text, '') || ' ' || coalesce(verification_status::text, '') || ' ' || coalesce(source_caution_ja::text, '') || ' ' || coalesce(robot_use_summary_ja::text, '') || ' ' || coalesce(misconception_guard_ja::text, ''))::text as all_text
  from aiworker.vw_robot_readable_brain_runtime_material_canon_v1
)
select 'BYD_ALL' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'

union all
select 'BYD_TAIKA_DYNAMIC' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'
  and all_text like '%大化%'

union all
select 'BYD_KAISHIN_DYNAMIC' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'
  and all_text like '%改新%'

union all
select 'BYD_SERIES_BEYOND' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'
  and legacy_material_model_code = 'SERIES:Beyond'

union all
select 'BYD_SERIES_BEYOND_TAIKA_DYNAMIC' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'
  and legacy_material_model_code = 'SERIES:Beyond'
  and all_text like '%大化%'

union all
select 'GLOBAL_TAIKA_DYNAMIC' as check_name, count(*) as rows
from canon
where all_text like '%大化%';

COMMIT;
