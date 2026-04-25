#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_cx22073jw_persona.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW PERSONA FULL RESET + REBUILD START"
  echo "phase        : implementation-bootstrap"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP SCHEMA IF EXISTS cx22073jw CASCADE;
CREATE SCHEMA cx22073jw;
SET search_path TO cx22073jw, public;

COMMENT ON SCHEMA cx22073jw IS
'CX22073JW canonical knowledge/reference/template foundation with embedded optimization layer and separated triple privileged lane.';

-- ============================================================
-- COMMON FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION cx22073jw.fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- FOUNDATION MASTER
-- ============================================================
CREATE TABLE cx22073jw.foundation_domain_master (
  domain_code        text PRIMARY KEY,
  domain_name        text NOT NULL,
  layer_code         text NOT NULL CHECK (layer_code IN ('normal','intelligence','triple')),
  domain_family      text NOT NULL,
  is_active          boolean NOT NULL DEFAULT true,
  description        text,
  created_at         timestamptz NOT NULL DEFAULT NOW(),
  updated_at         timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.source_review_registry (
  source_registry_code text PRIMARY KEY,
  source_type          text NOT NULL CHECK (source_type IN ('manual','document','system','external')),
  source_title         text NOT NULL,
  review_status        text NOT NULL CHECK (review_status IN ('pending','reviewed','approved','rejected')),
  trust_score          numeric(5,2),
  review_note          text,
  meta                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.knowledge_article (
  article_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code          text NOT NULL REFERENCES cx22073jw.foundation_domain_master(domain_code),
  article_code         text NOT NULL UNIQUE,
  title                text NOT NULL,
  body_text            text,
  visibility_scope     text NOT NULL CHECK (visibility_scope IN ('public','internal','restricted','triple_only')),
  publication_status   text NOT NULL CHECK (publication_status IN ('draft','reviewed','published','deprecated')),
  version_no           integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  source_registry_code text REFERENCES cx22073jw.source_review_registry(source_registry_code),
  meta                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.knowledge_chunk (
  chunk_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id           uuid NOT NULL REFERENCES cx22073jw.knowledge_article(article_id) ON DELETE CASCADE,
  chunk_no             integer NOT NULL CHECK (chunk_no > 0),
  chunk_text           text NOT NULL,
  audience_code        text,
  difficulty_code      text,
  summary_short        text,
  meta                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (article_id, chunk_no)
);

CREATE TABLE cx22073jw.entity_master (
  entity_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code          text NOT NULL UNIQUE,
  entity_name          text NOT NULL,
  entity_type          text NOT NULL,
  description          text,
  meta                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.relation_knowledge (
  relation_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity_id       uuid NOT NULL REFERENCES cx22073jw.entity_master(entity_id) ON DELETE CASCADE,
  to_entity_id         uuid NOT NULL REFERENCES cx22073jw.entity_master(entity_id) ON DELETE CASCADE,
  relation_type        text NOT NULL,
  weight_score         numeric(10,2) NOT NULL DEFAULT 1,
  meta                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (from_entity_id, to_entity_id, relation_type),
  CHECK (from_entity_id <> to_entity_id)
);

CREATE TABLE cx22073jw.template_registry (
  template_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code        text NOT NULL UNIQUE,
  template_name        text NOT NULL,
  template_kind        text NOT NULL,
  template_body        jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility_scope     text NOT NULL CHECK (visibility_scope IN ('public','internal','restricted','triple_only')),
  publication_status   text NOT NULL CHECK (publication_status IN ('draft','reviewed','published','deprecated')),
  source_registry_code text REFERENCES cx22073jw.source_review_registry(source_registry_code),
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.summary_registry (
  summary_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type          text NOT NULL CHECK (object_type IN ('article','chunk','template')),
  object_id            uuid NOT NULL,
  summary_kind         text NOT NULL CHECK (summary_kind IN ('short','medium','long','keywords')),
  summary_text         text NOT NULL,
  meta                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (object_type, object_id, summary_kind)
);

-- ============================================================
-- PRIORITY 26-29
-- ============================================================
CREATE TABLE cx22073jw.multilingual_term_dictionary (
  term_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_key             text NOT NULL,
  language_code        text NOT NULL,
  locale_code          text NOT NULL DEFAULT '',
  term_value           text NOT NULL,
  part_of_speech       text,
  is_canonical         boolean NOT NULL DEFAULT false,
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (term_key, language_code, locale_code)
);

CREATE TABLE cx22073jw.currency_amount_reference (
  currency_code        text PRIMARY KEY,
  currency_name        text NOT NULL,
  symbol_text          text NOT NULL,
  decimals_count       integer NOT NULL CHECK (decimals_count BETWEEN 0 AND 6),
  rounding_mode        text NOT NULL,
  locale_hint          text,
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.unit_reference (
  unit_code            text PRIMARY KEY,
  measurement_family   text NOT NULL,
  unit_name            text NOT NULL,
  symbol_text          text NOT NULL,
  base_unit_code       text,
  factor_to_base       numeric(24,12) NOT NULL,
  is_base_unit         boolean NOT NULL DEFAULT false,
  locale_hint          text,
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.unit_conversion_rule (
  rule_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_unit_code       text NOT NULL REFERENCES cx22073jw.unit_reference(unit_code),
  to_unit_code         text NOT NULL REFERENCES cx22073jw.unit_reference(unit_code),
  multiplier           numeric(24,12) NOT NULL,
  additive_offset      numeric(24,12) NOT NULL DEFAULT 0,
  precision_scale      integer NOT NULL DEFAULT 6 CHECK (precision_scale BETWEEN 0 AND 12),
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (from_unit_code, to_unit_code)
);

CREATE TABLE cx22073jw.jurisdiction_region_reference (
  jurisdiction_code       text PRIMARY KEY,
  jurisdiction_name       text NOT NULL,
  region_type             text NOT NULL CHECK (region_type IN ('country','state','prefecture','city','economic_area')),
  parent_jurisdiction_code text REFERENCES cx22073jw.jurisdiction_region_reference(jurisdiction_code),
  default_currency_code   text REFERENCES cx22073jw.currency_amount_reference(currency_code),
  default_locale_code     text,
  timezone_name           text,
  is_active               boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EMBEDDED FOUNDATION INTELLIGENCE
-- ============================================================
CREATE TABLE cx22073jw.foundation_optimization_job (
  job_id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type              text NOT NULL CHECK (job_type IN (
                           'storage_optimization',
                           'placement_optimization',
                           'indexing',
                           'summarization',
                           'compression',
                           'readiness_check'
                         )),
  target_object_type    text NOT NULL CHECK (target_object_type IN (
                           'article',
                           'chunk',
                           'template',
                           'dictionary',
                           'reference',
                           'secret_asset',
                           'schema'
                         )),
  target_object_id      text,
  status                text NOT NULL CHECK (status IN ('queued','running','done','failed','canceled')),
  request_payload       jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_payload        jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at            timestamptz,
  ended_at              timestamptz,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECRET FIRST SLICE
-- ============================================================
CREATE TABLE cx22073jw.access_route_master (
  route_code            text PRIMARY KEY,
  route_name            text NOT NULL,
  route_type            text NOT NULL CHECK (route_type IN ('normal','system','triple')),
  is_privileged         boolean NOT NULL DEFAULT false,
  description           text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.privilege_tier_master (
  tier_code             text PRIMARY KEY,
  tier_name             text NOT NULL,
  tier_rank             integer NOT NULL UNIQUE CHECK (tier_rank > 0),
  is_active             boolean NOT NULL DEFAULT true,
  description           text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.secret_asset_category_master (
  category_code         text PRIMARY KEY,
  category_name         text NOT NULL,
  description           text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.secret_target_selector_master (
  selector_code         text PRIMARY KEY,
  selector_name         text NOT NULL,
  selector_type         text NOT NULL CHECK (selector_type IN ('static','policy','environment')),
  description           text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.secret_target_master (
  target_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_code           text NOT NULL UNIQUE,
  selector_code         text NOT NULL REFERENCES cx22073jw.secret_target_selector_master(selector_code),
  target_name           text NOT NULL,
  target_kind           text NOT NULL CHECK (target_kind IN ('domain','asset_group','route_lane','environment')),
  eligibility_rule_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.secret_asset (
  asset_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code         text NOT NULL REFERENCES cx22073jw.secret_asset_category_master(category_code),
  asset_code            text NOT NULL UNIQUE,
  asset_name            text NOT NULL,
  asset_payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  sensitivity_level     integer NOT NULL DEFAULT 1 CHECK (sensitivity_level BETWEEN 1 AND 9),
  target_id             uuid REFERENCES cx22073jw.secret_target_master(target_id),
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.secret_route_binding (
  binding_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code            text NOT NULL REFERENCES cx22073jw.access_route_master(route_code),
  tier_code             text NOT NULL REFERENCES cx22073jw.privilege_tier_master(tier_code),
  selector_code         text NOT NULL REFERENCES cx22073jw.secret_target_selector_master(selector_code),
  target_id             uuid NOT NULL REFERENCES cx22073jw.secret_target_master(target_id),
  is_active             boolean NOT NULL DEFAULT true,
  valid_from            timestamptz NOT NULL DEFAULT NOW(),
  valid_to              timestamptz,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (route_code, tier_code, selector_code, target_id)
);

CREATE TABLE cx22073jw.privileged_policy_profile (
  profile_code          text PRIMARY KEY,
  profile_name          text NOT NULL,
  default_decision      text NOT NULL CHECK (default_decision IN ('allow','deny')),
  minimum_tier_rank     integer NOT NULL CHECK (minimum_tier_rank > 0),
  isolation_mode        text NOT NULL CHECK (isolation_mode IN ('strict','moderate','open')),
  description           text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.privileged_route_policy_binding (
  binding_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code            text NOT NULL REFERENCES cx22073jw.access_route_master(route_code),
  tier_code             text NOT NULL REFERENCES cx22073jw.privilege_tier_master(tier_code),
  profile_code          text NOT NULL REFERENCES cx22073jw.privileged_policy_profile(profile_code),
  category_code         text NOT NULL REFERENCES cx22073jw.secret_asset_category_master(category_code),
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (route_code, tier_code, profile_code, category_code)
);

CREATE TABLE cx22073jw.privileged_access_audit_log (
  audit_id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  route_code            text NOT NULL REFERENCES cx22073jw.access_route_master(route_code),
  tier_code             text NOT NULL REFERENCES cx22073jw.privilege_tier_master(tier_code),
  selector_code         text NOT NULL REFERENCES cx22073jw.secret_target_selector_master(selector_code),
  resolved_target_id    uuid REFERENCES cx22073jw.secret_target_master(target_id),
  asset_id              uuid REFERENCES cx22073jw.secret_asset(asset_id),
  decision_status       text NOT NULL CHECK (decision_status IN ('allowed','denied','unresolved','error')),
  reason_code           text NOT NULL CHECK (reason_code IN (
                           'ok',
                           'selector_not_found',
                           'insufficient_tier',
                           'eligibility_failed',
                           'target_not_bound',
                           'isolation_blocked',
                           'policy_blocked',
                           'internal_error'
                         )),
  detail                jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_at          timestamptz NOT NULL DEFAULT NOW(),
  resolved_at           timestamptz
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX ix_knowledge_article_domain
  ON cx22073jw.knowledge_article (domain_code, publication_status, visibility_scope);

CREATE INDEX ix_knowledge_chunk_article
  ON cx22073jw.knowledge_chunk (article_id, chunk_no);

CREATE INDEX ix_relation_knowledge_from_to
  ON cx22073jw.relation_knowledge (from_entity_id, to_entity_id, relation_type);

CREATE INDEX ix_summary_registry_object
  ON cx22073jw.summary_registry (object_type, object_id, summary_kind);

CREATE INDEX ix_multilingual_term_key
  ON cx22073jw.multilingual_term_dictionary (term_key, language_code);

CREATE INDEX ix_unit_conversion_rule_units
  ON cx22073jw.unit_conversion_rule (from_unit_code, to_unit_code);

CREATE INDEX ix_foundation_optimization_job_status
  ON cx22073jw.foundation_optimization_job (status, job_type, created_at DESC);

CREATE INDEX ix_secret_asset_category
  ON cx22073jw.secret_asset (category_code, is_active);

CREATE INDEX ix_secret_route_binding_lookup
  ON cx22073jw.secret_route_binding (route_code, tier_code, selector_code, is_active);

CREATE INDEX ix_privileged_route_policy_binding_lookup
  ON cx22073jw.privileged_route_policy_binding (route_code, tier_code, category_code, is_active);

CREATE INDEX ix_privileged_access_audit_log_requested_at
  ON cx22073jw.privileged_access_audit_log (requested_at DESC);

-- ============================================================
-- FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION cx22073jw.fn_enqueue_foundation_job(
  p_job_type           text,
  p_target_object_type text,
  p_target_object_id   text DEFAULT NULL,
  p_request_payload    jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_id uuid;
BEGIN
  INSERT INTO cx22073jw.foundation_optimization_job (
    job_type,
    target_object_type,
    target_object_id,
    status,
    request_payload
  )
  VALUES (
    p_job_type,
    p_target_object_type,
    p_target_object_id,
    'queued',
    COALESCE(p_request_payload, '{}'::jsonb)
  )
  RETURNING job_id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_convert_unit(
  p_value        numeric,
  p_from_unit    text,
  p_to_unit      text
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_multiplier      numeric;
  v_additive_offset numeric;
  v_from_factor     numeric;
  v_to_factor       numeric;
  v_result          numeric;
BEGIN
  IF p_from_unit = p_to_unit THEN
    RETURN p_value;
  END IF;

  SELECT multiplier, additive_offset
    INTO v_multiplier, v_additive_offset
  FROM cx22073jw.unit_conversion_rule
  WHERE from_unit_code = p_from_unit
    AND to_unit_code   = p_to_unit
    AND is_active = true
  LIMIT 1;

  IF FOUND THEN
    RETURN ROUND((p_value * v_multiplier + v_additive_offset)::numeric, 6);
  END IF;

  SELECT factor_to_base INTO v_from_factor
  FROM cx22073jw.unit_reference
  WHERE unit_code = p_from_unit
    AND is_active = true;

  SELECT factor_to_base INTO v_to_factor
  FROM cx22073jw.unit_reference
  WHERE unit_code = p_to_unit
    AND is_active = true;

  IF v_from_factor IS NULL OR v_to_factor IS NULL THEN
    RAISE EXCEPTION 'unit not found or inactive: % -> %', p_from_unit, p_to_unit;
  END IF;

  v_result := (p_value * v_from_factor) / v_to_factor;
  RETURN ROUND(v_result::numeric, 6);
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_can_access_secret(
  p_route_code    text,
  p_tier_code     text,
  p_selector_code text,
  p_target_code   text,
  p_category_code text
)
RETURNS TABLE (
  is_allowed        boolean,
  decision_status   text,
  reason_code       text,
  resolved_target_id uuid
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_target_id         uuid;
  v_route_privileged  boolean;
  v_binding_exists    boolean;
  v_profile_decision  text;
  v_minimum_tier_rank integer;
  v_tier_rank         integer;
BEGIN
  SELECT target_id
    INTO v_target_id
  FROM cx22073jw.secret_target_master
  WHERE selector_code = p_selector_code
    AND target_code   = p_target_code
    AND is_active = true
  LIMIT 1;

  IF v_target_id IS NULL THEN
    RETURN QUERY
    SELECT false, 'unresolved', 'target_not_bound', NULL::uuid;
    RETURN;
  END IF;

  SELECT is_privileged
    INTO v_route_privileged
  FROM cx22073jw.access_route_master
  WHERE route_code = p_route_code;

  IF NOT FOUND OR COALESCE(v_route_privileged, false) = false THEN
    RETURN QUERY
    SELECT false, 'denied', 'isolation_blocked', v_target_id;
    RETURN;
  END IF;

  SELECT tier_rank
    INTO v_tier_rank
  FROM cx22073jw.privilege_tier_master
  WHERE tier_code = p_tier_code
    AND is_active = true;

  IF v_tier_rank IS NULL THEN
    RETURN QUERY
    SELECT false, 'denied', 'insufficient_tier', v_target_id;
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM cx22073jw.secret_route_binding srb
    WHERE srb.route_code    = p_route_code
      AND srb.tier_code     = p_tier_code
      AND srb.selector_code = p_selector_code
      AND srb.target_id     = v_target_id
      AND srb.is_active     = true
      AND (srb.valid_to IS NULL OR srb.valid_to >= NOW())
  )
  INTO v_binding_exists;

  IF NOT COALESCE(v_binding_exists, false) THEN
    RETURN QUERY
    SELECT false, 'denied', 'target_not_bound', v_target_id;
    RETURN;
  END IF;

  SELECT ppp.default_decision, ppp.minimum_tier_rank
    INTO v_profile_decision, v_minimum_tier_rank
  FROM cx22073jw.privileged_route_policy_binding prpb
  JOIN cx22073jw.privileged_policy_profile ppp
    ON ppp.profile_code = prpb.profile_code
  WHERE prpb.route_code    = p_route_code
    AND prpb.tier_code     = p_tier_code
    AND prpb.category_code = p_category_code
    AND prpb.is_active     = true
  LIMIT 1;

  IF v_profile_decision IS NULL THEN
    RETURN QUERY
    SELECT false, 'denied', 'policy_blocked', v_target_id;
    RETURN;
  END IF;

  IF v_tier_rank < v_minimum_tier_rank THEN
    RETURN QUERY
    SELECT false, 'denied', 'insufficient_tier', v_target_id;
    RETURN;
  END IF;

  IF v_profile_decision <> 'allow' THEN
    RETURN QUERY
    SELECT false, 'denied', 'policy_blocked', v_target_id;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT true, 'allowed', 'ok', v_target_id;
END;
$$;

-- ============================================================
-- VIEWS
-- ============================================================
CREATE VIEW cx22073jw.v_foundation_article_catalog AS
SELECT
  ka.article_id,
  ka.article_code,
  ka.title,
  ka.domain_code,
  fdm.layer_code,
  ka.visibility_scope,
  ka.publication_status,
  ka.version_no,
  srr.source_registry_code,
  srr.review_status,
  ka.created_at,
  ka.updated_at
FROM cx22073jw.knowledge_article ka
JOIN cx22073jw.foundation_domain_master fdm
  ON fdm.domain_code = ka.domain_code
LEFT JOIN cx22073jw.source_review_registry srr
  ON srr.source_registry_code = ka.source_registry_code;

CREATE VIEW cx22073jw.v_secret_route_matrix AS
SELECT
  srb.route_code,
  arm.route_name,
  srb.tier_code,
  ptm.tier_rank,
  srb.selector_code,
  stm.target_code,
  stm.target_name,
  stm.target_kind,
  prpb.category_code,
  ppp.profile_code,
  ppp.default_decision,
  ppp.minimum_tier_rank,
  srb.is_active AS route_binding_active,
  prpb.is_active AS policy_binding_active
FROM cx22073jw.secret_route_binding srb
JOIN cx22073jw.access_route_master arm
  ON arm.route_code = srb.route_code
JOIN cx22073jw.privilege_tier_master ptm
  ON ptm.tier_code = srb.tier_code
JOIN cx22073jw.secret_target_master stm
  ON stm.target_id = srb.target_id
LEFT JOIN cx22073jw.privileged_route_policy_binding prpb
  ON prpb.route_code = srb.route_code
 AND prpb.tier_code  = srb.tier_code
LEFT JOIN cx22073jw.privileged_policy_profile ppp
  ON ppp.profile_code = prpb.profile_code;

CREATE VIEW cx22073jw.v_secret_asset_catalog AS
SELECT
  sa.asset_id,
  sa.asset_code,
  sa.asset_name,
  sacm.category_code,
  sacm.category_name,
  sa.sensitivity_level,
  stm.target_code,
  stm.target_name,
  sa.is_active,
  sa.created_at
FROM cx22073jw.secret_asset sa
JOIN cx22073jw.secret_asset_category_master sacm
  ON sacm.category_code = sa.category_code
LEFT JOIN cx22073jw.secret_target_master stm
  ON stm.target_id = sa.target_id;

CREATE VIEW cx22073jw.v_priority_26_29_readiness AS
SELECT 'multilingual_term_dictionary' AS area_code, COUNT(*)::bigint AS row_count
FROM cx22073jw.multilingual_term_dictionary
UNION ALL
SELECT 'currency_amount_reference' AS area_code, COUNT(*)::bigint AS row_count
FROM cx22073jw.currency_amount_reference
UNION ALL
SELECT 'unit_reference' AS area_code, COUNT(*)::bigint AS row_count
FROM cx22073jw.unit_reference
UNION ALL
SELECT 'unit_conversion_rule' AS area_code, COUNT(*)::bigint AS row_count
FROM cx22073jw.unit_conversion_rule
UNION ALL
SELECT 'jurisdiction_region_reference' AS area_code, COUNT(*)::bigint AS row_count
FROM cx22073jw.jurisdiction_region_reference;

-- ============================================================
-- TRIGGERS
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'foundation_domain_master',
    'source_review_registry',
    'knowledge_article',
    'knowledge_chunk',
    'entity_master',
    'relation_knowledge',
    'template_registry',
    'summary_registry',
    'multilingual_term_dictionary',
    'currency_amount_reference',
    'unit_reference',
    'unit_conversion_rule',
    'jurisdiction_region_reference',
    'foundation_optimization_job',
    'access_route_master',
    'privilege_tier_master',
    'secret_asset_category_master',
    'secret_target_selector_master',
    'secret_target_master',
    'secret_asset',
    'secret_route_binding',
    'privileged_policy_profile',
    'privileged_route_policy_binding'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON cx22073jw.%I
       FOR EACH ROW
       EXECUTE FUNCTION cx22073jw.fn_set_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- SEED: FOUNDATION DOMAINS
-- ============================================================
INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  ('knowledge_core', 'Knowledge Core', 'normal', 'knowledge', 'Fixed reusable knowledge'),
  ('entity_character', 'Entity / Character', 'normal', 'knowledge_structuring', 'Entity and character catalog'),
  ('relation_knowledge', 'Relation Knowledge', 'normal', 'knowledge_structuring', 'Relation structure foundation'),
  ('source_review', 'Source / Review', 'normal', 'governance', 'Governance / trust base'),
  ('template_foundation', 'Template Foundation', 'normal', 'template', 'Reusable template layer'),
  ('multilingual_term_dictionary', 'Multilingual / Term Dictionary', 'normal', 'priority_26_29', 'Cross-app multilingual term dictionary'),
  ('currency_amount_reference', 'Currency / Amount Reference', 'normal', 'priority_26_29', 'Currency reference'),
  ('unit_conversion_locale', 'Unit / Conversion / Locale', 'normal', 'priority_26_29', 'Unit conversion reference'),
  ('jurisdiction_region_difference', 'Jurisdiction / Region Difference', 'normal', 'priority_26_29', 'Jurisdiction difference reference'),
  ('embedded_optimization', 'Embedded Optimization', 'intelligence', 'optimization', 'Storage/index/summary readiness'),
  ('secret_layer', 'Triple Secret Layer', 'triple', 'secret', 'Privileged isolated secret layer');

-- ============================================================
-- SEED: GOVERNANCE / FOUNDATION
-- ============================================================
INSERT INTO cx22073jw.source_review_registry (
  source_registry_code, source_type, source_title, review_status, trust_score, review_note
) VALUES
  ('canonical_manual', 'manual', 'CX22073JW Canonical Manual Seed', 'approved', 99.00, 'Initial canonical seed'),
  ('foundation_system', 'system', 'Foundation System Generated Seed', 'approved', 95.00, 'System seed');

INSERT INTO cx22073jw.knowledge_article (
  domain_code, article_code, title, body_text, visibility_scope, publication_status, version_no, source_registry_code, meta
) VALUES
  (
    'knowledge_core',
    'cx22073jw_positioning',
    'CX22073JW Positioning',
    'CX22073JW is a common canonical knowledge / reference / template foundation, not a runtime transaction database.',
    'internal',
    'published',
    1,
    'canonical_manual',
    '{"seed":"yes","topic":"positioning"}'::jsonb
  ),
  (
    'knowledge_core',
    'cx22073jw_triple_route',
    'Triple Privileged Route',
    'Triple is a first-class privileged lane separated from ordinary caller/scope assumptions.',
    'restricted',
    'published',
    1,
    'canonical_manual',
    '{"seed":"yes","topic":"triple-route"}'::jsonb
  );

INSERT INTO cx22073jw.knowledge_chunk (
  article_id, chunk_no, chunk_text, audience_code, difficulty_code, summary_short
)
SELECT article_id, 1,
       'Normal foundation stores fixed knowledge, reusable reference, reusable template, and governance metadata.',
       'general', 'basic', 'Normal foundation overview'
FROM cx22073jw.knowledge_article
WHERE article_code = 'cx22073jw_positioning';

INSERT INTO cx22073jw.knowledge_chunk (
  article_id, chunk_no, chunk_text, audience_code, difficulty_code, summary_short
)
SELECT article_id, 1,
       'Triple route is isolated, policy-aware, and not a stronger hidden variant of normal route only.',
       'privileged', 'intermediate', 'Triple route isolation overview'
FROM cx22073jw.knowledge_article
WHERE article_code = 'cx22073jw_triple_route';

INSERT INTO cx22073jw.entity_master (
  entity_code, entity_name, entity_type, description
) VALUES
  ('cx22073jw', 'CX22073JW', 'foundation_system', 'Canonical knowledge/reference foundation'),
  ('triple_route', 'Triple Route', 'privileged_lane', 'Separated privileged lane');

INSERT INTO cx22073jw.relation_knowledge (
  from_entity_id, to_entity_id, relation_type, weight_score, meta
)
SELECT e1.entity_id, e2.entity_id, 'has_privileged_lane', 1.0, '{"seed":"yes"}'::jsonb
FROM cx22073jw.entity_master e1
JOIN cx22073jw.entity_master e2
  ON e1.entity_code = 'cx22073jw'
 AND e2.entity_code = 'triple_route';

INSERT INTO cx22073jw.template_registry (
  template_code, template_name, template_kind, template_body, visibility_scope, publication_status, source_registry_code
) VALUES
  (
    'foundation_answer_style_template',
    'Foundation Answer Style Template',
    'answer_style',
    '{"style":"structured","voice":"neutral","citations":"when-applicable"}'::jsonb,
    'internal',
    'published',
    'canonical_manual'
  );

INSERT INTO cx22073jw.summary_registry (
  object_type, object_id, summary_kind, summary_text, meta
)
SELECT
  'article',
  article_id,
  'short',
  'CX22073JW is a canonical foundation, not a runtime transaction DB.',
  '{"seed":"yes"}'::jsonb
FROM cx22073jw.knowledge_article
WHERE article_code = 'cx22073jw_positioning';

-- ============================================================
-- SEED: PRIORITY 26-29
-- ============================================================
INSERT INTO cx22073jw.multilingual_term_dictionary (
  term_key, language_code, locale_code, term_value, part_of_speech, is_canonical, notes
) VALUES
  ('salary', 'en', '', 'salary', 'noun', true, 'canonical base'),
  ('salary', 'ja', 'ja-JP', '給与', 'noun', true, 'canonical ja-JP'),
  ('tax', 'en', '', 'tax', 'noun', true, 'canonical base'),
  ('tax', 'ja', 'ja-JP', '税金', 'noun', true, 'canonical ja-JP'),
  ('shift', 'en', '', 'shift', 'noun', true, 'canonical base'),
  ('shift', 'ja', 'ja-JP', 'シフト', 'noun', true, 'canonical ja-JP');

INSERT INTO cx22073jw.currency_amount_reference (
  currency_code, currency_name, symbol_text, decimals_count, rounding_mode, locale_hint
) VALUES
  ('JPY', 'Japanese Yen', '¥', 0, 'half_up', 'ja-JP'),
  ('USD', 'US Dollar', '$', 2, 'half_up', 'en-US'),
  ('EUR', 'Euro', '€', 2, 'half_up', 'de-DE');

INSERT INTO cx22073jw.unit_reference (
  unit_code, measurement_family, unit_name, symbol_text, base_unit_code, factor_to_base, is_base_unit, locale_hint
) VALUES
  ('g', 'mass', 'gram', 'g', 'g', 1.000000000000, true, 'global'),
  ('kg', 'mass', 'kilogram', 'kg', 'g', 1000.000000000000, false, 'global'),
  ('cm', 'length', 'centimeter', 'cm', 'cm', 1.000000000000, true, 'global'),
  ('m', 'length', 'meter', 'm', 'cm', 100.000000000000, false, 'global'),
  ('kcal', 'energy', 'kilocalorie', 'kcal', 'kcal', 1.000000000000, true, 'global');

INSERT INTO cx22073jw.unit_conversion_rule (
  from_unit_code, to_unit_code, multiplier, additive_offset, precision_scale, is_active
) VALUES
  ('g', 'kg', 0.001000000000, 0, 6, true),
  ('kg', 'g', 1000.000000000000, 0, 6, true),
  ('cm', 'm', 0.010000000000, 0, 6, true),
  ('m', 'cm', 100.000000000000, 0, 6, true);

INSERT INTO cx22073jw.jurisdiction_region_reference (
  jurisdiction_code, jurisdiction_name, region_type, parent_jurisdiction_code, default_currency_code, default_locale_code, timezone_name
) VALUES
  ('JP', 'Japan', 'country', NULL, 'JPY', 'ja-JP', 'Asia/Tokyo'),
  ('JP-01', 'Hokkaido', 'prefecture', 'JP', 'JPY', 'ja-JP', 'Asia/Tokyo'),
  ('US', 'United States', 'country', NULL, 'USD', 'en-US', 'America/New_York'),
  ('EU', 'European Union', 'economic_area', NULL, 'EUR', 'en-GB', 'Europe/Brussels');

-- ============================================================
-- SEED: EMBEDDED OPTIMIZATION
-- ============================================================
INSERT INTO cx22073jw.foundation_optimization_job (
  job_type, target_object_type, target_object_id, status, request_payload, result_payload
) VALUES
  (
    'readiness_check',
    'schema',
    'cx22073jw',
    'done',
    '{"seed":"bootstrap"}'::jsonb,
    '{"result":"initial readiness confirmed"}'::jsonb
  );

-- ============================================================
-- SEED: SECRET FIRST SLICE
-- ============================================================
INSERT INTO cx22073jw.access_route_master (
  route_code, route_name, route_type, is_privileged, description
) VALUES
  ('normal', 'Normal Route', 'normal', false, 'General app-side reference consumption'),
  ('system_optimizer', 'System Optimizer Route', 'system', false, 'Embedded optimization layer route'),
  ('triple', 'Triple Route', 'triple', true, 'First-class privileged lane');

INSERT INTO cx22073jw.privilege_tier_master (
  tier_code, tier_name, tier_rank, is_active, description
) VALUES
  ('triple_viewer', 'Triple Viewer', 1, true, 'Privileged read-oriented tier'),
  ('triple_operator', 'Triple Operator', 2, true, 'Privileged operation tier'),
  ('triple_root', 'Triple Root', 3, true, 'Highest privileged tier');

INSERT INTO cx22073jw.secret_asset_category_master (
  category_code, category_name, description
) VALUES
  ('protected_knowledge', 'Protected Knowledge', 'Protected privileged knowledge assets'),
  ('protected_reference', 'Protected Reference', 'Protected privileged reference assets'),
  ('protected_template', 'Protected Template', 'Protected privileged template assets'),
  ('protected_index_support', 'Protected Index Support', 'Protected privileged index support assets');

INSERT INTO cx22073jw.secret_target_selector_master (
  selector_code, selector_name, selector_type, description
) VALUES
  ('default_selector', 'Default Selector', 'static', 'Default privileged selector'),
  ('protected_reference_selector', 'Protected Reference Selector', 'static', 'Reference-target selector'),
  ('protected_template_selector', 'Protected Template Selector', 'static', 'Template-target selector'),
  ('protected_knowledge_selector', 'Protected Knowledge Selector', 'static', 'Knowledge-target selector');

INSERT INTO cx22073jw.secret_target_master (
  target_code, selector_code, target_name, target_kind, eligibility_rule_json, is_active
) VALUES
  (
    'protected_reference_zone',
    'protected_reference_selector',
    'Protected Reference Zone',
    'domain',
    '{"required_route":"triple","minimum_tier":"triple_viewer"}'::jsonb,
    true
  ),
  (
    'protected_template_zone',
    'protected_template_selector',
    'Protected Template Zone',
    'domain',
    '{"required_route":"triple","minimum_tier":"triple_operator"}'::jsonb,
    true
  ),
  (
    'protected_knowledge_zone',
    'protected_knowledge_selector',
    'Protected Knowledge Zone',
    'domain',
    '{"required_route":"triple","minimum_tier":"triple_operator"}'::jsonb,
    true
  ),
  (
    'protected_index_support_zone',
    'default_selector',
    'Protected Index Support Zone',
    'domain',
    '{"required_route":"triple","minimum_tier":"triple_root"}'::jsonb,
    true
  );

INSERT INTO cx22073jw.secret_asset (
  category_code, asset_code, asset_name, asset_payload, sensitivity_level, target_id, is_active
)
SELECT
  'protected_reference',
  'secret_reference_seed',
  'Secret Reference Seed',
  '{"kind":"reference","seed":"yes"}'::jsonb,
  3,
  target_id,
  true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_reference_zone';

INSERT INTO cx22073jw.secret_asset (
  category_code, asset_code, asset_name, asset_payload, sensitivity_level, target_id, is_active
)
SELECT
  'protected_template',
  'secret_template_seed',
  'Secret Template Seed',
  '{"kind":"template","seed":"yes"}'::jsonb,
  4,
  target_id,
  true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_template_zone';

INSERT INTO cx22073jw.secret_asset (
  category_code, asset_code, asset_name, asset_payload, sensitivity_level, target_id, is_active
)
SELECT
  'protected_knowledge',
  'secret_knowledge_seed',
  'Secret Knowledge Seed',
  '{"kind":"knowledge","seed":"yes"}'::jsonb,
  5,
  target_id,
  true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_knowledge_zone';

INSERT INTO cx22073jw.secret_asset (
  category_code, asset_code, asset_name, asset_payload, sensitivity_level, target_id, is_active
)
SELECT
  'protected_index_support',
  'secret_index_support_seed',
  'Secret Index Support Seed',
  '{"kind":"index_support","seed":"yes"}'::jsonb,
  6,
  target_id,
  true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_index_support_zone';

INSERT INTO cx22073jw.privileged_policy_profile (
  profile_code, profile_name, default_decision, minimum_tier_rank, isolation_mode, description
) VALUES
  ('triple_view_profile', 'Triple View Profile', 'allow', 1, 'strict', 'Reference-oriented privileged access'),
  ('triple_operator_profile', 'Triple Operator Profile', 'allow', 2, 'strict', 'Knowledge/template privileged access'),
  ('triple_root_profile', 'Triple Root Profile', 'allow', 3, 'strict', 'Full privileged access'),
  ('deny_profile', 'Deny Profile', 'deny', 1, 'strict', 'Explicit deny profile');

INSERT INTO cx22073jw.secret_route_binding (
  route_code, tier_code, selector_code, target_id, is_active
)
SELECT 'triple', 'triple_viewer', 'protected_reference_selector', target_id, true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_reference_zone';

INSERT INTO cx22073jw.secret_route_binding (
  route_code, tier_code, selector_code, target_id, is_active
)
SELECT 'triple', 'triple_operator', 'protected_reference_selector', target_id, true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_reference_zone';

INSERT INTO cx22073jw.secret_route_binding (
  route_code, tier_code, selector_code, target_id, is_active
)
SELECT 'triple', 'triple_operator', 'protected_template_selector', target_id, true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_template_zone';

INSERT INTO cx22073jw.secret_route_binding (
  route_code, tier_code, selector_code, target_id, is_active
)
SELECT 'triple', 'triple_operator', 'protected_knowledge_selector', target_id, true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_knowledge_zone';

INSERT INTO cx22073jw.secret_route_binding (
  route_code, tier_code, selector_code, target_id, is_active
)
SELECT 'triple', 'triple_root', 'protected_reference_selector', target_id, true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_reference_zone';

INSERT INTO cx22073jw.secret_route_binding (
  route_code, tier_code, selector_code, target_id, is_active
)
SELECT 'triple', 'triple_root', 'protected_template_selector', target_id, true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_template_zone';

INSERT INTO cx22073jw.secret_route_binding (
  route_code, tier_code, selector_code, target_id, is_active
)
SELECT 'triple', 'triple_root', 'protected_knowledge_selector', target_id, true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_knowledge_zone';

INSERT INTO cx22073jw.secret_route_binding (
  route_code, tier_code, selector_code, target_id, is_active
)
SELECT 'triple', 'triple_root', 'default_selector', target_id, true
FROM cx22073jw.secret_target_master
WHERE target_code = 'protected_index_support_zone';

INSERT INTO cx22073jw.privileged_route_policy_binding (
  route_code, tier_code, profile_code, category_code, is_active
) VALUES
  ('triple', 'triple_viewer', 'triple_view_profile', 'protected_reference', true),
  ('triple', 'triple_operator', 'triple_operator_profile', 'protected_reference', true),
  ('triple', 'triple_operator', 'triple_operator_profile', 'protected_template', true),
  ('triple', 'triple_operator', 'triple_operator_profile', 'protected_knowledge', true),
  ('triple', 'triple_root', 'triple_root_profile', 'protected_reference', true),
  ('triple', 'triple_root', 'triple_root_profile', 'protected_template', true),
  ('triple', 'triple_root', 'triple_root_profile', 'protected_knowledge', true),
  ('triple', 'triple_root', 'triple_root_profile', 'protected_index_support', true);

INSERT INTO cx22073jw.privileged_access_audit_log (
  route_code, tier_code, selector_code, resolved_target_id, asset_id, decision_status, reason_code, detail, requested_at, resolved_at
)
SELECT
  'triple',
  'triple_viewer',
  'protected_reference_selector',
  stm.target_id,
  sa.asset_id,
  'allowed',
  'ok',
  '{"seed":"initial audit sample"}'::jsonb,
  NOW(),
  NOW()
FROM cx22073jw.secret_target_master stm
JOIN cx22073jw.secret_asset sa
  ON sa.target_id = stm.target_id
WHERE stm.target_code = 'protected_reference_zone'
  AND sa.asset_code = 'secret_reference_seed';

COMMIT;

\echo '============================================================'
\echo 'TABLES'
\echo '============================================================'
\dt cx22073jw.*

\echo '============================================================'
\echo 'VIEWS'
\echo '============================================================'
\dv cx22073jw.*

\echo '============================================================'
\echo 'FUNCTIONS'
\echo '============================================================'
\df cx22073jw.*

\echo '============================================================'
\echo 'PRIORITY 26-29 READINESS'
\echo '============================================================'
TABLE cx22073jw.v_priority_26_29_readiness;

\echo '============================================================'
\echo 'SECRET ROUTE MATRIX'
\echo '============================================================'
SELECT route_code, tier_code, selector_code, target_code, category_code, profile_code, default_decision
FROM cx22073jw.v_secret_route_matrix
ORDER BY route_code, tier_code, selector_code, category_code NULLS LAST;

\echo '============================================================'
\echo 'SECRET ACCESS CHECK SAMPLES'
\echo '============================================================'
SELECT * FROM cx22073jw.fn_can_access_secret(
  'triple',
  'triple_viewer',
  'protected_reference_selector',
  'protected_reference_zone',
  'protected_reference'
);

SELECT * FROM cx22073jw.fn_can_access_secret(
  'normal',
  'triple_viewer',
  'protected_reference_selector',
  'protected_reference_zone',
  'protected_reference'
);

SELECT cx22073jw.fn_convert_unit(1500, 'g', 'kg') AS grams_to_kg_sample;
SQL

  echo "============================================================"
  echo "CX22073JW PERSONA FULL RESET + REBUILD DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
