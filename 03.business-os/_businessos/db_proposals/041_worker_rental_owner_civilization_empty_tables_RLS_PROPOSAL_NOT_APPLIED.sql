-- ============================================================
-- WorkerRentalCore owner_civilization_id RLS
-- PROPOSAL ONLY - NOT APPLIED
-- Review: 佐藤(DB担当)
-- DB: PERSONA_DATABASE_URL
-- ============================================================

-- DO NOT RUN until:
-- 1. owner_civilization_id columns are applied
-- 2. write API sets app.current_civilization_id
-- 3. insert smoke passes
-- 4. 佐藤(DB担当) approves RLS

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

-- Policy shape example only.
-- Actual policies should be generated after write API is updated.

ROLLBACK;
