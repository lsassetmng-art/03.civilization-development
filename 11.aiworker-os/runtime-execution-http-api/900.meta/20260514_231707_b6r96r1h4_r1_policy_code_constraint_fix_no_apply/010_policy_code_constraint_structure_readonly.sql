\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with target_tables(schema_name, table_name) as (
  values
    ('aiworker','robot_brain_model_domain_policy'),
    ('aiworker','robot_brain_role_policy'),
    ('aiworker','business_support_role_domain_capability')
),
columns_json as (
  select
    tt.schema_name,
    tt.table_name,
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
  group by tt.schema_name, tt.table_name
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
  'table_ref', c.schema_name || '.' || c.table_name,
  'columns', coalesce(c.columns, '[]'::jsonb),
  'constraints', coalesce(k.constraints, '[]'::jsonb)
)::text
from columns_json c
left join constraints_json k
  on k.schema_name = c.schema_name
 and k.table_name = c.table_name
order by c.schema_name, c.table_name;
