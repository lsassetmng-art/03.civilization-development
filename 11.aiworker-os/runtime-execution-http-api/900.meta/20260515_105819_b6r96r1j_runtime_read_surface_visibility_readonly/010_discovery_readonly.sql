\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 260

select now() as discovery_started_at;

-- ============================================================
-- 1. Direct target table visibility
-- ============================================================

with target_domains(domain_code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
)
select
  'business_support_task_domain' as source_name,
  d.domain_code,
  exists (
    select 1
    from aiworker.business_support_task_domain t
    where t.task_domain_code = d.domain_code
      and t.status_code = 'active'
  ) as visible_flag
from target_domains d
order by d.domain_code;

with target_domains(domain_code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
)
select
  'robot_brain_model_domain_policy' as source_name,
  d.domain_code,
  count(*) as row_count
from target_domains d
left join aiworker.robot_brain_model_domain_policy t
  on to_jsonb(t)::text ~* d.domain_code
 and to_jsonb(t)::text ~* '(HD-R2|hd_r2|hd-r2|r2s|r2g|r2t|combat|sniper|general|origin|safe_non_harmful|defensive_fictional_game_lore)'
group by d.domain_code
order by d.domain_code;

with target_domains(domain_code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
)
select
  'robot_brain_role_policy' as source_name,
  d.domain_code,
  count(*) as row_count
from target_domains d
left join aiworker.robot_brain_role_policy t
  on to_jsonb(t)::text ~* d.domain_code
 and to_jsonb(t)::text ~* '(combat|sniper|general|origin|safe_non_harmful|defensive_fictional_game_lore)'
group by d.domain_code
order by d.domain_code;

with target_domains(domain_code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
)
select
  'business_support_role_domain_capability' as source_name,
  d.domain_code,
  count(*) as row_count
from target_domains d
left join aiworker.business_support_role_domain_capability t
  on to_jsonb(t)::text ~* d.domain_code
 and to_jsonb(t)::text ~* '(combat|sniper|general|origin|safe_non_harmful|defensive_fictional_game_lore)'
group by d.domain_code
order by d.domain_code;

-- ============================================================
-- 2. Runtime/read surface candidate views
-- ============================================================

select
  table_schema,
  table_name,
  table_type
from information_schema.tables
where table_schema = 'aiworker'
  and table_name in (
    'vw_app_aiworker_runtime_control_profile_v1',
    'vw_app_aiworker_runtime_control_prompt_fragment_v1',
    'vw_app_aiworker_runtime_execution_api_contract_v1',
    'vw_app_aiworker_runtime_execution_app_read_payload_v1',
    'vw_app_aiworker_runtime_execution_intake_payload_v1',
    'vw_app_aiworker_runtime_worker_output_board_v1',
    'vw_robot_brain_effective_access_v1',
    'vw_robot_brain_compact_context_v1',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_canon_v1',
    'vw_robot_readable_brain_runtime_material_coverage_v1',
    'vw_app_aiworker_model_selection_source_for_capability_v1',
    'vw_app_aiworker_model_selection_capability_card_v1',
    'vw_app_aiworker_model_selection_directory_v1',
    'vw_app_aiworker_robot_selection_card_v1'
  )
order by table_name;

select
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'aiworker'
  and table_name in (
    'vw_app_aiworker_runtime_control_profile_v1',
    'vw_app_aiworker_runtime_control_prompt_fragment_v1',
    'vw_app_aiworker_runtime_execution_api_contract_v1',
    'vw_app_aiworker_runtime_execution_app_read_payload_v1',
    'vw_app_aiworker_runtime_execution_intake_payload_v1',
    'vw_app_aiworker_runtime_worker_output_board_v1',
    'vw_robot_brain_effective_access_v1',
    'vw_robot_brain_compact_context_v1',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_canon_v1',
    'vw_robot_readable_brain_runtime_material_coverage_v1',
    'vw_app_aiworker_model_selection_source_for_capability_v1',
    'vw_app_aiworker_model_selection_capability_card_v1',
    'vw_app_aiworker_model_selection_directory_v1',
    'vw_app_aiworker_robot_selection_card_v1'
  )
order by table_name, ordinal_position;
