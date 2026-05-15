\pset pager off
\pset null '(null)'
\pset format aligned

with target_tables as (
  select
    schemaname,
    tablename
  from pg_tables
  where schemaname in ('aiworker', 'business')
    and lower(tablename) ~ '(runtime|execution|request|response|result|output|artifact|deliverable|content|body|markdown|payload|delivery|review|work_unit|worker)'
)
select format(
  'select %L as relation_name, count(*)::bigint as row_count from %I.%I;',
  schemaname || '.' || tablename,
  schemaname,
  tablename
)
from target_tables
order by 1;
\gexec
