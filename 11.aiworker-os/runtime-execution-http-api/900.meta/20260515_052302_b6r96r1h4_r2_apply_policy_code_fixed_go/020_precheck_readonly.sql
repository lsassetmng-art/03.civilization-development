\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 260

select now() as precheck_started_at;

with target_domains(domain_code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
)
select
  d.domain_code,
  exists (
    select 1
    from aiworker.business_support_task_domain t
    where t.task_domain_code = d.domain_code
      and t.status_code = 'active'
  ) as task_domain_active
from target_domains d
order by d.domain_code;

select
  'robot_brain_model_domain_policy' as source_table,
  count(*) as target_like_rows_before
from aiworker.robot_brain_model_domain_policy t
where to_jsonb(t)::text ~* '(security_crisis_response|fictional_combat_design|game_tactical_balance|defense_planning_non_harmful|threat_modeling_safe|combat_lore_reference)';

select
  'robot_brain_role_policy' as source_table,
  count(*) as target_like_rows_before
from aiworker.robot_brain_role_policy t
where to_jsonb(t)::text ~* '(security_crisis_response|fictional_combat_design|game_tactical_balance|defense_planning_non_harmful|threat_modeling_safe|combat_lore_reference)';

select
  'business_support_role_domain_capability' as source_table,
  count(*) as target_like_rows_before
from aiworker.business_support_role_domain_capability t
where to_jsonb(t)::text ~* '(security_crisis_response|fictional_combat_design|game_tactical_balance|defense_planning_non_harmful|threat_modeling_safe|combat_lore_reference)';
