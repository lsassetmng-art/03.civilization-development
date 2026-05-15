\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 260

select now() as dump_started_at;

-- ============================================================
-- 1. Existing military/security task domains
-- ============================================================

select
  task_domain_id,
  package_code,
  task_domain_code,
  task_domain_name,
  task_domain_name_ja,
  cx_topic_code,
  sort_order,
  status_code
from aiworker.business_support_task_domain
where task_domain_code in (
  'security_crisis_response',
  'fictional_combat_design',
  'game_tactical_balance',
  'defense_planning_non_harmful',
  'threat_modeling_safe',
  'combat_lore_reference'
)
order by sort_order, task_domain_code;

-- ============================================================
-- 2. Relevant table columns
-- ============================================================

select
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'aiworker'
  and table_name in (
    'business_support_role_domain_capability',
    'business_support_role_control',
    'business_support_task_domain',
    'command_authority_role_catalog',
    'worker_role_class_catalog',
    'worker_domain_proficiency',
    'worker_role_proficiency',
    'robot_model_capability_profile',
    'worker_model_capability_profile',
    'robot_brain_model_domain_policy',
    'robot_brain_role_policy',
    'robot_breadth_domain_runtime_policy',
    'robot_brain_access_tier_catalog',
    'robot_brain_reference_tier_policy',
    'robot_brain_series_profile',
    'robot_model_personality_profile',
    'model_public_registry',
    'worker_model_catalog',
    'robot_material_model_identifier_canon'
  )
order by table_schema, table_name, ordinal_position;

-- ============================================================
-- 3. Constraints
-- ============================================================

select
  n.nspname as schema_name,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid) as constraint_def
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'aiworker'
  and c.relname in (
    'business_support_role_domain_capability',
    'business_support_role_control',
    'command_authority_role_catalog',
    'worker_role_class_catalog',
    'worker_domain_proficiency',
    'worker_role_proficiency',
    'robot_model_capability_profile',
    'worker_model_capability_profile',
    'robot_brain_model_domain_policy',
    'robot_brain_role_policy',
    'robot_breadth_domain_runtime_policy',
    'robot_brain_access_tier_catalog',
    'robot_brain_reference_tier_policy',
    'robot_brain_series_profile',
    'robot_model_personality_profile',
    'model_public_registry',
    'worker_model_catalog',
    'robot_material_model_identifier_canon'
  )
order by n.nspname, c.relname, con.contype, con.conname;

-- ============================================================
-- 4. Existing role/model rows for HD-R2 family
-- ============================================================

select 'model_public_registry' as source_table, *
from aiworker.model_public_registry
where model_code ilike '%r2%'
   or model_no ilike '%R2%'
   or model_name_ja ilike '%戦闘%'
   or model_name_ja ilike '%スナイパー%'
   or model_name_ja ilike '%ジェネラル%'
   or model_name_ja ilike '%オリジン%'
order by model_code
limit 80;

select 'worker_model_catalog' as source_table, *
from aiworker.worker_model_catalog
where model_code ilike '%r2%'
   or model_no ilike '%R2%'
   or model_name_ja ilike '%戦闘%'
   or model_name_ja ilike '%スナイパー%'
   or model_name_ja ilike '%ジェネラル%'
   or model_name_ja ilike '%オリジン%'
order by model_code
limit 80;

select 'robot_material_model_identifier_canon' as source_table, *
from aiworker.robot_material_model_identifier_canon
where model_code ilike '%r2%'
   or model_no ilike '%R2%'
   or public_model_no ilike '%R2%'
order by model_code
limit 80;

select 'robot_model_capability_profile' as source_table, *
from aiworker.robot_model_capability_profile
where model_code ilike '%r2%'
order by model_code
limit 80;

select 'robot_model_personality_profile' as source_table, *
from aiworker.robot_model_personality_profile
where aiworker_model_code ilike '%r2%'
   or model_name_ja ilike '%戦闘%'
   or model_name_ja ilike '%スナイパー%'
   or model_name_ja ilike '%ジェネラル%'
   or model_name_ja ilike '%オリジン%'
order by aiworker_model_code
limit 80;

-- ============================================================
-- 5. Existing role/domain/brain policies
-- ============================================================

select 'business_support_role_domain_capability' as source_table, *
from aiworker.business_support_role_domain_capability
where task_domain_code in (
  'security_crisis_response',
  'fictional_combat_design',
  'game_tactical_balance',
  'defense_planning_non_harmful',
  'threat_modeling_safe',
  'combat_lore_reference'
)
limit 80;

select 'business_support_role_domain_capability_existing_r2_like' as source_table, *
from aiworker.business_support_role_domain_capability
where role_code ilike '%r2%'
   or role_code ilike '%combat%'
   or role_code ilike '%security%'
   or role_code ilike '%general%'
   or role_code ilike '%sniper%'
limit 80;

select 'robot_brain_model_domain_policy' as source_table, *
from aiworker.robot_brain_model_domain_policy
where model_code ilike '%r2%'
   or allowed_domain_code in (
      'security_crisis_response',
      'fictional_combat_design',
      'game_tactical_balance',
      'defense_planning_non_harmful',
      'threat_modeling_safe',
      'combat_lore_reference'
   )
limit 80;

select 'robot_brain_role_policy' as source_table, *
from aiworker.robot_brain_role_policy
where role_code ilike '%r2%'
   or role_code ilike '%combat%'
   or role_code ilike '%security%'
   or role_code ilike '%general%'
   or role_code ilike '%sniper%'
limit 80;

select 'robot_breadth_domain_runtime_policy' as source_table, *
from aiworker.robot_breadth_domain_runtime_policy
where domain_code in (
  'security_crisis_response',
  'fictional_combat_design',
  'game_tactical_balance',
  'defense_planning_non_harmful',
  'threat_modeling_safe',
  'combat_lore_reference'
)
limit 80;
