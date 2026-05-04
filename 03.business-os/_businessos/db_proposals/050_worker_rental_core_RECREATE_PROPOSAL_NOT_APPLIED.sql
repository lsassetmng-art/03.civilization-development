-- ============================================================
-- WorkerRentalCore RECREATE proposal
-- PROPOSAL ONLY - NOT APPLIED
-- Review: 佐藤(DB担当)
-- DB: PERSONA_DATABASE_URL
-- ============================================================
-- IMPORTANT:
-- This file intentionally uses ROLLBACK at the end.
-- Do not replace ROLLBACK with COMMIT until explicitly approved.
-- This proposal assumes target worker_rental_* tables are empty.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Safety guard: all target transactional tables must be empty.
-- ------------------------------------------------------------
DO $$
DECLARE
  v_total bigint;
BEGIN
  SELECT
    (SELECT COUNT(*) FROM business.worker_rental_contract)
    + (SELECT COUNT(*) FROM business.worker_rental_contract_line)
    + (SELECT COUNT(*) FROM business.worker_rental_period)
    + (SELECT COUNT(*) FROM business.worker_rental_usage_log)
    + (SELECT COUNT(*) FROM business.worker_rental_end_summary)
    + (SELECT COUNT(*) FROM business.worker_rental_safety_event)
    + (SELECT COUNT(*) FROM business.worker_rental_payment_intent)
    + (SELECT COUNT(*) FROM business.worker_rental_entitlement_grant)
    + (SELECT COUNT(*) FROM business.worker_rental_entitlement_balance)
    + (SELECT COUNT(*) FROM business.worker_rental_entitlement_usage)
    + (SELECT COUNT(*) FROM business.worker_rental_status_history)
  INTO v_total;

  IF v_total <> 0 THEN
    RAISE EXCEPTION 'worker_rental_recreate_aborted_non_empty_tables:%', v_total;
  END IF;
END $$;

-- ------------------------------------------------------------
-- Drop dependent views first.
-- ------------------------------------------------------------
DROP VIEW IF EXISTS business.v_worker_rental_contract_summary;
DROP VIEW IF EXISTS business.v_worker_rental_entitlement_balance_active;
DROP VIEW IF EXISTS business.v_worker_rental_monthly_free_ticket_rule;

-- ------------------------------------------------------------
-- Drop empty transactional tables.
-- ------------------------------------------------------------
DROP TABLE IF EXISTS business.worker_rental_status_history;
DROP TABLE IF EXISTS business.worker_rental_entitlement_usage;
DROP TABLE IF EXISTS business.worker_rental_entitlement_balance;
DROP TABLE IF EXISTS business.worker_rental_entitlement_grant;
DROP TABLE IF EXISTS business.worker_rental_payment_intent;
DROP TABLE IF EXISTS business.worker_rental_safety_event;
DROP TABLE IF EXISTS business.worker_rental_end_summary;
DROP TABLE IF EXISTS business.worker_rental_usage_log;
DROP TABLE IF EXISTS business.worker_rental_period;
DROP TABLE IF EXISTS business.worker_rental_contract_line;
DROP TABLE IF EXISTS business.worker_rental_contract;

-- Keep worker_rental_unit_policy if it has data. It is catalog/policy, not user-owned.
-- If a clean recreation of unit policy is desired, handle it in a separate catalog migration.

-- ------------------------------------------------------------
-- Parent contract table.
-- ------------------------------------------------------------
CREATE TABLE business.worker_rental_contract (
  rental_contract_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,
  target_company_id uuid NULL,
  erp_company_id uuid NULL,

  app_code text NOT NULL,
  service_code text NOT NULL,

  worker_owner_schema text NOT NULL DEFAULT 'aiworker',
  worker_id uuid NULL,
  worker_type text NOT NULL,
  worker_snapshot_id uuid NULL,
  aiworker_model_code text NULL,
  role_code text NULL,

  rental_unit_kind text NOT NULL,
  rental_unit_count integer NOT NULL DEFAULT 1,
  rental_total_minutes integer NULL,

  rental_starts_at timestamptz NULL,
  rental_ends_at timestamptz NULL,

  base_price_jpy integer NOT NULL DEFAULT 0,
  applied_entitlement_count integer NOT NULL DEFAULT 0,
  free_unit_count integer NOT NULL DEFAULT 0,
  paid_unit_count integer NOT NULL DEFAULT 0,
  final_price_jpy integer NOT NULL DEFAULT 0,

  contract_status text NOT NULL DEFAULT 'draft',
  price_version text NULL,
  locale text NOT NULL DEFAULT 'ja',
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_contract_owner_civ_required CHECK (owner_civilization_id IS NOT NULL),
  CONSTRAINT worker_rental_contract_unit_count_positive CHECK (rental_unit_count > 0),
  CONSTRAINT worker_rental_contract_price_non_negative CHECK (
    base_price_jpy >= 0
    AND applied_entitlement_count >= 0
    AND free_unit_count >= 0
    AND paid_unit_count >= 0
    AND final_price_jpy >= 0
  )
);

