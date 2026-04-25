#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="$HOME/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_knowledge_pack_sample_runtime.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART KNOWLEDGE PACK SAMPLE RUNTIME APPLY"
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
      AND table_name = 'system_to_cx_transfer_area_binding'
  ) THEN
    RAISE EXCEPTION 'system_to_cx_transfer_area_binding is required before staticart knowledge pack sample runtime apply';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'area_payload_contract_registry'
  ) THEN
    RAISE EXCEPTION 'area_payload_contract_registry is required before staticart knowledge pack sample runtime apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_knowledge_pack_sample_runtime',
    'StaticArt Knowledge Pack Sample Runtime',
    'normal',
    'integration',
    'Generates StaticArt knowledge pack sample payloads and runs exact contract preflight'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_knowledge_pack_sample_registry (
  sample_pack_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_code                    text NOT NULL UNIQUE,
  knowledge_pack_root            jsonb NOT NULL DEFAULT '{}'::jsonb,
  identity_block                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_block                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  exhibition_block               jsonb NOT NULL DEFAULT '{}'::jsonb,
  rights_digest_block            jsonb NOT NULL DEFAULT '{}'::jsonb,
  relationship_block             jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_learning_block          jsonb NOT NULL DEFAULT '{}'::jsonb,
  continuity_signal_block        jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendation_block           jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active                      boolean NOT NULL DEFAULT true,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_knowledge_pack_run (
  sample_pack_run_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_code                    text NOT NULL,
  apply_wrappers                 boolean NOT NULL DEFAULT false,
  run_status                     text NOT NULL CHECK (run_status IN ('pass','fail','partial','error','running')),
  total_area_count               integer NOT NULL DEFAULT 0,
  preflight_pass_count           integer NOT NULL DEFAULT 0,
  preflight_fail_count           integer NOT NULL DEFAULT 0,
  wrapper_applied_count          integer NOT NULL DEFAULT 0,
  wrapper_skipped_count          integer NOT NULL DEFAULT 0,
  actor_name                     text NOT NULL DEFAULT 'Zero',
  note_text                      text,
  started_at                     timestamptz NOT NULL DEFAULT NOW(),
  ended_at                       timestamptz,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_knowledge_pack_run_item (
  sample_pack_run_item_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_pack_run_id             uuid NOT NULL REFERENCES cx22073jw.staticart_knowledge_pack_run(sample_pack_run_id) ON DELETE CASCADE,
  area_slug                      text NOT NULL,
  target_function_name           text,
  subject_key                    text NOT NULL,
  preflight_status               text NOT NULL CHECK (preflight_status IN ('pass','fail')),
  missing_detail_json            jsonb NOT NULL DEFAULT '{}'::jsonb,
  projection_payload             jsonb,
  index_payload                  jsonb,
  policy_context_payload         jsonb,
  meta_payload                   jsonb,
  wrapper_apply_status           text NOT NULL CHECK (wrapper_apply_status IN ('applied','skipped','failed')),
  result_row_id                  uuid,
  error_text                     text,
  created_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_staticart_knowledge_pack_sample_registry_code
  ON cx22073jw.staticart_knowledge_pack_sample_registry (sample_code, is_active);

CREATE INDEX IF NOT EXISTS ix_staticart_knowledge_pack_run_code
  ON cx22073jw.staticart_knowledge_pack_run (sample_code, started_at DESC);

CREATE INDEX IF NOT EXISTS ix_staticart_knowledge_pack_run_item_run
  ON cx22073jw.staticart_knowledge_pack_run_item (sample_pack_run_id, area_slug);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'staticart_knowledge_pack_sample_registry',
    'staticart_knowledge_pack_run'
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

INSERT INTO cx22073jw.staticart_knowledge_pack_sample_registry (
  sample_code,
  knowledge_pack_root,
  identity_block,
  search_block,
  exhibition_block,
  rights_digest_block,
  relationship_block,
  review_learning_block,
  continuity_signal_block,
  recommendation_block,
  is_active
)
VALUES (
  'staticart_minimum_first_send_sample_001',
  '{
    "knowledge_pack_id":"kap_staticart_001",
    "asset_id":"11111111-2222-3333-4444-555555555555",
    "knowledge_version":1,
    "source_system":"StaticArtOS",
    "source_schema":"staticart",
    "generated_at":"2026-04-16T19:00:00+09:00",
    "language_scope":["ja-JP","en-US"],
    "canonical_updated_at_snapshot":"2026-04-16T18:55:00+09:00",
    "knowledge_status":"active"
  }'::jsonb,
  '{
    "asset_id":"11111111-2222-3333-4444-555555555555",
    "asset_type":"illustration",
    "asset_family":"visual",
    "canonical_title":"Spring Light",
    "alternate_titles":["春の光","Spring Glow"],
    "short_identity_summary":"A bright spring illustration with soft color balance.",
    "creator_display_summary":"Created by Studio Aurora.",
    "series_summary":"Spring Collection",
    "category_summary":["seasonal","illustration"],
    "tag_summary":["spring","light","soft-color"],
    "language_availability":["ja-JP","en-US"],
    "release_visibility_summary":"published"
  }'::jsonb,
  '{
    "primary_search_terms":["spring light","spring illustration"],
    "secondary_search_terms":["soft color","seasonal art"],
    "synonym_terms":["spring glow","vernal light"],
    "multilingual_search_terms":{"ja-JP":["春の光","春のイラスト"],"en-US":["spring light","spring illustration"]},
    "theme_keywords":["spring","light","renewal"],
    "style_keywords":["soft-color","illustration","pastel"],
    "subject_keywords":["flower","sky","light"],
    "mood_keywords":["calm","bright","fresh"],
    "search_boost_hints":["seasonal_feature","spring_home"],
    "related_query_hints":["spring exhibition art","soft pastel illustration"]
  }'::jsonb,
  '{
    "exhibition_suitability_summary":"Suitable for spring-themed wall display exhibitions.",
    "exhibition_theme_candidates":["Spring Renewal","Light and Color"],
    "wall_display_suitability":"high",
    "sequence_display_suitability":"medium",
    "spotlight_display_suitability":"high",
    "collection_pairing_hints":["paired with floral works","paired with pastel landscapes"],
    "visual_balance_hints":["works well beside low-saturation pieces","best with medium spacing"],
    "exhibition_caution_summary":"Avoid over-clustering with equally bright centerpieces.",
    "exhibition_ineligibility_summary":""
  }'::jsonb,
  '{
    "rights_short_summary":"Display allowed with standard attribution.",
    "exhibition_allowed_summary":"Exhibition use allowed for normal curated display.",
    "derivative_allowed_summary":"Derivative use requires additional confirmation.",
    "commercial_use_summary":"Commercial use is limited.",
    "age_rating_summary":"General audience.",
    "region_policy_summary":"No special regional restriction in default digest.",
    "additional_license_summary":"Commercial print license may be separately required.",
    "block_reason_summary":"",
    "allowed_usage_examples":["gallery exhibition with attribution","catalog thumbnail use"],
    "caution_usage_examples":["commercial merchandise without separate license"]
  }'::jsonb,
  '{
    "related_asset_ids":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"],
    "same_creator_asset_ids":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"],
    "same_series_asset_ids":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"],
    "same_theme_asset_ids":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"],
    "complementary_display_asset_ids":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5"],
    "contrast_display_asset_ids":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6"],
    "progression_asset_ids":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7"],
    "cross_reference_notes":["Pairs well with spring sky sequence."]
  }'::jsonb,
  '{
    "review_history_summary":"Previously passed standard review with minor metadata correction.",
    "common_issue_patterns":["missing multilingual subtitle"],
    "quality_risk_tags":["seasonal-overlap"],
    "publish_readiness_hints":["confirm multilingual labels","confirm exhibition digest wording"],
    "restriction_pattern_summary":"No major restriction tendency.",
    "remediation_hints":["keep summary concise"]
  }'::jsonb,
  '{
    "continuity_type":"viewer",
    "recency_summary":"Recently surfaced in spring discovery.",
    "engagement_summary":"Strong short-session engagement.",
    "progress_band_summary":"completed_like",
    "favorite_signal":true,
    "reentry_hint":"Recommend via spring collection landing."
  }'::jsonb,
  '{
    "recommended_for_queries":["spring art","light illustration"],
    "recommended_for_themes":["Spring Renewal","Pastel Light"],
    "recommended_for_display_modes":["wall display","featured seasonal card"],
    "similar_asset_candidates":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8"],
    "discovery_reason_summary":"Strong seasonal relevance and soft-color discoverability."
  }'::jsonb,
  true
)
ON CONFLICT (sample_code) DO UPDATE
SET knowledge_pack_root     = EXCLUDED.knowledge_pack_root,
    identity_block          = EXCLUDED.identity_block,
    search_block            = EXCLUDED.search_block,
    exhibition_block        = EXCLUDED.exhibition_block,
    rights_digest_block     = EXCLUDED.rights_digest_block,
    relationship_block      = EXCLUDED.relationship_block,
    review_learning_block   = EXCLUDED.review_learning_block,
    continuity_signal_block = EXCLUDED.continuity_signal_block,
    recommendation_block    = EXCLUDED.recommendation_block,
    is_active               = EXCLUDED.is_active,
    updated_at              = NOW();

