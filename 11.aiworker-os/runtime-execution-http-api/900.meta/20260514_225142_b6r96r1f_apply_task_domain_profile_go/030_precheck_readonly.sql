\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 240

with proposed(task_domain_code) as (
  values
    ('programming'),
    ('db_analysis'),
    ('document_writing'),
    ('research'),
    ('historical_reference'),
    ('ui_ux'),
    ('data_formatting'),
    ('review_audit'),
    ('customer_communication'),
    ('creative_planning'),
    ('operations_execution'),
    ('cx_reference_authoring'),
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
)
select
  p.task_domain_code,
  case when d.task_domain_code is null then 'MISSING_BEFORE_APPLY' else 'ALREADY_EXISTS_BEFORE_APPLY' end as before_status,
  d.package_code,
  d.task_domain_name,
  d.task_domain_name_ja,
  d.cx_topic_code,
  d.status_code
from proposed p
left join aiworker.business_support_task_domain d
  on d.task_domain_code = p.task_domain_code
order by p.task_domain_code;

select
  count(*) as existing_target_count_before
from aiworker.business_support_task_domain
where task_domain_code in (
  'programming',
  'db_analysis',
  'document_writing',
  'research',
  'historical_reference',
  'ui_ux',
  'data_formatting',
  'review_audit',
  'customer_communication',
  'creative_planning',
  'operations_execution',
  'cx_reference_authoring',
  'security_crisis_response',
  'fictional_combat_design',
  'game_tactical_balance',
  'defense_planning_non_harmful',
  'threat_modeling_safe',
  'combat_lore_reference'
);

select
  package_code,
  count(*) as row_count
from aiworker.business_support_task_domain
group by package_code
order by row_count desc, package_code;
