\pset pager off
\echo ============================================================
\echo AICompanyManager read-only company table discovery
\echo ============================================================

begin read only;

\echo ------------------------------------------------------------
\echo 1. business schema company-like tables
\echo ------------------------------------------------------------
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'business'
  and table_type = 'BASE TABLE'
  and (
    table_name ilike '%company%'
    or table_name ilike '%ai%enterprise%'
    or table_name ilike '%enterprise%'
  )
order by table_name;

\echo ------------------------------------------------------------
\echo 2. company-like columns in business schema
\echo ------------------------------------------------------------
select
  table_schema,
  table_name,
  string_agg(column_name, ', ' order by ordinal_position) as columns
from information_schema.columns
where table_schema = 'business'
  and (
    column_name ilike '%company%'
    or column_name in ('id','name','business_domain','company_name','company_id','company_status','deleted_at','active_flag')
  )
group by table_schema, table_name
having bool_or(column_name in ('company_id','company_name','business_domain'))
    or table_name ilike '%company%'
order by table_name;

\echo ------------------------------------------------------------
\echo 3. exact candidate table row counts
\echo ------------------------------------------------------------
do $$
declare
  r record;
  sql text;
begin
  for r in
    select table_schema, table_name
    from information_schema.tables
    where table_schema = 'business'
      and table_type = 'BASE TABLE'
      and table_name ilike '%company%'
    order by table_name
  loop
    sql := format(
      'select %L as table_name, count(*) as total_rows from %I.%I',
      r.table_schema || '.' || r.table_name,
      r.table_schema,
      r.table_name
    );
    raise notice '%', sql;
    execute sql;
  end loop;
end $$;

\echo ------------------------------------------------------------
\echo 4. likely active company rows from common table names
\echo ------------------------------------------------------------

select 'business.company' as table_name, count(*) as total_rows
from business.company
where to_regclass('business.company') is not null;

rollback;
