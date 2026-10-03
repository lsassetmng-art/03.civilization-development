-- R15B3 BusinessOS App Commerce Core
-- Authoritative DB: PERSONA_DATABASE_URL / schema business
-- public schema is forbidden.
--
-- This file defines commercial truth and logical module state only.
-- Physical PWA installation remains browser_or_device_os truth.
-- No payment provider is assumed by this schema.

BEGIN;

CREATE TABLE business.app_product (
  product_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_code text NOT NULL,
  product_code text NOT NULL UNIQUE,
  product_name text NOT NULL,
  product_state text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_product_state_ck
    CHECK (product_state IN ('draft','published','suspended','retired')),
  CONSTRAINT app_product_app_code_nonempty_ck
    CHECK (btrim(app_code) <> ''),
  CONSTRAINT app_product_code_nonempty_ck
    CHECK (btrim(product_code) <> ''),
  CONSTRAINT app_product_name_nonempty_ck
    CHECK (btrim(product_name) <> '')
);

CREATE INDEX app_product_app_state_idx
  ON business.app_product (app_code, product_state);


CREATE TABLE business.app_sku (
  sku_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL
    REFERENCES business.app_product(product_id)
    ON DELETE RESTRICT,
  sku_code text NOT NULL UNIQUE,
  purchase_type text NOT NULL,
  currency_code text NOT NULL,
  amount_minor bigint NOT NULL,
  sku_state text NOT NULL DEFAULT 'draft',
  effective_from timestamptz,
  effective_through timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_sku_purchase_type_ck
    CHECK (purchase_type IN ('one_time','subscription')),
  CONSTRAINT app_sku_currency_ck
    CHECK (currency_code ~ '^[A-Z]{3}$'),
  CONSTRAINT app_sku_amount_ck
    CHECK (amount_minor >= 0),
  CONSTRAINT app_sku_state_ck
    CHECK (sku_state IN ('draft','active','suspended','retired')),
  CONSTRAINT app_sku_effective_window_ck
    CHECK (
      effective_through IS NULL
      OR effective_from IS NULL
      OR effective_through > effective_from
    )
);

CREATE INDEX app_sku_product_state_idx
  ON business.app_sku (product_id, sku_state);


CREATE TABLE business.app_subscription_plan (
  plan_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL
    REFERENCES business.app_product(product_id)
    ON DELETE RESTRICT,
  sku_id uuid NOT NULL UNIQUE
    REFERENCES business.app_sku(sku_id)
    ON DELETE RESTRICT,
  plan_code text NOT NULL UNIQUE,
  plan_name text NOT NULL,
  plan_state text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_subscription_plan_state_ck
    CHECK (plan_state IN ('draft','active','suspended','retired')),
  CONSTRAINT app_subscription_plan_code_nonempty_ck
    CHECK (btrim(plan_code) <> ''),
  CONSTRAINT app_subscription_plan_name_nonempty_ck
    CHECK (btrim(plan_name) <> '')
);

CREATE INDEX app_subscription_plan_product_state_idx
  ON business.app_subscription_plan (product_id, plan_state);


CREATE TABLE business.app_order (
  order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_state text NOT NULL DEFAULT 'pending',
  currency_code text NOT NULL,
  total_amount_minor bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_order_state_ck
    CHECK (order_state IN ('pending','completed','canceled','failed')),
  CONSTRAINT app_order_currency_ck
    CHECK (currency_code ~ '^[A-Z]{3}$'),
  CONSTRAINT app_order_total_ck
    CHECK (total_amount_minor >= 0),
  CONSTRAINT app_order_completed_at_ck
    CHECK (order_state <> 'completed' OR completed_at IS NOT NULL)
);

CREATE INDEX app_order_user_state_idx
  ON business.app_order (user_id, order_state, created_at DESC);


CREATE TABLE business.app_order_line (
  order_line_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL
    REFERENCES business.app_order(order_id)
    ON DELETE RESTRICT,
  product_id uuid NOT NULL
    REFERENCES business.app_product(product_id)
    ON DELETE RESTRICT,
  sku_id uuid NOT NULL
    REFERENCES business.app_sku(sku_id)
    ON DELETE RESTRICT,
  app_code text NOT NULL,
  product_name_snapshot text NOT NULL,
  sku_code_snapshot text NOT NULL,
  unit_amount_minor bigint NOT NULL,
  currency_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_order_line_amount_ck
    CHECK (unit_amount_minor >= 0),
  CONSTRAINT app_order_line_currency_ck
    CHECK (currency_code ~ '^[A-Z]{3}$')
);

CREATE INDEX app_order_line_order_idx
  ON business.app_order_line (order_id);


CREATE TABLE business.app_subscription (
  subscription_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL
    REFERENCES business.app_product(product_id)
    ON DELETE RESTRICT,
  sku_id uuid NOT NULL
    REFERENCES business.app_sku(sku_id)
    ON DELETE RESTRICT,
  plan_id uuid NOT NULL
    REFERENCES business.app_subscription_plan(plan_id)
    ON DELETE RESTRICT,
  source_order_id uuid
    REFERENCES business.app_order(order_id)
    ON DELETE RESTRICT,
  app_code text NOT NULL,
  subscription_state text NOT NULL,
  effective_at timestamptz NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  renewal_at timestamptz,
  cancellation_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_subscription_state_ck
    CHECK (subscription_state IN ('active','suspended','canceled','expired')),
  CONSTRAINT app_subscription_period_ck
    CHECK (
      current_period_end IS NULL
      OR current_period_start IS NULL
      OR current_period_end > current_period_start
    )
);

