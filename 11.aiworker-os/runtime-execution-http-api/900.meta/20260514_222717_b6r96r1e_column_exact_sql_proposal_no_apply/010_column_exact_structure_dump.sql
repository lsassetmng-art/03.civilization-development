\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with target_tables(schema_name, table_name, purpose) as (
  values
    ('aiworker','business_support_task_domain','common_task_domain_catalog'),
    ('aiworker','business_support_role_domain_capability','role_domain_capability'),
    ('aiworker','worker_domain_proficiency','worker_domain_proficiency'),
    ('aiworker','worker_role_proficiency','worker_role_proficiency'),
    ('aiworker','worker_model_capability_profile','worker_model_capability'),
    ('aiworker','robot_model_capability_profile','robot_model_capability'),
    ('aiworker','robot_model_personality_profile','robot_model_personality'),
    ('aiworker','robot_brain_model_domain_policy','robot_brain_model_domain_policy'),
    ('aiworker','robot_brain_role_policy','robot_brain_role_policy'),
    ('aiworker','robot_breadth_domain_runtime_policy','robot_breadth_domain_runtime_policy'),
    ('personaos','persona_parameter_state','persona_parameter_state'),
    ('personaos','persona_parameter_value','persona_parameter_value'),
    ('personaos','growth_axis','growth_axis'),
    ('personaos','growth_core_state','growth_core_state'),
    ('personaos','persona_growth_state','persona_growth_state'),
    ('personaos','memory_state','memory_state'),
    ('personaos','growth_events','growth_events'),
    ('personaos','memory_events','memory_events')
),
columns_json as (
  select
    tt.schema_name,
    tt.table_name,
    tt.purpose,
    jsonb_agg(
      jsonb_build_object(
        'ordinal_position', c.ordinal_position,
        'column_name', c.column_name,
        'data_type', c.data_type,
        'udt_name', c.udt_name,
        'is_nullable', c.is_nullable,
        'column_default', c.column_default
      )
      order by c.ordinal_position
    ) filter (where c.column_name is not null) as columns
  from target_tables tt
  left join information_schema.columns c
    on c.table_schema = tt.schema_name
   and c.table_name = tt.table_name
  group by tt.schema_name, tt.table_name, tt.purpose
),
constraints_json as (
  select
    tt.schema_name,
    tt.table_name,
    jsonb_agg(
      jsonb_build_object(
        'constraint_name', con.conname,
        'constraint_type', con.contype,
        'constraint_def', pg_get_constraintdef(con.oid)
      )
      order by con.contype, con.conname
    ) filter (where con.oid is not null) as constraints
  from target_tables tt
  left join pg_namespace n
    on n.nspname = tt.schema_name
  left join pg_class cl
    on cl.relnamespace = n.oid
   and cl.relname = tt.table_name
  left join pg_constraint con
    on con.conrelid = cl.oid
  group by tt.schema_name, tt.table_name
),
row_counts as (
  select 'aiworker.business_support_task_domain' as table_ref, count(*)::bigint as row_count from aiworker.business_support_task_domain
  union all
  select 'aiworker.worker_domain_proficiency' as table_ref, count(*)::bigint as row_count from aiworker.worker_domain_proficiency
  union all
  select 'aiworker.worker_role_proficiency' as table_ref, count(*)::bigint as row_count from aiworker.worker_role_proficiency
  union all
  select 'personaos.persona_parameter_value' as table_ref, count(*)::bigint as row_count from personaos.persona_parameter_value
  union all
  select 'personaos.growth_axis' as table_ref, count(*)::bigint as row_count from personaos.growth_axis
)
select jsonb_build_object(
  'record_type', 'table_structure',
  'schema_name', c.schema_name,
  'table_name', c.table_name,
  'purpose', c.purpose,
  'exists_flag', coalesce(jsonb_array_length(c.columns), 0) > 0,
  'columns', coalesce(c.columns, '[]'::jsonb),
  'constraints', coalesce(k.constraints, '[]'::jsonb)
)::text
from columns_json c
left join constraints_json k
  on k.schema_name = c.schema_name
 and k.table_name = c.table_name
order by c.schema_name, c.table_name;

select jsonb_build_object(
  'record_type', 'row_counts',
  'rows', jsonb_agg(to_jsonb(row_counts) order by table_ref)
)::text
from row_counts;

select jsonb_build_object(
  'record_type', 'domain_sample',
  'source_table', 'aiworker.business_support_task_domain',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.business_support_task_domain
  limit 80
) t;

select jsonb_build_object(
  'record_type', 'growth_axis_sample',
  'source_table', 'personaos.growth_axis',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t::text), '[]'::jsonb)
)::text
from (
  select *
  from personaos.growth_axis
  limit 80
) t;
