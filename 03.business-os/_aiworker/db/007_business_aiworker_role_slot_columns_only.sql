-- ============================================================
-- BusinessOS AIWorker role slot columns only
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only columns
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

DO $$
BEGIN
  IF to_regclass('business.robot_pool') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_pool';
  END IF;
END $$;

ALTER TABLE business.robot_pool
  ADD COLUMN IF NOT EXISTS placement_role_code_1 text,
  ADD COLUMN IF NOT EXISTS placement_role_code_2 text,
  ADD COLUMN IF NOT EXISTS placement_role_code_3 text,
  ADD COLUMN IF NOT EXISTS placement_role_config_status_code text NOT NULL DEFAULT 'unset',
  ADD COLUMN IF NOT EXISTS placement_role_config_note text,
  ADD COLUMN IF NOT EXISTS placement_role_config_updated_at timestamptz NOT NULL DEFAULT now();

COMMENT ON COLUMN business.robot_pool.placement_role_code_1 IS
  'BusinessOS / AICompanyManager placement role slot 1. Model identity and placement role are separate.';

COMMENT ON COLUMN business.robot_pool.placement_role_code_2 IS
  'BusinessOS / AICompanyManager placement role slot 2. Maximum 3 role slots per robot_pool row.';

COMMENT ON COLUMN business.robot_pool.placement_role_code_3 IS
  'BusinessOS / AICompanyManager placement role slot 3. Maximum 3 role slots per robot_pool row.';

COMMENT ON COLUMN business.robot_pool.placement_role_config_status_code IS
  'Role slot configuration status. Initial default is unset.';

COMMENT ON COLUMN business.robot_pool.placement_role_config_note IS
  'Role slot configuration note.';

COMMENT ON COLUMN business.robot_pool.placement_role_config_updated_at IS
  'Timestamp for role slot configuration update.';

COMMIT;
