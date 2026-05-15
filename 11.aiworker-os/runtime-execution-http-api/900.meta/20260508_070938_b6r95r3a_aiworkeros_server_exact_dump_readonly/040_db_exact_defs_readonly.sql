\pset pager off
\pset null '(null)'
\pset format wrapped
\pset columns 240

select
  now() as collected_at,
  current_database() as database_name,
  current_user as current_user_name;

-- exact tables
select
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable
from information_schema.columns
where table_schema = 'aiworker'
  and table_name in (
    'runtime_execution_request',
    'runtime_worker_output',
    'runtime_output_artifact',
    'runtime_delivery_package'
  )
order by table_schema, table_name, ordinal_position;

-- exact business target table existing columns
select
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable
from information_schema.columns
where table_schema = 'business'
  and table_name in (
    'ai_company_manager_deliverable',
    'aicm_human_review_item',
    'aicm_worker_work_unit'
  )
order by table_schema, table_name, ordinal_position;

-- exact function definitions
select
  '===== FUNCTION ' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ') =====' as object_header,
  pg_get_functiondef(p.oid) as object_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'aiworker'
  and p.proname in (
    'fn_runtime_execution_create_request_with_route_v1',
    'fn_runtime_execution_submit_worker_output',
    'fn_runtime_execution_mark_delivery_ready'
  )
order by p.proname;

-- exact app-read view definition
select
  '===== VIEW ' || schemaname || '.' || viewname || ' =====' as object_header,
  definition as object_definition
from pg_views
where schemaname = 'aiworker'
  and viewname = 'vw_app_aiworker_runtime_execution_app_read_payload_v1';

-- dependency sanity
select
  'runtime_execution_request' as target,
  count(*)::bigint as row_count
from aiworker.runtime_execution_request
union all
select
  'runtime_worker_output' as target,
  count(*)::bigint as row_count
from aiworker.runtime_worker_output
union all
select
  'runtime_output_artifact' as target,
  count(*)::bigint as row_count
from aiworker.runtime_output_artifact
union all
select
  'runtime_delivery_package' as target,
  count(*)::bigint as row_count
from aiworker.runtime_delivery_package
union all
select
  'business.ai_company_manager_deliverable' as target,
  count(*)::bigint as row_count
from business.ai_company_manager_deliverable;
