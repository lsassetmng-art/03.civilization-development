\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 240

select now() as audit_started_at;

select schema_name
from information_schema.schemata
where schema_name in (
  'aiworker',
  'persona',
  'personaos',
  'business',
  'cx22073jw',
  'app_common'
)
order by schema_name;

select schemaname, tablename
from pg_tables
where schemaname in ('aiworker', 'persona', 'personaos', 'business', 'cx22073jw', 'app_common')
  and (
    tablename ilike '%robot%'
    or tablename ilike '%worker%'
    or tablename ilike '%persona%'
    or tablename ilike '%model%'
    or tablename ilike '%series%'
    or tablename ilike '%trait%'
    or tablename ilike '%personality%'
    or tablename ilike '%parameter%'
    or tablename ilike '%memory%'
    or tablename ilike '%growth%'
    or tablename ilike '%experience%'
    or tablename ilike '%capability%'
    or tablename ilike '%profile%'
    or tablename ilike '%role%'
    or tablename ilike '%task%'
    or tablename ilike '%domain%'
    or tablename ilike '%brain%'
    or tablename ilike '%reference%'
  )
order by schemaname, tablename;

select schemaname, viewname
from pg_views
where schemaname in ('aiworker', 'persona', 'personaos', 'business', 'cx22073jw', 'app_common')
  and (
    viewname ilike '%robot%'
    or viewname ilike '%worker%'
    or viewname ilike '%persona%'
    or viewname ilike '%model%'
    or viewname ilike '%series%'
    or viewname ilike '%trait%'
    or viewname ilike '%personality%'
    or viewname ilike '%parameter%'
    or viewname ilike '%memory%'
    or viewname ilike '%growth%'
    or viewname ilike '%experience%'
    or viewname ilike '%capability%'
    or viewname ilike '%profile%'
    or viewname ilike '%role%'
    or viewname ilike '%task%'
    or viewname ilike '%domain%'
    or viewname ilike '%brain%'
    or viewname ilike '%reference%'
  )
order by schemaname, viewname;

select
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable
from information_schema.columns
where table_schema in ('aiworker', 'persona', 'personaos', 'business', 'cx22073jw', 'app_common')
  and (
    table_name ilike '%robot%'
    or table_name ilike '%worker%'
    or table_name ilike '%persona%'
    or table_name ilike '%profile%'
    or table_name ilike '%parameter%'
    or table_name ilike '%task%'
    or table_name ilike '%trait%'
    or table_name ilike '%personality%'
    or table_name ilike '%memory%'
    or table_name ilike '%growth%'
    or table_name ilike '%experience%'
    or table_name ilike '%capability%'
    or column_name ilike '%persona%'
    or column_name ilike '%robot%'
    or column_name ilike '%worker%'
    or column_name ilike '%profile%'
    or column_name ilike '%parameter%'
    or column_name ilike '%task%'
    or column_name ilike '%trait%'
    or column_name ilike '%personality%'
    or column_name ilike '%memory%'
    or column_name ilike '%growth%'
    or column_name ilike '%experience%'
    or column_name ilike '%depth%'
    or column_name ilike '%breadth%'
    or column_name ilike '%cx%'
  )
order by table_schema, table_name, ordinal_position;

select
  n.nspname as function_schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as result_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('aiworker', 'persona', 'personaos', 'business', 'cx22073jw', 'app_common')
  and (
    p.proname ilike '%robot%'
    or p.proname ilike '%worker%'
    or p.proname ilike '%persona%'
    or p.proname ilike '%profile%'
    or p.proname ilike '%parameter%'
    or p.proname ilike '%task%'
    or p.proname ilike '%trait%'
    or p.proname ilike '%personality%'
    or p.proname ilike '%memory%'
    or p.proname ilike '%growth%'
    or p.proname ilike '%experience%'
    or p.proname ilike '%capability%'
    or p.proname ilike '%runtime%'
  )
order by n.nspname, p.proname;
