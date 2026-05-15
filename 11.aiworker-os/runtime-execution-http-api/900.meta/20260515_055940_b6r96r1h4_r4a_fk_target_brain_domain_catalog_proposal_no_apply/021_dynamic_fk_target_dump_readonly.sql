\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'resolved_fk_target',
  'referenced_schema', 'cx22073jw',
  'referenced_table', 'brain_data_domain_catalog',
  'referenced_column', 'brain_domain_code',
  'constraint_name', 'robot_brain_model_domain_policy_brain_domain_code_fkey',
  'constraint_def', 'FOREIGN KEY (brain_domain_code) REFERENCES cx22073jw.brain_data_domain_catalog(brain_domain_code)'
)::text;

select jsonb_build_object(
  'record_type', 'target_table_structure',
  'schema_name', 'cx22073jw',
  'table_name', 'brain_data_domain_catalog',
  'table_ref', 'cx22073jw.brain_data_domain_catalog',
  'referenced_column', 'brain_domain_code',
  'columns', coalesce(jsonb_agg(jsonb_build_object(
    'ordinal_position', ordinal_position,
    'column_name', column_name,
    'data_type', data_type,
    'udt_name', udt_name,
    'is_nullable', is_nullable,
    'column_default', column_default
  ) order by ordinal_position), '[]'::jsonb)
)::text
from information_schema.columns
where table_schema = 'cx22073jw'
  and table_name = 'brain_data_domain_catalog';

select jsonb_build_object(
  'record_type', 'target_constraints',
  'schema_name', 'cx22073jw',
  'table_name', 'brain_data_domain_catalog',
  'constraints', coalesce(jsonb_agg(jsonb_build_object(
    'constraint_name', con.conname,
    'constraint_type', con.contype,
    'constraint_def', pg_get_constraintdef(con.oid)
  ) order by con.contype, con.conname), '[]'::jsonb)
)::text
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_constraint con on con.conrelid = c.oid
where n.nspname = 'cx22073jw'
  and c.relname = 'brain_data_domain_catalog'
group by n.nspname, c.relname;

select jsonb_build_object(
  'record_type', 'target_existing_rows',
  'schema_name', 'cx22073jw',
  'table_name', 'brain_data_domain_catalog',
  'referenced_column', 'brain_domain_code',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)
)::text
from (select * from "cx22073jw"."brain_data_domain_catalog" limit 500) t;

select jsonb_build_object(
  'record_type', 'target_existing_six_check',
  'schema_name', 'cx22073jw',
  'table_name', 'brain_data_domain_catalog',
  'referenced_column', 'brain_domain_code',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)
)::text
from (
  select * from "cx22073jw"."brain_data_domain_catalog"
  where "brain_domain_code" in (
    'security_crisis_response',
    'fictional_combat_design',
    'game_tactical_balance',
    'defense_planning_non_harmful',
    'threat_modeling_safe',
    'combat_lore_reference'
  )
) t;
