\pset pager off
\pset null '(null)'
\pset format aligned

select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  pg_get_function_result(p.oid) as result_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'aiworker'
  and p.proname in (
    'fn_runtime_execution_create_request_with_route_v1',
    'fn_runtime_execution_submit_worker_output',
    'fn_runtime_execution_mark_delivery_ready'
  )
order by p.proname;
