-- ============================================================
-- CX22073JW / AIWorkerOS R29G-P2J
-- NOT EXECUTED: CX dedicated app_surface runtime control seed proposal
--
-- DB: Persona側DB only
-- ENV: PERSONA_DATABASE_URL only
--
-- IMPORTANT:
-- - This SQL is a proposal only.
-- - Do not execute without Sato review + Boss explicit GO.
-- - No DROP / DELETE / TRUNCATE / CASCADE.
-- - AICM code is not touched.
-- ============================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- ------------------------------------------------------------
-- 0. Safety precheck
-- ------------------------------------------------------------

do $$
begin
  if to_regclass('aiworker.vw_app_aiworker_runtime_control_profile_v1') is null then
    raise exception 'missing view: aiworker.vw_app_aiworker_runtime_control_profile_v1';
  end if;

  if not exists (
    select 1
    from aiworker.vw_app_aiworker_runtime_control_profile_v1
    where app_surface_code = 'ai_company_manager'
      and model_code = 'byd2_003_asic_leader3'
  ) then
    raise exception 'source runtime control profile not found: ai_company_manager × byd2_003_asic_leader3';
  end if;

  if exists (
    select 1
    from aiworker.vw_app_aiworker_runtime_control_profile_v1
    where app_surface_code = 'cx22073jw_e2e_quality_gate'
      and model_code = 'byd2_003_asic_leader3'
  ) then
    raise notice 'target profile already exists; seed may be unnecessary';
  end if;
end $$;

-- ------------------------------------------------------------
-- 1. Seed strategy
-- ------------------------------------------------------------
--
-- The writable source table must be confirmed from:
-- - aiworker.fn_runtime_execution_create_request(...)
-- - aiworker.vw_app_aiworker_runtime_control_profile_v1 definition
--
-- Expected seed intent:
-- Clone or create the same safe runtime-control posture as:
--   ai_company_manager × byd2_003_asic_leader3
--
-- Target:
--   cx22073jw_e2e_quality_gate × byd2_003_asic_leader3
--
-- Keep:
--   external_execution_allowed_flag = false
--   pg_apply_allowed_flag = false
--   destructive_action_allowed_flag = false
--
-- DO NOT execute the placeholder below until the actual writable table
-- and exact columns are confirmed by Sato review.

-- ------------------------------------------------------------
-- 2. PLACEHOLDER ONLY - replace after exact source table confirmation
-- ------------------------------------------------------------

/*
insert into aiworker.<RUNTIME_CONTROL_PROFILE_BASE_TABLE> (
  app_surface_code,
  app_surface_name_ja,
  model_code,
  -- copy/derive remaining runtime control columns from source profile
  created_at,
  updated_at
)
select
  'cx22073jw_e2e_quality_gate' as app_surface_code,
  'CX22073JW E2E品質ゲート' as app_surface_name_ja,
  src.model_code,
  now() as created_at,
  now() as updated_at
from aiworker.<RUNTIME_CONTROL_PROFILE_BASE_TABLE> src
where src.app_surface_code = 'ai_company_manager'
  and src.model_code = 'byd2_003_asic_leader3'
on conflict (...) do update
set
  app_surface_name_ja = excluded.app_surface_name_ja,
  updated_at = now();
*/

-- ------------------------------------------------------------
-- 3. Post-apply verification target
-- ------------------------------------------------------------

-- Expected after real seed apply:
-- select count(*)
-- from aiworker.vw_app_aiworker_runtime_control_profile_v1
-- where app_surface_code = 'cx22073jw_e2e_quality_gate'
--   and model_code = 'byd2_003_asic_leader3';
-- expected: 1

ROLLBACK;
