-- ============================================================
-- BusinessOS AIWorker AICompanyManager selector adapter
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only / replace functions and views only
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

CREATE OR REPLACE FUNCTION business.fn_business_robot_selector_options_for_role(
  p_role_code text DEFAULT NULL
)
RETURNS TABLE (
  robot_pool_id uuid,
  aiworker_model_code text,
  aiworker_series_code text,
  manufacturer_code text,
  display_name text,
  selector_label text,
  business_offer_code text,
  visible_available_quantity integer,
  recommended_role_codes text[],
  status_code text,
  sort_rank integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.robot_pool_id,
    v.aiworker_model_code,
    v.aiworker_series_code,
    v.manufacturer_code,
    v.display_name,
    v.selector_label,
    v.business_offer_code,
    v.visible_available_quantity,
    v.recommended_role_codes,
    v.status_code,
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN p_role_code = ANY(v.recommended_role_codes) THEN 1
      ELSE 999
    END AS sort_rank
  FROM business.vw_business_robot_selector_options v
  WHERE v.status_code = 'active'
    AND (
      p_role_code IS NULL
      OR btrim(p_role_code) = ''
      OR p_role_code = ANY(v.recommended_role_codes)
    )
  ORDER BY
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN p_role_code = ANY(v.recommended_role_codes) THEN 1
      ELSE 999
    END,
    v.aiworker_series_code,
    v.aiworker_model_code;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_selector_options_for_role(
  p_company_id uuid,
  p_role_code text DEFAULT NULL
)
RETURNS TABLE (
  company_robot_entitlement_id uuid,
  company_id uuid,
  robot_pool_id uuid,
  aiworker_model_code text,
  aiworker_series_code text,
  manufacturer_code text,
  display_name text,
  selector_label text,
  business_offer_code text,
  usable_quantity integer,
  assignment_mode_code text,
  recommended_role_codes text[],
  status_code text,
  sort_rank integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.company_robot_entitlement_id,
    v.company_id,
    v.robot_pool_id,
    v.aiworker_model_code,
    v.aiworker_series_code,
    v.manufacturer_code,
    v.display_name,
    v.selector_label,
    v.business_offer_code,
    v.usable_quantity,
    v.assignment_mode_code,
    v.recommended_role_codes,
    v.status_code,
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN p_role_code = ANY(v.recommended_role_codes) THEN 1
      ELSE 999
    END AS sort_rank
  FROM business.vw_company_robot_selector_options v
  WHERE v.company_id = p_company_id
    AND v.status_code = 'active'
    AND (
      p_role_code IS NULL
      OR btrim(p_role_code) = ''
      OR p_role_code = ANY(v.recommended_role_codes)
    )
  ORDER BY
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN p_role_code = ANY(v.recommended_role_codes) THEN 1
      ELSE 999
    END,
    v.aiworker_series_code,
    v.aiworker_model_code;
$$;

CREATE OR REPLACE FUNCTION business.fn_aicm_robot_setting_preview(
  p_company_id uuid,
  p_aiworker_model_code text,
  p_target_level_code text,
  p_role_code text,
  p_internal_nickname text,
  p_target_id uuid DEFAULT NULL,
  p_app_code text DEFAULT 'AICompanyManager'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_display_name text;
  v_selector_label text;
  v_display_label text;
  v_entitlement_exists boolean;
BEGIN
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'company_id_required';
  END IF;

  IF p_aiworker_model_code IS NULL OR btrim(p_aiworker_model_code) = '' THEN
    RAISE EXCEPTION 'aiworker_model_code_required';
  END IF;

  IF p_target_level_code IS NULL OR btrim(p_target_level_code) = '' THEN
    RAISE EXCEPTION 'target_level_code_required';
  END IF;

  IF p_role_code IS NULL OR btrim(p_role_code) = '' THEN
    RAISE EXCEPTION 'role_code_required';
  END IF;

  IF p_internal_nickname IS NULL OR btrim(p_internal_nickname) = '' THEN
    RAISE EXCEPTION 'internal_nickname_required';
  END IF;

  SELECT
    COALESCE(v.display_name, v.aiworker_model_code),
    COALESCE(v.selector_label, COALESCE(v.display_name, v.aiworker_model_code) || ' / ' || v.aiworker_model_code),
    true
    INTO
    v_display_name,
    v_selector_label,
    v_entitlement_exists
  FROM business.vw_company_robot_selector_options v
  WHERE v.company_id = p_company_id
    AND v.aiworker_model_code = btrim(p_aiworker_model_code)
    AND v.status_code = 'active'
  ORDER BY v.updated_at DESC
  LIMIT 1;

  v_display_label := btrim(p_internal_nickname) || '@' || btrim(p_role_code);

  RETURN jsonb_build_object(
    'ok', true,
    'company_id', p_company_id,
    'target_level_code', btrim(p_target_level_code),
    'target_id', p_target_id,
    'app_code', COALESCE(NULLIF(btrim(p_app_code), ''), 'AICompanyManager'),
    'role_code', btrim(p_role_code),
    'internal_nickname', btrim(p_internal_nickname),
    'display_label', v_display_label,
    'aiworker_model_code', btrim(p_aiworker_model_code),
    'model_display_name', COALESCE(v_display_name, btrim(p_aiworker_model_code)),
    'selector_label', COALESCE(v_selector_label, btrim(p_aiworker_model_code)),
    'entitlement_exists', COALESCE(v_entitlement_exists, false)
  );
END;
$$;

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
  p.updated_at
FROM business.company_robot_placement p
LEFT JOIN business.robot_pool rp
  ON rp.robot_pool_id = p.robot_pool_id
WHERE p.app_code = 'AICompanyManager';

COMMIT;
