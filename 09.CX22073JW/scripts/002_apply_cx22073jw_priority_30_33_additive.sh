#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_priority_30_33.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW PRIORITY 30-33 ADDITIVE APPLY START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'foundation_domain_master'
  ) THEN
    RAISE EXCEPTION 'base schema not found: foundation_domain_master is required before priority 30-33 additive apply';
  END IF;
END;
$$;

-- ============================================================
-- 30. PUBLISHED KNOWLEDGE CATALOG / QUALITY
-- ============================================================
CREATE TABLE IF NOT EXISTS cx22073jw.published_knowledge_catalog (
  catalog_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id            uuid NOT NULL UNIQUE REFERENCES cx22073jw.knowledge_article(article_id) ON DELETE CASCADE,
  catalog_status        text NOT NULL CHECK (catalog_status IN ('draft','review_ready','published','retired')),
  quality_grade         text NOT NULL CHECK (quality_grade IN ('A','B','C','D')),
  publication_channel   text NOT NULL,
  published_at          timestamptz,
  retired_at            timestamptz,
  search_keywords       text[] NOT NULL DEFAULT ARRAY[]::text[],
  quality_note          text,
  meta                  jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.published_knowledge_quality_metric (
  metric_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id            uuid NOT NULL REFERENCES cx22073jw.published_knowledge_catalog(catalog_id) ON DELETE CASCADE,
  metric_code           text NOT NULL,
  metric_value          numeric(10,2) NOT NULL,
  metric_unit           text,
  is_passing            boolean NOT NULL DEFAULT true,
  meta                  jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (catalog_id, metric_code)
);

-- ============================================================
-- 31. COMPATIBILITY / RESTRICTION
-- ============================================================
CREATE TABLE IF NOT EXISTS cx22073jw.compatibility_profile_master (
  profile_code          text PRIMARY KEY,
  profile_name          text NOT NULL,
  profile_scope         text NOT NULL CHECK (profile_scope IN ('app','domain','content','template','reference')),
  description           text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.compatibility_rule (
  rule_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  left_profile_code     text NOT NULL REFERENCES cx22073jw.compatibility_profile_master(profile_code),
  right_profile_code    text NOT NULL REFERENCES cx22073jw.compatibility_profile_master(profile_code),
  compatibility_status  text NOT NULL CHECK (compatibility_status IN ('compatible','conditional','incompatible','unknown')),
  reason_text           text,
  condition_json        jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority_rank         integer NOT NULL DEFAULT 100 CHECK (priority_rank > 0),
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (left_profile_code, right_profile_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.restriction_rule (
  restriction_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_object_type    text NOT NULL CHECK (target_object_type IN ('article','template','fragment','reference','domain')),
  target_object_id      text NOT NULL,
  restriction_code      text NOT NULL,
  restriction_scope     text NOT NULL CHECK (restriction_scope IN ('locale','jurisdiction','audience','age','safety','policy','other')),
  restriction_status    text NOT NULL CHECK (restriction_status IN ('draft','active','inactive')),
  rule_json             jsonb NOT NULL DEFAULT '{}'::jsonb,
  note_text             text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (target_object_type, target_object_id, restriction_code, restriction_scope)
);

-- ============================================================
-- 32. COMMON TEMPLATE FRAGMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS cx22073jw.template_fragment_registry (
  fragment_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fragment_code         text NOT NULL UNIQUE,
  fragment_name         text NOT NULL,
  fragment_kind         text NOT NULL,
  fragment_body         jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility_scope      text NOT NULL CHECK (visibility_scope IN ('public','internal','restricted','triple_only')),
  publication_status    text NOT NULL CHECK (publication_status IN ('draft','reviewed','published','deprecated')),
  source_registry_code  text REFERENCES cx22073jw.source_review_registry(source_registry_code),
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.template_fragment_binding (
  binding_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id           uuid NOT NULL REFERENCES cx22073jw.template_registry(template_id) ON DELETE CASCADE,
  fragment_id           uuid NOT NULL REFERENCES cx22073jw.template_fragment_registry(fragment_id) ON DELETE CASCADE,
  slot_code             text NOT NULL,
  sort_order            integer NOT NULL DEFAULT 100,
  is_required           boolean NOT NULL DEFAULT false,
  condition_json        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, fragment_id, slot_code)
);

-- ============================================================
-- 33. SEASONAL / ANNUAL EVENT / TIMING
-- ============================================================
CREATE TABLE IF NOT EXISTS cx22073jw.seasonal_event_master (
  event_code            text PRIMARY KEY,
  event_name            text NOT NULL,
  event_type            text NOT NULL CHECK (event_type IN ('seasonal','annual_event','campaign_window','deadline_window')),
  jurisdiction_code     text REFERENCES cx22073jw.jurisdiction_region_reference(jurisdiction_code),
  start_month           integer NOT NULL CHECK (start_month BETWEEN 1 AND 12),
  start_day             integer NOT NULL CHECK (start_day BETWEEN 1 AND 31),
  end_month             integer NOT NULL CHECK (end_month BETWEEN 1 AND 12),
  end_day               integer NOT NULL CHECK (end_day BETWEEN 1 AND 31),
  recurrence_rule       text NOT NULL DEFAULT 'annual',
  timing_note           text,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.seasonal_event_content_link (
  link_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code            text NOT NULL REFERENCES cx22073jw.seasonal_event_master(event_code) ON DELETE CASCADE,
  target_object_type    text NOT NULL CHECK (target_object_type IN ('article','template','fragment','reference')),
  target_object_id      text NOT NULL,
  relation_type         text NOT NULL CHECK (relation_type IN ('recommended','required','contextual','warning')),
  priority_rank         integer NOT NULL DEFAULT 100 CHECK (priority_rank > 0),
  meta                  jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (event_code, target_object_type, target_object_id, relation_type)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS ix_published_knowledge_catalog_status
  ON cx22073jw.published_knowledge_catalog (catalog_status, quality_grade, publication_channel);

CREATE INDEX IF NOT EXISTS ix_published_knowledge_quality_metric_catalog
  ON cx22073jw.published_knowledge_quality_metric (catalog_id, metric_code);

CREATE INDEX IF NOT EXISTS ix_compatibility_rule_left_right
  ON cx22073jw.compatibility_rule (left_profile_code, right_profile_code, compatibility_status);

CREATE INDEX IF NOT EXISTS ix_restriction_rule_target
  ON cx22073jw.restriction_rule (target_object_type, target_object_id, restriction_scope, restriction_status);

CREATE INDEX IF NOT EXISTS ix_template_fragment_registry_kind
  ON cx22073jw.template_fragment_registry (fragment_kind, publication_status, visibility_scope);

CREATE INDEX IF NOT EXISTS ix_template_fragment_binding_template
  ON cx22073jw.template_fragment_binding (template_id, slot_code, sort_order);

CREATE INDEX IF NOT EXISTS ix_seasonal_event_master_active
  ON cx22073jw.seasonal_event_master (is_active, jurisdiction_code, event_type);

CREATE INDEX IF NOT EXISTS ix_seasonal_event_content_link_event
  ON cx22073jw.seasonal_event_content_link (event_code, target_object_type, relation_type);

-- ============================================================
-- FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION cx22073jw.fn_is_date_in_seasonal_window(
  p_event_code text,
  p_target_date date DEFAULT CURRENT_DATE
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_start_md integer;
  v_end_md   integer;
  v_target_md integer;
BEGIN
  SELECT start_month * 100 + start_day,
         end_month * 100 + end_day
    INTO v_start_md, v_end_md
  FROM cx22073jw.seasonal_event_master
  WHERE event_code = p_event_code
    AND is_active = true;

  IF v_start_md IS NULL OR v_end_md IS NULL THEN
    RETURN false;
  END IF;

  v_target_md := EXTRACT(MONTH FROM p_target_date)::integer * 100
               + EXTRACT(DAY FROM p_target_date)::integer;

  IF v_start_md <= v_end_md THEN
    RETURN v_target_md BETWEEN v_start_md AND v_end_md;
  END IF;

  RETURN (v_target_md >= v_start_md OR v_target_md <= v_end_md);
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_article_publication_readiness(
  p_article_code text
)
RETURNS TABLE (
  article_code text,
  is_ready boolean,
  blocker_codes text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ka.article_code,
    (
      ka.publication_status = 'published'
      AND COALESCE(srr.review_status, 'pending') = 'approved'
      AND pkc.catalog_status IN ('review_ready','published')
    ) AS is_ready,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN ka.publication_status = 'published' THEN NULL ELSE 'publication_not_published' END,
      CASE WHEN COALESCE(srr.review_status, 'pending') = 'approved' THEN NULL ELSE 'source_not_approved' END,
      CASE WHEN pkc.catalog_status IN ('review_ready','published') THEN NULL ELSE 'catalog_not_ready' END
    ], NULL) AS blocker_codes
  FROM cx22073jw.knowledge_article ka
  LEFT JOIN cx22073jw.source_review_registry srr
    ON srr.source_registry_code = ka.source_registry_code
  LEFT JOIN cx22073jw.published_knowledge_catalog pkc
    ON pkc.article_id = ka.article_id
  WHERE ka.article_code = p_article_code;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_get_template_fragments(
  p_template_code text
)
RETURNS TABLE (
  template_code text,
  slot_code text,
  sort_order integer,
  fragment_code text,
  fragment_name text,
  is_required boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tr.template_code,
    tfb.slot_code,
    tfb.sort_order,
    tfr.fragment_code,
    tfr.fragment_name,
    tfb.is_required
  FROM cx22073jw.template_registry tr
  JOIN cx22073jw.template_fragment_binding tfb
    ON tfb.template_id = tr.template_id
  JOIN cx22073jw.template_fragment_registry tfr
    ON tfr.fragment_id = tfb.fragment_id
  WHERE tr.template_code = p_template_code
  ORDER BY tfb.sort_order, tfr.fragment_code;
END;
$$;

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW cx22073jw.v_published_knowledge_ready_catalog AS
SELECT
  ka.article_code,
  ka.title,
  ka.domain_code,
  ka.visibility_scope,
  ka.publication_status,
  srr.review_status,
  pkc.catalog_status,
  pkc.quality_grade,
  pkc.publication_channel,
  pkc.search_keywords,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN ka.publication_status = 'published' THEN NULL ELSE 'publication_not_published' END,
    CASE WHEN COALESCE(srr.review_status, 'pending') = 'approved' THEN NULL ELSE 'source_not_approved' END,
    CASE WHEN pkc.catalog_status IN ('review_ready','published') THEN NULL ELSE 'catalog_not_ready' END
  ], NULL) AS blocker_codes,
  (
    ka.publication_status = 'published'
    AND COALESCE(srr.review_status, 'pending') = 'approved'
    AND pkc.catalog_status IN ('review_ready','published')
  ) AS is_ready
FROM cx22073jw.knowledge_article ka
LEFT JOIN cx22073jw.source_review_registry srr
  ON srr.source_registry_code = ka.source_registry_code
LEFT JOIN cx22073jw.published_knowledge_catalog pkc
  ON pkc.article_id = ka.article_id;

CREATE OR REPLACE VIEW cx22073jw.v_compatibility_restriction_matrix AS
SELECT
  cr.left_profile_code,
  lp.profile_name AS left_profile_name,
  cr.right_profile_code,
  rp.profile_name AS right_profile_name,
  cr.compatibility_status,
  cr.reason_text,
  cr.priority_rank
FROM cx22073jw.compatibility_rule cr
JOIN cx22073jw.compatibility_profile_master lp
  ON lp.profile_code = cr.left_profile_code
JOIN cx22073jw.compatibility_profile_master rp
  ON rp.profile_code = cr.right_profile_code;

CREATE OR REPLACE VIEW cx22073jw.v_template_fragment_bindings AS
SELECT
  tr.template_code,
  tr.template_name,
  tfb.slot_code,
  tfb.sort_order,
  tfb.is_required,
  tfr.fragment_code,
  tfr.fragment_name,
  tfr.fragment_kind
FROM cx22073jw.template_registry tr
JOIN cx22073jw.template_fragment_binding tfb
  ON tfb.template_id = tr.template_id
JOIN cx22073jw.template_fragment_registry tfr
  ON tfr.fragment_id = tfb.fragment_id;

CREATE OR REPLACE VIEW cx22073jw.v_seasonal_active_today AS
SELECT
  sem.event_code,
  sem.event_name,
  sem.event_type,
  sem.jurisdiction_code,
  sem.timing_note
FROM cx22073jw.seasonal_event_master sem
WHERE sem.is_active = true
  AND cx22073jw.fn_is_date_in_seasonal_window(sem.event_code, CURRENT_DATE) = true;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'published_knowledge_catalog',
    'published_knowledge_quality_metric',
    'compatibility_profile_master',
    'compatibility_rule',
    'restriction_rule',
    'template_fragment_registry',
    'template_fragment_binding',
    'seasonal_event_master',
    'seasonal_event_content_link'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger
      WHERE tgname = format('trg_%s_updated_at', t)
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON cx22073jw.%I
         FOR EACH ROW
         EXECUTE FUNCTION cx22073jw.fn_set_updated_at()',
        t, t
      );
    END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- FOUNDATION DOMAIN SEED
-- ============================================================
INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  ('published_knowledge_catalog_quality', 'Published Knowledge Catalog / Quality', 'normal', 'priority_30_33', 'Publication readiness and quality foundation'),
  ('compatibility_restriction', 'Compatibility / Restriction', 'normal', 'priority_30_33', 'Compatibility and restriction foundation'),
  ('common_template_fragment', 'Common Template Fragment', 'normal', 'priority_30_33', 'Reusable common fragment foundation'),
  ('seasonal_annual_event_timing', 'Seasonal / Annual Event / Timing', 'normal', 'priority_30_33', 'Seasonal timing foundation')
ON CONFLICT (domain_code) DO UPDATE
SET domain_name  = EXCLUDED.domain_name,
    layer_code   = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description  = EXCLUDED.description,
    updated_at   = NOW();

-- ============================================================
-- ARTICLE SEED
-- ============================================================
INSERT INTO cx22073jw.knowledge_article (
  domain_code, article_code, title, body_text, visibility_scope, publication_status, version_no, source_registry_code, meta
) VALUES
  (
    'published_knowledge_catalog_quality',
    'published_knowledge_quality_policy',
    'Published Knowledge Quality Policy',
    'Published knowledge must be source-approved, publication-ready, and quality-scored before broad reuse.',
    'internal',
    'published',
    1,
    'canonical_manual',
    '{"seed":"yes","area":"30"}'::jsonb
  ),
  (
    'compatibility_restriction',
    'compatibility_restriction_policy',
    'Compatibility and Restriction Policy',
    'Compatibility and restriction are common cross-app reference layers and should not be embedded ad hoc per application.',
    'internal',
    'published',
    1,
    'canonical_manual',
    '{"seed":"yes","area":"31"}'::jsonb
  ),
  (
    'seasonal_annual_event_timing',
    'seasonal_timing_policy',
    'Seasonal Timing Policy',
    'Seasonal and annual timing should be reusable through canonical event windows rather than duplicated per app.',
    'internal',
    'published',
    1,
    'canonical_manual',
    '{"seed":"yes","area":"33"}'::jsonb
  )
ON CONFLICT (article_code) DO UPDATE
SET title              = EXCLUDED.title,
    body_text          = EXCLUDED.body_text,
    visibility_scope   = EXCLUDED.visibility_scope,
    publication_status = EXCLUDED.publication_status,
    version_no         = EXCLUDED.version_no,
    source_registry_code = EXCLUDED.source_registry_code,
    meta               = EXCLUDED.meta,
    updated_at         = NOW();

-- ============================================================
-- PUBLISHED KNOWLEDGE CATALOG SEED
-- ============================================================
INSERT INTO cx22073jw.published_knowledge_catalog (
  article_id, catalog_status, quality_grade, publication_channel, published_at, search_keywords, quality_note, meta
)
SELECT
  ka.article_id,
  'published',
  'A',
  'internal_foundation',
  NOW(),
  ARRAY['canonical','foundation','quality'],
  'seeded canonical article',
  '{"seed":"yes"}'::jsonb
FROM cx22073jw.knowledge_article ka
WHERE ka.article_code = 'published_knowledge_quality_policy'
ON CONFLICT (article_id) DO UPDATE
SET catalog_status      = EXCLUDED.catalog_status,
    quality_grade       = EXCLUDED.quality_grade,
    publication_channel = EXCLUDED.publication_channel,
    published_at        = EXCLUDED.published_at,
    search_keywords     = EXCLUDED.search_keywords,
    quality_note        = EXCLUDED.quality_note,
    meta                = EXCLUDED.meta,
    updated_at          = NOW();

INSERT INTO cx22073jw.published_knowledge_quality_metric (
  catalog_id, metric_code, metric_value, metric_unit, is_passing, meta
)
SELECT
  pkc.catalog_id,
  x.metric_code,
  x.metric_value,
  x.metric_unit,
  x.is_passing,
  x.meta
FROM cx22073jw.published_knowledge_catalog pkc
JOIN LATERAL (
  VALUES
    ('source_trust', 99.00::numeric, 'score', true, '{"seed":"yes"}'::jsonb),
    ('publication_completeness', 100.00::numeric, 'percent', true, '{"seed":"yes"}'::jsonb),
    ('foundation_reusability', 95.00::numeric, 'score', true, '{"seed":"yes"}'::jsonb)
) AS x(metric_code, metric_value, metric_unit, is_passing, meta)
  ON true
JOIN cx22073jw.knowledge_article ka
  ON ka.article_id = pkc.article_id
WHERE ka.article_code = 'published_knowledge_quality_policy'
ON CONFLICT (catalog_id, metric_code) DO UPDATE
SET metric_value = EXCLUDED.metric_value,
    metric_unit  = EXCLUDED.metric_unit,
    is_passing   = EXCLUDED.is_passing,
    meta         = EXCLUDED.meta,
    updated_at   = NOW();

-- ============================================================
-- COMPATIBILITY / RESTRICTION SEED
-- ============================================================
INSERT INTO cx22073jw.compatibility_profile_master (
  profile_code, profile_name, profile_scope, description
) VALUES
  ('general_reference', 'General Reference', 'reference', 'General reusable reference profile'),
  ('jp_reference', 'Japan Reference', 'reference', 'Japan-oriented reference profile'),
  ('public_template', 'Public Template', 'template', 'Public reusable template profile'),
  ('restricted_template', 'Restricted Template', 'template', 'Restricted template profile'),
  ('regulated_content', 'Regulated Content', 'content', 'Content with policy or regulation sensitivity')
ON CONFLICT (profile_code) DO UPDATE
SET profile_name = EXCLUDED.profile_name,
    profile_scope = EXCLUDED.profile_scope,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO cx22073jw.compatibility_rule (
  left_profile_code, right_profile_code, compatibility_status, reason_text, condition_json, priority_rank
) VALUES
  ('general_reference', 'public_template', 'compatible', 'General reference can be used in public templates', '{}'::jsonb, 10),
  ('jp_reference', 'public_template', 'conditional', 'Locale note may be required for public usage', '{"requires_locale_note":true}'::jsonb, 20),
  ('regulated_content', 'public_template', 'incompatible', 'Regulated content should not be exposed directly in public templates', '{"requires_review":true}'::jsonb, 5),
  ('regulated_content', 'restricted_template', 'conditional', 'Restricted templates may use regulated content after review', '{"requires_review":true}'::jsonb, 8)
ON CONFLICT (left_profile_code, right_profile_code) DO UPDATE
SET compatibility_status = EXCLUDED.compatibility_status,
    reason_text          = EXCLUDED.reason_text,
    condition_json       = EXCLUDED.condition_json,
    priority_rank        = EXCLUDED.priority_rank,
    updated_at           = NOW();

INSERT INTO cx22073jw.restriction_rule (
  target_object_type, target_object_id, restriction_code, restriction_scope, restriction_status, rule_json, note_text
) VALUES
  ('article', 'compatibility_restriction_policy', 'jp_localization_required', 'locale', 'active', '{"locale":"ja-JP"}'::jsonb, 'Japanese locale note required'),
  ('template', 'foundation_answer_style_template', 'public_safe_only', 'policy', 'active', '{"safe_only":true}'::jsonb, 'Public usage should remain safe-only'),
  ('domain', 'seasonal_annual_event_timing', 'jurisdiction_sensitive', 'jurisdiction', 'active', '{"requires_jurisdiction":true}'::jsonb, 'Timing can vary by jurisdiction')
ON CONFLICT (target_object_type, target_object_id, restriction_code, restriction_scope) DO UPDATE
SET restriction_status = EXCLUDED.restriction_status,
    rule_json          = EXCLUDED.rule_json,
    note_text          = EXCLUDED.note_text,
    updated_at         = NOW();

-- ============================================================
-- TEMPLATE FRAGMENT SEED
-- ============================================================
INSERT INTO cx22073jw.template_registry (
  template_code, template_name, template_kind, template_body, visibility_scope, publication_status, source_registry_code
) VALUES
  (
    'published_knowledge_card_template',
    'Published Knowledge Card Template',
    'knowledge_card',
    '{"layout":"card","version":"v1"}'::jsonb,
    'internal',
    'published',
    'canonical_manual'
  )
ON CONFLICT (template_code) DO UPDATE
SET template_name       = EXCLUDED.template_name,
    template_kind       = EXCLUDED.template_kind,
    template_body       = EXCLUDED.template_body,
    visibility_scope    = EXCLUDED.visibility_scope,
    publication_status  = EXCLUDED.publication_status,
    source_registry_code = EXCLUDED.source_registry_code,
    updated_at          = NOW();

INSERT INTO cx22073jw.template_fragment_registry (
  fragment_code, fragment_name, fragment_kind, fragment_body, visibility_scope, publication_status, source_registry_code
) VALUES
  (
    'safety_notice_fragment',
    'Safety Notice Fragment',
    'notice',
    '{"text_key":"safety_notice","required_for":"regulated_content"}'::jsonb,
    'internal',
    'published',
    'canonical_manual'
  ),
  (
    'jurisdiction_note_fragment',
    'Jurisdiction Note Fragment',
    'notice',
    '{"text_key":"jurisdiction_note","required_for":"jurisdiction_sensitive"}'::jsonb,
    'internal',
    'published',
    'canonical_manual'
  ),
  (
    'seasonal_note_fragment',
    'Seasonal Note Fragment',
    'timing',
    '{"text_key":"seasonal_note","required_for":"seasonal_window"}'::jsonb,
    'internal',
    'published',
    'canonical_manual'
  )
ON CONFLICT (fragment_code) DO UPDATE
SET fragment_name       = EXCLUDED.fragment_name,
    fragment_kind       = EXCLUDED.fragment_kind,
    fragment_body       = EXCLUDED.fragment_body,
    visibility_scope    = EXCLUDED.visibility_scope,
    publication_status  = EXCLUDED.publication_status,
    source_registry_code = EXCLUDED.source_registry_code,
    updated_at          = NOW();

INSERT INTO cx22073jw.template_fragment_binding (
  template_id, fragment_id, slot_code, sort_order, is_required, condition_json
)
SELECT
  tr.template_id,
  tfr.fragment_id,
  x.slot_code,
  x.sort_order,
  x.is_required,
  x.condition_json
FROM cx22073jw.template_registry tr
JOIN LATERAL (
  VALUES
    ('safety_notice_fragment', 'pre_body', 10, true, '{"when":"regulated_content"}'::jsonb),
    ('jurisdiction_note_fragment', 'post_body', 20, false, '{"when":"jurisdiction_sensitive"}'::jsonb),
    ('seasonal_note_fragment', 'footer', 30, false, '{"when":"seasonal_window"}'::jsonb)
) AS x(fragment_code, slot_code, sort_order, is_required, condition_json)
  ON true
JOIN cx22073jw.template_fragment_registry tfr
  ON tfr.fragment_code = x.fragment_code
WHERE tr.template_code = 'published_knowledge_card_template'
ON CONFLICT (template_id, fragment_id, slot_code) DO UPDATE
SET sort_order     = EXCLUDED.sort_order,
    is_required    = EXCLUDED.is_required,
    condition_json = EXCLUDED.condition_json,
    updated_at     = NOW();

-- ============================================================
-- SEASONAL / ANNUAL EVENT SEED
-- ============================================================
INSERT INTO cx22073jw.seasonal_event_master (
  event_code, event_name, event_type, jurisdiction_code, start_month, start_day, end_month, end_day, recurrence_rule, timing_note, is_active
) VALUES
  ('spring_new_life_jp', 'Spring New Life Japan', 'seasonal', 'JP', 3, 1, 4, 30, 'annual', 'Spring setup / life change season in Japan', true),
  ('fiscal_year_start_jp', 'Fiscal Year Start Japan', 'annual_event', 'JP', 4, 1, 4, 15, 'annual', 'Beginning of fiscal and school cycle in Japan', true),
  ('year_end_tax_jp', 'Year End Tax Prep Japan', 'deadline_window', 'JP', 11, 1, 12, 31, 'annual', 'Year-end preparation window', true),
  ('year_end_global', 'Year End Global', 'campaign_window', NULL, 12, 1, 12, 31, 'annual', 'Common end-of-year planning window', true)
ON CONFLICT (event_code) DO UPDATE
SET event_name        = EXCLUDED.event_name,
    event_type        = EXCLUDED.event_type,
    jurisdiction_code = EXCLUDED.jurisdiction_code,
    start_month       = EXCLUDED.start_month,
    start_day         = EXCLUDED.start_day,
    end_month         = EXCLUDED.end_month,
    end_day           = EXCLUDED.end_day,
    recurrence_rule   = EXCLUDED.recurrence_rule,
    timing_note       = EXCLUDED.timing_note,
    is_active         = EXCLUDED.is_active,
    updated_at        = NOW();

INSERT INTO cx22073jw.seasonal_event_content_link (
  event_code, target_object_type, target_object_id, relation_type, priority_rank, meta
) VALUES
  ('spring_new_life_jp', 'template', 'published_knowledge_card_template', 'recommended', 10, '{"seed":"yes"}'::jsonb),
  ('fiscal_year_start_jp', 'fragment', 'jurisdiction_note_fragment', 'contextual', 10, '{"seed":"yes"}'::jsonb),
  ('year_end_tax_jp', 'article', 'compatibility_restriction_policy', 'warning', 15, '{"seed":"yes"}'::jsonb),
  ('year_end_global', 'fragment', 'seasonal_note_fragment', 'recommended', 20, '{"seed":"yes"}'::jsonb)
ON CONFLICT (event_code, target_object_type, target_object_id, relation_type) DO UPDATE
SET priority_rank = EXCLUDED.priority_rank,
    meta          = EXCLUDED.meta,
    updated_at    = NOW();

COMMIT;

\echo '============================================================'
\echo 'PRIORITY 30-33 TABLE CHECK'
\echo '============================================================'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'cx22073jw'
  AND table_name IN (
    'published_knowledge_catalog',
    'published_knowledge_quality_metric',
    'compatibility_profile_master',
    'compatibility_rule',
    'restriction_rule',
    'template_fragment_registry',
    'template_fragment_binding',
    'seasonal_event_master',
    'seasonal_event_content_link'
  )
ORDER BY table_name;

\echo '============================================================'
\echo 'PUBLISHED KNOWLEDGE READY CATALOG'
\echo '============================================================'
TABLE cx22073jw.v_published_knowledge_ready_catalog;

\echo '============================================================'
\echo 'TEMPLATE FRAGMENT BINDINGS'
\echo '============================================================'
TABLE cx22073jw.v_template_fragment_bindings;

\echo '============================================================'
\echo 'SEASONAL ACTIVE TODAY'
\echo '============================================================'
TABLE cx22073jw.v_seasonal_active_today;

\echo '============================================================'
\echo 'FUNCTION SAMPLES'
\echo '============================================================'
SELECT * FROM cx22073jw.fn_article_publication_readiness('published_knowledge_quality_policy');
SELECT * FROM cx22073jw.fn_get_template_fragments('published_knowledge_card_template');
SELECT cx22073jw.fn_is_date_in_seasonal_window('spring_new_life_jp', DATE '2026-04-10') AS spring_window_sample;
SQL

  echo "============================================================"
  echo "CX22073JW PRIORITY 30-33 ADDITIVE APPLY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
