\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 260

select now() as diagnose_started_at;

-- ============================================================
-- 1. Locate brain domain catalog
-- ============================================================

select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'aiworker'
  and table_name in (
    'brain_data_domain_catalog',
    'brain_domain_catalog',
    'robot_brain_domain_catalog',
    'business_support_task_domain'
  )
order by table_schema, table_name;

-- ============================================================
-- 2. Column inventory
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
    'brain_data_domain_catalog',
    'brain_domain_catalog',
    'robot_brain_domain_catalog',
    'robot_brain_model_domain_policy',
    'robot_brain_role_policy',
    'business_support_role_domain_capability',
    'business_support_task_domain'
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
    'brain_data_domain_catalog',
    'brain_domain_catalog',
    'robot_brain_domain_catalog',
    'robot_brain_model_domain_policy',
    'robot_brain_role_policy',
    'business_support_role_domain_capability',
    'business_support_task_domain'
  )
order by n.nspname, c.relname, con.contype, con.conname;

-- ============================================================
-- 4. Brain domain catalog rows
-- ============================================================

select 'aiworker.brain_data_domain_catalog' as source_table, *
from aiworker.brain_data_domain_catalog
order by brain_domain_code
limit 300;

-- ============================================================
-- 5. New task domains
-- ============================================================

select 'aiworker.business_support_task_domain' as source_table, *
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
-- 6. Existing brain policy values
-- ============================================================

select
  'robot_brain_model_domain_policy_existing' as source_table,
  brain_domain_code,
  policy_code,
  count(*) as row_count
from aiworker.robot_brain_model_domain_policy
group by brain_domain_code, policy_code
order by row_count desc, brain_domain_code, policy_code;

select
  'robot_brain_role_policy_existing' as source_table,
  *
from aiworker.robot_brain_role_policy
limit 120;
