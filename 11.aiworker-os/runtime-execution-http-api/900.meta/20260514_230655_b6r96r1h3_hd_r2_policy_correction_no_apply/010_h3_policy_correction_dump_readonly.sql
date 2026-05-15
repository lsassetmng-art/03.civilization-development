\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with target_tables(schema_name, table_name, purpose) as (
  values
    ('aiworker','business_support_role_domain_capability','role_domain_capability_candidate'),
    ('aiworker','business_support_role_control','role_control_candidate'),
    ('aiworker','command_authority_role_catalog','command_authority_role_candidate'),
    ('aiworker','worker_role_class_catalog','worker_role_class_candidate'),
    ('aiworker','worker_domain_proficiency','worker_domain_proficiency_candidate'),
    ('aiworker','worker_role_proficiency','worker_role_proficiency_candidate'),
    ('aiworker','robot_model_capability_profile','robot_model_capability_candidate'),
    ('aiworker','worker_model_capability_profile','worker_model_capability_candidate'),
    ('aiworker','robot_brain_model_domain_policy','brain_model_domain_policy_candidate'),
    ('aiworker','robot_brain_role_policy','brain_role_policy_candidate'),
    ('aiworker','robot_breadth_domain_runtime_policy','brain_breadth_runtime_policy_candidate'),
    ('aiworker','robot_brain_access_tier_catalog','brain_access_tier_candidate'),
    ('aiworker','robot_brain_reference_tier_policy','brain_reference_tier_candidate'),
    ('aiworker','robot_brain_series_profile','brain_series_profile_candidate'),
    ('aiworker','robot_model_personality_profile','robot_personality_candidate'),
    ('aiworker','model_public_registry','model_registry_candidate'),
    ('aiworker','worker_model_catalog','worker_model_catalog_candidate'),
    ('aiworker','robot_material_model_identifier_canon','model_identifier_canon_candidate'),
    ('aiworker','business_support_task_domain','task_domain_catalog')
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
  'record_type', 'target_domains',
  'source_table', 'aiworker.business_support_task_domain',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t.sort_order nulls last, t.task_domain_code), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.business_support_task_domain
  where task_domain_code in (
    'security_crisis_response',
    'fictional_combat_design',
    'game_tactical_balance',
    'defense_planning_non_harmful',
    'threat_modeling_safe',
    'combat_lore_reference'
  )
) t;

select jsonb_build_object(
  'record_type', 'r2_model_candidates',
  'source_table', 'aiworker.model_public_registry',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.model_public_registry t
  where to_jsonb(t)::text ~* '(HD-R2|R2S|R2G|R2T|HD_R2|R2_|戦闘|スナイパー|ジェネラル|オリジン|origin|sniper|general|combat|battler)'
  limit 200
) t;

select jsonb_build_object(
  'record_type', 'r2_model_candidates',
  'source_table', 'aiworker.worker_model_catalog',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.worker_model_catalog t
  where to_jsonb(t)::text ~* '(HD-R2|R2S|R2G|R2T|HD_R2|R2_|戦闘|スナイパー|ジェネラル|オリジン|origin|sniper|general|combat|battler)'
  limit 200
) t;

select jsonb_build_object(
  'record_type', 'r2_model_candidates',
  'source_table', 'aiworker.robot_material_model_identifier_canon',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.robot_material_model_identifier_canon t
  where to_jsonb(t)::text ~* '(HD-R2|R2S|R2G|R2T|HD_R2|R2_|戦闘|スナイパー|ジェネラル|オリジン|origin|sniper|general|combat|battler)'
  limit 200
) t;

select jsonb_build_object(
  'record_type', 'r2_model_candidates',
  'source_table', 'aiworker.robot_model_capability_profile',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.robot_model_capability_profile t
  where to_jsonb(t)::text ~* '(HD-R2|R2S|R2G|R2T|HD_R2|R2_|戦闘|スナイパー|ジェネラル|オリジン|origin|sniper|general|combat|battler)'
  limit 200
) t;

select jsonb_build_object(
  'record_type', 'role_candidates',
  'source_table', 'aiworker.business_support_role_control',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.business_support_role_control t
  where to_jsonb(t)::text ~* '(combat|security|sniper|general|origin|battler|戦闘|警備|危機|スナイパー|ジェネラル|オリジン)'
  limit 200
) t;

select jsonb_build_object(
  'record_type', 'role_candidates',
  'source_table', 'aiworker.worker_role_class_catalog',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.worker_role_class_catalog t
  where to_jsonb(t)::text ~* '(combat|security|sniper|general|origin|battler|戦闘|警備|危機|スナイパー|ジェネラル|オリジン)'
  limit 200
) t;
