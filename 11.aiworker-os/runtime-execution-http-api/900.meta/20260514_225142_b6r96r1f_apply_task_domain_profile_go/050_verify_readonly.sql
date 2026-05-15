\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 240

with proposed(task_domain_code, expected_cx_topic_code, category_code) as (
  values
    ('programming','task_profile_programming','standard_work'),
    ('db_analysis','task_profile_db_analysis','standard_work'),
    ('document_writing','task_profile_document_writing','standard_work'),
    ('research','task_profile_research','standard_work'),
    ('historical_reference','task_profile_historical_reference','standard_work'),
    ('ui_ux','task_profile_ui_ux','standard_work'),
    ('data_formatting','task_profile_data_formatting','standard_work'),
    ('review_audit','task_profile_review_audit','standard_work'),
    ('customer_communication','task_profile_customer_communication','standard_work'),
    ('creative_planning','task_profile_creative_planning','standard_work'),
    ('operations_execution','task_profile_operations_execution','standard_work'),
    ('cx_reference_authoring','task_profile_cx_reference_authoring','standard_work'),
    ('security_crisis_response','task_profile_security_crisis_response','military_security_safe'),
    ('fictional_combat_design','task_profile_fictional_combat_design','military_security_safe'),
    ('game_tactical_balance','task_profile_game_tactical_balance','military_security_safe'),
    ('defense_planning_non_harmful','task_profile_defense_planning_non_harmful','military_security_safe'),
    ('threat_modeling_safe','task_profile_threat_modeling_safe','military_security_safe'),
    ('combat_lore_reference','task_profile_combat_lore_reference','military_security_safe')
),
joined as (
  select
    p.task_domain_code,
    p.expected_cx_topic_code,
    p.category_code,
    d.task_domain_id,
    d.package_code,
    d.task_domain_name,
    d.task_domain_name_ja,
    d.cx_topic_code,
    d.sort_order,
    d.status_code
  from proposed p
  left join aiworker.business_support_task_domain d
    on d.task_domain_code = p.task_domain_code
)
select *
from joined
order by category_code, task_domain_code;

with proposed(task_domain_code, expected_cx_topic_code) as (
  values
    ('programming','task_profile_programming'),
    ('db_analysis','task_profile_db_analysis'),
    ('document_writing','task_profile_document_writing'),
    ('research','task_profile_research'),
    ('historical_reference','task_profile_historical_reference'),
    ('ui_ux','task_profile_ui_ux'),
    ('data_formatting','task_profile_data_formatting'),
    ('review_audit','task_profile_review_audit'),
    ('customer_communication','task_profile_customer_communication'),
    ('creative_planning','task_profile_creative_planning'),
    ('operations_execution','task_profile_operations_execution'),
    ('cx_reference_authoring','task_profile_cx_reference_authoring'),
    ('security_crisis_response','task_profile_security_crisis_response'),
    ('fictional_combat_design','task_profile_fictional_combat_design'),
    ('game_tactical_balance','task_profile_game_tactical_balance'),
    ('defense_planning_non_harmful','task_profile_defense_planning_non_harmful'),
    ('threat_modeling_safe','task_profile_threat_modeling_safe'),
    ('combat_lore_reference','task_profile_combat_lore_reference')
),
joined as (
  select
    p.task_domain_code,
    p.expected_cx_topic_code,
    d.task_domain_id,
    d.package_code,
    d.task_domain_name,
    d.task_domain_name_ja,
    d.cx_topic_code,
    d.status_code
  from proposed p
  left join aiworker.business_support_task_domain d
    on d.task_domain_code = p.task_domain_code
)
select jsonb_build_object(
  'all_18_present', count(*) filter (where task_domain_id is not null) = 18,
  'all_cx_topic_code_match', count(*) filter (where cx_topic_code = expected_cx_topic_code) = 18,
  'all_status_active', count(*) filter (where status_code = 'active') = 18,
  'missing_count', count(*) filter (where task_domain_id is null),
  'mismatched_cx_topic_count', count(*) filter (where cx_topic_code is distinct from expected_cx_topic_code),
  'inactive_count', count(*) filter (where status_code is distinct from 'active')
)::text as verify_bool_json
from joined;
