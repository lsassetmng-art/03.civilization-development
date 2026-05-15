\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'schema_check',
  'personaos_exists', exists(select 1 from information_schema.schemata where schema_name = 'personaos'),
  'aiworker_exists', exists(select 1 from information_schema.schemata where schema_name = 'aiworker')
)::text;

select jsonb_build_object(
  'record_type', 'task_domains',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t.sort_order nulls last, t.task_domain_code), '[]'::jsonb)
)::text
from aiworker.business_support_task_domain t
where t.status_code = 'active';

select jsonb_build_object(
  'record_type', 'personaos_parameter_tables',
  'rows', coalesce(jsonb_agg(
    jsonb_build_object(
      'table_schema', table_schema,
      'table_name', table_name,
      'table_type', table_type
    )
    order by table_name
  ), '[]'::jsonb)
)::text
from information_schema.tables
where table_schema = 'personaos'
  and (
    table_name ilike '%parameter%'
    or table_name ilike '%growth%'
    or table_name ilike '%memory%'
    or table_name ilike '%persona%'
  );

select jsonb_build_object(
  'record_type', 'personaos_parameter_columns',
  'rows', coalesce(jsonb_agg(
    jsonb_build_object(
      'table_name', table_name,
      'ordinal_position', ordinal_position,
      'column_name', column_name,
      'data_type', data_type,
      'udt_name', udt_name,
      'is_nullable', is_nullable
    )
    order by table_name, ordinal_position
  ), '[]'::jsonb)
)::text
from information_schema.columns
where table_schema = 'personaos'
  and (
    table_name ilike '%parameter%'
    or table_name ilike '%growth%'
    or table_name ilike '%memory%'
    or table_name ilike '%persona%'
  );

select jsonb_build_object(
  'record_type', 'existing_personaos_task_profile_objects',
  'rows', coalesce(jsonb_agg(
    jsonb_build_object(
      'table_schema', table_schema,
      'table_name', table_name,
      'table_type', table_type
    )
    order by table_name
  ), '[]'::jsonb)
)::text
from information_schema.tables
where table_schema = 'personaos'
  and (
    table_name ilike '%task%profile%'
    or table_name ilike '%work%profile%'
    or table_name ilike '%task%domain%'
  );
