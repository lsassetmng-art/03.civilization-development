#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_sample_seed_and_contract_test_runtime.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW SAMPLE SEED AND CONTRACT TEST RUNTIME APPLY START"
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
    RAISE EXCEPTION 'official_prepare_generation_registry is required before sample seed runtime apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'sample_seed_contract_runtime',
    'Sample Seed Contract Runtime',
    'normal',
    'integration',
    'Wrapper-based sample seed and exact contract test runtime'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.exact_contract_sample_case_registry (
  sample_case_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_code                text NOT NULL UNIQUE,
  area_slug                text NOT NULL,
  case_kind                text NOT NULL CHECK (case_kind IN ('valid_sample','invalid_contract')),
  expected_result          text NOT NULL CHECK (expected_result IN ('success','validation_error')),
  subject_key              text NOT NULL,
  source_system            text NOT NULL,
  source_app               text,
  canonical_owner_system   text NOT NULL,
  canonical_ref_key        text,
  lifecycle_status         text NOT NULL DEFAULT 'active',
  projection_payload       jsonb,
  summary_text             text,
  summary_payload          jsonb,
  continuity_payload       jsonb,
  resume_at                timestamptz,
  index_terms              text[],
  index_payload            jsonb,
  policy_context_payload   jsonb,
  optimization_payload     jsonb,
  priority_score           numeric(10,2),
  meta                     jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active                boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT NOW(),
  updated_at               timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.exact_contract_sample_run_log (
  sample_run_log_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_case_id           uuid NOT NULL REFERENCES cx22073jw.exact_contract_sample_case_registry(sample_case_id) ON DELETE CASCADE,
  execution_status         text NOT NULL CHECK (
                            execution_status IN (
                              'success',
                              'expected_failure',
                              'unexpected_success',
                              'unexpected_failure'
                            )
                          ),
  result_row_id            uuid,
  error_text               text,
  executed_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_exact_contract_sample_case_registry_area
  ON cx22073jw.exact_contract_sample_case_registry (area_slug, case_kind, expected_result, is_active);

CREATE INDEX IF NOT EXISTS ix_exact_contract_sample_run_log_case
  ON cx22073jw.exact_contract_sample_run_log (sample_case_id, executed_at DESC);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'exact_contract_sample_case_registry'
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

CREATE OR REPLACE FUNCTION cx22073jw.fn_execute_sample_case(
  p_case_code text
)
RETURNS TABLE (
  case_code text,
  area_slug text,
  expected_result text,
  actual_status text,
  result_row_id uuid,
  error_text text
)
LANGUAGE plpgsql
AS $$
DECLARE
  r_case cx22073jw.exact_contract_sample_case_registry%ROWTYPE;
  v_target_function_name text;
  v_sql text;
  v_row_id uuid;
  v_error_text text;
  v_actual_status text;
BEGIN
  SELECT scr.*
    INTO r_case
  FROM cx22073jw.exact_contract_sample_case_registry scr
  WHERE scr.case_code = p_case_code
    AND scr.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'sample case not found or inactive: %', p_case_code;
  END IF;

  SELECT ogr.target_function_name
    INTO v_target_function_name
  FROM cx22073jw.official_prepare_generation_registry ogr
  JOIN cx22073jw.candidate_area_registry car
    ON car.candidate_area_id = ogr.candidate_area_id
  WHERE car.area_slug = r_case.area_slug
  LIMIT 1;

  IF v_target_function_name IS NULL THEN
    RAISE EXCEPTION 'wrapper target function not found for area_slug=%', r_case.area_slug;
  END IF;

  v_sql := format(
    'SELECT cx22073jw.%I($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)',
    v_target_function_name
  );

  BEGIN
    EXECUTE v_sql
      INTO v_row_id
      USING
        r_case.subject_key,
        r_case.source_system,
        r_case.source_app,
        r_case.canonical_owner_system,
        r_case.canonical_ref_key,
        r_case.lifecycle_status,
        r_case.projection_payload,
        r_case.summary_text,
        r_case.summary_payload,
        r_case.continuity_payload,
        r_case.resume_at,
        r_case.index_terms,
        r_case.index_payload,
        r_case.policy_context_payload,
        r_case.optimization_payload,
        r_case.priority_score,
        r_case.meta;

    IF r_case.expected_result = 'success' THEN
      v_actual_status := 'success';
    ELSE
      v_actual_status := 'unexpected_success';
    END IF;

    v_error_text := NULL;
  EXCEPTION
    WHEN OTHERS THEN
      v_row_id := NULL;
      v_error_text := SQLERRM;

      IF r_case.expected_result = 'validation_error' THEN
        v_actual_status := 'expected_failure';
      ELSE
        v_actual_status := 'unexpected_failure';
      END IF;
  END;

  INSERT INTO cx22073jw.exact_contract_sample_run_log (
    sample_case_id,
    execution_status,
    result_row_id,
    error_text
  )
  VALUES (
    r_case.sample_case_id,
    v_actual_status,
    v_row_id,
    v_error_text
  );

  RETURN QUERY
  SELECT
    r_case.case_code,
    r_case.area_slug,
    r_case.expected_result,
    v_actual_status,
    v_row_id,
    v_error_text;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_run_sample_cases(
  p_case_kind text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT case_code
    FROM cx22073jw.exact_contract_sample_case_registry
    WHERE is_active = true
      AND (p_case_kind IS NULL OR case_kind = p_case_kind)
    ORDER BY case_code
  LOOP
    PERFORM *
    FROM cx22073jw.fn_execute_sample_case(r.case_code);

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

INSERT INTO cx22073jw.exact_contract_sample_case_registry (
  case_code,
  area_slug,
  case_kind,
  expected_result,
  subject_key,
  source_system,
  source_app,
  canonical_owner_system,
  canonical_ref_key,
  lifecycle_status,
  projection_payload,
  summary_text,
  summary_payload,
  continuity_payload,
  resume_at,
  index_terms,
  index_payload,
  policy_context_payload,
  optimization_payload,
  priority_score,
  meta,
  is_active
) VALUES
  (
    'static_art_asset_valid_001',
    'static_art_asset_area',
    'valid_sample',
    'success',
    'asset:static:001',
    'StaticArtOS',
    NULL,
    'StaticArtOS',
    'staticart:asset:001',
    'active',
    '{"asset_id":"A001","asset_type":"illustration","creator_id":"C001","publication_state":"published"}'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{"seed_case":"valid"}'::jsonb,
    true
  ),
  (
    'asset_metadata_localization_valid_001',
    'asset_metadata_localization_area',
    'valid_sample',
    'success',
    'asset:meta:loc:001',
    'StaticArtOS',
    NULL,
    'StaticArtOS',
    'staticart:meta:loc:001',
    'active',
    '{"asset_id":"A001","language_code":"ja-JP","title":"春の絵","short_description":"春の短い説明"}'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    ARRAY['春','絵','creator_c001']::text[],
    '{"language_code":"ja-JP","search_aliases":["spring-art"],"title_tokens":["春","絵"],"creator_tokens":["C001"]}'::jsonb,
    NULL,
    NULL,
    NULL,
    '{"seed_case":"valid"}'::jsonb,
    true
  ),
  (
    'streaming_category_tree_valid_001',
    'streaming_category_tree_area',
    'valid_sample',
    'success',
    'stream:category:root',
    'StreamingOS',
    'StreamWatch',
    'StreamingOS',
    'streamwatch:category:root',
    'active',
    '{"subject_ref":"cat_root","state_code":"active","summary_label":"Root Category"}'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    ARRAY['root','category','streaming']::text[],
    '{"category_node_id":"root","parent_node_id":"none","path_text":"root","depth_no":1}'::jsonb,
    NULL,
    '{"branch_rank":1,"path_popularity_score":99.50,"entry_surface_code":"home","tree_refresh_group":"daily"}'::jsonb,
    99.50,
    '{"seed_case":"valid"}'::jsonb,
    true
  ),
  (
    'streaming_view_history_valid_001',
    'streaming_view_history_area',
    'valid_sample',
    'success',
    'history:v001:c001',
    'StreamingOS',
    'StreamWatch',
    'StreamingOS',
    'streamwatch:history:v001:c001',
    'active',
    NULL,
    'Viewer watched a popular stream recently.',
    '{"viewer_profile_id":"V001","content_id":"C001","history_bucket":"recent","watched_at":"2026-04-16T18:00:00+09:00"}'::jsonb,
    '{"viewer_profile_id":"V001","content_id":"C001","reentry_hint":"resume-soon","last_watch_device":"mobile"}'::jsonb,
    '2026-04-16T18:10:00+09:00'::timestamptz,
    NULL,
    NULL,
    NULL,
    '{"history_tier":"hot","archive_bucket":"recent_7d","reentry_rank":1,"compression_group":"hot_recent"}'::jsonb,
    80.00,
    '{"seed_case":"valid"}'::jsonb,
    true
  ),
  (
    'streaming_continue_watching_valid_001',
    'streaming_continue_watching_area',
    'valid_sample',
    'success',
    'cw:v001:c002',
    'StreamingOS',
    'StreamWatch',
    'StreamingOS',
    'streamwatch:cw:v001:c002',
    'active',
    NULL,
    'Continue watching candidate',
    '{"viewer_profile_id":"V001","content_id":"C002","series_id":"S001","last_position_sec":1250}'::jsonb,
    '{"viewer_profile_id":"V001","content_id":"C002","resume_position_sec":1250,"resume_device_type":"tablet"}'::jsonb,
    '2026-04-16T18:20:00+09:00'::timestamptz,
    NULL,
    NULL,
    NULL,
    '{"resume_rank":1,"bundle_group":"series_s001","surface_priority":"home_continue","cross_device_weight":95}'::jsonb,
    95.00,
    '{"seed_case":"valid"}'::jsonb,
    true
  ),
  (
    'streaming_progress_resume_valid_001',
    'streaming_progress_resume_area',
    'valid_sample',
    'success',
    'resume:v001:c003',
    'StreamingOS',
    'StreamWatch',
    'StreamingOS',
    'streamwatch:resume:v001:c003',
    'active',
    NULL,
    'Resume snapshot',
    '{"viewer_profile_id":"V001","content_id":"C003","resume_position_sec":480,"last_device_type":"tv"}'::jsonb,
    '{"viewer_profile_id":"V001","content_id":"C003","resume_candidate_rank":1,"resume_conflict_state":"clean"}'::jsonb,
    '2026-04-16T18:25:00+09:00'::timestamptz,
    NULL,
    NULL,
    NULL,
    '{"optimization_group":"resume_hot","priority_bucket":"top","weight_score":98}'::jsonb,
    98.00,
    '{"seed_case":"valid"}'::jsonb,
    true
  ),
  (
    'streaming_publish_setting_valid_001',
    'streaming_publish_setting_area',
    'valid_sample',
    'success',
    'publish:c101',
    'applications',
    'StreamStudio',
    'applications',
    'streamstudio:publish:c101',
    'active',
    '{"content_id":"C101","destination_code":"civilization_marketplace","publish_visibility":"public","scheduled_at":"2026-04-20T09:00:00+09:00"}'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{"visibility_policy":"public_release","destination_rule_code":"marketplace_main","schedule_policy":"scheduled","restriction_policy":"standard"}'::jsonb,
    NULL,
    NULL,
    '{"seed_case":"valid"}'::jsonb,
    true
  ),
  (
    'streaming_connector_audit_valid_001',
    'streaming_connector_audit_area',
    'valid_sample',
    'success',
    'connector:ytpush:001',
    'applications',
    'StreamStudio',
    'applications',
    'streamstudio:connector:ytpush:001',
    'active',
    NULL,
    'Connector audit summary',
    '{"connector_code":"youtube_push","request_type":"publish","request_at":"2026-04-16T17:00:00+09:00","response_status":"ok"}'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{"retry_rank":1,"audit_group":"youtube_publish","transport_priority":"normal","reconstruction_weight":88}'::jsonb,
    88.00,
    '{"seed_case":"valid"}'::jsonb,
    true
  ),
  (
    'streaming_category_tree_invalid_001',
    'streaming_category_tree_area',
    'invalid_contract',
    'validation_error',
    'stream:category:bad001',
    'StreamingOS',
    'StreamWatch',
    'StreamingOS',
    'streamwatch:category:bad001',
    'active',
    '{}'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    ARRAY['bad']::text[],
    '{"category_node_id":"bad_root"}'::jsonb,
    NULL,
    '{}'::jsonb,
    1.00,
    '{"seed_case":"invalid"}'::jsonb,
    true
  ),
  (
    'streaming_publish_setting_invalid_001',
    'streaming_publish_setting_area',
    'invalid_contract',
    'validation_error',
    'publish:bad001',
    'applications',
    'StreamStudio',
    'applications',
    'streamstudio:publish:bad001',
    'active',
    '{"content_id":"C102","destination_code":"civilization_marketplace"}'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{"visibility_policy":"public_release"}'::jsonb,
    NULL,
    NULL,
    '{"seed_case":"invalid"}'::jsonb,
    true
  )
ON CONFLICT (case_code) DO UPDATE
SET area_slug              = EXCLUDED.area_slug,
    case_kind              = EXCLUDED.case_kind,
    expected_result        = EXCLUDED.expected_result,
    subject_key            = EXCLUDED.subject_key,
    source_system          = EXCLUDED.source_system,
    source_app             = EXCLUDED.source_app,
    canonical_owner_system = EXCLUDED.canonical_owner_system,
    canonical_ref_key      = EXCLUDED.canonical_ref_key,
    lifecycle_status       = EXCLUDED.lifecycle_status,
    projection_payload     = EXCLUDED.projection_payload,
    summary_text           = EXCLUDED.summary_text,
    summary_payload        = EXCLUDED.summary_payload,
    continuity_payload     = EXCLUDED.continuity_payload,
    resume_at              = EXCLUDED.resume_at,
    index_terms            = EXCLUDED.index_terms,
    index_payload          = EXCLUDED.index_payload,
    policy_context_payload = EXCLUDED.policy_context_payload,
    optimization_payload   = EXCLUDED.optimization_payload,
    priority_score         = EXCLUDED.priority_score,
    meta                   = EXCLUDED.meta,
    is_active              = EXCLUDED.is_active,
    updated_at             = NOW();

SELECT cx22073jw.fn_run_sample_cases('valid_sample');
SELECT cx22073jw.fn_run_sample_cases('invalid_contract');

CREATE OR REPLACE VIEW cx22073jw.v_exact_contract_sample_case_summary AS
SELECT
  area_slug,
  case_kind,
  expected_result,
  COUNT(*) AS case_count
FROM cx22073jw.exact_contract_sample_case_registry
GROUP BY area_slug, case_kind, expected_result
ORDER BY area_slug, case_kind, expected_result;

CREATE OR REPLACE VIEW cx22073jw.v_exact_contract_sample_run_latest AS
SELECT
  scr.case_code,
  scr.area_slug,
  scr.case_kind,
  scr.expected_result,
  srl.execution_status,
  srl.result_row_id,
  srl.error_text,
  srl.executed_at
FROM cx22073jw.exact_contract_sample_case_registry scr
JOIN LATERAL (
  SELECT srl.*
  FROM cx22073jw.exact_contract_sample_run_log srl
  WHERE srl.sample_case_id = scr.sample_case_id
  ORDER BY srl.executed_at DESC
  LIMIT 1
) srl ON true
ORDER BY scr.case_code;

CREATE OR REPLACE VIEW cx22073jw.v_exact_contract_sample_run_summary AS
SELECT
  execution_status,
  COUNT(*) AS run_count
FROM cx22073jw.v_exact_contract_sample_run_latest
GROUP BY execution_status
ORDER BY execution_status;

COMMIT;

\echo '============================================================'
\echo 'SAMPLE CASE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_exact_contract_sample_case_summary;

\echo '============================================================'
\echo 'SAMPLE RUN SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_exact_contract_sample_run_summary;

\echo '============================================================'
\echo 'LATEST SAMPLE RUNS'
\echo '============================================================'
TABLE cx22073jw.v_exact_contract_sample_run_latest;
SQL

  echo "============================================================"
  echo "CX22073JW SAMPLE SEED AND CONTRACT TEST RUNTIME APPLY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
