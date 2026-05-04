-- ============================================================
-- BusinessOS AIWorker pool selector and placement
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only / idempotent merge
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS business;

CREATE TABLE IF NOT EXISTS business.robot_pool (
  robot_pool_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aiworker_model_code text NOT NULL,
  aiworker_series_code text,
  manufacturer_code text,
  display_name text,
  business_offer_code text NOT NULL DEFAULT 'standard',
  pool_scope_code text NOT NULL DEFAULT 'business_global',
  available_quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer NOT NULL DEFAULT 0,
  unlimited_assignment_flag boolean NOT NULL DEFAULT true,
  rental_unit_code text NOT NULL DEFAULT 'month',
  status_code text NOT NULL DEFAULT 'active',
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business.company_robot_entitlement (
  company_robot_entitlement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  robot_pool_id uuid REFERENCES business.robot_pool(robot_pool_id),
  aiworker_model_code text NOT NULL,
  business_offer_code text NOT NULL DEFAULT 'standard',
  entitlement_scope_code text NOT NULL DEFAULT 'company',
  contracted_quantity integer NOT NULL DEFAULT 0,
  usable_quantity integer NOT NULL DEFAULT 0,
  assignment_mode_code text NOT NULL DEFAULT 'unlimited_placement',
  status_code text NOT NULL DEFAULT 'active',
  starts_at timestamptz,
  ends_at timestamptz,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business.company_robot_placement (
  company_robot_placement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  company_robot_entitlement_id uuid REFERENCES business.company_robot_entitlement(company_robot_entitlement_id),
  robot_pool_id uuid REFERENCES business.robot_pool(robot_pool_id),
  aiworker_model_code text NOT NULL,
  target_level_code text NOT NULL,
  target_id uuid,
  app_code text NOT NULL DEFAULT 'AICompanyManager',
  role_code text NOT NULL,
  internal_nickname text NOT NULL,
  placement_quantity integer NOT NULL DEFAULT 1,
  placement_mode_code text NOT NULL DEFAULT 'role_assignment',
  status_code text NOT NULL DEFAULT 'active',
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business.robot_pool_sync_ledger (
  robot_pool_sync_ledger_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_source_code text NOT NULL,
  aiworker_model_code text NOT NULL,
  robot_pool_id uuid REFERENCES business.robot_pool(robot_pool_id),
  sync_status_code text NOT NULL DEFAULT 'applied',
  note text,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_business_robot_pool_model_offer_scope
  ON business.robot_pool (aiworker_model_code, business_offer_code, pool_scope_code);

CREATE UNIQUE INDEX IF NOT EXISTS ux_business_company_robot_entitlement_company_model_offer_scope
  ON business.company_robot_entitlement (
    company_id,
    aiworker_model_code,
    business_offer_code,
    entitlement_scope_code
  );

CREATE INDEX IF NOT EXISTS idx_business_robot_pool_status_selector
  ON business.robot_pool (status_code, aiworker_series_code, aiworker_model_code);

CREATE INDEX IF NOT EXISTS idx_business_robot_placement_app_role
  ON business.company_robot_placement (app_code, role_code, status_code);

CREATE OR REPLACE FUNCTION business.fn_business_aiworker_upsert_robot_pool(
  p_aiworker_model_code text,
  p_aiworker_series_code text DEFAULT NULL,
  p_manufacturer_code text DEFAULT NULL,
  p_display_name text DEFAULT NULL,
  p_business_offer_code text DEFAULT 'standard',
  p_pool_scope_code text DEFAULT 'business_global',
  p_available_quantity integer DEFAULT 0,
  p_rental_unit_code text DEFAULT 'month',
  p_status_code text DEFAULT 'active',
  p_metadata_jsonb jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_robot_pool_id uuid;
BEGIN
  IF p_aiworker_model_code IS NULL OR btrim(p_aiworker_model_code) = '' THEN
    RAISE EXCEPTION 'aiworker_model_code_required';
  END IF;

  INSERT INTO business.robot_pool (
    aiworker_model_code,
    aiworker_series_code,
    manufacturer_code,
    display_name,
    business_offer_code,
    pool_scope_code,
    available_quantity,
    reserved_quantity,
    unlimited_assignment_flag,
    rental_unit_code,
    status_code,
    metadata_jsonb,
    created_at,
    updated_at
  )
  VALUES (
    btrim(p_aiworker_model_code),
    NULLIF(btrim(COALESCE(p_aiworker_series_code, '')), ''),
    NULLIF(btrim(COALESCE(p_manufacturer_code, '')), ''),
    NULLIF(btrim(COALESCE(p_display_name, '')), ''),
    COALESCE(NULLIF(btrim(p_business_offer_code), ''), 'standard'),
    COALESCE(NULLIF(btrim(p_pool_scope_code), ''), 'business_global'),
    GREATEST(COALESCE(p_available_quantity, 0), 0),
    0,
    true,
    COALESCE(NULLIF(btrim(p_rental_unit_code), ''), 'month'),
    COALESCE(NULLIF(btrim(p_status_code), ''), 'active'),
    COALESCE(p_metadata_jsonb, '{}'::jsonb),
    now(),
    now()
  )
  ON CONFLICT (aiworker_model_code, business_offer_code, pool_scope_code)
  DO UPDATE SET
    aiworker_series_code = EXCLUDED.aiworker_series_code,
    manufacturer_code = EXCLUDED.manufacturer_code,
    display_name = EXCLUDED.display_name,
    available_quantity = GREATEST(EXCLUDED.available_quantity, business.robot_pool.available_quantity),
    rental_unit_code = EXCLUDED.rental_unit_code,
    status_code = EXCLUDED.status_code,
    metadata_jsonb = business.robot_pool.metadata_jsonb || EXCLUDED.metadata_jsonb,
    updated_at = now()
  RETURNING robot_pool_id INTO v_robot_pool_id;

  INSERT INTO business.robot_pool_sync_ledger (
    sync_source_code,
    aiworker_model_code,
    robot_pool_id,
    sync_status_code,
    note,
    metadata_jsonb
  )
  VALUES (
    'manual_seed_or_merge',
    btrim(p_aiworker_model_code),
    v_robot_pool_id,
    'applied',
    'Business robot pool upsert applied',
    jsonb_build_object(
      'business_offer_code', COALESCE(NULLIF(btrim(p_business_offer_code), ''), 'standard'),
      'pool_scope_code', COALESCE(NULLIF(btrim(p_pool_scope_code), ''), 'business_global')
    )
  );

  RETURN v_robot_pool_id;
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_grant_entitlement(
  p_company_id uuid,
  p_aiworker_model_code text,
  p_quantity integer DEFAULT 1,
  p_business_offer_code text DEFAULT 'standard',
  p_entitlement_scope_code text DEFAULT 'company',
  p_assignment_mode_code text DEFAULT 'unlimited_placement'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_robot_pool_id uuid;
  v_entitlement_id uuid;
  v_quantity integer;
BEGIN
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'company_id_required';
  END IF;

  IF p_aiworker_model_code IS NULL OR btrim(p_aiworker_model_code) = '' THEN
    RAISE EXCEPTION 'aiworker_model_code_required';
  END IF;

  v_quantity := GREATEST(COALESCE(p_quantity, 1), 1);

  SELECT robot_pool_id
    INTO v_robot_pool_id
  FROM business.robot_pool
  WHERE aiworker_model_code = btrim(p_aiworker_model_code)
    AND business_offer_code = COALESCE(NULLIF(btrim(p_business_offer_code), ''), 'standard')
    AND status_code = 'active'
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_robot_pool_id IS NULL THEN
    RAISE EXCEPTION 'robot_pool_not_found:%', p_aiworker_model_code;
  END IF;

  INSERT INTO business.company_robot_entitlement (
    company_id,
    robot_pool_id,
    aiworker_model_code,
    business_offer_code,
    entitlement_scope_code,
    contracted_quantity,
    usable_quantity,
    assignment_mode_code,
    status_code,
    created_at,
    updated_at
  )
  VALUES (
    p_company_id,
    v_robot_pool_id,
    btrim(p_aiworker_model_code),
    COALESCE(NULLIF(btrim(p_business_offer_code), ''), 'standard'),
    COALESCE(NULLIF(btrim(p_entitlement_scope_code), ''), 'company'),
    v_quantity,
    v_quantity,
    COALESCE(NULLIF(btrim(p_assignment_mode_code), ''), 'unlimited_placement'),
    'active',
    now(),
    now()
  )
  ON CONFLICT (
    company_id,
    aiworker_model_code,
    business_offer_code,
    entitlement_scope_code
  )
  DO UPDATE SET
    robot_pool_id = EXCLUDED.robot_pool_id,
    contracted_quantity = GREATEST(
      business.company_robot_entitlement.contracted_quantity,
      EXCLUDED.contracted_quantity
    ),
    usable_quantity = GREATEST(
      business.company_robot_entitlement.usable_quantity,
      EXCLUDED.usable_quantity
    ),
    assignment_mode_code = EXCLUDED.assignment_mode_code,
    status_code = 'active',
    updated_at = now()
  RETURNING company_robot_entitlement_id INTO v_entitlement_id;

  RETURN v_entitlement_id;
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_place(
  p_company_id uuid,
  p_aiworker_model_code text,
  p_target_level_code text,
  p_role_code text,
  p_internal_nickname text,
  p_target_id uuid DEFAULT NULL,
  p_app_code text DEFAULT 'AICompanyManager',
  p_placement_quantity integer DEFAULT 1,
  p_metadata_jsonb jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_robot_pool_id uuid;
  v_entitlement_id uuid;
  v_assignment_mode_code text;
  v_usable_quantity integer;
  v_active_placement_count integer;
  v_placement_id uuid;
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
    cre.company_robot_entitlement_id,
    cre.robot_pool_id,
    cre.assignment_mode_code,
    cre.usable_quantity
    INTO
    v_entitlement_id,
    v_robot_pool_id,
    v_assignment_mode_code,
    v_usable_quantity
  FROM business.company_robot_entitlement cre
  WHERE cre.company_id = p_company_id
    AND cre.aiworker_model_code = btrim(p_aiworker_model_code)
    AND cre.status_code = 'active'
  ORDER BY cre.updated_at DESC
  LIMIT 1;

  IF v_entitlement_id IS NULL THEN
    RAISE EXCEPTION 'company_robot_entitlement_not_found:%', p_aiworker_model_code;
  END IF;

  SELECT COUNT(*)
    INTO v_active_placement_count
  FROM business.company_robot_placement
  WHERE company_id = p_company_id
    AND aiworker_model_code = btrim(p_aiworker_model_code)
    AND status_code = 'active';

  IF v_assignment_mode_code = 'limited_quantity'
     AND v_active_placement_count >= COALESCE(v_usable_quantity, 0) THEN
    RAISE EXCEPTION 'company_robot_entitlement_quantity_exceeded:%', p_aiworker_model_code;
  END IF;

  INSERT INTO business.company_robot_placement (
    company_id,
    company_robot_entitlement_id,
    robot_pool_id,
    aiworker_model_code,
    target_level_code,
    target_id,
    app_code,
    role_code,
    internal_nickname,
    placement_quantity,
    placement_mode_code,
    status_code,
    metadata_jsonb,
    created_at,
    updated_at
  )
  VALUES (
    p_company_id,
    v_entitlement_id,
    v_robot_pool_id,
    btrim(p_aiworker_model_code),
    btrim(p_target_level_code),
    p_target_id,
    COALESCE(NULLIF(btrim(p_app_code), ''), 'AICompanyManager'),
    btrim(p_role_code),
    btrim(p_internal_nickname),
    GREATEST(COALESCE(p_placement_quantity, 1), 1),
    'role_assignment',
    'active',
    COALESCE(p_metadata_jsonb, '{}'::jsonb),
    now(),
    now()
  )
  RETURNING company_robot_placement_id INTO v_placement_id;

  RETURN v_placement_id;
END;
$$;

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'HD-R5',
  'HD',
  'helios_dynamics',
  'Manager',
  'standard',
  'business_global',
  10,
  'month',
  'active',
  '{"recommended_roles":["President","ExecutiveManager","Manager"],"source":"core_seed"}'::jsonb
);

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'HD-R4',
  'HD',
  'helios_dynamics',
  'Leader',
  'standard',
  'business_global',
  30,
  'month',
  'active',
  '{"recommended_roles":["Manager","Leader"],"source":"core_seed"}'::jsonb
);

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'HD-R3',
  'HD',
  'helios_dynamics',
  'Worker',
  'standard',
  'business_global',
  100,
  'month',
  'active',
  '{"recommended_roles":["Worker"],"source":"core_seed"}'::jsonb
);

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'HD-R1',
  'HD',
  'helios_dynamics',
  'Helper',
  'standard',
  'business_global',
  100,
  'month',
  'active',
  '{"recommended_roles":["Helper","Secretary"],"source":"core_seed"}'::jsonb
);

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'HD-R2',
  'HD',
  'helios_dynamics',
  'Butler',
  'standard',
  'business_global',
  50,
  'month',
  'active',
  '{"recommended_roles":["Butler","Security","Worker"],"source":"core_seed"}'::jsonb
);

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'HD-R1C',
  'HD',
  'helios_dynamics',
  'Friend',
  'standard',
  'business_global',
  100,
  'month',
  'active',
  '{"recommended_roles":["Friend","Support"],"source":"core_seed"}'::jsonb
);

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'MG-NORN-001',
  'MEGAMI',
  'mathers_garden',
  'Urd',
  'standard',
  'business_global',
  20,
  'month',
  'active',
  '{"recommended_roles":["Specialist","Advisor","Worker"],"source":"megami_seed"}'::jsonb
);

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'MG-NORN-002',
  'MEGAMI',
  'mathers_garden',
  'Verdandi',
  'standard',
  'business_global',
  20,
  'month',
  'active',
  '{"recommended_roles":["Specialist","Advisor","Worker"],"source":"megami_seed"}'::jsonb
);

