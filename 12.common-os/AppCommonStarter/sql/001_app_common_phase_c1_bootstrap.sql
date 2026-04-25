-- ============================================================
-- app_common phase C1 bootstrap starter
-- review required before execution
-- additive only
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS app_common;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app_common' AND t.typname = 'review_status'
  ) THEN
    CREATE TYPE app_common.review_status AS ENUM ('draft', 'reviewed', 'deprecated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app_common' AND t.typname = 'canonical_status'
  ) THEN
    CREATE TYPE app_common.canonical_status AS ENUM ('candidate', 'current', 'deprecated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app_common' AND t.typname = 'queue_state'
  ) THEN
    CREATE TYPE app_common.queue_state AS ENUM (
      'offline',
      'pending',
      'processing',
      'retry_wait',
      'sent',
      'failed',
      'conflict'
    );
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION app_common.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$;

CREATE TABLE IF NOT EXISTS app_common.theme_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  theme_name text NOT NULL,
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.design_token_set (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  token_set_name text NOT NULL,
  platform_code text NOT NULL DEFAULT 'shared-html',
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.design_token_value (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  token_set_id uuid NOT NULL REFERENCES app_common.design_token_set(id),
  token_name text NOT NULL,
  token_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no),
  UNIQUE (token_set_id, token_name, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.component_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  component_name text NOT NULL,
  component_class text NOT NULL,
  component_layer text NOT NULL DEFAULT 'presentation',
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.component_variant_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  component_id uuid NOT NULL REFERENCES app_common.component_catalog(id),
  variant_name text NOT NULL,
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no),
  UNIQUE (component_id, variant_name, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.locale_key (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  locale_key_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no),
  UNIQUE (locale_key_name, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.locale_translation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  locale_key_id uuid NOT NULL REFERENCES app_common.locale_key(id),
  locale_code text NOT NULL,
  translated_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no),
  UNIQUE (locale_key_id, locale_code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.screen_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  screen_name text NOT NULL,
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.form_definition_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  form_name text NOT NULL,
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.sync_policy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  policy_name text NOT NULL,
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.retry_policy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  policy_name text NOT NULL,
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.queue_visual_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  rule_name text NOT NULL,
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.queue_state_presentation_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  queue_state app_common.queue_state NOT NULL,
  display_label_key text NOT NULL DEFAULT '',
  display_rule_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no),
  UNIQUE (queue_state, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.verify_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  verify_type text NOT NULL,
  template_body text NOT NULL DEFAULT '',
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.smoke_test_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  smoke_test_name text NOT NULL,
  template_body text NOT NULL DEFAULT '',
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.release_gate_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  gate_name text NOT NULL,
  template_body text NOT NULL DEFAULT '',
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no)
);

CREATE TABLE IF NOT EXISTS app_common.client_capability_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  review_status app_common.review_status NOT NULL DEFAULT 'reviewed',
  is_active boolean NOT NULL DEFAULT true,
  platform_code text NOT NULL,
  capability_name text NOT NULL,
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version_no),
  UNIQUE (platform_code, capability_name, version_no)
);

CREATE INDEX IF NOT EXISTS idx_app_common_component_catalog_class
  ON app_common.component_catalog (component_class, component_layer);

CREATE INDEX IF NOT EXISTS idx_app_common_queue_state_presentation_rule_state
  ON app_common.queue_state_presentation_rule (queue_state);

CREATE INDEX IF NOT EXISTS idx_app_common_design_token_value_token_name
  ON app_common.design_token_value (token_name);

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'theme_registry',
    'design_token_set',
    'design_token_value',
    'component_catalog',
    'component_variant_catalog',
    'locale_key',
    'locale_translation',
    'screen_template',
    'form_definition_metadata',
    'sync_policy',
    'retry_policy',
    'queue_visual_rule',
    'queue_state_presentation_rule',
    'verify_template',
    'smoke_test_template',
    'release_gate_template',
    'client_capability_registry'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1
        FROM pg_trigger
       WHERE tgname = 'trg_' || tbl || '_updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON app_common.%I FOR EACH ROW EXECUTE FUNCTION app_common.touch_updated_at()',
        'trg_' || tbl || '_updated_at',
        tbl
      );
    END IF;
  END LOOP;
END
$$;
