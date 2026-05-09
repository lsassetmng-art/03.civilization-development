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
select
  'BYD_SAMPLE' as sample_type,
  model_code,
  public_model_no,
  legacy_material_model_code,
  identifier_scope_code,
  series_code,
  left(regexp_replace(all_text, E'[\n\r\t]+', ' ', 'g'), 350) as preview
from canon
where model_code = 'byd2_003_asic_leader3'
limit 20;

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
select
  'GLOBAL_TAIKA_SAMPLE' as sample_type,
  model_code,
  public_model_no,
  legacy_material_model_code,
  identifier_scope_code,
  series_code,
  left(regexp_replace(all_text, E'[\n\r\t]+', ' ', 'g'), 350) as preview
from canon
where all_text like '%大化%'
limit 20;

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
select
  'GLOBAL_KAISHIN_SAMPLE' as sample_type,
  model_code,
  public_model_no,
  legacy_material_model_code,
  identifier_scope_code,
  series_code,
  left(regexp_replace(all_text, E'[\n\r\t]+', ' ', 'g'), 350) as preview
from canon
where all_text like '%改新%'
limit 20;

COMMIT;
