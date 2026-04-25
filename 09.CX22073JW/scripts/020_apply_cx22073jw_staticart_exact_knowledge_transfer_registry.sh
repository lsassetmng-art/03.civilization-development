#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="$HOME/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_exact_knowledge_transfer_registry.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART EXACT KNOWLEDGE TRANSFER REGISTRY APPLY"
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

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_exact_knowledge_transfer',
    'StaticArt Exact Knowledge Transfer',
    'normal',
    'integration',
    'Exact knowledge transfer contract from StaticArtOS to CX22073JW'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.system_to_cx_knowledge_transfer_profile (
  transfer_profile_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system_code          text NOT NULL,
  source_schema_code          text,
  target_system_code          text NOT NULL,
  profile_code                text NOT NULL UNIQUE,
  status_code                 text NOT NULL CHECK (status_code IN ('implementation-prep','active','paused','deprecated')),
  owner_name                  text NOT NULL,
  prepared_by                 text,
  purpose_text                text NOT NULL,
  core_rule_text              text NOT NULL,
  final_rule_text             text NOT NULL,
  created_at                  timestamptz NOT NULL DEFAULT NOW(),
  updated_at                  timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.system_to_cx_knowledge_transfer_block (
  transfer_block_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_profile_id         uuid NOT NULL REFERENCES cx22073jw.system_to_cx_knowledge_transfer_profile(transfer_profile_id) ON DELETE CASCADE,
  block_code                  text NOT NULL,
  block_name                  text NOT NULL,
  sort_order                  integer NOT NULL CHECK (sort_order > 0),
  block_kind                  text NOT NULL CHECK (
                               block_kind IN (
                                 'rule',
                                 'root',
                                 'knowledge_block',
                                 'payload_grouping',
                                 'minimum_send_set'
                               )
                             ),
  block_description           text,
  important_rule_text         text,
  created_at                  timestamptz NOT NULL DEFAULT NOW(),
  updated_at                  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (transfer_profile_id, block_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_field_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_block_id           uuid NOT NULL REFERENCES cx22073jw.system_to_cx_knowledge_transfer_block(transfer_block_id) ON DELETE CASCADE,
  field_code                  text NOT NULL,
  field_type_text             text,
  field_role_text             text,
  fixed_value_text            text,
  allowed_values              text[] NOT NULL DEFAULT ARRAY[]::text[],
  sort_order                  integer NOT NULL CHECK (sort_order > 0),
  created_at                  timestamptz NOT NULL DEFAULT NOW(),
  updated_at                  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (transfer_block_id, field_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.system_to_cx_knowledge_transfer_rule_item (
  transfer_rule_item_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_profile_id         uuid NOT NULL REFERENCES cx22073jw.system_to_cx_knowledge_transfer_profile(transfer_profile_id) ON DELETE CASCADE,
  rule_group_code             text NOT NULL CHECK (
                               rule_group_code IN (
                                 'do_not_send_as_canonical',
                                 'minimum_first_send_set',
                                 'recommended_payload_grouping'
                               )
                             ),
  item_text                   text NOT NULL,
  sort_order                  integer NOT NULL CHECK (sort_order > 0),
  created_at                  timestamptz NOT NULL DEFAULT NOW(),
  updated_at                  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (transfer_profile_id, rule_group_code, item_text)
);

CREATE INDEX IF NOT EXISTS ix_system_to_cx_knowledge_transfer_block_profile
  ON cx22073jw.system_to_cx_knowledge_transfer_block (transfer_profile_id, sort_order);

CREATE INDEX IF NOT EXISTS ix_system_to_cx_knowledge_transfer_field_block
  ON cx22073jw.system_to_cx_knowledge_transfer_field (transfer_block_id, sort_order);

CREATE INDEX IF NOT EXISTS ix_system_to_cx_knowledge_transfer_rule_item_profile
  ON cx22073jw.system_to_cx_knowledge_transfer_rule_item (transfer_profile_id, rule_group_code, sort_order);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'system_to_cx_knowledge_transfer_profile',
    'system_to_cx_knowledge_transfer_block',
    'system_to_cx_knowledge_transfer_field',
    'system_to_cx_knowledge_transfer_rule_item'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c
        ON c.oid = tg.tgrelid
      JOIN pg_namespace n
        ON n.oid = c.relnamespace
      WHERE tg.tgname = format('trg_%s_updated_at', t)
        AND n.nspname = 'cx22073jw'
        AND c.relname = t
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

INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_profile (
  source_system_code,
  source_schema_code,
  target_system_code,
  profile_code,
  status_code,
  owner_name,
  prepared_by,
  purpose_text,
  core_rule_text,
  final_rule_text
) VALUES (
  'StaticArtOS',
  'staticart',
  'CX22073JW',
  'staticart_to_cx22073jw_knowledge_exact_list_v1',
  'implementation-prep',
  'Boss',
  'Zero',
  'Defines the exact knowledge-oriented items that StaticArtOS may send to CX22073JW.',
  'Send knowledge, not canonical operational source of truth. Keep StaticArtOS as the canonical owner of asset/business/governance data. CX22073JW stores understanding/search/recommendation/reference knowledge.',
  'StaticArtOS sends knowledge to CX22073JW only when cross-system reference value is needed. StaticArtOS remains the canonical owner of asset, rights, review, entitlement, and continuity truth. CX22073JW stores explainable, searchable, recommendable knowledge, not canonical operational truth.'
)
ON CONFLICT (profile_code) DO UPDATE
SET source_system_code = EXCLUDED.source_system_code,
    source_schema_code = EXCLUDED.source_schema_code,
    target_system_code = EXCLUDED.target_system_code,
    status_code        = EXCLUDED.status_code,
    owner_name         = EXCLUDED.owner_name,
    prepared_by        = EXCLUDED.prepared_by,
    purpose_text       = EXCLUDED.purpose_text,
    core_rule_text     = EXCLUDED.core_rule_text,
    final_rule_text    = EXCLUDED.final_rule_text,
    updated_at         = NOW();

WITH p AS (
  SELECT transfer_profile_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_profile
  WHERE profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_block (
  transfer_profile_id,
  block_code,
  block_name,
  sort_order,
  block_kind,
  block_description,
  important_rule_text
)
SELECT
  p.transfer_profile_id,
  v.block_code,
  v.block_name,
  v.sort_order,
  v.block_kind,
  v.block_description,
  v.important_rule_text
FROM p
JOIN (
  VALUES
    ('knowledge_pack_root','Knowledge Pack Root',10,'root','Knowledge package root definition',NULL),
    ('asset_identity_knowledge','Asset Identity Knowledge',20,'knowledge_block','Asset identity and summary knowledge',NULL),
    ('search_and_index_knowledge','Search and Index Knowledge',30,'knowledge_block','Search/index oriented knowledge',NULL),
    ('exhibition_knowledge','Exhibition Knowledge',40,'knowledge_block','Exhibition recommendation/support knowledge','Exhibition knowledge is recommendation/support knowledge only. Final exhibition eligibility remains derived from StaticArtOS-side canonical/projection logic.'),
    ('rights_digest_knowledge','Rights Digest Knowledge',50,'knowledge_block','Human-readable rights digest knowledge','Rights digest is explanatory knowledge. It must never replace canonical rights policy.'),
    ('relationship_knowledge','Relationship Knowledge',60,'knowledge_block','Asset relationship knowledge',NULL),
    ('review_quality_learning_knowledge','Review / Quality Learning Knowledge',70,'knowledge_block','Learning/support review knowledge','This is learning/support knowledge, not operational review truth.'),
    ('continuity_signal_knowledge','Continuity Signal Knowledge',80,'knowledge_block','Continuity summary knowledge','Do not transfer raw canonical progress ownership semantics as truth here. This is summary knowledge for reference/recommendation use.'),
    ('recommendation_knowledge','Recommendation Knowledge',90,'knowledge_block','Recommendation/discovery knowledge',NULL),
    ('minimum_first_send_set','Minimum First Send Set',100,'minimum_send_set','Minimum useful knowledge set if integration resumes later',NULL),
    ('recommended_payload_grouping','Recommended Payload Grouping',110,'payload_grouping','Recommended payload grouping',NULL)
) AS v(
  block_code, block_name, sort_order, block_kind, block_description, important_rule_text
) ON true
ON CONFLICT (transfer_profile_id, block_code) DO UPDATE
SET block_name           = EXCLUDED.block_name,
    sort_order           = EXCLUDED.sort_order,
    block_kind           = EXCLUDED.block_kind,
    block_description    = EXCLUDED.block_description,
    important_rule_text  = EXCLUDED.important_rule_text,
    updated_at           = NOW();

WITH p AS (
  SELECT transfer_profile_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_profile
  WHERE profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_rule_item (
  transfer_profile_id, rule_group_code, item_text, sort_order
)
SELECT p.transfer_profile_id, 'do_not_send_as_canonical', v.item_text, v.sort_order
FROM p
JOIN (
  VALUES
    ('asset_master full canonical row',10),
    ('asset_version canonical row',20),
    ('asset_file canonical manifest',30),
    ('purchase history canonical records',40),
    ('subscription canonical records',50),
    ('entitlement canonical records',60),
    ('favorite canonical records',70),
    ('reader/viewer progress canonical records',80),
    ('annotation canonical records',90),
    ('review_request canonical records',100),
    ('review_decision canonical records',110),
    ('access session data',120),
    ('raw storage delivery secrets',130),
    ('raw operational audit log as source of truth',140)
) AS v(item_text, sort_order) ON true
ON CONFLICT (transfer_profile_id, rule_group_code, item_text) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

WITH p AS (
  SELECT transfer_profile_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_profile
  WHERE profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_rule_item (
  transfer_profile_id, rule_group_code, item_text, sort_order
)
SELECT p.transfer_profile_id, 'minimum_first_send_set', v.item_text, v.sort_order
FROM p
JOIN (
  VALUES
    ('asset_identity_knowledge',10),
    ('search_and_index_knowledge',20),
    ('exhibition_knowledge',30),
    ('rights_digest_knowledge',40)
) AS v(item_text, sort_order) ON true
ON CONFLICT (transfer_profile_id, rule_group_code, item_text) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

WITH p AS (
  SELECT transfer_profile_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_profile
  WHERE profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_rule_item (
  transfer_profile_id, rule_group_code, item_text, sort_order
)
SELECT p.transfer_profile_id, 'recommended_payload_grouping', v.item_text, v.sort_order
FROM p
JOIN (
  VALUES
    ('asset_knowledge_header',10),
    ('identity_block',20),
    ('search_block',30),
    ('exhibition_block',40),
    ('rights_digest_block',50),
    ('relationship_block',60),
    ('review_learning_block',70),
    ('continuity_signal_block',80),
    ('recommendation_block',90)
) AS v(item_text, sort_order) ON true
ON CONFLICT (transfer_profile_id, rule_group_code, item_text) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- knowledge_pack_root
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'knowledge_pack_root'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  v.fixed_value_text,
  v.allowed_values,
  v.sort_order
FROM b
JOIN (
  VALUES
    ('knowledge_pack_id','text','unique id of knowledge package record',NULL,ARRAY[]::text[],10),
    ('asset_id','uuid','canonical asset anchor reference only',NULL,ARRAY[]::text[],20),
    ('knowledge_version','integer','knowledge package schema/rebuild version',NULL,ARRAY[]::text[],30),
    ('source_system','text',NULL,'StaticArtOS',ARRAY[]::text[],40),
    ('source_schema','text',NULL,'staticart',ARRAY[]::text[],50),
    ('generated_at','timestamptz','knowledge generation timestamp',NULL,ARRAY[]::text[],60),
    ('language_scope','text[]','covered languages in this knowledge package',NULL,ARRAY[]::text[],70),
    ('canonical_updated_at_snapshot','timestamptz','snapshot of source freshness',NULL,ARRAY[]::text[],80),
    ('knowledge_status','text',NULL,NULL,ARRAY['active','stale','superseded','blocked_reference_only']::text[],90)
) AS v(field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text  = EXCLUDED.field_type_text,
    field_role_text  = EXCLUDED.field_role_text,
    fixed_value_text = EXCLUDED.fixed_value_text,
    allowed_values   = EXCLUDED.allowed_values,
    sort_order       = EXCLUDED.sort_order,
    updated_at       = NOW();

-- asset_identity_knowledge
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'asset_identity_knowledge'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  NULL,
  v.allowed_values,
  v.sort_order
FROM b
JOIN (
  VALUES
    ('asset_id','uuid','canonical asset anchor reference only',ARRAY[]::text[],10),
    ('asset_type','text','exact asset type label',ARRAY[]::text[],20),
    ('asset_family','text',NULL,ARRAY['publishing','visual']::text[],30),
    ('canonical_title','text','main human-readable title',ARRAY[]::text[],40),
    ('alternate_titles','text[]','alternate search/display forms',ARRAY[]::text[],50),
    ('short_identity_summary','text','one-paragraph identity summary',ARRAY[]::text[],60),
    ('creator_display_summary','text','creator-facing public summary text',ARRAY[]::text[],70),
    ('series_summary','text','series membership summary if any',ARRAY[]::text[],80),
    ('category_summary','text[]','normalized category knowledge',ARRAY[]::text[],90),
    ('tag_summary','text[]','normalized tag knowledge',ARRAY[]::text[],100),
    ('language_availability','text[]','languages available for understanding/search',ARRAY[]::text[],110),
    ('release_visibility_summary','text','published / library-only / hidden level summary',ARRAY[]::text[],120)
) AS v(field_code, field_type_text, field_role_text, allowed_values, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text = EXCLUDED.field_type_text,
    field_role_text = EXCLUDED.field_role_text,
    allowed_values  = EXCLUDED.allowed_values,
    sort_order      = EXCLUDED.sort_order,
    updated_at      = NOW();

-- search_and_index_knowledge
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'search_and_index_knowledge'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  NULL,
  ARRAY[]::text[],
  v.sort_order
FROM b
JOIN (
  VALUES
    ('primary_search_terms','text[]','highest-confidence search anchors',10),
    ('secondary_search_terms','text[]','useful supplemental search anchors',20),
    ('synonym_terms','text[]','same-meaning search expansions',30),
    ('multilingual_search_terms','jsonb','language -> terms map',40),
    ('theme_keywords','text[]','theme-level retrieval terms',50),
    ('style_keywords','text[]','artistic/presentation style terms',60),
    ('subject_keywords','text[]','object/topic subject terms',70),
    ('mood_keywords','text[]','emotional atmosphere terms',80),
    ('search_boost_hints','text[]','ranking hints, not canonical truth',90),
    ('related_query_hints','text[]','query reformulation suggestions',100)
) AS v(field_code, field_type_text, field_role_text, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text = EXCLUDED.field_type_text,
    field_role_text = EXCLUDED.field_role_text,
    sort_order      = EXCLUDED.sort_order,
    updated_at      = NOW();

-- exhibition_knowledge
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'exhibition_knowledge'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  NULL,
  v.allowed_values,
  v.sort_order
FROM b
JOIN (
  VALUES
    ('exhibition_suitability_summary','text','human-readable exhibition fit summary',ARRAY[]::text[],10),
    ('exhibition_theme_candidates','text[]','suggested exhibition themes',ARRAY[]::text[],20),
    ('wall_display_suitability','text',NULL,ARRAY['high','medium','low','unsuitable']::text[],30),
    ('sequence_display_suitability','text',NULL,ARRAY['high','medium','low','unsuitable']::text[],40),
    ('spotlight_display_suitability','text',NULL,ARRAY['high','medium','low','unsuitable']::text[],50),
    ('collection_pairing_hints','text[]','related assets or display pairing hints',ARRAY[]::text[],60),
    ('visual_balance_hints','text[]','composition/color/space balancing hints',ARRAY[]::text[],70),
    ('exhibition_caution_summary','text','non-canonical caution summary',ARRAY[]::text[],80),
    ('exhibition_ineligibility_summary','text','short explanation if not suitable or blocked',ARRAY[]::text[],90)
) AS v(field_code, field_type_text, field_role_text, allowed_values, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text = EXCLUDED.field_type_text,
    field_role_text = EXCLUDED.field_role_text,
    allowed_values  = EXCLUDED.allowed_values,
    sort_order      = EXCLUDED.sort_order,
    updated_at      = NOW();

-- rights_digest_knowledge
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'rights_digest_knowledge'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  NULL,
  ARRAY[]::text[],
  v.sort_order
FROM b
JOIN (
  VALUES
    ('rights_short_summary','text','short rights digest',10),
    ('exhibition_allowed_summary','text','human-readable exhibition permission digest',20),
    ('derivative_allowed_summary','text','human-readable derivative permission digest',30),
    ('commercial_use_summary','text','human-readable commercial-use digest',40),
    ('age_rating_summary','text','human-readable age rule digest',50),
    ('region_policy_summary','text','human-readable region rule digest',60),
    ('additional_license_summary','text','explains extra license need if relevant',70),
    ('block_reason_summary','text','knowledge digest of why access/use may be blocked',80),
    ('allowed_usage_examples','text[]','illustrative allowed-use examples',90),
    ('caution_usage_examples','text[]','illustrative caution/disallowed-use examples',100)
) AS v(field_code, field_type_text, field_role_text, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text = EXCLUDED.field_type_text,
    field_role_text = EXCLUDED.field_role_text,
    sort_order      = EXCLUDED.sort_order,
    updated_at      = NOW();

-- relationship_knowledge
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'relationship_knowledge'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  NULL,
  ARRAY[]::text[],
  v.sort_order
FROM b
JOIN (
  VALUES
    ('related_asset_ids','uuid[]','broad related assets',10),
    ('same_creator_asset_ids','uuid[]','same creator relation set',20),
    ('same_series_asset_ids','uuid[]','same series relation set',30),
    ('same_theme_asset_ids','uuid[]','same theme relation set',40),
    ('complementary_display_asset_ids','uuid[]','good pairing candidates',50),
    ('contrast_display_asset_ids','uuid[]','contrast pairing candidates',60),
    ('progression_asset_ids','uuid[]','sequence/progression candidates',70),
    ('cross_reference_notes','text[]','human-readable relation notes',80)
) AS v(field_code, field_type_text, field_role_text, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text = EXCLUDED.field_type_text,
    field_role_text = EXCLUDED.field_role_text,
    sort_order      = EXCLUDED.sort_order,
    updated_at      = NOW();

-- review_quality_learning_knowledge
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'review_quality_learning_knowledge'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  NULL,
  ARRAY[]::text[],
  v.sort_order
FROM b
JOIN (
  VALUES
    ('review_history_summary','text','summarized review history, not canonical review record',10),
    ('common_issue_patterns','text[]','recurring issue knowledge',20),
    ('quality_risk_tags','text[]','lightweight governance/quality hints',30),
    ('publish_readiness_hints','text[]','preparation hints before publish',40),
    ('restriction_pattern_summary','text','summarized restriction tendency if any',50),
    ('remediation_hints','text[]','how to improve/fix typical issues',60)
) AS v(field_code, field_type_text, field_role_text, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text = EXCLUDED.field_type_text,
    field_role_text = EXCLUDED.field_role_text,
    sort_order      = EXCLUDED.sort_order,
    updated_at      = NOW();

-- continuity_signal_knowledge
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'continuity_signal_knowledge'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  NULL,
  v.allowed_values,
  v.sort_order
FROM b
JOIN (
  VALUES
    ('continuity_type','text',NULL,ARRAY['reader','viewer','mixed','none']::text[],10),
    ('recency_summary','text','recent-use digest',ARRAY[]::text[],20),
    ('engagement_summary','text','coarse engagement description',ARRAY[]::text[],30),
    ('progress_band_summary','text',NULL,ARRAY['not_started','early','mid','late','completed_like']::text[],40),
    ('favorite_signal','boolean','knowledge-side signal only',ARRAY[]::text[],50),
    ('reentry_hint','text','hint for where user may want to re-enter',ARRAY[]::text[],60)
) AS v(field_code, field_type_text, field_role_text, allowed_values, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text = EXCLUDED.field_type_text,
    field_role_text = EXCLUDED.field_role_text,
    allowed_values  = EXCLUDED.allowed_values,
    sort_order      = EXCLUDED.sort_order,
    updated_at      = NOW();

-- recommendation_knowledge
WITH b AS (
  SELECT b.transfer_block_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_block b
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = b.transfer_profile_id
  WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
    AND b.block_code = 'recommendation_knowledge'
)
INSERT INTO cx22073jw.system_to_cx_knowledge_transfer_field (
  transfer_block_id, field_code, field_type_text, field_role_text, fixed_value_text, allowed_values, sort_order
)
SELECT
  b.transfer_block_id,
  v.field_code,
  v.field_type_text,
  v.field_role_text,
  NULL,
  ARRAY[]::text[],
  v.sort_order
FROM b
JOIN (
  VALUES
    ('recommended_for_queries','text[]','recommended search intents',10),
    ('recommended_for_themes','text[]','recommended curation themes',20),
    ('recommended_for_display_modes','text[]','recommended display contexts',30),
    ('similar_asset_candidates','uuid[]','recommendation neighbors',40),
    ('discovery_reason_summary','text','why this asset is likely discoverable or recommendable',50)
) AS v(field_code, field_type_text, field_role_text, sort_order) ON true
ON CONFLICT (transfer_block_id, field_code) DO UPDATE
SET field_type_text = EXCLUDED.field_type_text,
    field_role_text = EXCLUDED.field_role_text,
    sort_order      = EXCLUDED.sort_order,
    updated_at      = NOW();

CREATE OR REPLACE VIEW cx22073jw.v_system_to_cx_knowledge_transfer_profile_summary AS
SELECT
  p.profile_code,
  p.source_system_code,
  p.target_system_code,
  p.status_code,
  COUNT(DISTINCT b.transfer_block_id) AS block_count,
  COUNT(DISTINCT f.transfer_field_id) AS field_count
FROM cx22073jw.system_to_cx_knowledge_transfer_profile p
LEFT JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
  ON b.transfer_profile_id = p.transfer_profile_id
LEFT JOIN cx22073jw.system_to_cx_knowledge_transfer_field f
  ON f.transfer_block_id = b.transfer_block_id
GROUP BY
  p.profile_code,
  p.source_system_code,
  p.target_system_code,
  p.status_code;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_exact_knowledge_transfer_blocks AS
SELECT
  p.profile_code,
  b.block_code,
  b.block_name,
  b.block_kind,
  b.sort_order,
  b.important_rule_text,
  COUNT(f.transfer_field_id) AS field_count
FROM cx22073jw.system_to_cx_knowledge_transfer_profile p
JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
  ON b.transfer_profile_id = p.transfer_profile_id
LEFT JOIN cx22073jw.system_to_cx_knowledge_transfer_field f
  ON f.transfer_block_id = b.transfer_block_id
WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
GROUP BY
  p.profile_code,
  b.block_code,
  b.block_name,
  b.block_kind,
  b.sort_order,
  b.important_rule_text
ORDER BY b.sort_order;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_exact_knowledge_transfer_fields AS
SELECT
  p.profile_code,
  b.block_code,
  b.block_name,
  f.field_code,
  f.field_type_text,
  f.field_role_text,
  f.fixed_value_text,
  f.allowed_values,
  f.sort_order
FROM cx22073jw.system_to_cx_knowledge_transfer_profile p
JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
  ON b.transfer_profile_id = p.transfer_profile_id
JOIN cx22073jw.system_to_cx_knowledge_transfer_field f
  ON f.transfer_block_id = b.transfer_block_id
WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
ORDER BY b.sort_order, f.sort_order;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_exact_knowledge_transfer_rules AS
SELECT
  p.profile_code,
  r.rule_group_code,
  r.item_text,
  r.sort_order
FROM cx22073jw.system_to_cx_knowledge_transfer_profile p
JOIN cx22073jw.system_to_cx_knowledge_transfer_rule_item r
  ON r.transfer_profile_id = p.transfer_profile_id
WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
ORDER BY r.rule_group_code, r.sort_order;

COMMIT;

\echo '============================================================'
\echo 'PROFILE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_system_to_cx_knowledge_transfer_profile_summary;

\echo '============================================================'
\echo 'STATICART BLOCK SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_staticart_exact_knowledge_transfer_blocks;

\echo '============================================================'
\echo 'STATICART RULE SUMMARY'
\echo '============================================================'
SELECT rule_group_code, COUNT(*) AS item_count
FROM cx22073jw.v_staticart_exact_knowledge_transfer_rules
GROUP BY rule_group_code
ORDER BY rule_group_code;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART EXACT KNOWLEDGE TRANSFER REGISTRY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
