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
    jsonb_agg(
      jsonb_build_object(
        'source_column', sa.attname,
        'referenced_column', ta.attname,
        'source_attnum', u.source_attnum,
        'referenced_attnum', u.referenced_attnum
      )
      order by u.ord
    ) as column_map,
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
    and srcc.relname = 'robot_brain_model_domain_policy'
  group by con.conname, srcn.nspname, srcc.relname, tgtn.nspname, tgtc.relname, pg_get_constraintdef(con.oid)
)
select jsonb_build_object(
  'record_type', 'fk_references',
  'rows', coalesce(jsonb_agg(to_jsonb(fk) order by constraint_name), '[]'::jsonb)
)::text
from fk;

select jsonb_build_object(
  'record_type', 'brain_data_domain_catalog_candidates',
  'rows', coalesce(jsonb_agg(
    jsonb_build_object(
      'schema_name', n.nspname,
      'table_name', c.relname,
      'table_ref', n.nspname || '.' || c.relname
    )
    order by n.nspname, c.relname
  ), '[]'::jsonb)
)::text
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind in ('r','p','v','m')
  and c.relname = 'brain_data_domain_catalog';

select jsonb_build_object(
  'record_type', 'all_brain_domain_like_tables',
  'rows', coalesce(jsonb_agg(
    jsonb_build_object(
      'schema_name', table_schema,
      'table_name', table_name,
      'table_type', table_type
    )
    order by table_schema, table_name
  ), '[]'::jsonb)
)::text
from information_schema.tables
where table_name ilike '%brain%domain%'
   or table_name ilike '%domain%catalog%';
