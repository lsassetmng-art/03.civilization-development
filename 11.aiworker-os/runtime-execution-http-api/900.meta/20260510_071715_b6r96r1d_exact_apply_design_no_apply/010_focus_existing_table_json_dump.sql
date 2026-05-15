\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with target_tables(schema_name, table_name, responsibility) as (
  values
    ('aiworker','business_support_task_domain','common_task_domain_candidate'),
    ('aiworker','business_support_role_domain_capability','role_domain_capability_candidate'),
    ('aiworker','worker_domain_proficiency','worker_task_proficiency_candidate'),
    ('aiworker','worker_role_proficiency','worker_role_proficiency_candidate'),
    ('aiworker','worker_capability_snapshot','worker_capability_snapshot_candidate'),
    ('aiworker','worker_model_capability_profile','worker_model_capability_candidate'),
    ('aiworker','robot_model_capability_profile','robot_model_capability_candidate'),
    ('aiworker','robot_model_personality_profile','robot_personality_candidate'),
    ('aiworker','robot_series_capability_default','robot_series_capability_candidate'),
    ('aiworker','series_tendency_profile','series_tendency_candidate'),
    ('aiworker','beyond_model_quality_profile','beyond_quality_candidate'),
    ('aiworker','megami_model_profile','megami_profile_candidate'),
    ('aiworker','robot_brain_model_domain_policy','brain_model_domain_policy_candidate'),
    ('aiworker','robot_brain_role_policy','brain_role_policy_candidate'),
    ('aiworker','robot_breadth_domain_runtime_policy','brain_breadth_runtime_policy_candidate'),
    ('personaos','persona_parameter_state','persona_current_parameter_candidate'),
    ('personaos','persona_parameter_value','persona_parameter_value_candidate'),
    ('personaos','growth_axis','persona_growth_axis_candidate'),
    ('personaos','growth_core_state','persona_growth_core_state_candidate'),
    ('personaos','persona_growth_state','persona_growth_state_candidate'),
    ('personaos','memory_state','persona_memory_state_candidate'),
    ('personaos','growth_events','persona_growth_event_candidate'),
    ('personaos','memory_events','persona_memory_event_candidate'),
    ('personaos','personas','persona_master_candidate'),
    ('personaos','persona_state','persona_state_candidate')
),
columns_json as (
  select
    tt.schema_name,
    tt.table_name,
    tt.responsibility,
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
    ) as columns
  from target_tables tt
  left join information_schema.columns c
    on c.table_schema = tt.schema_name
   and c.table_name = tt.table_name
  group by tt.schema_name, tt.table_name, tt.responsibility
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
indexes_json as (
  select
    tt.schema_name,
    tt.table_name,
    jsonb_agg(
      jsonb_build_object(
        'indexname', i.indexname,
        'indexdef', i.indexdef
      )
      order by i.indexname
    ) filter (where i.indexname is not null) as indexes
  from target_tables tt
  left join pg_indexes i
    on i.schemaname = tt.schema_name
   and i.tablename = tt.table_name
  group by tt.schema_name, tt.table_name
)
select jsonb_build_object(
  'record_type', 'table_structure',
  'schema_name', c.schema_name,
  'table_name', c.table_name,
  'responsibility', c.responsibility,
  'exists_flag', c.columns is not null and jsonb_array_length(coalesce(c.columns, '[]'::jsonb)) > 0,
  'columns', coalesce(c.columns, '[]'::jsonb),
  'constraints', coalesce(k.constraints, '[]'::jsonb),
  'indexes', coalesce(i.indexes, '[]'::jsonb)
)::text
from columns_json c
left join constraints_json k
  on k.schema_name = c.schema_name
 and k.table_name = c.table_name
left join indexes_json i
  on i.schema_name = c.schema_name
 and i.table_name = c.table_name
order by c.schema_name, c.table_name;

select jsonb_build_object(
  'record_type', 'existing_domain_codes',
  'source_table', 'aiworker.business_support_task_domain',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.business_support_task_domain
  limit 100
) t;

select jsonb_build_object(
  'record_type', 'existing_worker_domain_proficiency_sample',
  'source_table', 'aiworker.worker_domain_proficiency',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.worker_domain_proficiency
  limit 100
) t;

select jsonb_build_object(
  'record_type', 'existing_persona_parameter_value_sample',
  'source_table', 'personaos.persona_parameter_value',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t::text), '[]'::jsonb)
)::text
from (
  select *
  from personaos.persona_parameter_value
  limit 100
) t;

select jsonb_build_object(
  'record_type', 'existing_growth_axis_sample',
  'source_table', 'personaos.growth_axis',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t::text), '[]'::jsonb)
)::text
from (
  select *
  from personaos.growth_axis
  limit 100
) t;
