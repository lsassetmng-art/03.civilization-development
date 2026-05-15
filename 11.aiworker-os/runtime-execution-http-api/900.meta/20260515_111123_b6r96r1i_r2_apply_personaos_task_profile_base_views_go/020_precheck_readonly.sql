\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'precheck',
  'personaos_schema_exists', exists(select 1 from information_schema.schemata where schema_name = 'personaos'),
  'aiworker_schema_exists', exists(select 1 from information_schema.schemata where schema_name = 'aiworker'),
  'active_task_domain_count', (
    select count(*) from aiworker.business_support_task_domain where status_code = 'active'
  ),
  'existing_base_view_count_before', (
    select count(*)
    from information_schema.tables
    where table_schema = 'personaos'
      and table_name in (
        'vw_persona_task_domain_mapping_v1',
        'vw_persona_task_profile_required_parameter_v1',
        'vw_persona_task_profile_responsibility_note_v1'
      )
  )
)::text;