SELECT business.fn_business_aiworker_upsert_robot_pool(
  'MG-NORN-003',
  'MEGAMI',
  'mathers_garden',
  'Skuld',
  'standard',
  'business_global',
  20,
  'month',
  'active',
  '{"recommended_roles":["Specialist","Advisor","Worker"],"source":"megami_seed"}'::jsonb
);

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
  CASE
    WHEN rp.aiworker_model_code = 'HD-R5' THEN ARRAY['President','ExecutiveManager','Manager']
    WHEN rp.aiworker_model_code = 'HD-R4' THEN ARRAY['Manager','Leader']
    WHEN rp.aiworker_model_code = 'HD-R3' THEN ARRAY['Worker']
    WHEN rp.aiworker_model_code = 'HD-R1' THEN ARRAY['Helper','Secretary']
    WHEN rp.aiworker_model_code = 'HD-R2' THEN ARRAY['Butler','Security','Worker']
    WHEN rp.aiworker_model_code = 'HD-R1C' THEN ARRAY['Friend','Support']
    WHEN rp.aiworker_series_code = 'MEGAMI' THEN ARRAY['Specialist','Advisor','Worker']
    ELSE ARRAY['Worker']
  END AS recommended_role_codes,
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
  CASE
    WHEN cre.aiworker_model_code = 'HD-R5' THEN ARRAY['President','ExecutiveManager','Manager']
    WHEN cre.aiworker_model_code = 'HD-R4' THEN ARRAY['Manager','Leader']
    WHEN cre.aiworker_model_code = 'HD-R3' THEN ARRAY['Worker']
    WHEN cre.aiworker_model_code = 'HD-R1' THEN ARRAY['Helper','Secretary']
    WHEN cre.aiworker_model_code = 'HD-R2' THEN ARRAY['Butler','Security','Worker']
    WHEN cre.aiworker_model_code = 'HD-R1C' THEN ARRAY['Friend','Support']
    WHEN rp.aiworker_series_code = 'MEGAMI' THEN ARRAY['Specialist','Advisor','Worker']
    ELSE ARRAY['Worker']
  END AS recommended_role_codes,
  cre.updated_at
FROM business.company_robot_entitlement cre
LEFT JOIN business.robot_pool rp
  ON rp.robot_pool_id = cre.robot_pool_id
WHERE cre.status_code = 'active';

CREATE OR REPLACE VIEW business.vw_company_robot_placement_display AS
SELECT
  crp.company_robot_placement_id,
  crp.company_id,
  crp.target_level_code,
  crp.target_id,
  crp.app_code,
  crp.role_code,
  crp.internal_nickname,
  crp.internal_nickname || '@' || crp.role_code AS display_label,
  crp.aiworker_model_code,
  COALESCE(rp.display_name, crp.aiworker_model_code) AS model_display_name,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  crp.placement_quantity,
  crp.status_code,
  crp.created_at,
  crp.updated_at
FROM business.company_robot_placement crp
LEFT JOIN business.robot_pool rp
  ON rp.robot_pool_id = crp.robot_pool_id;

COMMIT;
