-- ============================================================
-- BusinessOS AIWorker foundation
-- Scope: business robot pool / company entitlement / placement
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Rule: add-only, no destructive change
-- ============================================================

BEGIN;

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
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (aiworker_model_code, business_offer_code, pool_scope_code)
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
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, aiworker_model_code, business_offer_code, entitlement_scope_code)
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

ALTER TABLE business.robot_pool
  ADD COLUMN IF NOT EXISTS aiworker_model_code text,
  ADD COLUMN IF NOT EXISTS aiworker_series_code text,
  ADD COLUMN IF NOT EXISTS manufacturer_code text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS business_offer_code text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS pool_scope_code text DEFAULT 'business_global',
  ADD COLUMN IF NOT EXISTS available_quantity integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reserved_quantity integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unlimited_assignment_flag boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS rental_unit_code text DEFAULT 'month',
  ADD COLUMN IF NOT EXISTS status_code text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS metadata_jsonb jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE business.company_robot_entitlement
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS robot_pool_id uuid,
  ADD COLUMN IF NOT EXISTS aiworker_model_code text,
  ADD COLUMN IF NOT EXISTS business_offer_code text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS entitlement_scope_code text DEFAULT 'company',
  ADD COLUMN IF NOT EXISTS contracted_quantity integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usable_quantity integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assignment_mode_code text DEFAULT 'unlimited_placement',
  ADD COLUMN IF NOT EXISTS status_code text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS metadata_jsonb jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE business.company_robot_placement
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS company_robot_entitlement_id uuid,
  ADD COLUMN IF NOT EXISTS robot_pool_id uuid,
  ADD COLUMN IF NOT EXISTS aiworker_model_code text,
  ADD COLUMN IF NOT EXISTS target_level_code text,
  ADD COLUMN IF NOT EXISTS target_id uuid,
  ADD COLUMN IF NOT EXISTS app_code text DEFAULT 'AICompanyManager',
  ADD COLUMN IF NOT EXISTS role_code text,
  ADD COLUMN IF NOT EXISTS internal_nickname text,
  ADD COLUMN IF NOT EXISTS placement_quantity integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS placement_mode_code text DEFAULT 'role_assignment',
  ADD COLUMN IF NOT EXISTS status_code text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS metadata_jsonb jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_business_robot_pool_model_status
  ON business.robot_pool (aiworker_model_code, status_code);

CREATE INDEX IF NOT EXISTS idx_business_robot_pool_series
  ON business.robot_pool (aiworker_series_code);

CREATE INDEX IF NOT EXISTS idx_business_robot_entitlement_company_model
  ON business.company_robot_entitlement (company_id, aiworker_model_code, status_code);

CREATE INDEX IF NOT EXISTS idx_business_robot_placement_company_target
  ON business.company_robot_placement (company_id, target_level_code, target_id, status_code);

CREATE INDEX IF NOT EXISTS idx_business_robot_placement_role
  ON business.company_robot_placement (company_id, role_code, status_code);

CREATE OR REPLACE VIEW business.vw_business_robot_pool_status AS
SELECT
  rp.robot_pool_id,
  rp.aiworker_model_code,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  rp.display_name,
  rp.business_offer_code,
  rp.pool_scope_code,
  rp.available_quantity,
  rp.reserved_quantity,
  GREATEST(rp.available_quantity - rp.reserved_quantity, 0) AS visible_available_quantity,
  rp.unlimited_assignment_flag,
  rp.rental_unit_code,
  rp.status_code,
  COUNT(crp.company_robot_placement_id) FILTER (WHERE crp.status_code = 'active') AS active_placement_count,
  rp.created_at,
  rp.updated_at
FROM business.robot_pool rp
LEFT JOIN business.company_robot_placement crp
  ON crp.robot_pool_id = rp.robot_pool_id
GROUP BY
  rp.robot_pool_id,
  rp.aiworker_model_code,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  rp.display_name,
  rp.business_offer_code,
  rp.pool_scope_code,
  rp.available_quantity,
  rp.reserved_quantity,
  rp.unlimited_assignment_flag,
  rp.rental_unit_code,
  rp.status_code,
  rp.created_at,
  rp.updated_at;

CREATE OR REPLACE VIEW business.vw_company_robot_placement_status AS
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
  crp.placement_quantity,
  crp.status_code,
  cre.assignment_mode_code,
  cre.contracted_quantity,
  cre.usable_quantity,
  rp.display_name AS pool_display_name,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  crp.created_at,
  crp.updated_at
FROM business.company_robot_placement crp
LEFT JOIN business.company_robot_entitlement cre
  ON cre.company_robot_entitlement_id = crp.company_robot_entitlement_id
LEFT JOIN business.robot_pool rp
  ON rp.robot_pool_id = crp.robot_pool_id;

COMMIT;
