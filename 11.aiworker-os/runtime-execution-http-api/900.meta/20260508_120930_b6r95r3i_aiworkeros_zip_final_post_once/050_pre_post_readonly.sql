\pset pager off
\pset null '(null)'
\pset format aligned

select
  'b6r95r3i_zip_final_20260508_120930' as idempotency_key,
  count(*)::bigint as existing_request_count
from aiworker.runtime_execution_request
where idempotency_key = 'b6r95r3i_zip_final_20260508_120930';

select count(*)::bigint as request_count_before
from aiworker.runtime_execution_request;

select count(*)::bigint as worker_output_count_before
from aiworker.runtime_worker_output;

select count(*)::bigint as artifact_count_before
from aiworker.runtime_output_artifact;
