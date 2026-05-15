\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with fk as (
  select
    con.conname as constraint_name,
    tgtn.nspname as referenced_schema,
    tgtc.relname as referenced_table,
    ta.attname as referenced_column
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
    and srcc.relname = 'robot_brain_model_domain_policy'
    and sa.attname = 'brain_domain_code'
  limit 1
)
select jsonb_build_object(
  'record_type', 'precheck_fk_target',
  'rows', coalesce(jsonb_agg(to_jsonb(fk)), '[]'::jsonb)
)::text
from fk;
