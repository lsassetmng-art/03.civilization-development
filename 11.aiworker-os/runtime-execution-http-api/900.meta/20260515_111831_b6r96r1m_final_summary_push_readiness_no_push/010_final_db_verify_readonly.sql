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
persona_views(view_name) as (
  values
    ('vw_persona_task_domain_mapping_v1'),
    ('vw_persona_task_profile_required_parameter_v1'),
    ('vw_persona_task_profile_responsibility_note_v1')
),
persona_view_check as (
  select
    v.view_name,
    exists (
      select 1
      from information_schema.tables t
      where t.table_schema = 'personaos'
        and t.table_name = v.view_name
    ) as exists_flag
  from persona_views v
),
persona_mapping as (
  select
    count(*)::integer as total_count,
    count(*) filter (
      where task_domain_code in (
        'security_crisis_response',
        'fictional_combat_design',
        'game_tactical_balance',
        'defense_planning_non_harmful',
        'threat_modeling_safe',
        'combat_lore_reference'
      )
      and safety_profile_code = 'restricted_safe_fiction_defense_lore_only'
    )::integer as restricted_count
  from personaos.vw_persona_task_domain_mapping_v1
),
persona_required_parameter as (
  select count(*)::integer as row_count
  from personaos.vw_persona_task_profile_required_parameter_v1
),
persona_responsibility as (
  select
    count(*)::integer as row_count,
    exists (
      select 1
      from personaos.vw_persona_task_profile_responsibility_note_v1
      where responsibility_note_ja like '%AIWorkerOS%'
    ) as has_aiworker_boundary_note
)
select jsonb_build_object(
  'hd_r2_task_domain_all_6_present', (select count(*) from task_domain where present_flag) = 6,
  'hd_r2_model_policy_all_6_present', (select count(*) from model_policy where hit_count > 0) = 6,
  'hd_r2_role_policy_all_6_present', (select count(*) from role_policy where hit_count > 0) = 6,
  'hd_r2_role_capability_all_6_present', (select count(*) from role_capability where hit_count > 0) = 6,
  'personaos_all_3_base_views_exist', (select count(*) from persona_view_check where exists_flag) = 3,
  'personaos_mapping_row_count', (select total_count from persona_mapping),
  'personaos_restricted_6_mapping_present', (select restricted_count from persona_mapping) = 6,
  'personaos_required_parameter_row_count', (select row_count from persona_required_parameter),
  'personaos_responsibility_row_count', (select row_count from persona_responsibility),
  'personaos_has_aiworker_boundary_note', (select has_aiworker_boundary_note from persona_responsibility),
  'missing_persona_views', (select coalesce(jsonb_agg(view_name order by view_name), '[]'::jsonb) from persona_view_check where not exists_flag),
  'missing_hd_r2_task_domains', (select coalesce(jsonb_agg(domain_code order by domain_code), '[]'::jsonb) from task_domain where not present_flag),
  'missing_hd_r2_model_policy', (select coalesce(jsonb_agg(domain_code order by domain_code), '[]'::jsonb) from model_policy where hit_count = 0),
  'missing_hd_r2_role_policy', (select coalesce(jsonb_agg(domain_code order by domain_code), '[]'::jsonb) from role_policy where hit_count = 0),
  'missing_hd_r2_role_capability', (select coalesce(jsonb_agg(domain_code order by domain_code), '[]'::jsonb) from role_capability where hit_count = 0)
)::text as final_verify_bool_json;
