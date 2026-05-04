-- ============================================================
-- WorkerRentalCore owner_civilization_id empty-table migration
-- PROPOSAL ONLY - NOT APPLIED
-- Review: 佐藤(DB担当)
-- DB: PERSONA_DATABASE_URL
-- ============================================================

-- Current audit says target worker_rental tables are empty.
-- No historical backfill is required.
-- DO NOT RUN until explicitly approved.

BEGIN;

ALTER TABLE business.worker_rental_contract
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid,
  ADD COLUMN IF NOT EXISTS target_company_id uuid,
  ADD COLUMN IF NOT EXISTS erp_company_id uuid;

ALTER TABLE business.worker_rental_period
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_usage_log
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_end_summary
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_safety_event
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_payment_intent
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_entitlement_grant
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_entitlement_balance
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_entitlement_usage
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_contract_line
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

ALTER TABLE business.worker_rental_status_history
  ADD COLUMN IF NOT EXISTS owner_civilization_id uuid;

CREATE INDEX IF NOT EXISTS idx_worker_rental_contract_owner_civ
  ON business.worker_rental_contract(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_period_owner_civ
  ON business.worker_rental_period(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_usage_log_owner_civ
  ON business.worker_rental_usage_log(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_end_summary_owner_civ
  ON business.worker_rental_end_summary(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_safety_event_owner_civ
  ON business.worker_rental_safety_event(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_payment_intent_owner_civ
  ON business.worker_rental_payment_intent(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_entitlement_grant_owner_civ
  ON business.worker_rental_entitlement_grant(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_entitlement_balance_owner_civ
  ON business.worker_rental_entitlement_balance(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_entitlement_usage_owner_civ
  ON business.worker_rental_entitlement_usage(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_contract_line_owner_civ
  ON business.worker_rental_contract_line(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_status_history_owner_civ
  ON business.worker_rental_status_history(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_contract_target_company
  ON business.worker_rental_contract(target_company_id);

CREATE INDEX IF NOT EXISTS idx_worker_rental_contract_erp_company
  ON business.worker_rental_contract(erp_company_id);

ROLLBACK;