CREATE UNIQUE INDEX app_subscription_current_uq
  ON business.app_subscription (
    user_id,
    app_code,
    product_id,
    plan_id
  )
  WHERE subscription_state IN ('active','suspended');

CREATE INDEX app_subscription_user_state_idx
  ON business.app_subscription (user_id, subscription_state);


CREATE TABLE business.app_entitlement (
  entitlement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_code text NOT NULL,
  product_id uuid NOT NULL
    REFERENCES business.app_product(product_id)
    ON DELETE RESTRICT,
  sku_id uuid
    REFERENCES business.app_sku(sku_id)
    ON DELETE RESTRICT,
  source_order_id uuid
    REFERENCES business.app_order(order_id)
    ON DELETE RESTRICT,
  source_subscription_id uuid
    REFERENCES business.app_subscription(subscription_id)
    ON DELETE RESTRICT,
  entitlement_state text NOT NULL,
  grant_reason_code text,
  revoke_reason_code text,
  effective_at timestamptz NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_entitlement_state_ck
    CHECK (entitlement_state IN ('granted','suspended','revoked','expired')),
  CONSTRAINT app_entitlement_window_ck
    CHECK (expires_at IS NULL OR expires_at > effective_at),
  CONSTRAINT app_entitlement_revoke_reason_ck
    CHECK (
      entitlement_state <> 'revoked'
      OR nullif(btrim(revoke_reason_code), '') IS NOT NULL
    )
);

CREATE UNIQUE INDEX app_entitlement_current_uq
  ON business.app_entitlement (
    user_id,
    app_code,
    product_id,
    coalesce(sku_id::text, '')
  )
  WHERE entitlement_state IN ('granted','suspended');

CREATE INDEX app_entitlement_user_state_idx
  ON business.app_entitlement (user_id, entitlement_state);


CREATE TABLE business.app_module_installation (
  installation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_code text NOT NULL,
  module_code text NOT NULL,
  installation_state text NOT NULL,
  installed_at timestamptz,
  uninstalled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_module_installation_state_ck
    CHECK (
      installation_state IN (
        'installed','suspended','failed','uninstalled'
      )
    ),
  CONSTRAINT app_module_installation_identity_uq
    UNIQUE (user_id, app_code, module_code)
);

CREATE INDEX app_module_installation_state_idx
  ON business.app_module_installation
    (user_id, app_code, installation_state);


CREATE TABLE business.app_module_activation (
  activation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_code text NOT NULL,
  module_code text NOT NULL,
  activation_state text NOT NULL,
  activated_at timestamptz,
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_module_activation_state_ck
    CHECK (activation_state IN ('active','inactive','suspended')),
  CONSTRAINT app_module_activation_identity_uq
    UNIQUE (user_id, app_code, module_code),
  CONSTRAINT app_module_activation_installation_fk
    FOREIGN KEY (user_id, app_code, module_code)
    REFERENCES business.app_module_installation
      (user_id, app_code, module_code)
    ON DELETE RESTRICT
);

CREATE INDEX app_module_activation_state_idx
  ON business.app_module_activation
    (user_id, app_code, activation_state);


CREATE TABLE business.business_persona_event_outbox (
  outbox_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  source_system text NOT NULL DEFAULT 'BusinessOS',
  payload_version text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  producer_trace_id text NOT NULL,
  subject_type text NOT NULL,
  subject_id text NOT NULL,
  tenant_scope text,
  payload_json jsonb NOT NULL,
  enqueue_status text NOT NULL DEFAULT 'pending',
  retry_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  delivered_at timestamptz,
  dead_lettered_at timestamptz,
  CONSTRAINT business_persona_event_type_ck
    CHECK (
      event_type IN (
        'purchase_complete',
        'grant',
        'revoke',
        'subscription_change'
      )
    ),
  CONSTRAINT business_persona_source_system_ck
    CHECK (source_system = 'BusinessOS'),
  CONSTRAINT business_persona_enqueue_status_ck
    CHECK (
      enqueue_status IN (
        'pending',
        'delivering',
        'delivered',
        'failed_retryable',
        'dead_lettered'
      )
    ),
  CONSTRAINT business_persona_retry_count_ck
    CHECK (retry_count >= 0)
);

CREATE INDEX business_persona_outbox_delivery_idx
  ON business.business_persona_event_outbox
    (enqueue_status, next_attempt_at);

CREATE INDEX business_persona_outbox_subject_idx
  ON business.business_persona_event_outbox
    (subject_type, subject_id);

CREATE INDEX business_persona_outbox_created_idx
  ON business.business_persona_event_outbox
    (created_at);

CREATE INDEX business_persona_outbox_event_type_idx
  ON business.business_persona_event_outbox
    (event_type);

COMMIT;
