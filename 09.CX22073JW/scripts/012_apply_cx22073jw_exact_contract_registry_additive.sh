#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_exact_contract_registry.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW EXACT CONTRACT REGISTRY ADDITIVE APPLY START"
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
      AND table_name = 'official_prepare_generation_registry'
  ) THEN
    RAISE EXCEPTION 'official_prepare_generation_registry is required before exact contract registry apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'exact_contract_registry',
    'Exact Contract Registry',
    'normal',
    'integration',
    'Frozen exact contracts for common columns and area payload keys'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.exact_contract_profile_master (
  profile_code              text PRIMARY KEY,
  profile_name              text NOT NULL,
  applies_to_scope          text NOT NULL CHECK (applies_to_scope IN ('common_columns','payload_contract','snapshot')),
  contract_version          integer NOT NULL CHECK (contract_version > 0),
  is_active                 boolean NOT NULL DEFAULT true,
  description               text,
  created_at                timestamptz NOT NULL DEFAULT NOW(),
  updated_at                timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.projection_common_column_contract_master (
  common_column_contract_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_code              text NOT NULL REFERENCES cx22073jw.exact_contract_profile_master(profile_code),
  column_name               text NOT NULL,
  data_type_sql             text NOT NULL,
  is_nullable               boolean NOT NULL DEFAULT true,
  default_sql               text,
  semantic_role             text NOT NULL CHECK (
                             semantic_role IN (
                               'identity',
                               'source',
                               'ownership',
                               'lifecycle',
                               'meta',
                               'audit'
                             )
                           ),
  sort_order                integer NOT NULL CHECK (sort_order > 0),
  description               text,
  created_at                timestamptz NOT NULL DEFAULT NOW(),
  updated_at                timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (profile_code, column_name)
);

CREATE TABLE IF NOT EXISTS cx22073jw.area_payload_contract_registry (
  area_payload_contract_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_area_id          uuid NOT NULL REFERENCES cx22073jw.candidate_area_registry(candidate_area_id) ON DELETE CASCADE,
  generation_registry_id     uuid REFERENCES cx22073jw.official_prepare_generation_registry(generation_registry_id) ON DELETE CASCADE,
  payload_column_name        text NOT NULL CHECK (
                              payload_column_name IN (
                                'projection_payload',
                                'summary_payload',
                                'continuity_payload',
                                'index_payload',
                                'policy_context_payload',
                                'optimization_payload'
                              )
                            ),
  payload_shape_kind         text NOT NULL CHECK (payload_shape_kind IN ('object','array','scalar','mixed')),
  required_keys              text[] NOT NULL DEFAULT ARRAY[]::text[],
  optional_keys              text[] NOT NULL DEFAULT ARRAY[]::text[],
  example_json               jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes_text                 text,
  created_at                 timestamptz NOT NULL DEFAULT NOW(),
  updated_at                 timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_area_id, payload_column_name)
);