CREATE TABLE business.worker_rental_contract_line (
  rental_contract_line_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_contract_id uuid NOT NULL REFERENCES business.worker_rental_contract(rental_contract_id) ON DELETE RESTRICT,
  owner_civilization_id uuid NOT NULL,

  line_type text NOT NULL,
  rental_unit_kind text NOT NULL,
  rental_unit_count integer NOT NULL DEFAULT 1,
  quantity integer NOT NULL DEFAULT 1,
  unit_price_jpy integer NOT NULL DEFAULT 0,
  amount_jpy integer NOT NULL DEFAULT 0,
  note text NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_contract_line_owner_civ_required CHECK (owner_civilization_id IS NOT NULL),
  CONSTRAINT worker_rental_contract_line_quantity_positive CHECK (quantity > 0),
  CONSTRAINT worker_rental_contract_line_amount_non_negative CHECK (unit_price_jpy >= 0 AND amount_jpy >= 0)
);

CREATE TABLE business.worker_rental_period (
  rental_period_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_contract_id uuid NOT NULL REFERENCES business.worker_rental_contract(rental_contract_id) ON DELETE RESTRICT,
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,

  worker_owner_schema text NOT NULL DEFAULT 'aiworker',
  worker_id uuid NULL,
  worker_type text NOT NULL,

  period_status text NOT NULL DEFAULT 'pending',
  starts_at timestamptz NULL,
  ends_at timestamptz NULL,
  actual_started_at timestamptz NULL,
  actual_ended_at timestamptz NULL,
  remaining_seconds_snapshot integer NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_period_owner_civ_required CHECK (owner_civilization_id IS NOT NULL)
);

CREATE TABLE business.worker_rental_usage_log (
  rental_usage_log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_contract_id uuid NOT NULL REFERENCES business.worker_rental_contract(rental_contract_id) ON DELETE RESTRICT,
  rental_period_id uuid NULL REFERENCES business.worker_rental_period(rental_period_id) ON DELETE SET NULL,
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,

  app_code text NOT NULL,
  service_code text NOT NULL,
  worker_owner_schema text NOT NULL DEFAULT 'aiworker',
  worker_id uuid NULL,
  worker_type text NOT NULL,

  usage_unit_kind text NOT NULL,
  usage_unit_count integer NOT NULL DEFAULT 0,
  usage_seconds integer NOT NULL DEFAULT 0,
  event_count integer NOT NULL DEFAULT 0,
  safety_event_count integer NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_usage_log_owner_civ_required CHECK (owner_civilization_id IS NOT NULL),
  CONSTRAINT worker_rental_usage_log_non_negative CHECK (
    usage_unit_count >= 0
    AND usage_seconds >= 0
    AND event_count >= 0
    AND safety_event_count >= 0
  )
);

CREATE TABLE business.worker_rental_end_summary (
  rental_end_summary_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_contract_id uuid NOT NULL REFERENCES business.worker_rental_contract(rental_contract_id) ON DELETE RESTRICT,
  rental_period_id uuid NULL REFERENCES business.worker_rental_period(rental_period_id) ON DELETE SET NULL,
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,

  app_code text NOT NULL,
  service_code text NOT NULL,
  worker_owner_schema text NOT NULL DEFAULT 'aiworker',
  worker_id uuid NULL,
  worker_type text NOT NULL,

  ended_reason text NULL,
  used_seconds integer NOT NULL DEFAULT 0,
  summary_text text NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_end_summary_owner_civ_required CHECK (owner_civilization_id IS NOT NULL)
);

CREATE TABLE business.worker_rental_safety_event (
  rental_safety_event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_contract_id uuid NOT NULL REFERENCES business.worker_rental_contract(rental_contract_id) ON DELETE RESTRICT,
  rental_period_id uuid NULL REFERENCES business.worker_rental_period(rental_period_id) ON DELETE SET NULL,
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,

  app_code text NOT NULL,
  service_code text NOT NULL,
  worker_owner_schema text NOT NULL DEFAULT 'aiworker',
  worker_id uuid NULL,
  worker_type text NOT NULL,

  safety_state text NOT NULL,
  safety_code text NOT NULL,
  event_summary text NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_safety_event_owner_civ_required CHECK (owner_civilization_id IS NOT NULL)
);

