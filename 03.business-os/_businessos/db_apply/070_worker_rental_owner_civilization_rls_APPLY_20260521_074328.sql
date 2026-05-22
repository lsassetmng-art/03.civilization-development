-- ============================================================
-- WorkerRentalCore owner_civilization_id RLS APPLY
-- NOT EXECUTED / REVIEW REQUIRED
-- ============================================================
-- Owner boundary:
--   owner_civilization_id = current_setting('app.current_civilization_id', true)::uuid
--
-- Runtime requirement:
--   API must set app.current_civilization_id inside the same transaction.
--
-- DELETE:
--   intentionally no DELETE policies.
--
-- Safety:
--   This file ends with ROLLBACK and must not be applied as-is.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Context helper
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION business.fn_worker_rental_current_civilization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = business, public
AS $$
  SELECT NULLIF(current_setting('app.current_civilization_id', true), '')::uuid;
$$;

-- ------------------------------------------------------------
-- business.worker_rental_contract
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_contract FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_contract_owner_select ON business.worker_rental_contract;
CREATE POLICY worker_rental_contract_owner_select
  ON business.worker_rental_contract
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_contract_owner_insert ON business.worker_rental_contract;
CREATE POLICY worker_rental_contract_owner_insert
  ON business.worker_rental_contract
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_contract_owner_update ON business.worker_rental_contract;
CREATE POLICY worker_rental_contract_owner_update
  ON business.worker_rental_contract
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_contract_line
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_contract_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_contract_line FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_contract_line_owner_select ON business.worker_rental_contract_line;
CREATE POLICY worker_rental_contract_line_owner_select
  ON business.worker_rental_contract_line
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_contract_line_owner_insert ON business.worker_rental_contract_line;
CREATE POLICY worker_rental_contract_line_owner_insert
  ON business.worker_rental_contract_line
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_contract_line_owner_update ON business.worker_rental_contract_line;
CREATE POLICY worker_rental_contract_line_owner_update
  ON business.worker_rental_contract_line
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_status_history
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_status_history FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_status_history_owner_select ON business.worker_rental_status_history;
CREATE POLICY worker_rental_status_history_owner_select
  ON business.worker_rental_status_history
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_status_history_owner_insert ON business.worker_rental_status_history;
CREATE POLICY worker_rental_status_history_owner_insert
  ON business.worker_rental_status_history
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_status_history_owner_update ON business.worker_rental_status_history;
CREATE POLICY worker_rental_status_history_owner_update
  ON business.worker_rental_status_history
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_period
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_period ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_period FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_period_owner_select ON business.worker_rental_period;
CREATE POLICY worker_rental_period_owner_select
  ON business.worker_rental_period
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_period_owner_insert ON business.worker_rental_period;
CREATE POLICY worker_rental_period_owner_insert
  ON business.worker_rental_period
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_period_owner_update ON business.worker_rental_period;
CREATE POLICY worker_rental_period_owner_update
  ON business.worker_rental_period
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_payment_intent
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_payment_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_payment_intent FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_payment_intent_owner_select ON business.worker_rental_payment_intent;
CREATE POLICY worker_rental_payment_intent_owner_select
  ON business.worker_rental_payment_intent
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_payment_intent_owner_insert ON business.worker_rental_payment_intent;
CREATE POLICY worker_rental_payment_intent_owner_insert
  ON business.worker_rental_payment_intent
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_payment_intent_owner_update ON business.worker_rental_payment_intent;
CREATE POLICY worker_rental_payment_intent_owner_update
  ON business.worker_rental_payment_intent
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_end_summary
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_end_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_end_summary FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_end_summary_owner_select ON business.worker_rental_end_summary;
CREATE POLICY worker_rental_end_summary_owner_select
  ON business.worker_rental_end_summary
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_end_summary_owner_insert ON business.worker_rental_end_summary;
CREATE POLICY worker_rental_end_summary_owner_insert
  ON business.worker_rental_end_summary
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_end_summary_owner_update ON business.worker_rental_end_summary;
CREATE POLICY worker_rental_end_summary_owner_update
  ON business.worker_rental_end_summary
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_usage_log
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_usage_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_usage_log_owner_select ON business.worker_rental_usage_log;
CREATE POLICY worker_rental_usage_log_owner_select
  ON business.worker_rental_usage_log
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_usage_log_owner_insert ON business.worker_rental_usage_log;
CREATE POLICY worker_rental_usage_log_owner_insert
  ON business.worker_rental_usage_log
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_usage_log_owner_update ON business.worker_rental_usage_log;
CREATE POLICY worker_rental_usage_log_owner_update
  ON business.worker_rental_usage_log
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_safety_event
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_safety_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_safety_event FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_safety_event_owner_select ON business.worker_rental_safety_event;
CREATE POLICY worker_rental_safety_event_owner_select
  ON business.worker_rental_safety_event
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_safety_event_owner_insert ON business.worker_rental_safety_event;
CREATE POLICY worker_rental_safety_event_owner_insert
  ON business.worker_rental_safety_event
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_safety_event_owner_update ON business.worker_rental_safety_event;
CREATE POLICY worker_rental_safety_event_owner_update
  ON business.worker_rental_safety_event
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_entitlement_grant
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_entitlement_grant ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_entitlement_grant FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_entitlement_grant_owner_select ON business.worker_rental_entitlement_grant;
CREATE POLICY worker_rental_entitlement_grant_owner_select
  ON business.worker_rental_entitlement_grant
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_entitlement_grant_owner_insert ON business.worker_rental_entitlement_grant;
CREATE POLICY worker_rental_entitlement_grant_owner_insert
  ON business.worker_rental_entitlement_grant
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_entitlement_grant_owner_update ON business.worker_rental_entitlement_grant;
CREATE POLICY worker_rental_entitlement_grant_owner_update
  ON business.worker_rental_entitlement_grant
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_entitlement_balance
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_entitlement_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_entitlement_balance FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_entitlement_balance_owner_select ON business.worker_rental_entitlement_balance;
CREATE POLICY worker_rental_entitlement_balance_owner_select
  ON business.worker_rental_entitlement_balance
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_entitlement_balance_owner_insert ON business.worker_rental_entitlement_balance;
CREATE POLICY worker_rental_entitlement_balance_owner_insert
  ON business.worker_rental_entitlement_balance
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_entitlement_balance_owner_update ON business.worker_rental_entitlement_balance;
CREATE POLICY worker_rental_entitlement_balance_owner_update
  ON business.worker_rental_entitlement_balance
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

-- ------------------------------------------------------------
-- business.worker_rental_entitlement_usage
-- ------------------------------------------------------------

ALTER TABLE business.worker_rental_entitlement_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.worker_rental_entitlement_usage FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worker_rental_entitlement_usage_owner_select ON business.worker_rental_entitlement_usage;
CREATE POLICY worker_rental_entitlement_usage_owner_select
  ON business.worker_rental_entitlement_usage
  FOR SELECT
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_entitlement_usage_owner_insert ON business.worker_rental_entitlement_usage;
CREATE POLICY worker_rental_entitlement_usage_owner_insert
  ON business.worker_rental_entitlement_usage
  FOR INSERT
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

DROP POLICY IF EXISTS worker_rental_entitlement_usage_owner_update ON business.worker_rental_entitlement_usage;
CREATE POLICY worker_rental_entitlement_usage_owner_update
  ON business.worker_rental_entitlement_usage
  FOR UPDATE
  USING (owner_civilization_id = business.fn_worker_rental_current_civilization_id())
  WITH CHECK (owner_civilization_id = business.fn_worker_rental_current_civilization_id());

COMMIT;
