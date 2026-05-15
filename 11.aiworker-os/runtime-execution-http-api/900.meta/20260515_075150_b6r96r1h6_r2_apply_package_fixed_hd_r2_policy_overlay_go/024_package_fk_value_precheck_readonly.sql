\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with extracted as (
  select jsonb_array_elements_text(('{  "package_codes": [    "BUSINESS_SUPPORT_WLM_V0"  ]}'::jsonb)->'package_codes') as package_code
),
fk as (
  select
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
    and srcc.relname = 'business_support_role_domain_capability'
    and sa.attname = 'package_code'
  limit 1
)
select jsonb_build_object(
  'record_type', 'package_code_precheck',
  'extracted_package_codes', (select coalesce(jsonb_agg(package_code order by package_code), '[]'::jsonb) from extracted),
  'fk_target', (select to_jsonb(fk) from fk),
  'note', 'actual value check occurs at apply if target is dynamic'
)::text;
