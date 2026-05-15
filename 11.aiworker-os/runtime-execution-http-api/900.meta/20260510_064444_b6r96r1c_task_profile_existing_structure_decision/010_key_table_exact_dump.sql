\pset pager off
\pset null '(null)'
\pset format aligned
\pset columns 260

select now() as dump_started_at;

-- ============================================================
-- 1. Key candidate table columns
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
where table_schema in ('aiworker', 'personaos', 'business', 'cx22073jw')
  and table_name in (
    'business_support_task_domain',
    'business_support_role_domain_capability',
    'worker_domain_proficiency',
    'worker_role_proficiency',
    'worker_capability_snapshot',
    'worker_model_capability_profile',
    'robot_model_capability_profile',
    'robot_model_personality_profile',
    'robot_series_capability_default',
    'series_tendency_profile',
    'series_tendency_axis_catalog',
    'series_tendency_value_catalog',
    'beyond_model_quality_profile',
    'megami_model_profile',
    'president_model_catalog',
    'president_capability_gate',
    'robot_brain_access_tier_catalog',
    'robot_brain_model_domain_policy',
    'robot_brain_role_policy',
    'robot_brain_series_profile',
    'robot_breadth_domain_runtime_policy',
    'robot_role_safety_boundary_v1',
    'persona_parameter_state',
    'persona_parameter_value',
    'growth_axis',
    'growth_core_state',
    'growth_events',
    'memory_state',
    'memory_events',
    'persona_growth_state',
    'persona_state',
    'personas'
  )
order by table_schema, table_name, ordinal_position;

-- ============================================================
-- 2. Primary keys / unique constraints / check constraints
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
where n.nspname in ('aiworker', 'personaos', 'business', 'cx22073jw')
  and c.relname in (
    'business_support_task_domain',
    'business_support_role_domain_capability',
    'worker_domain_proficiency',
    'worker_role_proficiency',
    'worker_capability_snapshot',
    'worker_model_capability_profile',
    'robot_model_capability_profile',
    'robot_model_personality_profile',
    'robot_series_capability_default',
    'series_tendency_profile',
    'beyond_model_quality_profile',
    'megami_model_profile',
    'president_model_catalog',
    'president_capability_gate',
    'robot_brain_access_tier_catalog',
    'robot_brain_model_domain_policy',
    'robot_brain_role_policy',
    'robot_brain_series_profile',
    'robot_breadth_domain_runtime_policy',
    'persona_parameter_state',
    'persona_parameter_value',
    'growth_axis',
    'growth_core_state',
    'growth_events',
    'memory_state',
    'memory_events',
    'persona_growth_state',
    'persona_state',
    'personas'
  )
order by n.nspname, c.relname, con.contype, con.conname;

-- ============================================================
-- 3. Indexes
-- ============================================================

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname in ('aiworker', 'personaos', 'business', 'cx22073jw')
  and tablename in (
    'business_support_task_domain',
    'business_support_role_domain_capability',
    'worker_domain_proficiency',
    'worker_role_proficiency',
    'worker_capability_snapshot',
    'worker_model_capability_profile',
    'robot_model_capability_profile',
    'robot_model_personality_profile',
    'robot_series_capability_default',
    'series_tendency_profile',
    'beyond_model_quality_profile',
    'megami_model_profile',
    'president_model_catalog',
    'president_capability_gate',
    'robot_brain_access_tier_catalog',
    'robot_brain_model_domain_policy',
    'robot_brain_role_policy',
    'robot_brain_series_profile',
    'robot_breadth_domain_runtime_policy',
    'persona_parameter_state',
    'persona_parameter_value',
    'growth_axis',
    'growth_core_state',
    'growth_events',
    'memory_state',
    'memory_events',
    'persona_growth_state',
    'persona_state',
    'personas'
  )
order by schemaname, tablename, indexname;

-- ============================================================
-- 4. Exact view definitions for relevant app-read views
-- ============================================================

select
  schemaname,
  viewname,
  pg_get_viewdef((quote_ident(schemaname) || '.' || quote_ident(viewname))::regclass, true) as view_definition
from pg_views
where schemaname in ('aiworker', 'cx22073jw')
  and viewname in (
    'vw_app_aiworker_model_capability_overlay_v1',
    'vw_app_aiworker_model_selection_capability_card_v1',
    'vw_app_aiworker_model_selection_directory_v1',
    'vw_app_aiworker_model_selection_source_for_capability_v1',
    'vw_app_aiworker_model_selection_summary_v1',
    'vw_app_robot_capability_profile_directory_v1',
    'vw_robot_capability_sharing_policy_public_v1',
    'vw_robot_model_capability_public_v1',
    'vw_robot_brain_compact_context_v1',
    'vw_robot_brain_effective_access_v1',
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_model_full_reference_v3',
    'vw_robot_personality_reference_v1',
    'vw_robot_role_safety_boundary_v1'
  )
order by schemaname, viewname;

-- ============================================================
-- 5. Sample existing data
-- ============================================================

select 'aiworker.business_support_task_domain' as source_table, *
from aiworker.business_support_task_domain
limit 50;

select 'aiworker.worker_domain_proficiency' as source_table, *
from aiworker.worker_domain_proficiency
limit 50;

select 'aiworker.worker_role_proficiency' as source_table, *
from aiworker.worker_role_proficiency
limit 50;

select 'aiworker.worker_model_capability_profile' as source_table, *
from aiworker.worker_model_capability_profile
limit 50;

select 'aiworker.robot_model_capability_profile' as source_table, *
from aiworker.robot_model_capability_profile
limit 50;

select 'aiworker.robot_model_personality_profile' as source_table, *
from aiworker.robot_model_personality_profile
limit 50;

select 'aiworker.beyond_model_quality_profile' as source_table, *
from aiworker.beyond_model_quality_profile
limit 50;

select 'aiworker.megami_model_profile' as source_table, *
from aiworker.megami_model_profile
limit 50;

select 'aiworker.robot_brain_model_domain_policy' as source_table, *
from aiworker.robot_brain_model_domain_policy
limit 50;

select 'aiworker.robot_brain_role_policy' as source_table, *
from aiworker.robot_brain_role_policy
limit 50;

select 'aiworker.robot_breadth_domain_runtime_policy' as source_table, *
from aiworker.robot_breadth_domain_runtime_policy
limit 50;

select 'personaos.persona_parameter_state' as source_table, *
from personaos.persona_parameter_state
limit 50;

select 'personaos.persona_parameter_value' as source_table, *
from personaos.persona_parameter_value
limit 80;

select 'personaos.growth_axis' as source_table, *
from personaos.growth_axis
limit 80;

select 'personaos.growth_core_state' as source_table, *
from personaos.growth_core_state
limit 50;

select 'personaos.persona_growth_state' as source_table, *
from personaos.persona_growth_state
limit 50;

select 'personaos.memory_state' as source_table, *
from personaos.memory_state
limit 50;
