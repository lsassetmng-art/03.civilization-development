#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_exact_payload_check_functions.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW EXACT PAYLOAD CHECK FUNCTIONS ADDITIVE APPLY START"
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
      AND table_name = 'area_payload_contract_registry'
  ) THEN
    RAISE EXCEPTION 'area_payload_contract_registry is required before exact payload check functions apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'exact_payload_runtime',
    'Exact Payload Runtime',
    'normal',
    'integration',
    'Runtime validation and exact upsert functions for applied skeleton projections'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.exact_payload_validation_issue_log (
  validation_issue_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_area_id        uuid REFERENCES cx22073jw.candidate_area_registry(candidate_area_id) ON DELETE SET NULL,
  area_slug                text NOT NULL,
  subject_key              text NOT NULL,
  payload_column_name      text NOT NULL,
  missing_keys             text[] NOT NULL DEFAULT ARRAY[]::text[],
  issue_note               text,
  created_at               timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_exact_payload_validation_issue_log_area
  ON cx22073jw.exact_payload_validation_issue_log (area_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_exact_payload_validation_issue_log_subject
  ON cx22073jw.exact_payload_validation_issue_log (subject_key, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_exact_payload_validation_issue_log_missing
  ON cx22073jw.exact_payload_validation_issue_log USING gin (missing_keys);

CREATE OR REPLACE FUNCTION cx22073jw.fn_jsonb_missing_required_keys(
  p_payload jsonb,
  p_required_keys text[]
)
RETURNS text[]
LANGUAGE sql
AS $$
SELECT COALESCE(
  ARRAY(
    SELECT k
    FROM unnest(COALESCE(p_required_keys, ARRAY[]::text[])) AS k
    WHERE CASE
      WHEN p_payload IS NULL THEN true
      WHEN jsonb_typeof(p_payload) <> 'object' THEN true
      ELSE NOT (p_payload ? k)
    END
  ),
  ARRAY[]::text[]
);
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_validate_area_payload_contracts(
  p_area_slug text,
  p_projection_payload jsonb DEFAULT NULL,
  p_summary_payload jsonb DEFAULT NULL,
  p_continuity_payload jsonb DEFAULT NULL,
  p_index_payload jsonb DEFAULT NULL,
  p_policy_context_payload jsonb DEFAULT NULL,
  p_optimization_payload jsonb DEFAULT NULL
)
RETURNS TABLE (
  payload_column_name text,
  is_valid boolean,
  missing_keys text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    apcr.payload_column_name,
    cardinality(v_missing_keys) = 0 AS is_valid,
    v_missing_keys AS missing_keys
  FROM (
    SELECT
      apcr.payload_column_name,
      CASE apcr.payload_column_name
        WHEN 'projection_payload' THEN cx22073jw.fn_jsonb_missing_required_keys(p_projection_payload, apcr.required_keys)
        WHEN 'summary_payload' THEN cx22073jw.fn_jsonb_missing_required_keys(p_summary_payload, apcr.required_keys)
        WHEN 'continuity_payload' THEN cx22073jw.fn_jsonb_missing_required_keys(p_continuity_payload, apcr.required_keys)
        WHEN 'index_payload' THEN cx22073jw.fn_jsonb_missing_required_keys(p_index_payload, apcr.required_keys)
        WHEN 'policy_context_payload' THEN cx22073jw.fn_jsonb_missing_required_keys(p_policy_context_payload, apcr.required_keys)
        WHEN 'optimization_payload' THEN cx22073jw.fn_jsonb_missing_required_keys(p_optimization_payload, apcr.required_keys)
        ELSE ARRAY[]::text[]
      END AS v_missing_keys
    FROM cx22073jw.area_payload_contract_registry apcr
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = apcr.candidate_area_id
    WHERE car.area_slug = p_area_slug
  ) AS apcr;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_apply_area_exact_upsert(
  p_area_slug text,
  p_subject_key text,
  p_source_system text,
  p_source_app text DEFAULT NULL,
  p_canonical_owner_system text DEFAULT 'unknown',
  p_canonical_ref_key text DEFAULT NULL,
  p_lifecycle_status text DEFAULT 'active',
  p_projection_payload jsonb DEFAULT NULL,
  p_summary_text text DEFAULT NULL,
  p_summary_payload jsonb DEFAULT NULL,
  p_continuity_payload jsonb DEFAULT NULL,
  p_resume_at timestamptz DEFAULT NULL,
  p_index_terms text[] DEFAULT NULL,
  p_index_payload jsonb DEFAULT NULL,
  p_policy_context_payload jsonb DEFAULT NULL,
  p_optimization_payload jsonb DEFAULT NULL,
  p_priority_score numeric DEFAULT NULL,
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_candidate_area_id uuid;
  v_target_table_name text;
  v_columns text[];
  v_insert_cols text[] := ARRAY[
    'subject_key',
    'source_system',
    'source_app',
    'canonical_owner_system',
    'canonical_ref_key',
    'lifecycle_status',
    'meta'
  ];
  v_insert_vals text[] := ARRAY[
    '$1',
    '$2',
    '$3',
    '$4',
    '$5',
    '$6',
    '$17'
  ];
  v_update_sets text[] := ARRAY[
    'source_system = EXCLUDED.source_system',
    'source_app = EXCLUDED.source_app',
    'canonical_owner_system = EXCLUDED.canonical_owner_system',
    'canonical_ref_key = EXCLUDED.canonical_ref_key',
    'lifecycle_status = EXCLUDED.lifecycle_status',
    'meta = EXCLUDED.meta'
  ];
  v_sql text;
  v_row_id uuid;
  r_invalid record;
  v_has_invalid boolean := false;
  v_invalid_summary text := '';
BEGIN
  SELECT
    car.candidate_area_id,
    ogr.target_table_name
    INTO
    v_candidate_area_id,
    v_target_table_name
  FROM cx22073jw.candidate_area_registry car
  JOIN cx22073jw.official_prepare_generation_registry ogr
    ON ogr.candidate_area_id = car.candidate_area_id
  WHERE car.area_slug = p_area_slug
  LIMIT 1;

  IF v_target_table_name IS NULL THEN
    RAISE EXCEPTION 'target table not found for area_slug=%', p_area_slug;
  END IF;

  SELECT array_agg(c.column_name::text ORDER BY c.ordinal_position)
    INTO v_columns
  FROM information_schema.columns c
  WHERE c.table_schema = 'cx22073jw'
    AND c.table_name = v_target_table_name;

  IF v_columns IS NULL THEN
    RAISE EXCEPTION 'physical applied table not found for area_slug=% table=%', p_area_slug, v_target_table_name;
  END IF;

  FOR r_invalid IN
    SELECT *
    FROM cx22073jw.fn_validate_area_payload_contracts(
      p_area_slug,
      p_projection_payload,
      p_summary_payload,
      p_continuity_payload,
      p_index_payload,
      p_policy_context_payload,
      p_optimization_payload
    )
    WHERE is_valid = false
  LOOP
    v_has_invalid := true;

    INSERT INTO cx22073jw.exact_payload_validation_issue_log (
      candidate_area_id,
      area_slug,
      subject_key,
      payload_column_name,
      missing_keys,
      issue_note
    )
    VALUES (
      v_candidate_area_id,
      p_area_slug,
      p_subject_key,
      r_invalid.payload_column_name,
      r_invalid.missing_keys,
      'Exact payload required key violation.'
    );

    v_invalid_summary := v_invalid_summary
      || CASE WHEN v_invalid_summary = '' THEN '' ELSE ' | ' END
      || r_invalid.payload_column_name
      || ':'
      || array_to_string(r_invalid.missing_keys, ',');
  END LOOP;

  IF v_has_invalid THEN
    RAISE EXCEPTION 'exact payload contract violation for area_slug=% subject_key=% details=%',
      p_area_slug,
      p_subject_key,
      v_invalid_summary;
  END IF;

  IF 'projection_payload' = ANY(v_columns) AND p_projection_payload IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'projection_payload');
    v_insert_vals := array_append(v_insert_vals, '$7');
    v_update_sets := array_append(v_update_sets, 'projection_payload = EXCLUDED.projection_payload');
  END IF;

  IF 'summary_text' = ANY(v_columns) AND p_summary_text IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'summary_text');
    v_insert_vals := array_append(v_insert_vals, '$8');
    v_update_sets := array_append(v_update_sets, 'summary_text = EXCLUDED.summary_text');
  END IF;

  IF 'summary_payload' = ANY(v_columns) AND p_summary_payload IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'summary_payload');
    v_insert_vals := array_append(v_insert_vals, '$9');
    v_update_sets := array_append(v_update_sets, 'summary_payload = EXCLUDED.summary_payload');
  END IF;

  IF 'continuity_payload' = ANY(v_columns) AND p_continuity_payload IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'continuity_payload');
    v_insert_vals := array_append(v_insert_vals, '$10');
    v_update_sets := array_append(v_update_sets, 'continuity_payload = EXCLUDED.continuity_payload');
  END IF;

  IF 'resume_at' = ANY(v_columns) AND p_resume_at IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'resume_at');
    v_insert_vals := array_append(v_insert_vals, '$11');
    v_update_sets := array_append(v_update_sets, 'resume_at = EXCLUDED.resume_at');
  END IF;

  IF 'index_terms' = ANY(v_columns) AND p_index_terms IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'index_terms');
    v_insert_vals := array_append(v_insert_vals, '$12');
    v_update_sets := array_append(v_update_sets, 'index_terms = EXCLUDED.index_terms');
  END IF;

  IF 'index_payload' = ANY(v_columns) AND p_index_payload IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'index_payload');
    v_insert_vals := array_append(v_insert_vals, '$13');
    v_update_sets := array_append(v_update_sets, 'index_payload = EXCLUDED.index_payload');
  END IF;

  IF 'policy_context_payload' = ANY(v_columns) AND p_policy_context_payload IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'policy_context_payload');
    v_insert_vals := array_append(v_insert_vals, '$14');
    v_update_sets := array_append(v_update_sets, 'policy_context_payload = EXCLUDED.policy_context_payload');
  END IF;

  IF 'optimization_payload' = ANY(v_columns) AND p_optimization_payload IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'optimization_payload');
    v_insert_vals := array_append(v_insert_vals, '$15');
    v_update_sets := array_append(v_update_sets, 'optimization_payload = EXCLUDED.optimization_payload');
  END IF;

  IF 'priority_score' = ANY(v_columns) AND p_priority_score IS NOT NULL THEN
    v_insert_cols := array_append(v_insert_cols, 'priority_score');
    v_insert_vals := array_append(v_insert_vals, '$16');
    v_update_sets := array_append(v_update_sets, 'priority_score = EXCLUDED.priority_score');
  END IF;

  v_sql := format(
    'INSERT INTO cx22073jw.%I (%s) VALUES (%s) ON CONFLICT (subject_key) DO UPDATE SET %s RETURNING row_id',
    v_target_table_name,
    array_to_string(v_insert_cols, ', '),
    array_to_string(v_insert_vals, ', '),
    array_to_string(v_update_sets, ', ')
  );

  EXECUTE v_sql
     INTO v_row_id
     USING
       p_subject_key,
       p_source_system,
       p_source_app,
       p_canonical_owner_system,
       p_canonical_ref_key,
       p_lifecycle_status,
       p_projection_payload,
       p_summary_text,
       p_summary_payload,
       p_continuity_payload,
       p_resume_at,
       p_index_terms,
       p_index_payload,
       p_policy_context_payload,
       p_optimization_payload,
       p_priority_score,
       COALESCE(p_meta, '{}'::jsonb);

  RETURN v_row_id;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_generate_area_upsert_wrapper_sql(
  p_area_slug text
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_target_function_name text;
BEGIN
  SELECT ogr.target_function_name
    INTO v_target_function_name
  FROM cx22073jw.official_prepare_generation_registry ogr
  JOIN cx22073jw.candidate_area_registry car
    ON car.candidate_area_id = ogr.candidate_area_id
  WHERE car.area_slug = p_area_slug
  LIMIT 1;

  IF v_target_function_name IS NULL THEN
    RAISE EXCEPTION 'target_function_name not found for area_slug=%', p_area_slug;
  END IF;

  RETURN format(
$FN$
CREATE OR REPLACE FUNCTION cx22073jw.%I(
  p_subject_key text,
  p_source_system text,
  p_source_app text DEFAULT NULL,
  p_canonical_owner_system text DEFAULT 'unknown',
  p_canonical_ref_key text DEFAULT NULL,
  p_lifecycle_status text DEFAULT 'active',
  p_projection_payload jsonb DEFAULT NULL,
  p_summary_text text DEFAULT NULL,
  p_summary_payload jsonb DEFAULT NULL,
  p_continuity_payload jsonb DEFAULT NULL,
  p_resume_at timestamptz DEFAULT NULL,
  p_index_terms text[] DEFAULT NULL,
  p_index_payload jsonb DEFAULT NULL,
  p_policy_context_payload jsonb DEFAULT NULL,
  p_optimization_payload jsonb DEFAULT NULL,
  p_priority_score numeric DEFAULT NULL,
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $BODY$
BEGIN
  RETURN cx22073jw.fn_apply_area_exact_upsert(
    %L,
    p_subject_key,
    p_source_system,
    p_source_app,
    p_canonical_owner_system,
    p_canonical_ref_key,
    p_lifecycle_status,
    p_projection_payload,
    p_summary_text,
    p_summary_payload,
    p_continuity_payload,
    p_resume_at,
    p_index_terms,
    p_index_payload,
    p_policy_context_payload,
    p_optimization_payload,
    p_priority_score,
    p_meta
  );
END;
$BODY$;
$FN$,
    v_target_function_name,
    p_area_slug
  );
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_regenerate_applied_area_upsert_wrappers()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_sql text;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT
      car.area_slug,
      ogr.target_table_name
    FROM cx22073jw.official_prepare_generation_registry ogr
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = ogr.candidate_area_id
    WHERE to_regclass('cx22073jw.' || ogr.target_table_name) IS NOT NULL
  LOOP
    v_sql := cx22073jw.fn_generate_area_upsert_wrapper_sql(r.area_slug);
    EXECUTE v_sql;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

SELECT cx22073jw.fn_regenerate_applied_area_upsert_wrappers();

CREATE OR REPLACE VIEW cx22073jw.v_exact_payload_wrapper_status AS
SELECT
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  car.area_slug,
  ogr.target_table_name,
  ogr.target_view_name,
  ogr.target_function_name,
  (to_regclass('cx22073jw.' || ogr.target_table_name) IS NOT NULL) AS table_exists,
  (to_regclass('cx22073jw.' || ogr.target_view_name) IS NOT NULL) AS view_exists,
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n
      ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = ogr.target_function_name
  ) AS wrapper_function_exists
FROM cx22073jw.official_prepare_generation_registry ogr
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = ogr.candidate_area_id
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
ORDER BY clsr.source_system, clsr.source_app, car.area_slug;

CREATE OR REPLACE VIEW cx22073jw.v_exact_payload_validation_issue_summary AS
SELECT
  area_slug,
  payload_column_name,
  COUNT(*) AS issue_count,
  MAX(created_at) AS last_issue_at
FROM cx22073jw.exact_payload_validation_issue_log
GROUP BY area_slug, payload_column_name
ORDER BY area_slug, payload_column_name;

COMMIT;

\echo '============================================================'
\echo 'WRAPPER STATUS SUMMARY'
\echo '============================================================'
SELECT
  source_system,
  source_app,
  COUNT(*) AS area_count,
  COUNT(*) FILTER (WHERE wrapper_function_exists) AS wrapper_count
FROM cx22073jw.v_exact_payload_wrapper_status
GROUP BY source_system, source_app
ORDER BY source_system, source_app;

\echo '============================================================'
\echo 'VALIDATION SAMPLE: VALID'
\echo '============================================================'
SELECT *
FROM cx22073jw.fn_validate_area_payload_contracts(
  'streaming_category_tree_area',
  '{"subject_ref":"cat_root","state_code":"active","summary_label":"root"}'::jsonb,
  NULL,
  NULL,
  '{"category_node_id":"node_root","parent_node_id":"none","path_text":"root","depth_no":1}'::jsonb,
  NULL,
  '{"branch_rank":1,"path_popularity_score":99.5,"entry_surface_code":"home","tree_refresh_group":"daily"}'::jsonb
);

\echo '============================================================'
\echo 'VALIDATION SAMPLE: INVALID'
\echo '============================================================'
SELECT *
FROM cx22073jw.fn_validate_area_payload_contracts(
  'streaming_category_tree_area',
  '{}'::jsonb,
  NULL,
  NULL,
  '{"category_node_id":"node_root"}'::jsonb,
  NULL,
  '{}'::jsonb
);

\echo '============================================================'
\echo 'WRAPPER STATUS'
\echo '============================================================'
TABLE cx22073jw.v_exact_payload_wrapper_status;
SQL

  echo "============================================================"
  echo "CX22073JW EXACT PAYLOAD CHECK FUNCTIONS ADDITIVE APPLY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
