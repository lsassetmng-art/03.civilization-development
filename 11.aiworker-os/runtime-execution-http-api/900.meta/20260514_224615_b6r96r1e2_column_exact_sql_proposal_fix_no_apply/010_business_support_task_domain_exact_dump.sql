\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'table_columns',
  'schema_name', 'aiworker',
  'table_name', 'business_support_task_domain',
  'columns', jsonb_agg(
    jsonb_build_object(
      'ordinal_position', ordinal_position,
      'column_name', column_name,
      'data_type', data_type,
      'udt_name', udt_name,
      'is_nullable', is_nullable,
      'column_default', column_default
    )
    order by ordinal_position
  )
)::text
from information_schema.columns
where table_schema = 'aiworker'
  and table_name = 'business_support_task_domain';

select jsonb_build_object(
  'record_type', 'constraints',
  'schema_name', n.nspname,
  'table_name', c.relname,
  'constraints', coalesce(jsonb_agg(
    jsonb_build_object(
      'constraint_name', con.conname,
      'constraint_type', con.contype,
      'constraint_def', pg_get_constraintdef(con.oid)
    )
    order by con.contype, con.conname
  ), '[]'::jsonb)
)::text
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_constraint con on con.conrelid = c.oid
where n.nspname = 'aiworker'
  and c.relname = 'business_support_task_domain'
group by n.nspname, c.relname;

select jsonb_build_object(
  'record_type', 'existing_rows',
  'schema_name', 'aiworker',
  'table_name', 'business_support_task_domain',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t.sort_order nulls last, t.task_domain_code), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.business_support_task_domain
  limit 200
) t;

select jsonb_build_object(
  'record_type', 'package_code_counts',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by row_count desc, package_code), '[]'::jsonb)
)::text
from (
  select package_code, count(*)::bigint as row_count
  from aiworker.business_support_task_domain
  group by package_code
  order by count(*) desc, package_code
) t;

select jsonb_build_object(
  'record_type', 'cx_topic_code_counts',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by row_count desc, cx_topic_code), '[]'::jsonb)
)::text
from (
  select cx_topic_code, count(*)::bigint as row_count
  from aiworker.business_support_task_domain
  group by cx_topic_code
  order by count(*) desc, cx_topic_code
  limit 50
) t;