CREATE OR REPLACE FUNCTION cx22073jw.fn_get_staticart_block_json(
  p_sample_code text,
  p_block_code text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  s cx22073jw.staticart_knowledge_pack_sample_registry%ROWTYPE;
BEGIN
  SELECT ss.*
    INTO s
  FROM cx22073jw.staticart_knowledge_pack_sample_registry ss
  WHERE ss.sample_code = p_sample_code
    AND ss.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'staticart sample not found or inactive: %', p_sample_code;
  END IF;

  CASE p_block_code
    WHEN 'knowledge_pack_root' THEN RETURN s.knowledge_pack_root;
    WHEN 'asset_identity_knowledge' THEN RETURN s.identity_block;
    WHEN 'search_and_index_knowledge' THEN RETURN s.search_block;
    WHEN 'exhibition_knowledge' THEN RETURN s.exhibition_block;
    WHEN 'rights_digest_knowledge' THEN RETURN s.rights_digest_block;
    WHEN 'relationship_knowledge' THEN RETURN s.relationship_block;
    WHEN 'review_quality_learning_knowledge' THEN RETURN s.review_learning_block;
    WHEN 'continuity_signal_knowledge' THEN RETURN s.continuity_signal_block;
    WHEN 'recommendation_knowledge' THEN RETURN s.recommendation_block;
    ELSE
      RETURN '{}'::jsonb;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_build_staticart_minimum_first_send_bundle(
  p_sample_code text,
  p_area_slug text
)
RETURNS TABLE (
  subject_key text,
  source_system text,
  source_app text,
  canonical_owner_system text,
  canonical_ref_key text,
  lifecycle_status text,
  projection_payload jsonb,
  index_payload jsonb,
  policy_context_payload jsonb,
  meta_payload jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_root jsonb;
  v_subject_key text;
  v_source_system text;
  v_source_app text;
  v_canonical_owner_system text;
  v_canonical_ref_key text;
  v_lifecycle_status text;
  v_projection_payload jsonb := '{}'::jsonb;
  v_index_payload jsonb := '{}'::jsonb;
  v_policy_context_payload jsonb := '{}'::jsonb;
  v_meta_payload jsonb := '{}'::jsonb;
  r_bind record;
  r_field record;
  v_block_json jsonb;
  v_val jsonb;
BEGIN
  v_root := cx22073jw.fn_get_staticart_block_json(p_sample_code, 'knowledge_pack_root');

  v_subject_key := COALESCE(v_root->>'knowledge_pack_id', p_sample_code || ':' || p_area_slug);
  v_source_system := COALESCE(v_root->>'source_system', 'StaticArtOS');
  v_source_app := NULL;
  v_canonical_owner_system := 'StaticArtOS';
  v_canonical_ref_key := v_root->>'asset_id';
  v_lifecycle_status := 'active';

  FOR r_bind IN
    SELECT
      tab.transfer_area_binding_id,
      tab.target_slot_scope,
      tab.target_payload_column_name,
      b.block_code
    FROM cx22073jw.system_to_cx_transfer_area_binding tab
    JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
      ON b.transfer_block_id = tab.transfer_block_id
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = tab.candidate_area_id
    JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
      ON p.transfer_profile_id = tab.transfer_profile_id
    WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
      AND tab.is_minimum_first_send = true
      AND car.area_slug = p_area_slug
    ORDER BY tab.priority_rank, b.sort_order
  LOOP
    v_block_json := cx22073jw.fn_get_staticart_block_json(p_sample_code, r_bind.block_code);

    FOR r_field IN
      SELECT
        tf.field_code,
        tfsb.target_slot_type,
        tfsb.target_slot_name,
        tfsb.sort_order
      FROM cx22073jw.system_to_cx_transfer_field_slot_binding tfsb
      JOIN cx22073jw.system_to_cx_knowledge_transfer_field tf
        ON tf.transfer_field_id = tfsb.transfer_field_id
      WHERE tfsb.transfer_area_binding_id = r_bind.transfer_area_binding_id
      ORDER BY tfsb.sort_order, tf.field_code
    LOOP
      v_val := v_block_json -> r_field.field_code;

      IF r_bind.target_slot_scope = 'top_level_bridge' THEN
        IF r_field.target_slot_type = 'table_column' AND r_field.target_slot_name = 'subject_key' THEN
          v_subject_key := COALESCE(v_block_json->>r_field.field_code, v_subject_key);
        ELSIF r_field.target_slot_type = 'table_column' AND r_field.target_slot_name = 'canonical_ref_key' THEN
          v_canonical_ref_key := COALESCE(v_block_json->>r_field.field_code, v_canonical_ref_key);
        ELSIF r_field.target_slot_type = 'table_column' AND r_field.target_slot_name = 'source_system' THEN
          v_source_system := COALESCE(v_block_json->>r_field.field_code, v_source_system);
        ELSIF r_field.target_slot_type = 'meta_json_key' THEN
          v_meta_payload := jsonb_set(v_meta_payload, ARRAY[r_field.target_slot_name], COALESCE(v_val, 'null'::jsonb), true);
        END IF;
      ELSIF r_bind.target_slot_scope = 'payload_bridge' THEN
        IF r_bind.target_payload_column_name = 'projection_payload' THEN
          v_projection_payload := jsonb_set(v_projection_payload, ARRAY[r_field.target_slot_name], COALESCE(v_val, 'null'::jsonb), true);
        ELSIF r_bind.target_payload_column_name = 'index_payload' THEN
          v_index_payload := jsonb_set(v_index_payload, ARRAY[r_field.target_slot_name], COALESCE(v_val, 'null'::jsonb), true);
        ELSIF r_bind.target_payload_column_name = 'policy_context_payload' THEN
          v_policy_context_payload := jsonb_set(v_policy_context_payload, ARRAY[r_field.target_slot_name], COALESCE(v_val, 'null'::jsonb), true);
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY
  SELECT
    v_subject_key,
    v_source_system,
    v_source_app,
    v_canonical_owner_system,
    v_canonical_ref_key,
    v_lifecycle_status,
    v_projection_payload,
    v_index_payload,
    v_policy_context_payload,
    v_meta_payload;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_run_staticart_minimum_first_send_sample(
  p_sample_code text,
  p_apply_wrappers boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id uuid;
  v_total_area_count integer := 0;
  v_preflight_pass_count integer := 0;
  v_preflight_fail_count integer := 0;
  v_wrapper_applied_count integer := 0;
  v_wrapper_skipped_count integer := 0;

  r_area record;
  r_bundle record;
  r_invalid record;

  v_missing_detail jsonb;
  v_target_function_name text;
  v_row_id uuid;
  v_error_text text;
BEGIN
  INSERT INTO cx22073jw.staticart_knowledge_pack_run (
    sample_code,
    apply_wrappers,
    run_status,
    actor_name,
    note_text
  )
  VALUES (
    p_sample_code,
    p_apply_wrappers,
    'running',
    'Zero',
    'StaticArt minimum first send sample run started.'
  )
  RETURNING sample_pack_run_id INTO v_run_id;

  FOR r_area IN
    SELECT
      car.area_slug,
      ogr.target_function_name
    FROM cx22073jw.system_to_cx_transfer_area_binding tab
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = tab.candidate_area_id
    LEFT JOIN cx22073jw.official_prepare_generation_registry ogr
      ON ogr.candidate_area_id = car.candidate_area_id
    JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
      ON p.transfer_profile_id = tab.transfer_profile_id
    WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
      AND tab.is_minimum_first_send = true
    ORDER BY tab.priority_rank, car.area_slug
  LOOP
    v_total_area_count := v_total_area_count + 1;

    SELECT *
      INTO r_bundle
    FROM cx22073jw.fn_build_staticart_minimum_first_send_bundle(
      p_sample_code,
      r_area.area_slug
    );

    SELECT COALESCE(
      jsonb_object_agg(v.payload_column_name, to_jsonb(v.missing_keys)),
      '{}'::jsonb
    )
      INTO v_missing_detail
    FROM (
      SELECT *
      FROM cx22073jw.fn_validate_area_payload_contracts(
        r_area.area_slug,
        r_bundle.projection_payload,
        NULL,
        NULL,
        r_bundle.index_payload,
        r_bundle.policy_context_payload,
        NULL
      )
      WHERE is_valid = false
    ) v;

    IF v_missing_detail = '{}'::jsonb THEN
      v_preflight_pass_count := v_preflight_pass_count + 1;

      IF p_apply_wrappers AND r_area.target_function_name IS NOT NULL THEN
        BEGIN
          EXECUTE format(
            'SELECT cx22073jw.%I($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)',
            r_area.target_function_name
          )
          INTO v_row_id
          USING
            r_bundle.subject_key,
            r_bundle.source_system,
            r_bundle.source_app,
            r_bundle.canonical_owner_system,
            r_bundle.canonical_ref_key,
            r_bundle.lifecycle_status,
            r_bundle.projection_payload,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            r_bundle.index_payload,
            r_bundle.policy_context_payload,
            NULL,
            NULL,
            COALESCE(r_bundle.meta_payload, '{}'::jsonb);

          v_wrapper_applied_count := v_wrapper_applied_count + 1;

          INSERT INTO cx22073jw.staticart_knowledge_pack_run_item (
            sample_pack_run_id,
            area_slug,
            target_function_name,
            subject_key,
            preflight_status,
            missing_detail_json,
            projection_payload,
            index_payload,
            policy_context_payload,
            meta_payload,
            wrapper_apply_status,
            result_row_id,
            error_text
          )
          VALUES (
            v_run_id,
            r_area.area_slug,
            r_area.target_function_name,
            r_bundle.subject_key,
            'pass',
            '{}'::jsonb,
            r_bundle.projection_payload,
            r_bundle.index_payload,
            r_bundle.policy_context_payload,
            r_bundle.meta_payload,
            'applied',
            v_row_id,
            NULL
          );
        EXCEPTION
          WHEN OTHERS THEN
            v_wrapper_skipped_count := v_wrapper_skipped_count + 1;

            INSERT INTO cx22073jw.staticart_knowledge_pack_run_item (
              sample_pack_run_id,
              area_slug,
              target_function_name,
              subject_key,
              preflight_status,
              missing_detail_json,
              projection_payload,
              index_payload,
              policy_context_payload,
              meta_payload,
              wrapper_apply_status,
              result_row_id,
              error_text
            )
            VALUES (
              v_run_id,
              r_area.area_slug,
              r_area.target_function_name,
              r_bundle.subject_key,
              'pass',
              '{}'::jsonb,
              r_bundle.projection_payload,
              r_bundle.index_payload,
              r_bundle.policy_context_payload,
              r_bundle.meta_payload,
              'failed',
              NULL,
              SQLERRM
            );
        END;
      ELSE
        v_wrapper_skipped_count := v_wrapper_skipped_count + 1;

        INSERT INTO cx22073jw.staticart_knowledge_pack_run_item (
          sample_pack_run_id,
          area_slug,
          target_function_name,
          subject_key,
          preflight_status,
          missing_detail_json,
          projection_payload,
          index_payload,
          policy_context_payload,
          meta_payload,
          wrapper_apply_status,
          result_row_id,
          error_text
        )
        VALUES (
          v_run_id,
          r_area.area_slug,
          r_area.target_function_name,
          r_bundle.subject_key,
          'pass',
          '{}'::jsonb,
          r_bundle.projection_payload,
          r_bundle.index_payload,
          r_bundle.policy_context_payload,
          r_bundle.meta_payload,
          'skipped',
          NULL,
          'Wrapper apply disabled or wrapper function missing.'
        );
      END IF;
    ELSE
      v_preflight_fail_count := v_preflight_fail_count + 1;
      v_wrapper_skipped_count := v_wrapper_skipped_count + 1;

      INSERT INTO cx22073jw.staticart_knowledge_pack_run_item (
        sample_pack_run_id,
        area_slug,
        target_function_name,
        subject_key,
        preflight_status,
        missing_detail_json,
        projection_payload,
        index_payload,
        policy_context_payload,
        meta_payload,
        wrapper_apply_status,
        result_row_id,
        error_text
      )
      VALUES (
        v_run_id,
        r_area.area_slug,
        r_area.target_function_name,
        r_bundle.subject_key,
        'fail',
        v_missing_detail,
        r_bundle.projection_payload,
        r_bundle.index_payload,
        r_bundle.policy_context_payload,
        r_bundle.meta_payload,
        'skipped',
        NULL,
        'Preflight failed by exact payload contract.'
      );
    END IF;
  END LOOP;

  UPDATE cx22073jw.staticart_knowledge_pack_run
     SET total_area_count      = v_total_area_count,
         preflight_pass_count  = v_preflight_pass_count,
         preflight_fail_count  = v_preflight_fail_count,
         wrapper_applied_count = v_wrapper_applied_count,
         wrapper_skipped_count = v_wrapper_skipped_count,
         run_status = CASE
                        WHEN v_total_area_count = 0 THEN 'error'
                        WHEN v_preflight_fail_count = 0 THEN 'pass'
                        WHEN v_preflight_pass_count > 0 THEN 'partial'
                        ELSE 'fail'
                      END,
         note_text = CASE
                       WHEN v_total_area_count = 0 THEN 'No minimum first send areas were found.'
                       WHEN v_preflight_fail_count = 0 THEN 'All minimum first send areas passed preflight.'
                       ELSE 'Some minimum first send areas have contract gaps.'
                     END,
         ended_at = NOW(),
         updated_at = NOW()
   WHERE sample_pack_run_id = v_run_id;

  RETURN v_run_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_knowledge_pack_sample_registry_summary AS
SELECT
  sample_code,
  is_active,
  created_at,
  updated_at
FROM cx22073jw.staticart_knowledge_pack_sample_registry
ORDER BY sample_code;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_knowledge_pack_run_latest AS
SELECT *
FROM cx22073jw.staticart_knowledge_pack_run
ORDER BY started_at DESC;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_knowledge_pack_run_item_latest AS
SELECT
  r.sample_code,
  i.area_slug,
  i.target_function_name,
  i.subject_key,
  i.preflight_status,
  i.missing_detail_json,
  i.wrapper_apply_status,
  i.result_row_id,
  i.error_text,
  i.created_at
FROM cx22073jw.staticart_knowledge_pack_run_item i
JOIN cx22073jw.staticart_knowledge_pack_run r
  ON r.sample_pack_run_id = i.sample_pack_run_id
WHERE i.sample_pack_run_id = (
  SELECT sample_pack_run_id
  FROM cx22073jw.staticart_knowledge_pack_run
  ORDER BY started_at DESC
  LIMIT 1
)
ORDER BY i.area_slug;

SELECT cx22073jw.fn_run_staticart_minimum_first_send_sample(
  'staticart_minimum_first_send_sample_001',
  true
);

COMMIT;

\echo '============================================================'
\echo 'STATICART SAMPLE REGISTRY SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_staticart_knowledge_pack_sample_registry_summary;

\echo '============================================================'
\echo 'LATEST RUN SUMMARY'
\echo '============================================================'
SELECT
  sample_code,
  run_status,
  total_area_count,
  preflight_pass_count,
  preflight_fail_count,
  wrapper_applied_count,
  wrapper_skipped_count,
  started_at,
  ended_at,
  note_text
FROM cx22073jw.v_staticart_knowledge_pack_run_latest
LIMIT 1;

\echo '============================================================'
\echo 'LATEST RUN ITEMS'
\echo '============================================================'
TABLE cx22073jw.v_staticart_knowledge_pack_run_item_latest;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART KNOWLEDGE PACK SAMPLE RUNTIME DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
