-- ============================================================
-- WorkerRentalCore owner_civilization_id RLS draft
-- NOT APPLIED
-- ============================================================
-- This file is a draft only.
-- Do not execute until ownership verification passes and explicit GO is given.

BEGIN;

-- Current app context helper proposal:
-- current_setting('app.current_civilization_id', true)

-- Helper function proposal:
-- CREATE OR REPLACE FUNCTION business.fn_worker_rental_current_civilization_id()
-- RETURNS uuid
-- LANGUAGE sql
-- STABLE
-- AS $$
--   SELECT NULLIF(current_setting('app.current_civilization_id', true), '')::uuid;
-- $$;

-- Example pattern:
-- ALTER TABLE business.worker_rental_contract ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS worker_rental_contract_owner_select ON business.worker_rental_contract;
-- CREATE POLICY worker_rental_contract_owner_select
--   ON business.worker_rental_contract
--   FOR SELECT
--   USING (owner_civilization_id = NULLIF(current_setting('app.current_civilization_id', true), '')::uuid);
--
-- DROP POLICY IF EXISTS worker_rental_contract_owner_insert ON business.worker_rental_contract;
-- CREATE POLICY worker_rental_contract_owner_insert
--   ON business.worker_rental_contract
--   FOR INSERT
--   WITH CHECK (owner_civilization_id = NULLIF(current_setting('app.current_civilization_id', true), '')::uuid);
--
-- DROP POLICY IF EXISTS worker_rental_contract_owner_update ON business.worker_rental_contract;
-- CREATE POLICY worker_rental_contract_owner_update
--   ON business.worker_rental_contract
--   FOR UPDATE
--   USING (owner_civilization_id = NULLIF(current_setting('app.current_civilization_id', true), '')::uuid)
--   WITH CHECK (owner_civilization_id = NULLIF(current_setting('app.current_civilization_id', true), '')::uuid);

ROLLBACK;