CREATE TABLE business.worker_rental_payment_intent (
  rental_payment_intent_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_contract_id uuid NOT NULL REFERENCES business.worker_rental_contract(rental_contract_id) ON DELETE RESTRICT,
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,

  amount_jpy integer NOT NULL DEFAULT 0,
  currency_code text NOT NULL DEFAULT 'JPY',
  payment_status text NOT NULL DEFAULT 'pending',
  provider_code text NULL,
  provider_reference text NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_payment_intent_owner_civ_required CHECK (owner_civilization_id IS NOT NULL),
  CONSTRAINT worker_rental_payment_intent_amount_non_negative CHECK (amount_jpy >= 0)
);

CREATE TABLE business.worker_rental_entitlement_grant (
  entitlement_grant_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,

  app_code text NOT NULL,
  service_code text NOT NULL,
  grant_period text NOT NULL,
  entitlement_kind text NOT NULL,
  entitlement_source_rule text NOT NULL,
  entitlement_unit_kind text NOT NULL,
  entitlement_unit_count integer NOT NULL DEFAULT 1,
  granted_quantity integer NOT NULL DEFAULT 0,
  total_granted_units integer NOT NULL DEFAULT 0,
  carryover_enabled boolean NOT NULL DEFAULT false,
  grant_status text NOT NULL DEFAULT 'active',
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_entitlement_grant_owner_civ_required CHECK (owner_civilization_id IS NOT NULL)
);

CREATE TABLE business.worker_rental_entitlement_balance (
  entitlement_balance_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_grant_id uuid NOT NULL REFERENCES business.worker_rental_entitlement_grant(entitlement_grant_id) ON DELETE RESTRICT,
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,

  app_code text NOT NULL,
  service_code text NOT NULL,
  grant_period text NOT NULL,
  entitlement_kind text NOT NULL,
  entitlement_source_rule text NOT NULL,
  entitlement_unit_kind text NOT NULL,
  entitlement_unit_count integer NOT NULL DEFAULT 1,
  entitlement_minutes_each integer NULL,
  granted_quantity integer NOT NULL DEFAULT 0,
  used_quantity integer NOT NULL DEFAULT 0,
  remaining_quantity integer NOT NULL DEFAULT 0,
  remaining_total_units integer NOT NULL DEFAULT 0,
  remaining_total_minutes integer NULL,
  balance_status text NOT NULL DEFAULT 'active',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_entitlement_balance_owner_civ_required CHECK (owner_civilization_id IS NOT NULL)
);

CREATE TABLE business.worker_rental_entitlement_usage (
  entitlement_usage_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_grant_id uuid NOT NULL REFERENCES business.worker_rental_entitlement_grant(entitlement_grant_id) ON DELETE RESTRICT,
  entitlement_balance_id uuid NOT NULL REFERENCES business.worker_rental_entitlement_balance(entitlement_balance_id) ON DELETE RESTRICT,
  rental_contract_id uuid NULL REFERENCES business.worker_rental_contract(rental_contract_id) ON DELETE SET NULL,
  rental_period_id uuid NULL REFERENCES business.worker_rental_period(rental_period_id) ON DELETE SET NULL,
  owner_civilization_id uuid NOT NULL,
  user_id uuid NULL,

  app_code text NOT NULL,
  service_code text NOT NULL,
  entitlement_kind text NOT NULL,
  entitlement_source_rule text NOT NULL,
  used_quantity integer NOT NULL DEFAULT 0,
  used_unit_kind text NOT NULL,
  used_unit_count integer NOT NULL DEFAULT 0,
  discounted_amount_jpy integer NOT NULL DEFAULT 0,
  final_price_jpy integer NOT NULL DEFAULT 0,
  usage_status text NOT NULL DEFAULT 'applied',
  used_at timestamptz NOT NULL DEFAULT now(),

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_entitlement_usage_owner_civ_required CHECK (owner_civilization_id IS NOT NULL)
);

