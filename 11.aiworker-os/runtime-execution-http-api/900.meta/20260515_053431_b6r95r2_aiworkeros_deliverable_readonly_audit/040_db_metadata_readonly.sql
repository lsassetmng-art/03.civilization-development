\pset pager off
\pset null '(null)'
\pset format aligned

select
  now() as collected_at,
  current_database() as database_name,
  current_user as current_user_name;

select
  nspname as schema_name
from pg_namespace
where nspname in ('aiworker', 'business', 'cx22073jw')
order by nspname;

select
  table_schema,
  table_name,
  table_type
from information_schema.tables
where table_schema in ('aiworker', 'business')
  and (
    lower(table_name) ~ '(runtime|execution|request|response|result|output|artifact|deliverable|content|body|markdown|payload|delivery|review|work_unit|worker)'
  )
order by table_schema, table_name;

select
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable
from information_schema.columns
where table_schema in ('aiworker', 'business')
  and (
    lower(table_name || ' ' || column_name) ~ '(runtime|execution|request|response|result|output|artifact|deliverable|content|body|markdown|payload|delivery|summary|message|review|work_unit|worker|source_route|status)'
  )
order by table_schema, table_name, ordinal_position;

select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_function_result(p.oid) as result_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('aiworker', 'business')
  and lower(p.proname) ~ '(runtime|execution|request|response|result|output|artifact|deliverable|content|body|markdown|payload|delivery|review|worker)'
order by n.nspname, p.proname, pg_get_function_identity_arguments(p.oid);

select
  schemaname,
  viewname
from pg_views
where schemaname in ('aiworker', 'business')
  and lower(viewname) ~ '(runtime|execution|request|response|result|output|artifact|deliverable|content|body|markdown|payload|delivery|review|worker)'
order by schemaname, viewname;
