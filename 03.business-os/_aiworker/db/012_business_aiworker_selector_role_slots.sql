-- ============================================================
-- BusinessOS AIWorker selector role slots
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: replace views/functions only
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

DO $$
BEGIN
  IF to_regclass('business.robot_pool') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_pool';
  END IF;

  IF to_regclass('business.company_robot_entitlement') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.company_robot_entitlement';
  END IF;

  IF to_regclass('business.robot_placement_role_catalog') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_placement_role_catalog';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business'
      AND table_name = 'robot_pool'
      AND column_name = 'placement_role_code_1'
  ) THEN
    RAISE EXCEPTION 'required_column_missing: business.robot_pool.placement_role_code_1';
  END IF;
END $$;

CREATE OR REPLACE VIEW business.vw_business_robot_selector_options AS
SELECT
  rp.robot_pool_id,
  rp.aiworker_model_code,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  rp.display_name,
  rp.display_name || ' / ' || rp.aiworker_model_code AS selector_label,
  rp.business_offer_code,
  rp.pool_scope_code,
  rp.available_quantity,
  rp.reserved_quantity,
  GREATEST(rp.available_quantity - rp.reserved_quantity, 0) AS visible_available_quantity,
  rp.unlimited_assignment_flag,
  rp.rental_unit_code,
  rp.status_code,
  ARRAY_REMOVE(ARRAY[
    NULLIF(rp.placement_role_code_1, ''),
    NULLIF(rp.placement_role_code_2, ''),
    NULLIF(rp.placement_role_code_3, '')
  ], NULL) AS recommended_role_codes,
  rp.metadata_jsonb,
  rp.updated_at
FROM business.robot_pool rp
WHERE rp.status_code = 'active';

CREATE OR REPLACE VIEW business.vw_company_robot_selector_options AS
SELECT
  cre.company_robot_entitlement_id,
  cre.company_id,
  cre.robot_pool_id,
  cre.aiworker_model_code,
  COALESCE(rp.display_name, cre.aiworker_model_code) AS display_name,
  COALESCE(rp.display_name, cre.aiworker_model_code) || ' / ' || cre.aiworker_model_code AS selector_label,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  cre.business_offer_code,
  cre.entitlement_scope_code,
  cre.contracted_quantity,
  cre.usable_quantity,
  cre.assignment_mode_code,
  cre.status_code,
  ARRAY_REMOVE(ARRAY[
    NULLIF(rp.placement_role_code_1, ''),
    NULLIF(rp.placement_role_code_2, ''),
    NULLIF(rp.placement_role_code_3, '')
  ], NULL) AS recommended_role_codes,
  cre.updated_at
FROM business.company_robot_entitlement cre
LEFT JOIN business.robot_pool rp
  ON rp.robot_pool_id = cre.robot_pool_id
WHERE cre.status_code = 'active';

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
      WHEN v.recommended_role_codes[1] = btrim(p_role_code) THEN 1
      WHEN v.recommended_role_codes[2] = btrim(p_role_code) THEN 2
      WHEN v.recommended_role_codes[3] = btrim(p_role_code) THEN 3
      ELSE 999
    END AS sort_rank
  FROM business.vw_business_robot_selector_options v
  WHERE v.status_code = 'active'
    AND (
      p_role_code IS NULL
      OR btrim(p_role_code) = ''
      OR btrim(p_role_code) = ANY(v.recommended_role_codes)
    )
  ORDER BY
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN v.recommended_role_codes[1] = btrim(p_role_code) THEN 1
      WHEN v.recommended_role_codes[2] = btrim(p_role_code) THEN 2
      WHEN v.recommended_role_codes[3] = btrim(p_role_code) THEN 3
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
      WHEN v.recommended_role_codes[1] = btrim(p_role_code) THEN 1
      WHEN v.recommended_role_codes[2] = btrim(p_role_code) THEN 2
      WHEN v.recommended_role_codes[3] = btrim(p_role_code) THEN 3
      ELSE 999
    END AS sort_rank
  FROM business.vw_company_robot_selector_options v
  WHERE v.company_id = p_company_id
    AND v.status_code = 'active'
    AND (
      p_role_code IS NULL
      OR btrim(p_role_code) = ''
      OR btrim(p_role_code) = ANY(v.recommended_role_codes)
    )
  ORDER BY
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN v.recommended_role_codes[1] = btrim(p_role_code) THEN 1
      WHEN v.recommended_role_codes[2] = btrim(p_role_code) THEN 2
      WHEN v.recommended_role_codes[3] = btrim(p_role_code) THEN 3
      ELSE 999
    END,
    v.aiworker_series_code,
    v.aiworker_model_code;
$$;

CREATE OR REPLACE VIEW business.vw_aicm_robot_role_duplicate_rule AS
SELECT
  role_code,
  single_slot_flag AS duplicate_guard_flag,
  COALESCE(max_active_per_target, CASE WHEN single_slot_flag THEN 1 ELSE NULL::integer END) AS max_active_count,
  CASE WHEN single_slot_flag THEN 'same_company_target_role' ELSE 'multi_allowed' END AS duplicate_scope_code,
  note
FROM business.robot_placement_role_catalog
WHERE status_code = 'active';

COMMIT;
