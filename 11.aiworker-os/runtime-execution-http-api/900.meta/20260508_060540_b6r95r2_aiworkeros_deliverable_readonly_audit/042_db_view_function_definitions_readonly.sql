\pset pager off
\pset null '(null)'
\pset format wrapped
\pset columns 220

select
  '===== VIEW ' || schemaname || '.' || viewname || ' =====' as object_header,
  definition as object_definition
from pg_views
where schemaname in ('aiworker', 'business')
  and lower(viewname) ~ '(runtime|execution|request|response|result|output|artifact|deliverable|content|body|markdown|payload|delivery|review|worker)'
order by schemaname, viewname;

select
  '===== FUNCTION ' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ') =====' as object_header,
  pg_get_functiondef(p.oid) as object_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('aiworker', 'business')
  and lower(p.proname) ~ '(runtime|execution|request|response|result|output|artifact|deliverable|content|body|markdown|payload|delivery|review|worker)'
order by n.nspname, p.proname, pg_get_function_identity_arguments(p.oid);
