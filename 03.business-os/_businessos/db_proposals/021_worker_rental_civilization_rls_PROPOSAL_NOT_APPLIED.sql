-- ============================================================
-- WorkerRentalCore civilization_id RLS proposal
-- PROPOSAL ONLY - NOT APPLIED
-- Review: 佐藤(DB担当)
-- DB: PERSONA_DATABASE_URL
-- ============================================================

-- DO NOT RUN until approved and owner_civilization_id backfill is complete.

BEGIN;

CREATE OR REPLACE FUNCTION business.fn_business_current_civilization_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_civilization_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION business.fn_business_require_civilization_context(
  p_owner_civilization_id uuid,
  p_action_code text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_current uuid;
BEGIN
  v_current := business.fn_business_current_civilization_id();

  IF v_current IS NULL THEN
    RAISE EXCEPTION 'missing_civilization_context:%', p_action_code;
  END IF;

  IF p_owner_civilization_id IS NULL OR p_owner_civilization_id <> v_current THEN
    RAISE EXCEPTION 'civilization_context_mismatch:%', p_action_code;
  END IF;

  RETURN true;
END;
$$;

-- Example policy shape:
-- ALTER TABLE business.worker_rental_contract ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS worker_rental_contract_civilization_select ON business.worker_rental_contract;
-- CREATE POLICY worker_rental_contract_civilization_select
--   ON business.worker_rental_contract
--   FOR SELECT
--   USING (owner_civilization_id = business.fn_business_current_civilization_id());

ROLLBACK;
