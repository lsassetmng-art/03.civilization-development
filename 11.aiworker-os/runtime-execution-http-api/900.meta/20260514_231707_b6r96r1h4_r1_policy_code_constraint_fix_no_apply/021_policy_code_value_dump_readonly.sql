\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'policy_code_values',
  'table_ref', 'aiworker.robot_brain_model_domain_policy',
  'column_name', 'policy_code',
  'values', coalesce(jsonb_agg(to_jsonb(v) order by v.row_count desc, v.value), '[]'::jsonb)
)::text
from (
  select policy_code::text as value, count(*)::bigint as row_count
  from aiworker.robot_brain_model_domain_policy
  group by policy_code
) v;

select jsonb_build_object(
  'record_type', 'policy_code_values',
  'table_ref', 'aiworker.robot_brain_role_policy',
  'column_name', 'policy_code',
  'values', coalesce(jsonb_agg(to_jsonb(v) order by v.row_count desc, v.value), '[]'::jsonb)
)::text
from (
  select policy_code::text as value, count(*)::bigint as row_count
  from aiworker.robot_brain_role_policy
  group by policy_code
) v;

