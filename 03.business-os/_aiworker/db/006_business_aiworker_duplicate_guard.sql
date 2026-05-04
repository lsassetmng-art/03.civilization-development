-- ============================================================
-- BusinessOS AIWorker duplicate guard
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only / replace function and view only
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

DO $$
BEGIN
  IF to_regclass('business.company_robot_placement') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.company_robot_placement';
  END IF;
END $$;

CREATE OR REPLACE VIEW business.vw_aicm_robot_role_duplicate_rule AS
SELECT *
FROM (
  VALUES
    ('President', true, 1, 'same_company_target_role', 'single president per company target'),
    ('ExecutiveManager', true, 1, 'same_company_target_role', 'single executive manager per company target'),
    ('Manager', true, 1, 'same_company_target_role', 'single manager per department target'),
    ('Leader', true, 1, 'same_company_target_role', 'single leader per section target'),
    ('Worker', false, NULL::integer, 'multi_allowed', 'multiple workers allowed'),
    ('Helper', false, NULL::integer, 'multi_allowed', 'multiple helpers allowed'),
    ('Friend', false, NULL::integer, 'multi_allowed', 'multiple friends allowed'),
    ('Specialist', false, NULL::integer, 'multi_allowed', 'multiple specialists allowed'),
    ('Butler', false, NULL::integer, 'multi_allowed', 'multiple butlers allowed'),
    ('Security', false, NULL::integer, 'multi_allowed', 'multiple security robots allowed')
) AS t(
  role_code,
  duplicate_guard_flag,
  max_active_count,
  duplicate_scope_code,
  note
);

CREATE OR REPLACE FUNCTION business.fn_aicm_robot_placement_duplicate_guard(
  p_company_id uuid,
  p_role_code text,
  p_target_level_code text,
  p_target_id uuid DEFAULT NULL,
  p_exclude_company_robot_placement_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_role_code text;
  v_target_level_code text;
  v_duplicate_guard_flag boolean;
  v_max_active_count integer;
  v_active_count integer;
  v_allowed boolean;
  v_reason text;
BEGIN
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'company_id_required';
  END IF;

  IF p_role_code IS NULL OR btrim(p_role_code) = '' THEN
    RAISE EXCEPTION 'role_code_required';
  END IF;

  IF p_target_level_code IS NULL OR btrim(p_target_level_code) = '' THEN
    RAISE EXCEPTION 'target_level_code_required';
  END IF;

  v_role_code := btrim(p_role_code);
  v_target_level_code := btrim(p_target_level_code);

  SELECT
    duplicate_guard_flag,
    max_active_count
    INTO
    v_duplicate_guard_flag,
    v_max_active_count
  FROM business.vw_aicm_robot_role_duplicate_rule
  WHERE role_code = v_role_code
  LIMIT 1;

  v_duplicate_guard_flag := COALESCE(v_duplicate_guard_flag, false);
  v_max_active_count := COALESCE(v_max_active_count, 999999);

  SELECT COUNT(*)
    INTO v_active_count
  FROM business.company_robot_placement p
  WHERE p.company_id = p_company_id
    AND p.app_code = 'AICompanyManager'
    AND p.status_code = 'active'
    AND p.role_code = v_role_code
    AND p.target_level_code = v_target_level_code
    AND (
      (p.target_id IS NULL AND p_target_id IS NULL)
      OR p.target_id = p_target_id
    )
    AND (
      p_exclude_company_robot_placement_id IS NULL
      OR p.company_robot_placement_id <> p_exclude_company_robot_placement_id
    );

  IF v_duplicate_guard_flag = false THEN
    v_allowed := true;
    v_reason := 'multi_slot_role_allowed';
  ELSIF v_active_count < v_max_active_count THEN
    v_allowed := true;
    v_reason := 'single_slot_available';
  ELSE
    v_allowed := false;
    v_reason := 'duplicate_single_slot_role_blocked';
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'allowed', v_allowed,
    'reason', v_reason,
    'company_id', p_company_id,
    'role_code', v_role_code,
    'target_level_code', v_target_level_code,
    'target_id', p_target_id,
    'duplicate_guard_flag', v_duplicate_guard_flag,
    'max_active_count', v_max_active_count,
    'active_count', v_active_count,
    'exclude_company_robot_placement_id', p_exclude_company_robot_placement_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_aicm_robot_placement_duplicate_guard_from_payload(
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_company_id uuid;
  v_role_code text;
  v_target_level_code text;
  v_target_id uuid;
  v_exclude_id uuid;
BEGIN
  IF p_payload IS NULL THEN
    RAISE EXCEPTION 'payload_required';
  END IF;

  v_company_id := NULLIF(p_payload->>'company_id', '')::uuid;
  v_role_code := p_payload->>'role_code';
  v_target_level_code := p_payload->>'target_level_code';
  v_target_id := NULLIF(p_payload->>'target_id', '')::uuid;
  v_exclude_id := NULLIF(p_payload->>'exclude_company_robot_placement_id', '')::uuid;

  RETURN business.fn_aicm_robot_placement_duplicate_guard(
    v_company_id,
    v_role_code,
    v_target_level_code,
    v_target_id,
    v_exclude_id
  );
END;
$$;

COMMIT;
