\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 260

select now() as dump_started_at;

-- ============================================================
-- 1. Existing military/security task domains
-- ============================================================

select
  *
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
-- 2. Safe column inventory
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
-- 3. Constraints / indexes
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

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'aiworker'
  and tablename in (
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
order by schemaname, tablename, indexname;

-- ============================================================
-- 4. Safe samples. No fixed WHERE column assumptions.
-- ============================================================

select 'aiworker.model_public_registry' as source_table, *
from aiworker.model_public_registry
limit 80;

select 'aiworker.worker_model_catalog' as source_table, *
from aiworker.worker_model_catalog
limit 80;

select 'aiworker.robot_material_model_identifier_canon' as source_table, *
from aiworker.robot_material_model_identifier_canon
limit 80;

select 'aiworker.robot_model_capability_profile' as source_table, *
from aiworker.robot_model_capability_profile
limit 80;

select 'aiworker.worker_model_capability_profile' as source_table, *
from aiworker.worker_model_capability_profile
limit 80;

select 'aiworker.robot_model_personality_profile' as source_table, *
from aiworker.robot_model_personality_profile
limit 80;

select 'aiworker.business_support_role_domain_capability' as source_table, *
from aiworker.business_support_role_domain_capability
limit 80;

select 'aiworker.robot_brain_model_domain_policy' as source_table, *
from aiworker.robot_brain_model_domain_policy
limit 80;

select 'aiworker.robot_brain_role_policy' as source_table, *
from aiworker.robot_brain_role_policy
limit 80;

select 'aiworker.robot_breadth_domain_runtime_policy' as source_table, *
from aiworker.robot_breadth_domain_runtime_policy
limit 80;

-- ============================================================
-- 5. Dynamic text search SQL hints only, not executed.
-- ============================================================

select
  'Use DUMP_OUT samples and column inventory to identify HD-R2 canonical model_code. Avoid fixed model_no/model_name_ja assumptions.' as note;
