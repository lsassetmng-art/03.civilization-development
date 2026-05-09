BEGIN READ ONLY;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

with src as (
  select
    model_code,
    (profile_source_type || ' ' || model_code || ' ' || series_code || ' ' || role_code || ' ' || brain_data_code || ' ' || brain_domain_code || ' ' || brain_domain_label_ja || ' ' || depth_code || ' ' || risk_class_code || ' ' || granularity_code || ' ' || access_decision_code || ' ' || unit_code || ' ' || unit_title_ja || ' ' || unit_summary_ja || ' ' || unit_detail_ja || ' ' || practical_use_ja || ' ' || example_prompt_ja || ' ' || safety_boundary_ja || ' ' || material_source_kind || ' ' || canon_status || ' ' || reference_tier || ' ' || verification_status || ' ' || source_caution_ja || ' ' || robot_use_summary_ja || ' ' || misconception_guard_ja)::text as all_text
  from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1
)
select 'SRC_BYD2_003_大化' as check_name, count(*) as rows
from src
where model_code = 'BYD2-003'
  and all_text like '%大化%'

union all
select 'SRC_SERIES_BEYOND_大化' as check_name, count(*) as rows
from src
where model_code = 'SERIES:Beyond'
  and all_text like '%大化%'

union all
select 'SRC_GLOBAL_大化' as check_name, count(*) as rows
from src
where all_text like '%大化%'

union all
select 'SRC_BYD2_003_改新' as check_name, count(*) as rows
from src
where model_code = 'BYD2-003'
  and all_text like '%改新%'

union all
select 'SRC_SERIES_BEYOND_改新' as check_name, count(*) as rows
from src
where model_code = 'SERIES:Beyond'
  and all_text like '%改新%'
;

COMMIT;
