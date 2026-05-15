\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with target_domains(domain_code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
),
domain_check as (
  select
    d.domain_code,
    exists (
      select 1
      from aiworker.business_support_task_domain t
      where t.task_domain_code = d.domain_code
        and t.status_code = 'active'
    ) as exists_active
  from target_domains d
),
model_policy as (
  select
    d.domain_code,
    count(*) as hit_count
  from target_domains d
  left join aiworker.robot_brain_model_domain_policy t
    on to_jsonb(t)::text ~* d.domain_code
   and to_jsonb(t)::text ~* '(HD-R2|hd_r2|hd-r2|r2s|r2g|r2t|combat|sniper|general|origin|B6R96R1H3|safe_non_harmful|defensive_fictional_game_lore)'
  group by d.domain_code
),
role_policy as (
  select
    d.domain_code,
    count(*) as hit_count
  from target_domains d
  left join aiworker.robot_brain_role_policy t
    on to_jsonb(t)::text ~* d.domain_code
   and to_jsonb(t)::text ~* '(combat|sniper|general|origin|B6R96R1H3|safe_non_harmful|defensive_fictional_game_lore)'
  group by d.domain_code
),
role_capability as (
  select
    d.domain_code,
    count(*) as hit_count
  from target_domains d
  left join aiworker.business_support_role_domain_capability t
    on to_jsonb(t)::text ~* d.domain_code
   and to_jsonb(t)::text ~* '(combat|sniper|general|origin|B6R96R1H3|safe_non_harmful|defensive_fictional_game_lore)'
  group by d.domain_code
)
select jsonb_build_object(
  'all_6_domains_active', (select count(*) from domain_check where exists_active) = 6,
  'model_policy_all_6_domains_present', (select count(*) from model_policy where hit_count > 0) = 6,
  'role_policy_all_6_domains_present', (select count(*) from role_policy where hit_count > 0) = 6,
  'role_capability_all_6_domains_present', (select count(*) from role_capability where hit_count > 0) = 6,
  'model_policy_total_hits', (select coalesce(sum(hit_count),0) from model_policy),
  'role_policy_total_hits', (select coalesce(sum(hit_count),0) from role_policy),
  'role_capability_total_hits', (select coalesce(sum(hit_count),0) from role_capability),
  'missing_domain_count', (select count(*) from domain_check where not exists_active),
  'model_policy_missing_domain_count', (select count(*) from model_policy where hit_count = 0),
  'role_policy_missing_domain_count', (select count(*) from role_policy where hit_count = 0),
  'role_capability_missing_domain_count', (select count(*) from role_capability where hit_count = 0)
)::text as verify_bool_json;
