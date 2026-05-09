BEGIN READ ONLY;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

with canon as (
  select
    model_code,
    public_model_no,
    legacy_material_model_code,
    identifier_scope_code,
    series_code,
    (profile_source_type || ' ' || model_code || ' ' || registry_code || ' ' || public_model_no || ' ' || runtime_model_code || ' ' || legacy_material_model_code || ' ' || identifier_scope_code || ' ' || series_code || ' ' || role_code || ' ' || brain_data_code || ' ' || brain_domain_code || ' ' || brain_domain_label_ja || ' ' || depth_code || ' ' || risk_class_code || ' ' || granularity_code || ' ' || access_decision_code || ' ' || unit_code || ' ' || unit_title_ja || ' ' || unit_summary_ja || ' ' || unit_detail_ja || ' ' || practical_use_ja || ' ' || example_prompt_ja || ' ' || safety_boundary_ja || ' ' || material_source_kind || ' ' || canon_status || ' ' || reference_tier || ' ' || verification_status || ' ' || source_caution_ja || ' ' || robot_use_summary_ja || ' ' || misconception_guard_ja)::text as all_text
  from aiworker.vw_robot_readable_brain_runtime_material_canon_v1
)
select 'BYD_ANY_大化' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'
  and all_text like '%大化%'

union all
select 'BYD_ANY_改新' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'
  and all_text like '%改新%'

union all
select 'BYD_ANY_中大兄' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'
  and all_text like '%中大兄%'

union all
select 'BYD_ANY_中臣' as check_name, count(*) as rows
from canon
where model_code = 'byd2_003_asic_leader3'
  and all_text like '%中臣%'

union all
select 'GLOBAL_大化' as check_name, count(*) as rows
from canon
where all_text like '%大化%'

union all
select 'GLOBAL_改新' as check_name, count(*) as rows
from canon
where all_text like '%改新%'

union all
select 'SERIES_BEYOND_大化' as check_name, count(*) as rows
from canon
where legacy_material_model_code = 'SERIES:Beyond'
  and all_text like '%大化%'

union all
select 'BYD_PUBLIC_NO_大化' as check_name, count(*) as rows
from canon
where public_model_no = 'BYD2-003'
  and all_text like '%大化%'
;

COMMIT;
