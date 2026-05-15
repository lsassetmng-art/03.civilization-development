\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with target_domains(domain_code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
),
task_domain as (
  select
    d.domain_code,
    exists (
      select 1
      from aiworker.business_support_task_domain t
      where t.task_domain_code = d.domain_code
        and t.status_code = 'active'
    ) as present_flag
  from target_domains d
),
model_policy as (
  select
    d.domain_code,
    count(*) as hit_count
  from target_domains d
  left join aiworker.robot_brain_model_domain_policy t
    on to_jsonb(t)::text ~* d.domain_code
   and to_jsonb(t)::text ~* '(HD-R2|hd_r2|hd-r2|r2s|r2g|r2t|combat|sniper|general|origin|safe_non_harmful|defensive_fictional_game_lore)'
  group by d.domain_code
),
role_policy as (
  select
    d.domain_code,
    count(*) as hit_count
  from target_domains d
  left join aiworker.robot_brain_role_policy t
    on to_jsonb(t)::text ~* d.domain_code
   and to_jsonb(t)::text ~* '(combat|sniper|general|origin|safe_non_harmful|defensive_fictional_game_lore)'
  group by d.domain_code
),
role_capability as (
  select
    d.domain_code,
    count(*) as hit_count
  from target_domains d
  left join aiworker.business_support_role_domain_capability t
    on to_jsonb(t)::text ~* d.domain_code
   and to_jsonb(t)::text ~* '(combat|sniper|general|origin|safe_non_harmful|defensive_fictional_game_lore)'
  group by d.domain_code
),
view_catalog as (
  select
    table_name,
    exists (
      select 1
      from information_schema.tables x
      where x.table_schema = 'aiworker'
        and x.table_name = v.table_name
    ) as exists_flag
  from (
    values
      ('vw_app_aiworker_runtime_control_profile_v1'),
      ('vw_app_aiworker_runtime_control_prompt_fragment_v1'),
      ('vw_app_aiworker_runtime_execution_app_read_payload_v1'),
      ('vw_robot_brain_effective_access_v1'),
      ('vw_robot_brain_compact_context_v1'),
      ('vw_robot_readable_brain_runtime_material_v1'),
      ('vw_robot_readable_brain_runtime_material_v2'),
      ('vw_robot_readable_brain_runtime_material_v3'),
      ('vw_robot_readable_brain_runtime_material_canon_v1'),
      ('vw_robot_readable_brain_runtime_material_coverage_v1'),
      ('vw_app_aiworker_model_selection_source_for_capability_v1'),
      ('vw_app_aiworker_model_selection_capability_card_v1'),
      ('vw_app_aiworker_robot_selection_card_v1')
  ) v(table_name)
)
select jsonb_build_object(
  'task_domain_all_6_present', (select count(*) from task_domain where present_flag) = 6,
  'model_policy_all_6_present', (select count(*) from model_policy where hit_count > 0) = 6,
  'role_policy_all_6_present', (select count(*) from role_policy where hit_count > 0) = 6,
  'role_capability_all_6_present', (select count(*) from role_capability where hit_count > 0) = 6,
  'task_domain_missing', (select coalesce(jsonb_agg(domain_code order by domain_code), '[]'::jsonb) from task_domain where not present_flag),
  'model_policy_missing', (select coalesce(jsonb_agg(domain_code order by domain_code), '[]'::jsonb) from model_policy where hit_count = 0),
  'role_policy_missing', (select coalesce(jsonb_agg(domain_code order by domain_code), '[]'::jsonb) from role_policy where hit_count = 0),
  'role_capability_missing', (select coalesce(jsonb_agg(domain_code order by domain_code), '[]'::jsonb) from role_capability where hit_count = 0),
  'runtime_candidate_view_count', (select count(*) from view_catalog where exists_flag),
  'runtime_candidate_views_missing_count', (select count(*) from view_catalog where not exists_flag),
  'runtime_candidate_views_missing', (select coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb) from view_catalog where not exists_flag)
)::text as verify_bool_json;
