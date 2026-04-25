#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_candidate_area_registry.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW CANDIDATE AREA REGISTRY ADDITIVE APPLY START"
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
    RAISE EXCEPTION 'base schema not found: foundation_domain_master is required before candidate area registry apply';
  END IF;
END;
$$;

-- ============================================================
-- FOUNDATION DOMAIN
-- ============================================================
INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  ('candidate_area_registry', 'Candidate Area Registry', 'normal', 'integration', 'Cross-system candidate CX22073JW area intake registry')
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

-- ============================================================
-- MASTER TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS cx22073jw.candidate_ledger_source_registry (
  ledger_source_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_code             text NOT NULL UNIQUE,
  source_system           text NOT NULL,
  source_app              text,
  source_schema           text,
  source_layer            text NOT NULL,
  source_status           text NOT NULL CHECK (source_status IN ('candidate-ledger','draft','reviewed','approved','archived')),
  storage_reference_system text NOT NULL DEFAULT 'CX22073JW',
  owner_name              text NOT NULL,
  prepared_by             text,
  language_code           text NOT NULL DEFAULT 'English',
  purpose_text            text,
  canonical_boundary_note text,
  meta                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.candidate_area_registry (
  candidate_area_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_source_id        uuid NOT NULL REFERENCES cx22073jw.candidate_ledger_source_registry(ledger_source_id) ON DELETE CASCADE,
  candidate_code          text,
  area_name               text NOT NULL,
  area_slug               text NOT NULL,
  area_roles              text[] NOT NULL DEFAULT ARRAY[]::text[],
  priority_code           text NOT NULL CHECK (priority_code IN ('highest','high','medium-high','medium','conditional','low')),
  ownership_mode          text NOT NULL CHECK (ownership_mode IN ('source_canonical','cx_projection','shared_reference')),
  purpose_text            text NOT NULL,
  why_text                text,
  suitable_contents       text[] NOT NULL DEFAULT ARRAY[]::text[],
  not_source_of_truth_for text[] NOT NULL DEFAULT ARRAY[]::text[],
  phase_recommendation    text,
  is_phase1_recommended   boolean NOT NULL DEFAULT false,
  is_active               boolean NOT NULL DEFAULT true,
  meta                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (ledger_source_id, area_slug)
);

CREATE TABLE IF NOT EXISTS cx22073jw.candidate_area_tag (
  candidate_area_tag_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_area_id       uuid NOT NULL REFERENCES cx22073jw.candidate_area_registry(candidate_area_id) ON DELETE CASCADE,
  tag_code                text NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_area_id, tag_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.candidate_area_boundary_rule (
  boundary_rule_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_source_id        uuid NOT NULL REFERENCES cx22073jw.candidate_ledger_source_registry(ledger_source_id) ON DELETE CASCADE,
  boundary_group          text NOT NULL CHECK (boundary_group IN ('source_remains_canonical_for','commerce_remains_canonical_for','cx22073_may_hold','non_candidate_or_deferred')),
  rule_text               text NOT NULL,
  sort_order              integer NOT NULL DEFAULT 100,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (ledger_source_id, boundary_group, rule_text)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS ix_candidate_ledger_source_registry_system
  ON cx22073jw.candidate_ledger_source_registry (source_system, source_app, source_status);

CREATE INDEX IF NOT EXISTS ix_candidate_area_registry_source_priority
  ON cx22073jw.candidate_area_registry (ledger_source_id, priority_code, is_phase1_recommended);

CREATE INDEX IF NOT EXISTS ix_candidate_area_registry_roles
  ON cx22073jw.candidate_area_registry USING gin (area_roles);

CREATE INDEX IF NOT EXISTS ix_candidate_area_registry_contents
  ON cx22073jw.candidate_area_registry USING gin (suitable_contents);

CREATE INDEX IF NOT EXISTS ix_candidate_area_tag_candidate
  ON cx22073jw.candidate_area_tag (candidate_area_id, tag_code);

CREATE INDEX IF NOT EXISTS ix_candidate_area_boundary_rule_source
  ON cx22073jw.candidate_area_boundary_rule (ledger_source_id, boundary_group, sort_order);

-- ============================================================
-- TRIGGERS
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'candidate_ledger_source_registry',
    'candidate_area_registry',
    'candidate_area_boundary_rule'
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
-- SOURCE REGISTRY SEED
-- ============================================================
INSERT INTO cx22073jw.candidate_ledger_source_registry (
  source_code, source_system, source_app, source_schema, source_layer, source_status,
  storage_reference_system, owner_name, prepared_by, language_code,
  purpose_text, canonical_boundary_note, meta
) VALUES
  (
    'staticartos_candidate_ledger',
    'StaticArtOS',
    NULL,
    'staticart',
    'integration',
    'candidate-ledger',
    'CX22073JW',
    'Boss',
    'Zero',
    'English',
    'Candidate data areas StaticArtOS may add to CX22073 after implementation-ready design completion.',
    'StaticArtOS remains canonical owner of asset identity, rights state, entitlement state, library visibility logic, and projection source logic.',
    '{"import_source":"user_pasted"}'::jsonb
  ),
  (
    'streamwatch_candidate_ledger',
    'StreamingOS',
    'StreamWatch',
    'streaming',
    'integration',
    'candidate-ledger',
    'CX22073JW',
    'Boss',
    'Zero',
    'English',
    'Structured knowledge, reference, indexing, optimization, and retrieval candidate areas for StreamWatch.',
    'StreamingOS and commerce remain canonical for operational truth; CX22073JW holds projections, summaries, indexes, and optimization metadata.',
    '{"import_source":"user_pasted"}'::jsonb
  ),
  (
    'streamstudio_candidate_ledger',
    'applications',
    'StreamStudio',
    NULL,
    'meta',
    'candidate-ledger',
    'CX22073JW',
    'Boss',
    'Zero',
    'English',
    'Candidate CX22073JW data areas discovered from StreamStudio design.',
    'This file records candidate additions only and does not directly modify official ledgers.',
    '{"import_source":"user_pasted"}'::jsonb
  )
ON CONFLICT (source_code) DO UPDATE
SET source_system            = EXCLUDED.source_system,
    source_app               = EXCLUDED.source_app,
    source_schema            = EXCLUDED.source_schema,
    source_layer             = EXCLUDED.source_layer,
    source_status            = EXCLUDED.source_status,
    storage_reference_system = EXCLUDED.storage_reference_system,
    owner_name               = EXCLUDED.owner_name,
    prepared_by              = EXCLUDED.prepared_by,
    language_code            = EXCLUDED.language_code,
    purpose_text             = EXCLUDED.purpose_text,
    canonical_boundary_note  = EXCLUDED.canonical_boundary_note,
    meta                     = EXCLUDED.meta,
    updated_at               = NOW();

-- ============================================================
-- STATICARTOS AREAS
-- ============================================================
WITH src AS (
  SELECT ledger_source_id
  FROM cx22073jw.candidate_ledger_source_registry
  WHERE source_code = 'staticartos_candidate_ledger'
)
INSERT INTO cx22073jw.candidate_area_registry (
  ledger_source_id, candidate_code, area_name, area_slug, area_roles, priority_code,
  ownership_mode, purpose_text, why_text, suitable_contents, not_source_of_truth_for,
  phase_recommendation, is_phase1_recommended, meta
)
SELECT
  src.ledger_source_id,
  NULL,
  v.area_name,
  v.area_slug,
  v.area_roles,
  v.priority_code,
  'source_canonical',
  v.purpose_text,
  v.why_text,
  v.suitable_contents,
  v.not_truth,
  v.phase_recommendation,
  v.is_phase1_recommended,
  v.meta
FROM src
JOIN (
  VALUES
  (
    'static_art_asset_area',
    'static_art_asset_area',
    ARRAY['reference-area']::text[],
    'high',
    'canonical asset summary for static visual works',
    'Useful as long-term asset summary and retrieval base.',
    ARRAY['asset identity summary','asset type summary','creator summary','publication summary']::text[],
    ARRAY['asset identity operational truth']::text[],
    'prepare_earliest',
    true,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'publishing_asset_area',
    'publishing_asset_area',
    ARRAY['reference-area']::text[],
    'high',
    'canonical asset summary for publishing works',
    'Useful as book/publishing asset summary and version-aware retrieval base.',
    ARRAY['asset identity summary','publishing classification','edition / version summary','release summary']::text[],
    ARRAY['publishing operational truth']::text[],
    'prepare_earliest',
    true,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'asset_metadata_localization_area',
    'asset_metadata_localization_area',
    ARRAY['reference-area','index-area']::text[],
    'high',
    'multilingual metadata reference area',
    'Supports multilingual titles, descriptions, and localized display retrieval.',
    ARRAY['titles','subtitles','short descriptions','long descriptions','localized creator-facing display text']::text[],
    ARRAY['live app-local editing truth']::text[],
    'prepare_earliest',
    true,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'asset_rights_policy_area',
    'asset_rights_policy_area',
    ARRAY['reference-area','policy-context-area']::text[],
    'high',
    'rights and permission reference area',
    'Supports policy-aware retrieval and downstream projection.',
    ARRAY['exhibition permission','commercial permission','derivative permission','region scope','age rating','rights notes']::text[],
    ARRAY['rights state operational truth']::text[],
    'prepare_earliest',
    true,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'asset_sales_offer_area',
    'asset_sales_offer_area',
    ARRAY['reference-area']::text[],
    'medium',
    'offer and pricing reference area',
    'Useful for offer lookup and pricing projection.',
    ARRAY['sale type','base price','base currency','sale period','limited sale flag','listing state']::text[],
    ARRAY['commerce transaction truth']::text[],
    'prepare_next',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'asset_marketplace_listing_projection_area',
    'asset_marketplace_listing_projection_area',
    ARRAY['reference-area','optimization-area']::text[],
    'high',
    'marketplace-facing projection area',
    'Supports marketplace rendering and discovery projection.',
    ARRAY['tab placement','ranking fields','featured state','recommended state','card rendering support fields']::text[],
    ARRAY['marketplace source logic operational truth']::text[],
    'prepare_earliest',
    true,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'asset_subscription_policy_area',
    'asset_subscription_policy_area',
    ARRAY['reference-area','policy-context-area']::text[],
    'medium',
    'subscription inclusion reference area',
    'Supports subscription eligibility and inclusion window lookup.',
    ARRAY['subscription eligible flag','inclusion start / end','settlement group','creator opt-in state']::text[],
    ARRAY['subscription contract truth']::text[],
    'prepare_next',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'asset_ownership_ledger_area',
    'asset_ownership_ledger_area',
    ARRAY['summary-area','reference-area']::text[],
    'conditional',
    'entitlement and ownership reference area',
    'Useful only as derived reference if canonical ownership boundaries remain clear.',
    ARRAY['permanent ownership','subscription access','entitlement source','active / expired state summary']::text[],
    ARRAY['entitlement state truth']::text[],
    'conditional',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'library_projection_area',
    'library_projection_area',
    ARRAY['reference-area','summary-area']::text[],
    'conditional',
    'user-facing owned library projection area',
    'Useful as derived library projection only.',
    ARRAY['library visibility','continue visibility','favorite visibility','downloaded visibility']::text[],
    ARRAY['library visibility logic truth']::text[],
    'conditional',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'reader_progress_area',
    'reader_progress_area',
    ARRAY['continuity-area','summary-area']::text[],
    'conditional',
    'reading continuity reference area',
    'Supports continuity reconstruction and resume support.',
    ARRAY['current locator','progress percent','last-opened timestamp','sync version']::text[],
    ARRAY['authoritative progress truth']::text[],
    'conditional',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'bookmark_area',
    'bookmark_area',
    ARRAY['reference-area']::text[],
    'conditional',
    'bookmark reference area',
    'Useful as derived bookmark lookup.',
    ARRAY['bookmark locator','bookmark note','creation timestamp']::text[],
    ARRAY['bookmark mutation truth']::text[],
    'conditional',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'favorite_asset_area',
    'favorite_asset_area',
    ARRAY['reference-area','summary-area']::text[],
    'conditional',
    'favorite relationship area',
    'Useful as preference/reference projection.',
    ARRAY['user to asset favorite mapping','favorite timestamp']::text[],
    ARRAY['favorite operational truth']::text[],
    'conditional',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'asset_version_history_area',
    'asset_version_history_area',
    ARRAY['reference-area','summary-area']::text[],
    'medium',
    'asset version history reference area',
    'Supports version-aware retrieval and release history.',
    ARRAY['version number','version label','replacement policy','release timestamps','change summary']::text[],
    ARRAY['authoritative release execution truth']::text[],
    'prepare_next',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'review_case_area',
    'review_case_area',
    ARRAY['reference-area','policy-context-area']::text[],
    'high',
    'review governance reference area',
    'Supports review status and governance summary lookup.',
    ARRAY['review type','review status','assigned reviewer','result summary','timestamps']::text[],
    ARRAY['review workflow operational truth']::text[],
    'prepare_earliest',
    true,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'exhibition_projection_area',
    'exhibition_projection_area',
    ARRAY['reference-area','optimization-area']::text[],
    'high',
    'Exhibition Builder projection reference area',
    'Supports exhibition-facing reusable projection and builder eligibility.',
    ARRAY['projection eligibility','projection summary text','rights summary','price label','usable_in_exhibition_builder flag']::text[],
    ARRAY['projection source logic truth']::text[],
    'prepare_earliest',
    true,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'marketplace_filter_index_area',
    'marketplace_filter_index_area',
    ARRAY['index-area','optimization-area']::text[],
    'medium',
    'derived filtering and discovery support area',
    'Supports category/tag/creator/language/price filtering.',
    ARRAY['category lookup support','tag lookup support','creator lookup support','language lookup support','price band lookup support']::text[],
    ARRAY['primary search engine truth']::text[],
    'prepare_next',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'marketplace_ranking_snapshot_area',
    'marketplace_ranking_snapshot_area',
    ARRAY['summary-area','optimization-area']::text[],
    'medium',
    'ranking and discovery history area',
    'Supports ranking snapshots and discovery history.',
    ARRAY['popularity score snapshot','best-selling snapshot','featured snapshot','recommended snapshot','ranking timestamp']::text[],
    ARRAY['live ranking computation truth']::text[],
    'prepare_next',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  ),
  (
    'creator_settlement_measurement_area',
    'creator_settlement_measurement_area',
    ARRAY['summary-area','reference-area']::text[],
    'conditional',
    'settlement measurement support area',
    'Useful only as derived measurement support.',
    ARRAY['qualified page read counts','qualified session counts','qualified view session counts','qualified time-spent bands']::text[],
    ARRAY['settlement final truth']::text[],
    'conditional',
    false,
    '{"system":"StaticArtOS"}'::jsonb
  )
) AS v(
  area_name, area_slug, area_roles, priority_code, purpose_text, why_text,
  suitable_contents, not_truth, phase_recommendation, is_phase1_recommended, meta
) ON true
ON CONFLICT (ledger_source_id, area_slug) DO UPDATE
SET candidate_code          = EXCLUDED.candidate_code,
    area_name               = EXCLUDED.area_name,
    area_roles              = EXCLUDED.area_roles,
    priority_code           = EXCLUDED.priority_code,
    ownership_mode          = EXCLUDED.ownership_mode,
    purpose_text            = EXCLUDED.purpose_text,
    why_text                = EXCLUDED.why_text,
    suitable_contents       = EXCLUDED.suitable_contents,
    not_source_of_truth_for = EXCLUDED.not_source_of_truth_for,
    phase_recommendation    = EXCLUDED.phase_recommendation,
    is_phase1_recommended   = EXCLUDED.is_phase1_recommended,
    is_active               = EXCLUDED.is_active,
    meta                    = EXCLUDED.meta,
    updated_at              = NOW();

-- ============================================================
-- STREAMWATCH AREAS
-- ============================================================
WITH src AS (
  SELECT ledger_source_id
  FROM cx22073jw.candidate_ledger_source_registry
  WHERE source_code = 'streamwatch_candidate_ledger'
)
INSERT INTO cx22073jw.candidate_area_registry (
  ledger_source_id, candidate_code, area_name, area_slug, area_roles, priority_code,
  ownership_mode, purpose_text, why_text, suitable_contents, not_source_of_truth_for,
  phase_recommendation, is_phase1_recommended, meta
)
SELECT
  src.ledger_source_id,
  v.candidate_code,
  v.area_name,
  v.area_slug,
  v.area_roles,
  v.priority_code,
  'source_canonical',
  v.purpose_text,
  v.why_text,
  v.suitable_contents,
  v.not_truth,
  v.phase_recommendation,
  v.is_phase1_recommended,
  v.meta
FROM src
JOIN (
  VALUES
  ('SW-CX-001','streaming_view_history_area','streaming_view_history_area',ARRAY['summary-area','continuity-area','optimization-area']::text[],'highest',
   'Support long-range viewing-history reconstruction, compression, indexing, and retrieval.',
   'Viewer watch history grows quickly and is useful for summarized recall and continuity restoration.',
   ARRAY['summarized history slices','historical aggregates by time range','compact recent-to-archived transition records','re-entry hints','last-known watched clusters','cross-device history reconstruction hints']::text[],
   ARRAY['immediate playback progress writes','authoritative operational history row ownership']::text[],
   'prepare_earliest',true,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-002','streaming_favorite_area','streaming_favorite_area',ARRAY['reference-area','summary-area']::text[],'high',
   'Support retrieval, grouping, summarization, and preference-oriented recall for favorites.',
   'Favorites are valuable long-term preference signals and user-facing memory cues.',
   ARRAY['favorite summaries by category, creator, or series','favorite cluster references','favorite recency slices','favorite retrieval indexes']::text[],
   ARRAY['add/remove favorite mutations','operational favorite ownership state']::text[],
   'prepare_next',false,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-003','streaming_watch_later_area','streaming_watch_later_area',ARRAY['reference-area','continuity-area']::text[],'high',
   'Support deferred-intent retrieval and structured later-viewing recall.',
   'Watch-later lists become large and semantically meaningful.',
   ARRAY['watch-later summaries','age-of-intent groupings','watch-later category clusters','unresolved deferred-viewing groups','reminder-oriented retrieval context']::text[],
   ARRAY['operational append/remove actions','exact ordering as the canonical list owner']::text[],
   'prepare_next',false,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-004','streaming_follow_area','streaming_follow_area',ARRAY['reference-area','summary-area','index-area']::text[],'high',
   'Support follow relationship recall, grouping, and creator/channel interest retrieval.',
   'Follow state is a strong long-term interest signal and useful for recommendation-context retrieval.',
   ARRAY['followed creator summaries','followed channel clusters','recent follow activity references','interest group indices','follow-based discovery context summaries']::text[],
   ARRAY['active follow/unfollow transactional state','notification delivery ownership']::text[],
   'prepare_next',false,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-005','streaming_category_tree_area','streaming_category_tree_area',ARRAY['index-area','reference-area','optimization-area']::text[],'highest',
   'Support structured category-tree indexing, path recall, and traversal optimization.',
   'Category-tree discovery is central and benefits from branch indexing and semantic path retrieval.',
   ARRAY['category node reference projections','branch summaries','breadcrumb path reference sets','semantic aliases for discovery','cross-node relation hints','popular path summaries']::text[],
   ARRAY['operational category mutation control','authoritative node identity ownership']::text[],
   'prepare_earliest',true,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-006','streaming_playlist_reference_area','streaming_playlist_reference_area',ARRAY['reference-area','summary-area','index-area']::text[],'medium-high',
   'Support playlist-level retrieval, grouping, and relationship lookup.',
   'Playlists are useful not only as operational playback sequences but as structured content clusters.',
   ARRAY['playlist summaries','playlist-to-series relation hints','playlist-to-category mappings','playlist thematic indexes','playlist recency and relevance summaries']::text[],
   ARRAY['operational playlist ordering','canonical playlist item mutation']::text[],
   'observe_before_deeper_expansion',false,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-007','streaming_continue_watching_area','streaming_continue_watching_area',ARRAY['continuity-area','summary-area','optimization-area']::text[],'highest',
   'Support rapid recovery of in-progress viewing surfaces across devices and sessions.',
   'Continue-watching is a major viewer convenience layer and benefits from fast retrieval and historical continuity support.',
   ARRAY['in-progress content summaries','last-entry recovery hints','resume candidate ranking hints','series-grouped continue-watching bundles','device-agnostic continuity projections']::text[],
   ARRAY['authoritative immediate playback position','canonical progress-write ownership']::text[],
   'prepare_earliest',true,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-008','streaming_tv_handoff_area','streaming_tv_handoff_area',ARRAY['continuity-area','optimization-area','reference-area']::text[],'high',
   'Support route-aware handoff history, session recall, and recovery assistance.',
   'TV handoff benefits from session reconstruction and device-context indexing.',
   ARRAY['handoff summaries','route preference memory','failed handoff recovery hints','source-target device transition histories','route capability references','resume write-back recovery summaries']::text[],
   ARRAY['active live cast session ownership','direct real-time session control']::text[],
   'prepare_next',false,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-009','streaming_viewer_profile_area','streaming_viewer_profile_area',ARRAY['reference-area','policy-context-area']::text[],'high',
   'Support viewer-profile-centered retrieval, preference context, and continuity partitioning.',
   'Profile context is highly useful for reference and retrieval.',
   ARRAY['profile preference summaries','profile continuity identity mappings','profile viewing pattern summaries','profile language and subtitle tendencies','profile-level library patterns']::text[],
   ARRAY['authoritative account/profile management','profile security ownership','direct credential or secret storage']::text[],
   'prepare_next',false,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-010','streaming_progress_resume_area','streaming_progress_resume_area',ARRAY['continuity-area','summary-area','optimization-area']::text[],'highest',
   'Support fast resume reconstruction and historical progress summarization.',
   'Resume logic benefits from a retrievable projection separate from the canonical progress table.',
   ARRAY['resume candidate summaries','progress snapshots suitable for reconstruction','near-finish and in-progress group summaries','cross-device resume hints','conflict-resolution support projections']::text[],
   ARRAY['authoritative current progress write path','strict playback engine progress truth']::text[],
   'prepare_earliest',true,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-011','streaming_restriction_profile_area','streaming_restriction_profile_area',ARRAY['policy-context-area','reference-area']::text[],'medium-high',
   'Support restriction-aware browsing context and safe-surface retrieval.',
   'Restriction mode is a meaningful context layer for retrieval and safe experience shaping.',
   ARRAY['safe-browse preference summaries','restriction-mode retrieval hints','profile-safe category projections','alternate-safe-surface references','non-sensitive gate-supporting context']::text[],
   ARRAY['final allow/deny enforcement','secrets, bypass codes, or privileged guardian artifacts']::text[],
   'observe_before_deeper_expansion',false,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-012','streaming_search_context_area','streaming_search_context_area',ARRAY['index-area','summary-area','optimization-area']::text[],'medium-high',
   'Support search-memory reconstruction, query context retrieval, and discovery optimization.',
   'Viewer search behavior is useful for structured recall and discovery support.',
   ARRAY['recent search summaries','long-range search pattern summaries','query-to-category associations','query intent clusters','multilingual search normalization support','discovery re-entry context']::text[],
   ARRAY['immediate search result computation','direct operational search logging ownership']::text[],
   'observe_before_deeper_expansion',false,'{"system":"StreamWatch"}'::jsonb),
  ('SW-CX-013','streaming_entitlement_reference_area','streaming_entitlement_reference_area',ARRAY['reference-area','summary-area','policy-context-area']::text[],'high',
   'Support entitlement-aware retrieval and viewing-readiness reference without replacing the canonical entitlement engine.',
   'Viewers benefit from fast retrieval of what is playable now and why.',
   ARRAY['entitlement reference summaries','watchability reason summaries','membership-based access summaries','rental window summaries','archive-availability hints','product-to-entitlement relation references']::text[],
   ARRAY['canonical entitlement grant state','commerce contract ownership','billing, refund, renewal, or charge execution truth']::text[],
   'prepare_next',false,'{"system":"StreamWatch"}'::jsonb)
) AS v(
  candidate_code, area_name, area_slug, area_roles, priority_code, purpose_text, why_text,
  suitable_contents, not_truth, phase_recommendation, is_phase1_recommended, meta
) ON true
ON CONFLICT (ledger_source_id, area_slug) DO UPDATE
SET candidate_code          = EXCLUDED.candidate_code,
    area_name               = EXCLUDED.area_name,
    area_roles              = EXCLUDED.area_roles,
    priority_code           = EXCLUDED.priority_code,
    ownership_mode          = EXCLUDED.ownership_mode,
    purpose_text            = EXCLUDED.purpose_text,
    why_text                = EXCLUDED.why_text,
    suitable_contents       = EXCLUDED.suitable_contents,
    not_source_of_truth_for = EXCLUDED.not_source_of_truth_for,
    phase_recommendation    = EXCLUDED.phase_recommendation,
    is_phase1_recommended   = EXCLUDED.is_phase1_recommended,
    is_active               = EXCLUDED.is_active,
    meta                    = EXCLUDED.meta,
    updated_at              = NOW();

-- ============================================================
-- STREAMSTUDIO AREAS
-- ============================================================
WITH src AS (
  SELECT ledger_source_id
  FROM cx22073jw.candidate_ledger_source_registry
  WHERE source_code = 'streamstudio_candidate_ledger'
)
INSERT INTO cx22073jw.candidate_area_registry (
  ledger_source_id, candidate_code, area_name, area_slug, area_roles, priority_code,
  ownership_mode, purpose_text, why_text, suitable_contents, not_source_of_truth_for,
  phase_recommendation, is_phase1_recommended, meta
)
SELECT
  src.ledger_source_id,
  NULL,
  v.area_name,
  v.area_slug,
  v.area_roles,
  v.priority_code,
  'source_canonical',
  v.purpose_text,
  v.why_text,
  v.suitable_contents,
  v.not_truth,
  v.phase_recommendation,
  v.is_phase1_recommended,
  v.meta
FROM src
JOIN (
  VALUES
  ('streaming_creator_asset_area','streaming_creator_asset_area',ARRAY['reference-area']::text[],'high',
   'creator-side asset working references',
   'Supports draft preparation and creator asset linkage.',
   ARRAY['creator-side asset working references','draft preparation support','creator asset linkage support']::text[],
   ARRAY['creator asset operational truth']::text[],
   'prepare_earliest',true,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_upload_queue_area','streaming_upload_queue_area',ARRAY['reference-area','summary-area']::text[],'medium',
   'upload queue support area',
   'Supports queue summary and retry-oriented reconstruction.',
   ARRAY['upload queue summary','queue state projection','retry reconstruction hints']::text[],
   ARRAY['live upload execution truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_metadata_draft_area','streaming_metadata_draft_area',ARRAY['reference-area']::text[],'medium',
   'metadata draft support area',
   'Supports draft metadata preparation.',
   ARRAY['metadata draft','title/description draft','visibility draft']::text[],
   ARRAY['live edit truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_thumbnail_area','streaming_thumbnail_area',ARRAY['reference-area']::text[],'medium',
   'thumbnail support area',
   'Supports reusable thumbnail reference and selection context.',
   ARRAY['thumbnail candidate summary','thumbnail reference','selection support fields']::text[],
   ARRAY['binary asset truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_subtitle_area','streaming_subtitle_area',ARRAY['reference-area','index-area']::text[],'medium',
   'subtitle support area',
   'Supports subtitle reference and retrieval support.',
   ARRAY['subtitle reference','language binding','subtitle version summary']::text[],
   ARRAY['playback subtitle operational truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_project_collaboration_area','streaming_project_collaboration_area',ARRAY['reference-area','summary-area']::text[],'medium',
   'project collaboration support area',
   'Supports collaboration summary and linkage support.',
   ARRAY['collaboration project summary','member linkage','role summary']::text[],
   ARRAY['collaboration workflow truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_revision_area','streaming_revision_area',ARRAY['reference-area','summary-area']::text[],'medium',
   'revision support area',
   'Supports revision history and creator working summary.',
   ARRAY['revision summary','revision comparison hints','change notes']::text[],
   ARRAY['editor runtime truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_approval_area','streaming_approval_area',ARRAY['reference-area','policy-context-area']::text[],'medium',
   'approval support area',
   'Supports approval summary and governance reference.',
   ARRAY['approval summary','approval state','reviewer linkage']::text[],
   ARRAY['approval operational truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_publish_setting_area','streaming_publish_setting_area',ARRAY['reference-area','policy-context-area']::text[],'high',
   'publication readiness and destination rule storage',
   'Supports scheduling and visibility configuration support.',
   ARRAY['publication readiness','destination rule','scheduling config','visibility config']::text[],
   ARRAY['live publish execution truth']::text[],
   'prepare_earliest',true,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_marketplace_listing_area','streaming_marketplace_listing_area',ARRAY['reference-area','optimization-area']::text[],'high',
   'Civilization Marketplace listing preparation support',
   'Supports listing metadata and release rule linkage.',
   ARRAY['listing metadata','release rule linkage','marketplace projection support']::text[],
   ARRAY['marketplace listing transaction truth']::text[],
   'prepare_earliest',true,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_paid_video_offer_area','streaming_paid_video_offer_area',ARRAY['reference-area','policy-context-area']::text[],'high',
   'one-time paid access rule support',
   'Supports pricing and sale window reference.',
   ARRAY['pricing','sale window','paid access rule']::text[],
   ARRAY['billing and purchase truth']::text[],
   'prepare_earliest',true,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_membership_program_area','streaming_membership_program_area',ARRAY['reference-area','policy-context-area']::text[],'high',
   'membership program master support',
   'Supports creator subscription configuration.',
   ARRAY['membership program master','creator subscription configuration']::text[],
   ARRAY['membership contract truth']::text[],
   'prepare_earliest',true,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_membership_rule_area','streaming_membership_rule_area',ARRAY['reference-area','policy-context-area']::text[],'high',
   'members-only and early-access rule support',
   'Supports tier binding and access-mode rule support.',
   ARRAY['members-only rule','early-access rule','tier binding','access-mode rule']::text[],
   ARRAY['runtime allow/deny truth']::text[],
   'prepare_earliest',true,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_membership_reference_area','streaming_membership_reference_area',ARRAY['reference-area']::text[],'medium',
   'membership reference support area',
   'Supports membership-oriented reference lookup.',
   ARRAY['membership reference','tier reference','program linkage']::text[],
   ARRAY['membership contract truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_external_push_area','streaming_external_push_area',ARRAY['reference-area','summary-area']::text[],'medium',
   'external push support area',
   'Supports external push summary and retry context.',
   ARRAY['external push summary','push destination','retry context']::text[],
   ARRAY['connector execution truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_revenue_split_area','streaming_revenue_split_area',ARRAY['reference-area','summary-area']::text[],'high',
   'creator-side monetization allocation support',
   'Supports split draft and settlement preparation.',
   ARRAY['split draft','settlement preparation','allocation support']::text[],
   ARRAY['final settlement truth']::text[],
   'prepare_earliest',true,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_settlement_reference_area','streaming_settlement_reference_area',ARRAY['reference-area','summary-area']::text[],'medium',
   'settlement reference support area',
   'Supports settlement lookup and reference summary.',
   ARRAY['settlement reference','settlement summary','settlement linkage']::text[],
   ARRAY['final settlement truth']::text[],
   'prepare_next',false,'{"system":"StreamStudio"}'::jsonb),
  ('streaming_connector_audit_area','streaming_connector_audit_area',ARRAY['summary-area','optimization-area']::text[],'high',
   'connector request / response summary support',
   'Supports retry and audit reconstruction support.',
   ARRAY['connector request / response summary','retry reconstruction','audit support']::text[],
   ARRAY['raw connector transport truth']::text[],
   'prepare_earliest',true,'{"system":"StreamStudio"}'::jsonb)
) AS v(
  area_name, area_slug, area_roles, priority_code, purpose_text, why_text,
  suitable_contents, not_truth, phase_recommendation, is_phase1_recommended, meta
) ON true
ON CONFLICT (ledger_source_id, area_slug) DO UPDATE
SET candidate_code          = EXCLUDED.candidate_code,
    area_name               = EXCLUDED.area_name,
    area_roles              = EXCLUDED.area_roles,
    priority_code           = EXCLUDED.priority_code,
    ownership_mode          = EXCLUDED.ownership_mode,
    purpose_text            = EXCLUDED.purpose_text,
    why_text                = EXCLUDED.why_text,
    suitable_contents       = EXCLUDED.suitable_contents,
    not_source_of_truth_for = EXCLUDED.not_source_of_truth_for,
    phase_recommendation    = EXCLUDED.phase_recommendation,
    is_phase1_recommended   = EXCLUDED.is_phase1_recommended,
    is_active               = EXCLUDED.is_active,
    meta                    = EXCLUDED.meta,
    updated_at              = NOW();

-- ============================================================
-- STREAMWATCH BOUNDARY RULES
-- ============================================================
WITH src AS (
  SELECT ledger_source_id
  FROM cx22073jw.candidate_ledger_source_registry
  WHERE source_code = 'streamwatch_candidate_ledger'
)
INSERT INTO cx22073jw.candidate_area_boundary_rule (
  ledger_source_id, boundary_group, rule_text, sort_order
)
SELECT src.ledger_source_id, v.boundary_group, v.rule_text, v.sort_order
FROM src
JOIN (
  VALUES
  ('source_remains_canonical_for','entitlement truth',10),
  ('source_remains_canonical_for','playback eligibility truth',20),
  ('source_remains_canonical_for','profile operational truth',30),
  ('source_remains_canonical_for','progress operational truth',40),
  ('source_remains_canonical_for','history operational truth',50),
  ('source_remains_canonical_for','follow operational truth',60),
  ('source_remains_canonical_for','playlist operational truth',70),
  ('source_remains_canonical_for','queue operational truth',80),
  ('source_remains_canonical_for','category identity truth',90),
  ('commerce_remains_canonical_for','purchase transaction truth',100),
  ('commerce_remains_canonical_for','rental contract truth',110),
  ('commerce_remains_canonical_for','membership contract truth',120),
  ('commerce_remains_canonical_for','billing and charge truth',130),
  ('commerce_remains_canonical_for','refund and renewal truth',140),
  ('cx22073_may_hold','reference projections',150),
  ('cx22073_may_hold','retrieval-optimized mirrors',160),
  ('cx22073_may_hold','summaries',170),
  ('cx22073_may_hold','semantic indexes',180),
  ('cx22073_may_hold','cross-area relation hints',190),
  ('cx22073_may_hold','optimization metadata',200),
  ('cx22073_may_hold','storage placement hints',210),
  ('cx22073_may_hold','AI-assistable context layers',220),
  ('non_candidate_or_deferred','direct live playback stream control',230),
  ('non_candidate_or_deferred','primary comment thread storage',240),
  ('non_candidate_or_deferred','direct moderation decision authority',250),
  ('non_candidate_or_deferred','checkout transaction execution',260),
  ('non_candidate_or_deferred','direct refund processing',270),
  ('non_candidate_or_deferred','DRM license control',280),
  ('non_candidate_or_deferred','direct content binary delivery ownership',290),
  ('non_candidate_or_deferred','privileged guardian override secrets',300),
  ('non_candidate_or_deferred','ephemeral playback buffer memory',310)
) AS v(boundary_group, rule_text, sort_order) ON true
ON CONFLICT (ledger_source_id, boundary_group, rule_text) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ============================================================
-- TAG SEED
-- ============================================================
INSERT INTO cx22073jw.candidate_area_tag (
  candidate_area_id, tag_code
)
SELECT car.candidate_area_id, tag_code
FROM cx22073jw.candidate_area_registry car
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
JOIN LATERAL (
  VALUES
    (CASE WHEN car.priority_code IN ('highest','high') THEN 'priority_focus' ELSE 'secondary_focus' END),
    (CASE WHEN 'continuity-area' = ANY(car.area_roles) THEN 'continuity' ELSE 'non_continuity' END),
    (CASE WHEN 'index-area' = ANY(car.area_roles) THEN 'indexing' ELSE 'non_indexing' END),
    (CASE WHEN 'optimization-area' = ANY(car.area_roles) THEN 'optimization' ELSE 'non_optimization' END),
    (CASE WHEN car.is_phase1_recommended THEN 'phase1' ELSE 'post_phase1' END),
    (lower(replace(clsr.source_system, ' ', '_')))
) AS tags(tag_code)
  ON true
ON CONFLICT (candidate_area_id, tag_code) DO NOTHING;

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW cx22073jw.v_candidate_area_priority_matrix AS
SELECT
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  car.candidate_code,
  car.area_name,
  car.priority_code,
  car.area_roles,
  car.is_phase1_recommended,
  car.phase_recommendation,
  car.ownership_mode
FROM cx22073jw.candidate_area_registry car
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
WHERE car.is_active = true;

CREATE OR REPLACE VIEW cx22073jw.v_candidate_area_phase1_focus AS
SELECT
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  car.area_name,
  car.priority_code,
  car.area_roles,
  car.purpose_text
FROM cx22073jw.candidate_area_registry car
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
WHERE car.is_phase1_recommended = true
  AND car.is_active = true
ORDER BY clsr.source_system, clsr.source_app, car.priority_code, car.area_name;

CREATE OR REPLACE VIEW cx22073jw.v_candidate_area_source_summary AS
SELECT
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  COUNT(*) AS candidate_count,
  COUNT(*) FILTER (WHERE car.priority_code = 'highest') AS highest_count,
  COUNT(*) FILTER (WHERE car.priority_code = 'high') AS high_count,
  COUNT(*) FILTER (WHERE car.priority_code = 'medium-high') AS medium_high_count,
  COUNT(*) FILTER (WHERE car.priority_code = 'medium') AS medium_count,
  COUNT(*) FILTER (WHERE car.priority_code = 'conditional') AS conditional_count,
  COUNT(*) FILTER (WHERE car.is_phase1_recommended) AS phase1_count
FROM cx22073jw.candidate_area_registry car
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
GROUP BY clsr.source_system, clsr.source_app;

COMMIT;

\echo '============================================================'
\echo 'CANDIDATE LEDGER SOURCES'
\echo '============================================================'
SELECT source_code, source_system, COALESCE(source_app, '-') AS source_app, source_status
FROM cx22073jw.candidate_ledger_source_registry
ORDER BY source_system, source_app, source_code;

\echo '============================================================'
\echo 'CANDIDATE AREA SOURCE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_candidate_area_source_summary;

\echo '============================================================'
\echo 'PHASE1 FOCUS'
\echo '============================================================'
TABLE cx22073jw.v_candidate_area_phase1_focus;

\echo '============================================================'
\echo 'STREAMWATCH BOUNDARY RULES'
\echo '============================================================'
SELECT boundary_group, rule_text, sort_order
FROM cx22073jw.candidate_area_boundary_rule br
JOIN cx22073jw.candidate_ledger_source_registry sr
  ON sr.ledger_source_id = br.ledger_source_id
WHERE sr.source_code = 'streamwatch_candidate_ledger'
ORDER BY boundary_group, sort_order;
SQL

  echo "============================================================"
  echo "CX22073JW CANDIDATE AREA REGISTRY ADDITIVE APPLY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
