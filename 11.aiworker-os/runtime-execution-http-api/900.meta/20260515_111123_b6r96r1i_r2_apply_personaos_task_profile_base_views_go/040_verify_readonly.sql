\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with required_views(view_name) as (
  values
    ('vw_persona_task_domain_mapping_v1'),
    ('vw_persona_task_profile_required_parameter_v1'),
    ('vw_persona_task_profile_responsibility_note_v1')
),
view_check as (
  select
    r.view_name,
    exists (
      select 1
      from information_schema.tables t
      where t.table_schema = 'personaos'
        and t.table_name = r.view_name
    ) as exists_flag
  from required_views r
),
mapping_rows as (
  select count(*)::integer as row_count
  from personaos.vw_persona_task_domain_mapping_v1
),
required_parameter_rows as (
  select count(*)::integer as row_count
  from personaos.vw_persona_task_profile_required_parameter_v1
),
responsibility_rows as (
  select count(*)::integer as row_count
  from personaos.vw_persona_task_profile_responsibility_note_v1
),
restricted_mapping as (
  select count(*)::integer as row_count
  from personaos.vw_persona_task_domain_mapping_v1
  where task_domain_code in (
    'security_crisis_response',
    'fictional_combat_design',
    'game_tactical_balance',
    'defense_planning_non_harmful',
    'threat_modeling_safe',
    'combat_lore_reference'
  )
    and safety_profile_code = 'restricted_safe_fiction_defense_lore_only'
)
select jsonb_build_object(
  'all_3_views_exist', (select count(*) from view_check where exists_flag) = 3,
  'missing_views', (select coalesce(jsonb_agg(view_name order by view_name), '[]'::jsonb) from view_check where not exists_flag),
  'mapping_row_count', (select row_count from mapping_rows),
  'required_parameter_row_count', (select row_count from required_parameter_rows),
  'responsibility_row_count', (select row_count from responsibility_rows),
  'restricted_6_mapping_present', (select row_count from restricted_mapping) = 6,
  'restricted_mapping_row_count', (select row_count from restricted_mapping),
  'has_aiworker_boundary_note', exists (
    select 1
    from personaos.vw_persona_task_profile_responsibility_note_v1
    where responsibility_note_ja like '%AIWorkerOS%'
  )
)::text as verify_bool_json;