CREATE TABLE business.worker_rental_status_history (
  rental_status_history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_contract_id uuid NOT NULL REFERENCES business.worker_rental_contract(rental_contract_id) ON DELETE RESTRICT,
  owner_civilization_id uuid NOT NULL,

  from_status text NULL,
  to_status text NOT NULL,
  reason text NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT worker_rental_status_history_owner_civ_required CHECK (owner_civilization_id IS NOT NULL)
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX idx_worker_rental_contract_owner_civ
  ON business.worker_rental_contract(owner_civilization_id);

CREATE INDEX idx_worker_rental_contract_app_service_owner
  ON business.worker_rental_contract(app_code, service_code, owner_civilization_id);

CREATE INDEX idx_worker_rental_contract_status
  ON business.worker_rental_contract(contract_status);

CREATE INDEX idx_worker_rental_contract_target_company
  ON business.worker_rental_contract(target_company_id);

CREATE INDEX idx_worker_rental_contract_erp_company
  ON business.worker_rental_contract(erp_company_id);

CREATE INDEX idx_worker_rental_contract_line_contract
  ON business.worker_rental_contract_line(rental_contract_id);

CREATE INDEX idx_worker_rental_contract_line_owner_civ
  ON business.worker_rental_contract_line(owner_civilization_id);

CREATE INDEX idx_worker_rental_period_contract
  ON business.worker_rental_period(rental_contract_id);

CREATE INDEX idx_worker_rental_period_owner_civ
  ON business.worker_rental_period(owner_civilization_id);

CREATE INDEX idx_worker_rental_usage_log_contract
  ON business.worker_rental_usage_log(rental_contract_id);

CREATE INDEX idx_worker_rental_usage_log_owner_civ
  ON business.worker_rental_usage_log(owner_civilization_id);

CREATE INDEX idx_worker_rental_end_summary_owner_civ
  ON business.worker_rental_end_summary(owner_civilization_id);

CREATE INDEX idx_worker_rental_safety_event_owner_civ
  ON business.worker_rental_safety_event(owner_civilization_id);

CREATE INDEX idx_worker_rental_payment_intent_contract
  ON business.worker_rental_payment_intent(rental_contract_id);

CREATE INDEX idx_worker_rental_payment_intent_owner_civ
  ON business.worker_rental_payment_intent(owner_civilization_id);

CREATE INDEX idx_worker_rental_entitlement_grant_owner_civ
  ON business.worker_rental_entitlement_grant(owner_civilization_id);

CREATE INDEX idx_worker_rental_entitlement_balance_owner_civ
  ON business.worker_rental_entitlement_balance(owner_civilization_id);

CREATE INDEX idx_worker_rental_entitlement_usage_owner_civ
  ON business.worker_rental_entitlement_usage(owner_civilization_id);

CREATE INDEX idx_worker_rental_status_history_contract
  ON business.worker_rental_status_history(rental_contract_id);

CREATE INDEX idx_worker_rental_status_history_owner_civ
  ON business.worker_rental_status_history(owner_civilization_id);

-- ------------------------------------------------------------
-- Views
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW business.v_worker_rental_contract_summary AS
SELECT
  c.rental_contract_id,
  c.owner_civilization_id,
  c.user_id,
  c.target_company_id,
  c.erp_company_id,
  c.app_code,
  c.service_code,
  c.worker_owner_schema,
  c.worker_id,
  c.worker_type,
  c.worker_snapshot_id,
  c.aiworker_model_code,
  c.role_code,
  c.rental_unit_kind,
  c.rental_unit_count,
  c.rental_total_minutes,
  c.rental_starts_at,
  c.rental_ends_at,
  c.base_price_jpy,
  c.applied_entitlement_count,
  c.free_unit_count,
  c.paid_unit_count,
  c.final_price_jpy,
  c.contract_status,
  c.price_version,
  c.locale,
  c.created_at,
  c.updated_at
FROM business.worker_rental_contract c;

CREATE OR REPLACE VIEW business.v_worker_rental_entitlement_balance_active AS
SELECT
  b.entitlement_balance_id,
  b.entitlement_grant_id,
  b.owner_civilization_id,
  b.user_id,
  b.app_code,
  b.service_code,
  b.grant_period,
  b.entitlement_kind,
  b.entitlement_source_rule,
  b.entitlement_unit_kind,
  b.entitlement_unit_count,
  b.entitlement_minutes_each,
  b.granted_quantity,
  b.used_quantity,
  b.remaining_quantity,
  b.remaining_total_units,
  b.remaining_total_minutes,
  b.balance_status,
  b.created_at,
  b.updated_at
FROM business.worker_rental_entitlement_balance b
WHERE b.balance_status = 'active';

-- If worker_rental_unit_policy exists, this view can use it.
-- This proposal keeps the view simple and defensive.
CREATE OR REPLACE VIEW business.v_worker_rental_monthly_free_ticket_rule AS
SELECT
  p.rental_unit_kind,
  p.display_name,
  p.max_unit_count,
  p.max_total_minutes,
  p.max_human_label,
  p.is_active,
  p.created_at,
  p.updated_at
FROM business.worker_rental_unit_policy p
WHERE p.is_active = true;

-- RLS intentionally not enabled here.

ROLLBACK;
