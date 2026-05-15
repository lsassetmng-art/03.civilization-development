\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'brain_domain_catalog',
  'source_table', 'aiworker.brain_data_domain_catalog',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t.brain_domain_code), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.brain_data_domain_catalog
  limit 500
) t;

select jsonb_build_object(
  'record_type', 'task_domains',
  'source_table', 'aiworker.business_support_task_domain',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t.sort_order nulls last, t.task_domain_code), '[]'::jsonb)
)::text
from (
  select *
  from aiworker.business_support_task_domain
  where task_domain_code in (
    'security_crisis_response',
    'fictional_combat_design',
    'game_tactical_balance',
    'defense_planning_non_harmful',
    'threat_modeling_safe',
    'combat_lore_reference'
  )
) t;

select jsonb_build_object(
  'record_type', 'model_policy_existing_values',
  'source_table', 'aiworker.robot_brain_model_domain_policy',
  'rows', coalesce(jsonb_agg(to_jsonb(t) order by t.row_count desc, t.brain_domain_code), '[]'::jsonb)
)::text
from (
  select brain_domain_code, policy_code, count(*)::bigint as row_count
  from aiworker.robot_brain_model_domain_policy
  group by brain_domain_code, policy_code
) t;

select jsonb_build_object(
  'record_type', 'model_policy_structure',
  'source_table', 'aiworker.robot_brain_model_domain_policy',
  'columns', coalesce(jsonb_agg(
    jsonb_build_object(
      'ordinal_position', ordinal_position,
      'column_name', column_name,
      'data_type', data_type,
      'udt_name', udt_name,
      'is_nullable', is_nullable,
      'column_default', column_default
    )
    order by ordinal_position
  ), '[]'::jsonb)
)::text
from information_schema.columns
where table_schema = 'aiworker'
  and table_name = 'robot_brain_model_domain_policy';
