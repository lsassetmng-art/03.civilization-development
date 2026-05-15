\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'schema_list',
  'rows', coalesce(jsonb_agg(schema_name order by schema_name), '[]'::jsonb)
)::text
from information_schema.schemata
where schema_name in ('personaos','aiworker','business','cx22073jw');

select jsonb_build_object(
  'record_type', 'personaos_tables',
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
    table_name ilike '%persona%'
    or table_name ilike '%parameter%'
    or table_name ilike '%growth%'
    or table_name ilike '%memory%'
  );

select jsonb_build_object(
  'record_type', 'personaos_columns',
  'rows', coalesce(jsonb_agg(
    jsonb_build_object(
      'table_schema', table_schema,
      'table_name', table_name,
      'ordinal_position', ordinal_position,
      'column_name', column_name,
      'data_type', data_type,
      'udt_name', udt_name,
      'is_nullable', is_nullable,
      'column_default', column_default
    )
    order by table_name, ordinal_position
  ), '[]'::jsonb)
)::text
from information_schema.columns
where table_schema = 'personaos'
  and table_name in (
    'personas',
    'persona_state',
    'persona_parameter_state',
    'persona_parameter_value',
    'persona_growth_state',
    'growth_axis',
    'growth_core_state',
    'growth_events',
    'memory_state',
    'memory_events',
    'persona_character_map',
    'persona_snapshot',
    'vtuber_parameter_state'
  );

select jsonb_build_object(
  'record_type', 'personaos_constraints',
  'rows', coalesce(jsonb_agg(
    jsonb_build_object(
      'schema_name', n.nspname,
      'table_name', c.relname,
      'constraint_name', con.conname,
      'constraint_type', con.contype,
      'constraint_def', pg_get_constraintdef(con.oid)
    )
    order by c.relname, con.contype, con.conname
  ), '[]'::jsonb)
)::text
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'personaos'
  and c.relname in (
    'personas',
    'persona_state',
    'persona_parameter_state',
    'persona_parameter_value',
    'persona_growth_state',
    'growth_axis',
    'growth_core_state',
    'growth_events',
    'memory_state',
    'memory_events',
    'persona_character_map',
    'persona_snapshot',
    'vtuber_parameter_state'
  );

select jsonb_build_object(
  'record_type', 'aiworker_task_domain_rows',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t.task_domain_code), '[]'::jsonb)
)::text
from aiworker.business_support_task_domain t;

select jsonb_build_object(
  'record_type', 'aiworker_task_domain_columns',
  'rows', coalesce(jsonb_agg(
    jsonb_build_object(
      'table_schema', table_schema,
      'table_name', table_name,
      'ordinal_position', ordinal_position,
      'column_name', column_name,
      'data_type', data_type,
      'udt_name', udt_name,
      'is_nullable', is_nullable,
      'column_default', column_default
    )
    order by ordinal_position
  ), '[]'::jsonb)
)::text
from information_schema.columns
where table_schema = 'aiworker'
  and table_name = 'business_support_task_domain';

select jsonb_build_object(
  'record_type', 'persona_existing_task_profile_views',
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
    or table_name ilike '%capability%'
    or table_name ilike '%domain%'
  );
