\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with fk as (
  select
    con.conname as constraint_name,
    srcn.nspname as source_schema,
    srcc.relname as source_table,
    tgtn.nspname as referenced_schema,
    tgtc.relname as referenced_table,
    sa.attname as source_column,
    ta.attname as referenced_column,
    pg_get_constraintdef(con.oid) as constraint_def
  from pg_constraint con
  join pg_class srcc on srcc.oid = con.conrelid
  join pg_namespace srcn on srcn.oid = srcc.relnamespace
  join pg_class tgtc on tgtc.oid = con.confrelid
  join pg_namespace tgtn on tgtn.oid = tgtc.relnamespace
  join unnest(con.conkey, con.confkey) with ordinality as u(source_attnum, referenced_attnum, ord) on true
  join pg_attribute sa on sa.attrelid = con.conrelid and sa.attnum = u.source_attnum
  join pg_attribute ta on ta.attrelid = con.confrelid and ta.attnum = u.referenced_attnum
  where con.contype = 'f'
    and srcn.nspname = 'aiworker'
    and srcc.relname = 'business_support_role_domain_capability'
    and sa.attname = 'package_code'
)
select jsonb_build_object(
  'record_type', 'package_code_fk',
  'rows', coalesce(jsonb_agg(to_jsonb(fk) order by constraint_name), '[]'::jsonb)
)::text
from fk;

select jsonb_build_object(
  'record_type', 'role_domain_capability_structure',
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
  and table_name = 'business_support_role_domain_capability';