CREATE TABLE IF NOT EXISTS cx22073jw.area_exact_contract_snapshot (
  area_exact_contract_snapshot_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_registry_id          uuid NOT NULL UNIQUE REFERENCES cx22073jw.official_prepare_generation_registry(generation_registry_id) ON DELETE CASCADE,
  common_profile_code             text NOT NULL REFERENCES cx22073jw.exact_contract_profile_master(profile_code),
  payload_contract_count          integer NOT NULL DEFAULT 0 CHECK (payload_contract_count >= 0),
  contract_digest                 text NOT NULL,
  snapshot_json                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  contract_status                 text NOT NULL CHECK (contract_status IN ('draft','locked','superseded')),
  generated_at                    timestamptz NOT NULL DEFAULT NOW(),
  created_at                      timestamptz NOT NULL DEFAULT NOW(),
  updated_at                      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_projection_common_column_contract_profile
  ON cx22073jw.projection_common_column_contract_master (profile_code, sort_order);

CREATE INDEX IF NOT EXISTS ix_area_payload_contract_candidate
  ON cx22073jw.area_payload_contract_registry (candidate_area_id, payload_column_name);

CREATE INDEX IF NOT EXISTS ix_area_payload_contract_required_keys
  ON cx22073jw.area_payload_contract_registry USING gin (required_keys);

CREATE INDEX IF NOT EXISTS ix_area_exact_contract_snapshot_status
  ON cx22073jw.area_exact_contract_snapshot (contract_status, generated_at DESC);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'exact_contract_profile_master',
    'projection_common_column_contract_master',
    'area_payload_contract_registry',
    'area_exact_contract_snapshot'
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

INSERT INTO cx22073jw.exact_contract_profile_master (
  profile_code, profile_name, applies_to_scope, contract_version, is_active, description
) VALUES
  ('phase1_common_columns_v1', 'Phase1 Common Columns V1', 'common_columns', 1, true, 'Frozen common columns for phase1 skeleton projections'),
  ('phase1_payload_contract_v1', 'Phase1 Payload Contract V1', 'payload_contract', 1, true, 'Frozen payload key contracts for phase1 areas'),
  ('phase1_snapshot_v1', 'Phase1 Snapshot V1', 'snapshot', 1, true, 'Frozen exact contract snapshot profile')
ON CONFLICT (profile_code) DO UPDATE
SET profile_name     = EXCLUDED.profile_name,
    applies_to_scope = EXCLUDED.applies_to_scope,
    contract_version = EXCLUDED.contract_version,
    is_active        = EXCLUDED.is_active,
    description      = EXCLUDED.description,
    updated_at       = NOW();

INSERT INTO cx22073jw.projection_common_column_contract_master (
  profile_code, column_name, data_type_sql, is_nullable, default_sql, semantic_role, sort_order, description
) VALUES
  ('phase1_common_columns_v1', 'row_id', 'uuid', false, 'gen_random_uuid()', 'identity', 10, 'Projection primary key'),
  ('phase1_common_columns_v1', 'subject_key', 'text', false, NULL, 'identity', 20, 'Stable subject identifier for projection row'),
  ('phase1_common_columns_v1', 'source_system', 'text', false, NULL, 'source', 30, 'Source system name'),
  ('phase1_common_columns_v1', 'source_app', 'text', true, NULL, 'source', 40, 'Source application name'),
  ('phase1_common_columns_v1', 'canonical_owner_system', 'text', false, NULL, 'ownership', 50, 'Canonical owner system'),
  ('phase1_common_columns_v1', 'canonical_ref_key', 'text', true, NULL, 'ownership', 60, 'Canonical reference key'),
  ('phase1_common_columns_v1', 'lifecycle_status', 'text', false, '''active''', 'lifecycle', 70, 'Projection lifecycle state'),
  ('phase1_common_columns_v1', 'meta', 'jsonb', false, '''{}''::jsonb', 'meta', 80, 'Extension metadata'),
  ('phase1_common_columns_v1', 'created_at', 'timestamptz', false, 'NOW()', 'audit', 90, 'Creation timestamp'),
  ('phase1_common_columns_v1', 'updated_at', 'timestamptz', false, 'NOW()', 'audit', 100, 'Update timestamp')
ON CONFLICT (profile_code, column_name) DO UPDATE
SET data_type_sql  = EXCLUDED.data_type_sql,
    is_nullable    = EXCLUDED.is_nullable,
    default_sql    = EXCLUDED.default_sql,
    semantic_role  = EXCLUDED.semantic_role,
    sort_order     = EXCLUDED.sort_order,
    description    = EXCLUDED.description,
    updated_at     = NOW();

CREATE OR REPLACE FUNCTION cx22073jw.fn_default_required_keys(
  p_area_slug text,
  p_payload_column_name text
)
RETURNS text[]
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_payload_column_name = 'projection_payload' THEN
    CASE p_area_slug
      WHEN 'static_art_asset_area' THEN
        RETURN ARRAY['asset_id','asset_type','creator_id','publication_state'];
      WHEN 'asset_metadata_localization_area' THEN
        RETURN ARRAY['asset_id','language_code','title','short_description'];
      WHEN 'asset_rights_policy_area' THEN
        RETURN ARRAY['asset_id','exhibition_permission','commercial_permission','region_scope'];
      WHEN 'asset_marketplace_listing_projection_area' THEN
        RETURN ARRAY['asset_id','tab_code','featured_state','card_fields'];
      WHEN 'exhibition_projection_area' THEN
        RETURN ARRAY['asset_id','projection_eligibility','rights_summary','usable_in_exhibition_builder'];
      WHEN 'review_case_area' THEN
        RETURN ARRAY['review_case_id','review_type','review_status','assigned_reviewer'];
      WHEN 'publishing_asset_area' THEN
        RETURN ARRAY['asset_id','publishing_classification','edition_no','release_state'];
      WHEN 'streaming_favorite_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','favorite_group','favorited_at'];
      WHEN 'streaming_watch_later_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','intent_age_bucket','saved_at'];
      WHEN 'streaming_follow_area' THEN
        RETURN ARRAY['viewer_profile_id','creator_id','follow_type','followed_at'];
      WHEN 'streaming_viewer_profile_area' THEN
        RETURN ARRAY['viewer_profile_id','language_preference','subtitle_preference','profile_partition_key'];
      WHEN 'streaming_entitlement_reference_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','entitlement_type','watchability_reason'];
      WHEN 'streaming_creator_asset_area' THEN
        RETURN ARRAY['creator_id','asset_id','work_state','asset_link_state'];
      WHEN 'streaming_publish_setting_area' THEN
        RETURN ARRAY['content_id','destination_code','publish_visibility','scheduled_at'];
      WHEN 'streaming_marketplace_listing_area' THEN
        RETURN ARRAY['content_id','listing_state','release_rule_code','marketplace_card_fields'];
      WHEN 'streaming_paid_video_offer_area' THEN
        RETURN ARRAY['content_id','price_amount','currency_code','sale_window_code'];
      WHEN 'streaming_membership_program_area' THEN
        RETURN ARRAY['creator_id','program_id','program_state','tier_count'];
      WHEN 'streaming_membership_rule_area' THEN
        RETURN ARRAY['program_id','tier_id','access_mode','rule_state'];
      WHEN 'streaming_revenue_split_area' THEN
        RETURN ARRAY['content_id','split_rule_id','settlement_group','allocation_version'];
      WHEN 'streaming_membership_reference_area' THEN
        RETURN ARRAY['program_id','tier_id','program_name','tier_name'];
      WHEN 'streaming_metadata_draft_area' THEN
        RETURN ARRAY['content_id','draft_title','draft_description','draft_state'];
      WHEN 'streaming_thumbnail_area' THEN
        RETURN ARRAY['content_id','thumbnail_id','thumbnail_state','selection_rank'];
      WHEN 'streaming_subtitle_area' THEN
        RETURN ARRAY['content_id','language_code','subtitle_version','subtitle_state'];
      WHEN 'streaming_project_collaboration_area' THEN
        RETURN ARRAY['project_id','member_id','role_code','collaboration_state'];
      WHEN 'streaming_revision_area' THEN
        RETURN ARRAY['content_id','revision_no','revision_state','change_note'];
      WHEN 'streaming_approval_area' THEN
        RETURN ARRAY['approval_case_id','content_id','approval_state','reviewer_id'];
      WHEN 'streaming_external_push_area' THEN
        RETURN ARRAY['content_id','destination_code','push_state','last_attempt_at'];
      WHEN 'streaming_settlement_reference_area' THEN
        RETURN ARRAY['settlement_id','creator_id','settlement_period','settlement_state'];
      ELSE
        RETURN ARRAY['subject_ref','state_code','summary_label'];
    END CASE;
  ELSIF p_payload_column_name = 'summary_payload' THEN
    CASE p_area_slug
      WHEN 'streaming_view_history_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','history_bucket','watched_at'];
      WHEN 'streaming_continue_watching_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','series_id','last_position_sec'];
      WHEN 'streaming_progress_resume_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','resume_position_sec','last_device_type'];
      WHEN 'streaming_connector_audit_area' THEN
        RETURN ARRAY['connector_code','request_type','request_at','response_status'];
      WHEN 'asset_version_history_area' THEN
        RETURN ARRAY['asset_id','version_no','change_summary','released_at'];
      WHEN 'marketplace_ranking_snapshot_area' THEN
        RETURN ARRAY['asset_id','ranking_type','ranking_score','ranking_at'];
      WHEN 'creator_settlement_measurement_area' THEN
        RETURN ARRAY['creator_id','measurement_period','qualified_count','measurement_state'];
      ELSE
        RETURN ARRAY['summary_subject','summary_bucket','summary_at'];
    END CASE;
  ELSIF p_payload_column_name = 'continuity_payload' THEN
    CASE p_area_slug
      WHEN 'reader_progress_area' THEN
        RETURN ARRAY['reader_id','asset_id','current_locator','progress_percent'];
      WHEN 'streaming_view_history_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','reentry_hint','last_watch_device'];
      WHEN 'streaming_watch_later_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','deferred_group','next_recall_hint'];
      WHEN 'streaming_continue_watching_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','resume_position_sec','resume_device_type'];
      WHEN 'streaming_tv_handoff_area' THEN
        RETURN ARRAY['viewer_profile_id','source_device_type','target_device_type','handoff_state'];
      WHEN 'streaming_progress_resume_area' THEN
        RETURN ARRAY['viewer_profile_id','content_id','resume_candidate_rank','resume_conflict_state'];
      ELSE
        RETURN ARRAY['continuity_subject','continuity_state','continuity_marker'];
    END CASE;
  ELSIF p_payload_column_name = 'index_payload' THEN
    CASE p_area_slug
      WHEN 'asset_metadata_localization_area' THEN
        RETURN ARRAY['language_code','search_aliases','title_tokens','creator_tokens'];
      WHEN 'marketplace_filter_index_area' THEN
        RETURN ARRAY['category_key','tag_keys','creator_key','price_band_key'];
      WHEN 'streaming_follow_area' THEN
        RETURN ARRAY['creator_cluster_key','channel_cluster_key','interest_group_key'];
      WHEN 'streaming_category_tree_area' THEN
        RETURN ARRAY['category_node_id','parent_node_id','path_text','depth_no'];
      WHEN 'streaming_playlist_reference_area' THEN
        RETURN ARRAY['playlist_id','series_relation_key','theme_key','category_key'];
      WHEN 'streaming_search_context_area' THEN
        RETURN ARRAY['query_text','intent_cluster','category_assoc_key','language_code'];
      WHEN 'streaming_subtitle_area' THEN
        RETURN ARRAY['language_code','subtitle_tokens','search_terms','version_key'];
      ELSE
        RETURN ARRAY['index_key','index_group','index_label'];
    END CASE;
  ELSIF p_payload_column_name = 'policy_context_payload' THEN
    CASE p_area_slug
      WHEN 'asset_rights_policy_area' THEN
        RETURN ARRAY['policy_scope','permission_mode','region_scope','age_rating'];
      WHEN 'asset_subscription_policy_area' THEN
        RETURN ARRAY['subscription_eligible','inclusion_window_code','creator_opt_in_state','settlement_group'];
      WHEN 'review_case_area' THEN
        RETURN ARRAY['review_policy_code','decision_status','review_window_code','escalation_state'];
      WHEN 'streaming_viewer_profile_area' THEN
        RETURN ARRAY['language_policy','subtitle_policy','profile_mode','safe_mode'];
      WHEN 'streaming_restriction_profile_area' THEN
        RETURN ARRAY['restriction_mode','safe_category_set','gate_context_code','surface_policy'];
      WHEN 'streaming_entitlement_reference_area' THEN
        RETURN ARRAY['entitlement_type','window_state','membership_state','watchability_reason'];
      WHEN 'streaming_publish_setting_area' THEN
        RETURN ARRAY['visibility_policy','destination_rule_code','schedule_policy','restriction_policy'];
      WHEN 'streaming_paid_video_offer_area' THEN
        RETURN ARRAY['offer_policy_code','sale_window_code','refund_policy_hint','access_window_mode'];
      WHEN 'streaming_membership_program_area' THEN
        RETURN ARRAY['program_policy_code','billing_cycle_mode','creator_opt_in_state','program_visibility'];
      WHEN 'streaming_membership_rule_area' THEN
        RETURN ARRAY['tier_access_mode','early_access_mode','member_only_mode','rule_policy_code'];
      WHEN 'streaming_approval_area' THEN
        RETURN ARRAY['approval_policy_code','approval_state','review_window_code','gate_decision'];
      ELSE
        RETURN ARRAY['policy_code','policy_state','policy_scope'];
    END CASE;
  ELSIF p_payload_column_name = 'optimization_payload' THEN
    CASE p_area_slug
      WHEN 'asset_marketplace_listing_projection_area' THEN
        RETURN ARRAY['rank_score','featured_weight','tab_priority','card_render_weight'];
      WHEN 'exhibition_projection_area' THEN
        RETURN ARRAY['builder_priority','projection_rank','rights_render_weight','projection_surface_code'];
      WHEN 'marketplace_filter_index_area' THEN
        RETURN ARRAY['filter_priority','lookup_density','index_refresh_group','discovery_weight'];
      WHEN 'marketplace_ranking_snapshot_area' THEN
        RETURN ARRAY['ranking_score','snapshot_type','snapshot_weight','ranking_window_code'];
      WHEN 'streaming_view_history_area' THEN
        RETURN ARRAY['history_tier','archive_bucket','reentry_rank','compression_group'];
      WHEN 'streaming_category_tree_area' THEN
        RETURN ARRAY['branch_rank','path_popularity_score','entry_surface_code','tree_refresh_group'];
      WHEN 'streaming_continue_watching_area' THEN
        RETURN ARRAY['resume_rank','bundle_group','surface_priority','cross_device_weight'];
      WHEN 'streaming_tv_handoff_area' THEN
        RETURN ARRAY['handoff_route_rank','route_memory_group','failure_recovery_rank','target_surface_code'];
      WHEN 'streaming_search_context_area' THEN
        RETURN ARRAY['query_rank','intent_weight','discovery_weight','normalization_group'];
      WHEN 'streaming_marketplace_listing_area' THEN
        RETURN ARRAY['listing_rank','release_priority','surface_group','card_weight'];
      WHEN 'streaming_connector_audit_area' THEN
        RETURN ARRAY['retry_rank','audit_group','transport_priority','reconstruction_weight'];
      ELSE
        RETURN ARRAY['optimization_group','priority_bucket','weight_score'];
    END CASE;
  END IF;

  RETURN ARRAY[]::text[];
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_refresh_area_payload_contracts()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT
      car.candidate_area_id,
      car.area_slug,
      ogr.generation_registry_id,
      unnest(ARRAY_REMOVE(ARRAY[
        CASE WHEN 'reference-area' = ANY(car.area_roles) THEN 'projection_payload' END,
        CASE WHEN 'summary-area' = ANY(car.area_roles) THEN 'summary_payload' END,
        CASE WHEN 'continuity-area' = ANY(car.area_roles) THEN 'continuity_payload' END,
        CASE WHEN 'index-area' = ANY(car.area_roles) THEN 'index_payload' END,
        CASE WHEN 'policy-context-area' = ANY(car.area_roles) THEN 'policy_context_payload' END,
        CASE WHEN 'optimization-area' = ANY(car.area_roles) THEN 'optimization_payload' END
      ]::text[], NULL)) AS payload_column_name
    FROM cx22073jw.candidate_area_registry car
    JOIN cx22073jw.official_prepare_generation_registry ogr
      ON ogr.candidate_area_id = car.candidate_area_id
  LOOP
    INSERT INTO cx22073jw.area_payload_contract_registry (
      candidate_area_id,
      generation_registry_id,
      payload_column_name,
      payload_shape_kind,
      required_keys,
      optional_keys,
      example_json,
      notes_text
    )
    VALUES (
      r.candidate_area_id,
      r.generation_registry_id,
      r.payload_column_name,
      'object',
      cx22073jw.fn_default_required_keys(r.area_slug, r.payload_column_name),
      ARRAY['note','label','status']::text[],
      jsonb_build_object(
        'area_slug', r.area_slug,
        'payload_column_name', r.payload_column_name
      ),
      'Auto-refreshed default exact contract.'
    )
    ON CONFLICT (candidate_area_id, payload_column_name) DO UPDATE
    SET generation_registry_id = EXCLUDED.generation_registry_id,
        payload_shape_kind     = EXCLUDED.payload_shape_kind,
        required_keys          = EXCLUDED.required_keys,
        optional_keys          = EXCLUDED.optional_keys,
        example_json           = EXCLUDED.example_json,
        notes_text             = EXCLUDED.notes_text,
        updated_at             = NOW();

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_refresh_area_exact_contract_snapshots()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_count integer := 0;
  v_payload_count integer;
  v_snapshot jsonb;
  v_digest text;
BEGIN
  FOR r IN
    SELECT
      ogr.generation_registry_id,
      car.area_slug,
      car.area_roles,
      ogr.target_table_name,
      ogr.target_view_name,
      ogr.target_function_name
    FROM cx22073jw.official_prepare_generation_registry ogr
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = ogr.candidate_area_id
  LOOP
    SELECT COUNT(*)
      INTO v_payload_count
    FROM cx22073jw.area_payload_contract_registry apcr
    WHERE apcr.generation_registry_id = r.generation_registry_id;

    SELECT jsonb_build_object(
      'area_slug', r.area_slug,
      'area_roles', r.area_roles,
      'target_table_name', r.target_table_name,
      'target_view_name', r.target_view_name,
      'target_function_name', r.target_function_name,
      'common_columns', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'column_name', pcm.column_name,
            'data_type_sql', pcm.data_type_sql,
            'is_nullable', pcm.is_nullable,
            'default_sql', pcm.default_sql,
            'semantic_role', pcm.semantic_role,
            'sort_order', pcm.sort_order
          )
          ORDER BY pcm.sort_order
        )
        FROM cx22073jw.projection_common_column_contract_master pcm
        WHERE pcm.profile_code = 'phase1_common_columns_v1'
      ),
      'payload_contracts', (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'payload_column_name', apcr.payload_column_name,
              'payload_shape_kind', apcr.payload_shape_kind,
              'required_keys', apcr.required_keys,
              'optional_keys', apcr.optional_keys
            )
            ORDER BY apcr.payload_column_name
          ),
          '[]'::jsonb
        )
        FROM cx22073jw.area_payload_contract_registry apcr
        WHERE apcr.generation_registry_id = r.generation_registry_id
      )
    )
    INTO v_snapshot;

    v_digest := md5(v_snapshot::text);

    INSERT INTO cx22073jw.area_exact_contract_snapshot (
      generation_registry_id,
      common_profile_code,
      payload_contract_count,
      contract_digest,
      snapshot_json,
      contract_status,
      generated_at
    )
    VALUES (
      r.generation_registry_id,
      'phase1_common_columns_v1',
      v_payload_count,
      v_digest,
      v_snapshot,
      'locked',
      NOW()
    )
    ON CONFLICT (generation_registry_id) DO UPDATE
    SET common_profile_code    = EXCLUDED.common_profile_code,
        payload_contract_count = EXCLUDED.payload_contract_count,
        contract_digest        = EXCLUDED.contract_digest,
        snapshot_json          = EXCLUDED.snapshot_json,
        contract_status        = EXCLUDED.contract_status,
        generated_at           = EXCLUDED.generated_at,
        updated_at             = NOW();

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

SELECT cx22073jw.fn_refresh_area_payload_contracts();
SELECT cx22073jw.fn_refresh_area_exact_contract_snapshots();

CREATE OR REPLACE VIEW cx22073jw.v_exact_contract_common_columns AS
SELECT
  profile_code,
  column_name,
  data_type_sql,
  is_nullable,
  default_sql,
  semantic_role,
  sort_order
FROM cx22073jw.projection_common_column_contract_master
ORDER BY profile_code, sort_order;

CREATE OR REPLACE VIEW cx22073jw.v_exact_contract_area_payloads AS
SELECT
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  car.area_slug,
  apcr.payload_column_name,
  apcr.payload_shape_kind,
  apcr.required_keys,
  apcr.optional_keys,
  apcr.notes_text
FROM cx22073jw.area_payload_contract_registry apcr
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = apcr.candidate_area_id
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
ORDER BY clsr.source_system, clsr.source_app, car.area_slug, apcr.payload_column_name;

CREATE OR REPLACE VIEW cx22073jw.v_exact_contract_snapshot_summary AS
SELECT
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  car.area_slug,
  aecs.payload_contract_count,
  aecs.contract_digest,
  aecs.contract_status,
  aecs.generated_at
FROM cx22073jw.area_exact_contract_snapshot aecs
JOIN cx22073jw.official_prepare_generation_registry ogr
  ON ogr.generation_registry_id = aecs.generation_registry_id
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = ogr.candidate_area_id
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
ORDER BY clsr.source_system, clsr.source_app, car.area_slug;

COMMIT;

\echo '============================================================'
\echo 'COMMON COLUMN CONTRACT'
\echo '============================================================'
TABLE cx22073jw.v_exact_contract_common_columns;

\echo '============================================================'
\echo 'PAYLOAD CONTRACT SUMMARY'
\echo '============================================================'
SELECT source_system, source_app, COUNT(*) AS payload_contract_count
FROM cx22073jw.v_exact_contract_area_payloads
GROUP BY source_system, source_app
ORDER BY source_system, source_app;

\echo '============================================================'
\echo 'SNAPSHOT SUMMARY'
\echo '============================================================'
SELECT source_system, source_app, COUNT(*) AS snapshot_count
FROM cx22073jw.v_exact_contract_snapshot_summary
GROUP BY source_system, source_app
ORDER BY source_system, source_app;

\echo '============================================================'
\echo 'SAMPLE AREA CONTRACTS'
\echo '============================================================'
SELECT *
FROM cx22073jw.v_exact_contract_area_payloads
WHERE area_slug IN (
  'streaming_view_history_area',
  'streaming_category_tree_area',
  'streaming_continue_watching_area',
  'streaming_progress_resume_area',
  'static_art_asset_area',
  'asset_metadata_localization_area',
  'streaming_publish_setting_area',
  'streaming_connector_audit_area'
)
ORDER BY area_slug, payload_column_name;
SQL

  echo "============================================================"
  echo "CX22073JW EXACT CONTRACT REGISTRY ADDITIVE APPLY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
