-- ============================================================
-- BusinessOS AIWorker placement management repair
-- Fix view column order for CREATE OR REPLACE VIEW
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

DO $$
BEGIN
  IF to_regclass('business.company_robot_placement') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.company_robot_placement';
  END IF;

  IF to_regclass('business.robot_pool') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_pool';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS business.company_robot_placement_event (
  company_robot_placement_event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_robot_placement_id uuid NOT NULL REFERENCES business.company_robot_placement(company_robot_placement_id),
  company_id uuid NOT NULL,
  event_code text NOT NULL,
  reason text,
  before_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_company_robot_placement_event_placement
  ON business.company_robot_placement_event(company_robot_placement_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_company_robot_placement_event_company
  ON business.company_robot_placement_event(company_id, event_code, created_at DESC);

CREATE OR REPLACE FUNCTION business.fn_company_robot_placement_update(
  p_company_robot_placement_id uuid,
  p_internal_nickname text DEFAULT NULL,
  p_role_code text DEFAULT NULL,
  p_target_level_code text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_metadata_patch_jsonb jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_before business.company_robot_placement%ROWTYPE;
  v_after business.company_robot_placement%ROWTYPE;
BEGIN
  IF p_company_robot_placement_id IS NULL THEN
    RAISE EXCEPTION 'company_robot_placement_id_required';
  END IF;

  SELECT *
    INTO v_before
  FROM business.company_robot_placement
  WHERE company_robot_placement_id = p_company_robot_placement_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'company_robot_placement_not_found:%', p_company_robot_placement_id;
  END IF;

  UPDATE business.company_robot_placement
  SET
    internal_nickname = COALESCE(NULLIF(btrim(COALESCE(p_internal_nickname, '')), ''), internal_nickname),
    role_code = COALESCE(NULLIF(btrim(COALESCE(p_role_code, '')), ''), role_code),
    target_level_code = COALESCE(NULLIF(btrim(COALESCE(p_target_level_code, '')), ''), target_level_code),
    target_id = COALESCE(p_target_id, target_id),
    metadata_jsonb = metadata_jsonb || COALESCE(p_metadata_patch_jsonb, '{}'::jsonb),
    updated_at = now()
  WHERE company_robot_placement_id = p_company_robot_placement_id
  RETURNING * INTO v_after;

  INSERT INTO business.company_robot_placement_event (
    company_robot_placement_id,
    company_id,
    event_code,
    reason,
    before_jsonb,
    after_jsonb,
    metadata_jsonb
  )
  VALUES (
    p_company_robot_placement_id,
    v_after.company_id,
    'placement_updated',
    'manual_update',
    to_jsonb(v_before),
    to_jsonb(v_after),
    COALESCE(p_metadata_patch_jsonb, '{}'::jsonb)
  );

  RETURN p_company_robot_placement_id;
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_placement_deactivate(
  p_company_robot_placement_id uuid,
  p_reason text DEFAULT 'manual_deactivate',
  p_metadata_patch_jsonb jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_before business.company_robot_placement%ROWTYPE;
  v_after business.company_robot_placement%ROWTYPE;
BEGIN
  IF p_company_robot_placement_id IS NULL THEN
    RAISE EXCEPTION 'company_robot_placement_id_required';
  END IF;

  SELECT *
    INTO v_before
  FROM business.company_robot_placement
  WHERE company_robot_placement_id = p_company_robot_placement_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'company_robot_placement_not_found:%', p_company_robot_placement_id;
  END IF;

  UPDATE business.company_robot_placement
  SET
    status_code = 'inactive',
    metadata_jsonb = metadata_jsonb
      || jsonb_build_object(
        'deactivated_at', now(),
        'deactivation_reason', COALESCE(NULLIF(btrim(COALESCE(p_reason, '')), ''), 'manual_deactivate')
      )
      || COALESCE(p_metadata_patch_jsonb, '{}'::jsonb),
    updated_at = now()
  WHERE company_robot_placement_id = p_company_robot_placement_id
  RETURNING * INTO v_after;

  INSERT INTO business.company_robot_placement_event (
    company_robot_placement_id,
    company_id,
    event_code,
    reason,
    before_jsonb,
    after_jsonb,
    metadata_jsonb
  )
  VALUES (
    p_company_robot_placement_id,
    v_after.company_id,
    'placement_deactivated',
    COALESCE(NULLIF(btrim(COALESCE(p_reason, '')), ''), 'manual_deactivate'),
    to_jsonb(v_before),
    to_jsonb(v_after),
    COALESCE(p_metadata_patch_jsonb, '{}'::jsonb)
  );

  RETURN p_company_robot_placement_id;
END;
$$;

-- IMPORTANT:
-- Preserve existing view column order:
-- ... placement_quantity, status_code, created_at, updated_at
-- Add metadata_jsonb only at the end.
CREATE OR REPLACE VIEW business.vw_aicm_company_robot_assignment_display AS
SELECT
  p.company_robot_placement_id,
  p.company_id,
  p.target_level_code,
  p.target_id,
  p.app_code,
  p.role_code,
  p.internal_nickname,
  p.internal_nickname || '@' || p.role_code AS display_label,
  p.aiworker_model_code,
  COALESCE(rp.display_name, p.aiworker_model_code) AS model_display_name,
  COALESCE(rp.display_name, p.aiworker_model_code) || ' / ' || p.aiworker_model_code AS selector_label,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  p.placement_quantity,
  p.status_code,
  p.created_at,
  p.updated_at,
  p.metadata_jsonb
FROM business.company_robot_placement p
LEFT JOIN business.robot_pool rp
  ON rp.robot_pool_id = p.robot_pool_id
WHERE p.app_code = 'AICompanyManager';

CREATE OR REPLACE VIEW business.vw_aicm_company_robot_active_assignment_display AS
SELECT *
FROM business.vw_aicm_company_robot_assignment_display
WHERE status_code = 'active';

COMMIT;
