#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="$HOME/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_contract_remediation_bundle.log"
BATCH_CODE="staticart_contract_remediation_${RUN_TS}"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART CONTRACT REMEDIATION BUNDLE APPLY"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "batch_code   : $BATCH_CODE"
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
    RAISE EXCEPTION 'system_to_cx_transfer_area_binding is required before staticart contract remediation apply';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'area_payload_contract_registry'
  ) THEN
    RAISE EXCEPTION 'area_payload_contract_registry is required before staticart contract remediation apply';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'staticart_knowledge_pack_run_item'
  ) THEN
    RAISE EXCEPTION 'staticart_knowledge_pack_run_item is required before staticart contract remediation apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_contract_remediation',
    'StaticArt Contract Remediation',
    'normal',
    'integration',
    'Safe contract remediation bundle for StaticArt minimum first send bridge'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.contract_remediation_batch (
  remediation_batch_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code               text NOT NULL UNIQUE,
  source_scope             text NOT NULL CHECK (source_scope IN ('staticart_minimum_first_send','generic')),
  batch_status             text NOT NULL CHECK (batch_status IN ('planned','applied','partial','failed')),
  proposed_item_count      integer NOT NULL DEFAULT 0,
  applied_item_count       integer NOT NULL DEFAULT 0,
  skipped_item_count       integer NOT NULL DEFAULT 0,
  actor_name               text NOT NULL DEFAULT 'Zero',
  note_text                text,
  created_at               timestamptz NOT NULL DEFAULT NOW(),
  updated_at               timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.contract_remediation_item (
  remediation_item_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remediation_batch_id     uuid NOT NULL REFERENCES cx22073jw.contract_remediation_batch(remediation_batch_id) ON DELETE CASCADE,
  area_slug                text NOT NULL,
  payload_column_name      text NOT NULL CHECK (
                            payload_column_name IN (
                              'projection_payload',
                              'summary_payload',
                              'continuity_payload',
                              'index_payload',
                              'policy_context_payload',
                              'optimization_payload'
                            )
                          ),
  remediation_type         text NOT NULL CHECK (
                            remediation_type IN (
                              'add_optional_keys',
                              'add_required_keys',
                              'manual_review'
                            )
                          ),
  proposed_keys            text[] NOT NULL DEFAULT ARRAY[]::text[],
  applied_keys             text[] NOT NULL DEFAULT ARRAY[]::text[],
  source_reason            text NOT NULL,
  source_detail_json       jsonb NOT NULL DEFAULT '{}'::jsonb,
  apply_status             text NOT NULL CHECK (apply_status IN ('planned','applied','skipped')),
  created_at               timestamptz NOT NULL DEFAULT NOW(),
  updated_at               timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (
    remediation_batch_id,
    area_slug,
    payload_column_name,
    remediation_type
  )
);

CREATE INDEX IF NOT EXISTS ix_contract_remediation_batch_scope
  ON cx22073jw.contract_remediation_batch (source_scope, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_contract_remediation_item_batch
  ON cx22073jw.contract_remediation_item (remediation_batch_id, area_slug, payload_column_name);

CREATE INDEX IF NOT EXISTS ix_contract_remediation_item_keys
  ON cx22073jw.contract_remediation_item USING gin (proposed_keys);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'contract_remediation_batch',
    'contract_remediation_item'
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

CREATE OR REPLACE FUNCTION cx22073jw.fn_build_staticart_contract_remediation_batch(
  p_batch_code text
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_count integer := 0;
BEGIN
  INSERT INTO cx22073jw.contract_remediation_batch (
    batch_code,
    source_scope,
    batch_status,
    actor_name,
    note_text
  )
  VALUES (
    p_batch_code,
    'staticart_minimum_first_send',
    'planned',
    'Zero',
    'Auto-built from bridge coverage and latest sample preflight failures.'
  )
  ON CONFLICT (batch_code) DO NOTHING;

  SELECT crb.remediation_batch_id
    INTO v_batch_id
  FROM cx22073jw.contract_remediation_batch crb
  WHERE crb.batch_code = p_batch_code
  LIMIT 1;

  IF v_batch_id IS NULL THEN
    RAISE EXCEPTION 'failed to create/find remediation batch: %', p_batch_code;
  END IF;

  DELETE FROM cx22073jw.contract_remediation_item cri
  WHERE cri.remediation_batch_id = v_batch_id
    AND cri.apply_status = 'planned';

  WITH latest_sample_fail AS (
    SELECT *
    FROM cx22073jw.v_staticart_knowledge_pack_run_item_latest
    WHERE preflight_status = 'fail'
  ),
  src AS (
    SELECT
      c.area_slug,
      c.target_payload_column_name AS payload_column_name,
      c.missing_contract_keys AS missing_keys,
      jsonb_build_object(
        'source', 'bridge_coverage',
        'block_code', c.block_code,
        'mapped_field_count', c.mapped_field_count,
        'target_contract_key_count', c.target_contract_key_count,
        'matched_contract_key_count', c.matched_contract_key_count
      ) AS detail_json
    FROM cx22073jw.v_staticart_minimum_first_send_contract_coverage c
    WHERE c.target_payload_column_name IS NOT NULL
      AND cardinality(c.missing_contract_keys) > 0

    UNION ALL

    SELECT
      f.area_slug,
      j.key AS payload_column_name,
      ARRAY(
        SELECT jsonb_array_elements_text(j.value)
      ) AS missing_keys,
      jsonb_build_object(
        'source', 'sample_preflight',
        'missing_detail_json', f.missing_detail_json,
        'error_text', f.error_text
      ) AS detail_json
    FROM latest_sample_fail f
    CROSS JOIN LATERAL jsonb_each(f.missing_detail_json) AS j
  ),
  agg AS (
    SELECT
      s.area_slug,
      s.payload_column_name,
      ARRAY(
        SELECT DISTINCT k
        FROM (
          SELECT unnest(COALESCE(s2.missing_keys, ARRAY[]::text[])) AS k
          FROM src s2
          WHERE s2.area_slug = s.area_slug
            AND s2.payload_column_name = s.payload_column_name
        ) q
        ORDER BY 1
      ) AS proposed_keys,
      jsonb_agg(s.detail_json ORDER BY s.detail_json::text) AS evidence_json
    FROM src s
    GROUP BY s.area_slug, s.payload_column_name
  )
  INSERT INTO cx22073jw.contract_remediation_item (
    remediation_batch_id,
    area_slug,
    payload_column_name,
    remediation_type,
    proposed_keys,
    applied_keys,
    source_reason,
    source_detail_json,
    apply_status
  )
  SELECT
    v_batch_id,
    a.area_slug,
    a.payload_column_name,
    'add_optional_keys',
    a.proposed_keys,
    ARRAY[]::text[],
    'auto_union_bridge_and_sample',
    jsonb_build_object(
      'evidence', a.evidence_json
    ),
    'planned'
  FROM agg a
  WHERE cardinality(a.proposed_keys) > 0
  ON CONFLICT (
    remediation_batch_id,
    area_slug,
    payload_column_name,
    remediation_type
  ) DO UPDATE
  SET proposed_keys      = EXCLUDED.proposed_keys,
      source_reason      = EXCLUDED.source_reason,
      source_detail_json = EXCLUDED.source_detail_json,
      apply_status       = EXCLUDED.apply_status,
      updated_at         = NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE cx22073jw.contract_remediation_batch crb
     SET proposed_item_count = (
           SELECT COUNT(*)
           FROM cx22073jw.contract_remediation_item cri
           WHERE cri.remediation_batch_id = v_batch_id
         ),
         batch_status = CASE
                          WHEN (
                            SELECT COUNT(*)
                            FROM cx22073jw.contract_remediation_item cri
                            WHERE cri.remediation_batch_id = v_batch_id
                          ) > 0 THEN 'planned'
                          ELSE 'failed'
                        END,
         updated_at = NOW()
   WHERE crb.remediation_batch_id = v_batch_id;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_apply_contract_remediation_batch(
  p_batch_code text
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_applied_count integer := 0;
  v_skipped_count integer := 0;
  r record;
  v_before text[];
  v_after text[];
  v_applied text[];
BEGIN
  SELECT crb.remediation_batch_id
    INTO v_batch_id
  FROM cx22073jw.contract_remediation_batch crb
  WHERE crb.batch_code = p_batch_code
  LIMIT 1;

  IF v_batch_id IS NULL THEN
    RAISE EXCEPTION 'remediation batch not found: %', p_batch_code;
  END IF;

  FOR r IN
    SELECT cri.*
    FROM cx22073jw.contract_remediation_item cri
    WHERE cri.remediation_batch_id = v_batch_id
    ORDER BY cri.area_slug, cri.payload_column_name
  LOOP
    SELECT apcr.optional_keys
      INTO v_before
    FROM cx22073jw.area_payload_contract_registry apcr
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = apcr.candidate_area_id
    WHERE car.area_slug = r.area_slug
      AND apcr.payload_column_name = r.payload_column_name
    LIMIT 1;

    IF v_before IS NULL AND NOT EXISTS (
      SELECT 1
      FROM cx22073jw.area_payload_contract_registry apcr
      JOIN cx22073jw.candidate_area_registry car
        ON car.candidate_area_id = apcr.candidate_area_id
      WHERE car.area_slug = r.area_slug
        AND apcr.payload_column_name = r.payload_column_name
    ) THEN
      UPDATE cx22073jw.contract_remediation_item
         SET apply_status = 'skipped',
             applied_keys = ARRAY[]::text[],
             source_detail_json = source_detail_json || jsonb_build_object(
               'apply_note', 'payload contract row not found'
             ),
             updated_at = NOW()
       WHERE remediation_item_id = r.remediation_item_id;

      v_skipped_count := v_skipped_count + 1;
    ELSE
      v_after := ARRAY(
        SELECT DISTINCT x
        FROM unnest(COALESCE(v_before, ARRAY[]::text[]) || COALESCE(r.proposed_keys, ARRAY[]::text[])) AS x
        ORDER BY 1
      );

      v_applied := ARRAY(
        SELECT x
        FROM unnest(COALESCE(v_after, ARRAY[]::text[])) AS x
        WHERE NOT (x = ANY(COALESCE(v_before, ARRAY[]::text[])))
        ORDER BY 1
      );

      UPDATE cx22073jw.area_payload_contract_registry apcr
         SET optional_keys = v_after,
             updated_at = NOW()
      FROM cx22073jw.candidate_area_registry car
      WHERE car.candidate_area_id = apcr.candidate_area_id
        AND car.area_slug = r.area_slug
        AND apcr.payload_column_name = r.payload_column_name;

      UPDATE cx22073jw.contract_remediation_item
         SET apply_status = CASE
                              WHEN cardinality(COALESCE(v_applied, ARRAY[]::text[])) > 0 THEN 'applied'
                              ELSE 'skipped'
                            END,
             applied_keys = COALESCE(v_applied, ARRAY[]::text[]),
             source_detail_json = source_detail_json || jsonb_build_object(
               'before_optional_keys', COALESCE(to_jsonb(v_before), '[]'::jsonb),
               'after_optional_keys', COALESCE(to_jsonb(v_after), '[]'::jsonb)
             ),
             updated_at = NOW()
       WHERE remediation_item_id = r.remediation_item_id;

      IF cardinality(COALESCE(v_applied, ARRAY[]::text[])) > 0 THEN
        v_applied_count := v_applied_count + 1;
      ELSE
        v_skipped_count := v_skipped_count + 1;
      END IF;
    END IF;
  END LOOP;

  UPDATE cx22073jw.contract_remediation_batch crb
     SET applied_item_count = v_applied_count,
         skipped_item_count = v_skipped_count,
         batch_status = CASE
                          WHEN v_applied_count > 0 AND v_skipped_count = 0 THEN 'applied'
                          WHEN v_applied_count > 0 THEN 'partial'
                          ELSE 'failed'
                        END,
         note_text = CASE
                       WHEN v_applied_count > 0 AND v_skipped_count = 0 THEN 'All remediation items applied.'
                       WHEN v_applied_count > 0 THEN 'Some remediation items applied, some skipped.'
                       ELSE 'No remediation item applied.'
                     END,
         updated_at = NOW()
   WHERE crb.remediation_batch_id = v_batch_id;

  PERFORM cx22073jw.fn_refresh_area_exact_contract_snapshots();
  PERFORM cx22073jw.fn_refresh_staticart_transfer_contract_binding_snapshots();

  RETURN v_applied_count;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_contract_remediation_batch_summary AS
SELECT
  batch_code,
  source_scope,
  batch_status,
  proposed_item_count,
  applied_item_count,
  skipped_item_count,
  actor_name,
  note_text,
  created_at
FROM cx22073jw.contract_remediation_batch
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW cx22073jw.v_contract_remediation_item_detail AS
SELECT
  crb.batch_code,
  cri.area_slug,
  cri.payload_column_name,
  cri.remediation_type,
  cri.proposed_keys,
  cri.applied_keys,
  cri.source_reason,
  cri.apply_status,
  cri.source_detail_json,
  cri.created_at
FROM cx22073jw.contract_remediation_item cri
JOIN cx22073jw.contract_remediation_batch crb
  ON crb.remediation_batch_id = cri.remediation_batch_id
ORDER BY crb.created_at DESC, cri.area_slug, cri.payload_column_name;

COMMIT;

\echo '============================================================'
\echo 'FUNCTION / TABLE SETUP DONE'
\echo '============================================================'
SQL

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT cx22073jw.fn_build_staticart_contract_remediation_batch('$BATCH_CODE');
SELECT cx22073jw.fn_apply_contract_remediation_batch('$BATCH_CODE');
SELECT cx22073jw.fn_run_staticart_minimum_first_send_sample(
  'staticart_minimum_first_send_sample_001',
  true
);
SELECT cx22073jw.fn_run_phase1_runtime_readiness_gate();
SQL

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
\echo '============================================================'
\echo 'LATEST REMEDIATION BATCH SUMMARY'
\echo '============================================================'
SELECT *
FROM cx22073jw.v_contract_remediation_batch_summary
WHERE batch_code = '$BATCH_CODE';

\echo '============================================================'
\echo 'LATEST REMEDIATION ITEMS'
\echo '============================================================'
SELECT *
FROM cx22073jw.v_contract_remediation_item_detail
WHERE batch_code = '$BATCH_CODE';

\echo '============================================================'
\echo 'STATICART CONTRACT COVERAGE AFTER REMEDIATION'
\echo '============================================================'
TABLE cx22073jw.v_staticart_minimum_first_send_contract_coverage;

\echo '============================================================'
\echo 'LATEST STATICART SAMPLE RUN SUMMARY'
\echo '============================================================'
SELECT
  sample_code,
  run_status,
  total_area_count,
  preflight_pass_count,
  preflight_fail_count,
  wrapper_applied_count,
  wrapper_skipped_count,
  note_text
FROM cx22073jw.v_staticart_knowledge_pack_run_latest
LIMIT 1;

\echo '============================================================'
\echo 'LATEST STATICART SAMPLE RUN ITEMS'
\echo '============================================================'
TABLE cx22073jw.v_staticart_knowledge_pack_run_item_latest;

\echo '============================================================'
\echo 'LATEST READINESS GATE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_readiness_gate_latest_run_summary;

\echo '============================================================'
\echo 'LATEST READINESS GATE FAILED CHECKS'
\echo '============================================================'
TABLE cx22073jw.v_readiness_gate_latest_failed_checks;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART CONTRACT REMEDIATION BUNDLE DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
