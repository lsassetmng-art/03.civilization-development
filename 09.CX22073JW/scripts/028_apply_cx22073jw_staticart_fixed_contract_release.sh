#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="$HOME/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_fixed_contract_release.log"
RELEASE_CODE="staticart_minimum_first_send_fixed_v1"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART FIXED CONTRACT RELEASE APPLY"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "release_code : $RELEASE_CODE"
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
    RAISE EXCEPTION 'system_to_cx_transfer_area_binding is required before fixed contract release apply';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'area_payload_contract_registry'
  ) THEN
    RAISE EXCEPTION 'area_payload_contract_registry is required before fixed contract release apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_fixed_contract_release',
    'StaticArt Fixed Contract Release',
    'normal',
    'integration',
    'Frozen fixed contract release for StaticArt minimum first send'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.source_to_cx_fixed_contract_release (
  fixed_contract_release_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_code              text NOT NULL UNIQUE,
  source_system_code        text NOT NULL,
  target_system_code        text NOT NULL,
  source_profile_code       text NOT NULL,
  release_scope             text NOT NULL CHECK (release_scope IN ('minimum_first_send')),
  release_status            text NOT NULL CHECK (release_status IN ('draft','released','blocked')),
  latest_sample_run_status  text,
  latest_gate_run_status    text,
  total_target_count        integer NOT NULL DEFAULT 0,
  released_target_count     integer NOT NULL DEFAULT 0,
  blocked_target_count      integer NOT NULL DEFAULT 0,
  release_digest            text,
  detail_json               jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at                timestamptz NOT NULL DEFAULT NOW(),
  updated_at                timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.source_to_cx_fixed_contract_release_target (
  fixed_contract_release_target_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixed_contract_release_id        uuid NOT NULL REFERENCES cx22073jw.source_to_cx_fixed_contract_release(fixed_contract_release_id) ON DELETE CASCADE,
  block_code                       text NOT NULL,
  area_slug                        text NOT NULL,
  contract_level                   text NOT NULL CHECK (contract_level IN ('top_level','payload')),
  target_payload_column_name       text CHECK (
                                    target_payload_column_name IN (
                                      'projection_payload',
                                      'summary_payload',
                                      'continuity_payload',
                                      'index_payload',
                                      'policy_context_payload',
                                      'optimization_payload'
                                    )
                                  ),
  target_table_name                text,
  target_function_name             text,
  key_count                        integer NOT NULL DEFAULT 0,
  missing_key_count                integer NOT NULL DEFAULT 0,
  target_status_code               text NOT NULL CHECK (target_status_code IN ('released','blocked')),
  contract_digest                  text,
  detail_json                      jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order                       integer NOT NULL DEFAULT 100,
  created_at                       timestamptz NOT NULL DEFAULT NOW(),
  updated_at                       timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (
    fixed_contract_release_id,
    block_code,
    area_slug,
    contract_level,
    target_payload_column_name
  )
);

CREATE TABLE IF NOT EXISTS cx22073jw.source_to_cx_fixed_contract_release_key (
  fixed_contract_release_key_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixed_contract_release_target_id uuid NOT NULL REFERENCES cx22073jw.source_to_cx_fixed_contract_release_target(fixed_contract_release_target_id) ON DELETE CASCADE,
  key_name                         text NOT NULL,
  key_role                         text NOT NULL CHECK (key_role IN ('top_level','required','optional')),
  source_field_code                text,
  target_slot_name                 text,
  sort_order                       integer NOT NULL DEFAULT 100,
  created_at                       timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (
    fixed_contract_release_target_id,
    key_name,
    key_role
  )
);

CREATE INDEX IF NOT EXISTS ix_source_to_cx_fixed_contract_release_status
  ON cx22073jw.source_to_cx_fixed_contract_release (release_status, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_source_to_cx_fixed_contract_release_target_release
  ON cx22073jw.source_to_cx_fixed_contract_release_target (fixed_contract_release_id, sort_order);

CREATE INDEX IF NOT EXISTS ix_source_to_cx_fixed_contract_release_key_target
  ON cx22073jw.source_to_cx_fixed_contract_release_key (fixed_contract_release_target_id, sort_order);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'source_to_cx_fixed_contract_release',
    'source_to_cx_fixed_contract_release_target'
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

CREATE OR REPLACE FUNCTION cx22073jw.fn_publish_staticart_minimum_first_send_fixed_contract_release(
  p_release_code text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_release_id uuid;
  v_profile_code text := 'staticart_to_cx22073jw_knowledge_exact_list_v1';
  v_sample_run_status text;
  v_sample_preflight_fail_count integer := 0;
  v_gate_run_status text;
  v_total_payload integer := 0;
  v_zero_missing integer := 0;
  v_release_status text;
  v_total_target_count integer := 0;
  v_released_target_count integer := 0;
  v_blocked_target_count integer := 0;
  v_release_digest text;
BEGIN
  SELECT skr.run_status, skr.preflight_fail_count
    INTO v_sample_run_status, v_sample_preflight_fail_count
  FROM cx22073jw.staticart_knowledge_pack_run skr
  ORDER BY skr.started_at DESC
  LIMIT 1;

  SELECT rgr.run_status
    INTO v_gate_run_status
  FROM cx22073jw.readiness_gate_run rgr
  JOIN cx22073jw.readiness_gate_master rgm
    ON rgm.readiness_gate_id = rgr.readiness_gate_id
  WHERE rgm.gate_code = 'phase1_runtime_readiness_gate'
  ORDER BY rgr.started_at DESC
  LIMIT 1;

  SELECT
    COUNT(*) FILTER (WHERE target_payload_column_name IS NOT NULL),
    COUNT(*) FILTER (
      WHERE target_payload_column_name IS NOT NULL
        AND cardinality(COALESCE(missing_contract_keys, ARRAY[]::text[])) = 0
    )
    INTO v_total_payload, v_zero_missing
  FROM cx22073jw.v_staticart_minimum_first_send_contract_coverage;

  v_release_status := CASE
    WHEN v_total_payload > 0
     AND v_total_payload = v_zero_missing
     AND COALESCE(v_sample_preflight_fail_count, 1) = 0
    THEN 'released'
    ELSE 'blocked'
  END;

  INSERT INTO cx22073jw.source_to_cx_fixed_contract_release (
    release_code,
    source_system_code,
    target_system_code,
    source_profile_code,
    release_scope,
    release_status,
    latest_sample_run_status,
    latest_gate_run_status,
    detail_json
  )
  VALUES (
    p_release_code,
    'StaticArtOS',
    'CX22073JW',
    v_profile_code,
    'minimum_first_send',
    v_release_status,
    v_sample_run_status,
    v_gate_run_status,
    jsonb_build_object(
      'coverage_total_payload', v_total_payload,
      'coverage_zero_missing_payload', v_zero_missing,
      'sample_preflight_fail_count', v_sample_preflight_fail_count
    )
  )
  ON CONFLICT (release_code) DO UPDATE
  SET release_status           = EXCLUDED.release_status,
      latest_sample_run_status = EXCLUDED.latest_sample_run_status,
      latest_gate_run_status   = EXCLUDED.latest_gate_run_status,
      detail_json              = EXCLUDED.detail_json,
      updated_at               = NOW();

  SELECT fixed_contract_release_id
    INTO v_release_id
  FROM cx22073jw.source_to_cx_fixed_contract_release
  WHERE release_code = p_release_code
  LIMIT 1;

  IF v_release_id IS NULL THEN
    RAISE EXCEPTION 'failed to create/find fixed contract release';
  END IF;

  DELETE FROM cx22073jw.source_to_cx_fixed_contract_release_target
  WHERE fixed_contract_release_id = v_release_id;

  -- top level target
  INSERT INTO cx22073jw.source_to_cx_fixed_contract_release_target (
    fixed_contract_release_id,
    block_code,
    area_slug,
    contract_level,
    target_payload_column_name,
    target_table_name,
    target_function_name,
    key_count,
    missing_key_count,
    target_status_code,
    contract_digest,
    detail_json,
    sort_order
  )
  SELECT
    v_release_id,
    'knowledge_pack_root',
    car.area_slug,
    'top_level',
    NULL,
    ogr.target_table_name,
    ogr.target_function_name,
    COUNT(*)::integer,
    0,
    'released',
    md5(string_agg(
      COALESCE(tf.field_code,'') || ':' || COALESCE(tfsb.target_slot_name,''),
      '|' ORDER BY tfsb.sort_order
    )),
    jsonb_build_object(
      'binding_scope', tab.target_slot_scope,
      'binding_note', tab.binding_note
    ),
    tab.priority_rank
  FROM cx22073jw.system_to_cx_transfer_area_binding tab
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = tab.transfer_profile_id
  JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
    ON b.transfer_block_id = tab.transfer_block_id
  JOIN cx22073jw.candidate_area_registry car
    ON car.candidate_area_id = tab.candidate_area_id
  LEFT JOIN cx22073jw.official_prepare_generation_registry ogr
    ON ogr.candidate_area_id = car.candidate_area_id
  JOIN cx22073jw.system_to_cx_transfer_field_slot_binding tfsb
    ON tfsb.transfer_area_binding_id = tab.transfer_area_binding_id
  JOIN cx22073jw.system_to_cx_knowledge_transfer_field tf
    ON tf.transfer_field_id = tfsb.transfer_field_id
  WHERE p.profile_code = v_profile_code
    AND tab.is_minimum_first_send = true
    AND b.block_code = 'knowledge_pack_root'
    AND tab.target_slot_scope = 'top_level_bridge'
  GROUP BY
    car.area_slug,
    ogr.target_table_name,
    ogr.target_function_name,
    tab.priority_rank,
    tab.target_slot_scope,
    tab.binding_note;

  -- payload targets
  INSERT INTO cx22073jw.source_to_cx_fixed_contract_release_target (
    fixed_contract_release_id,
    block_code,
    area_slug,
    contract_level,
    target_payload_column_name,
    target_table_name,
    target_function_name,
    key_count,
    missing_key_count,
    target_status_code,
    contract_digest,
    detail_json,
    sort_order
  )
  SELECT
    v_release_id,
    c.block_code,
    c.area_slug,
    'payload',
    c.target_payload_column_name,
    ab.target_table_name,
    ab.target_function_name,
    (
      SELECT COUNT(*)
      FROM (
        SELECT unnest(COALESCE(apcr.required_keys, ARRAY[]::text[])) AS k
        UNION
        SELECT unnest(COALESCE(apcr.optional_keys, ARRAY[]::text[])) AS k
      ) q
    )::integer AS key_count,
    cardinality(COALESCE(c.missing_contract_keys, ARRAY[]::text[])) AS missing_key_count,
    CASE
      WHEN cardinality(COALESCE(c.missing_contract_keys, ARRAY[]::text[])) = 0
       AND EXISTS (
         SELECT 1
         FROM cx22073jw.v_staticart_knowledge_pack_run_item_latest s
         WHERE s.area_slug = c.area_slug
           AND s.preflight_status = 'pass'
       )
      THEN 'released'
      ELSE 'blocked'
    END AS target_status_code,
    md5(
      COALESCE(array_to_string(apcr.required_keys, '|'), '')
      || '||'
      || COALESCE(array_to_string(apcr.optional_keys, '|'), '')
    ) AS contract_digest,
    jsonb_build_object(
      'missing_contract_keys', COALESCE(c.missing_contract_keys, ARRAY[]::text[]),
      'latest_sample_preflight', (
        SELECT s.preflight_status
        FROM cx22073jw.v_staticart_knowledge_pack_run_item_latest s
        WHERE s.area_slug = c.area_slug
        LIMIT 1
      ),
      'binding_note', ab.binding_note
    ),
    ab.priority_rank
  FROM cx22073jw.v_staticart_minimum_first_send_contract_coverage c
  JOIN cx22073jw.area_payload_contract_registry apcr
    ON apcr.payload_column_name = c.target_payload_column_name
  JOIN cx22073jw.candidate_area_registry car
    ON car.area_slug = c.area_slug
   AND car.candidate_area_id = apcr.candidate_area_id
  JOIN cx22073jw.v_staticart_minimum_first_send_area_bindings ab
    ON ab.block_code = c.block_code
   AND ab.area_slug = c.area_slug
   AND ab.target_payload_column_name = c.target_payload_column_name
  WHERE c.target_payload_column_name IS NOT NULL;

  -- top level keys
  INSERT INTO cx22073jw.source_to_cx_fixed_contract_release_key (
    fixed_contract_release_target_id,
    key_name,
    key_role,
    source_field_code,
    target_slot_name,
    sort_order
  )
  SELECT
    rt.fixed_contract_release_target_id,
    tfsb.target_slot_name,
    'top_level',
    tf.field_code,
    tfsb.target_slot_name,
    tfsb.sort_order
  FROM cx22073jw.source_to_cx_fixed_contract_release_target rt
  JOIN cx22073jw.source_to_cx_fixed_contract_release r
    ON r.fixed_contract_release_id = rt.fixed_contract_release_id
  JOIN cx22073jw.system_to_cx_transfer_area_binding tab
    ON tab.priority_rank = rt.sort_order
  JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
    ON p.transfer_profile_id = tab.transfer_profile_id
  JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
    ON b.transfer_block_id = tab.transfer_block_id
  JOIN cx22073jw.candidate_area_registry car
    ON car.candidate_area_id = tab.candidate_area_id
   AND car.area_slug = rt.area_slug
  JOIN cx22073jw.system_to_cx_transfer_field_slot_binding tfsb
    ON tfsb.transfer_area_binding_id = tab.transfer_area_binding_id
  JOIN cx22073jw.system_to_cx_knowledge_transfer_field tf
    ON tf.transfer_field_id = tfsb.transfer_field_id
  WHERE r.release_code = p_release_code
    AND p.profile_code = v_profile_code
    AND rt.contract_level = 'top_level'
    AND b.block_code = 'knowledge_pack_root'
    AND tab.target_slot_scope = 'top_level_bridge'
  ORDER BY tfsb.sort_order;

  -- payload required keys
  INSERT INTO cx22073jw.source_to_cx_fixed_contract_release_key (
    fixed_contract_release_target_id,
    key_name,
    key_role,
    source_field_code,
    target_slot_name,
    sort_order
  )
  SELECT
    rt.fixed_contract_release_target_id,
    k.key_name,
    'required',
    NULL,
    k.key_name,
    k.ord::integer
  FROM cx22073jw.source_to_cx_fixed_contract_release_target rt
  JOIN cx22073jw.source_to_cx_fixed_contract_release r
    ON r.fixed_contract_release_id = rt.fixed_contract_release_id
  JOIN cx22073jw.candidate_area_registry car
    ON car.area_slug = rt.area_slug
  JOIN cx22073jw.area_payload_contract_registry apcr
    ON apcr.candidate_area_id = car.candidate_area_id
   AND apcr.payload_column_name = rt.target_payload_column_name
  JOIN LATERAL unnest(COALESCE(apcr.required_keys, ARRAY[]::text[])) WITH ORDINALITY AS k(key_name, ord)
    ON true
  WHERE r.release_code = p_release_code
    AND rt.contract_level = 'payload';

  -- payload optional keys
  INSERT INTO cx22073jw.source_to_cx_fixed_contract_release_key (
    fixed_contract_release_target_id,
    key_name,
    key_role,
    source_field_code,
    target_slot_name,
    sort_order
  )
  SELECT
    rt.fixed_contract_release_target_id,
    k.key_name,
    'optional',
    NULL,
    k.key_name,
    (1000 + k.ord)::integer
  FROM cx22073jw.source_to_cx_fixed_contract_release_target rt
  JOIN cx22073jw.source_to_cx_fixed_contract_release r
    ON r.fixed_contract_release_id = rt.fixed_contract_release_id
  JOIN cx22073jw.candidate_area_registry car
    ON car.area_slug = rt.area_slug
  JOIN cx22073jw.area_payload_contract_registry apcr
    ON apcr.candidate_area_id = car.candidate_area_id
   AND apcr.payload_column_name = rt.target_payload_column_name
  JOIN LATERAL unnest(COALESCE(apcr.optional_keys, ARRAY[]::text[])) WITH ORDINALITY AS k(key_name, ord)
    ON true
  WHERE r.release_code = p_release_code
    AND rt.contract_level = 'payload';

  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE target_status_code = 'released'),
         COUNT(*) FILTER (WHERE target_status_code = 'blocked')
    INTO v_total_target_count, v_released_target_count, v_blocked_target_count
  FROM cx22073jw.source_to_cx_fixed_contract_release_target
  WHERE fixed_contract_release_id = v_release_id;

  SELECT md5(COALESCE(string_agg(contract_digest, '|' ORDER BY sort_order, area_slug, COALESCE(target_payload_column_name, '')), ''))
    INTO v_release_digest
  FROM cx22073jw.source_to_cx_fixed_contract_release_target
  WHERE fixed_contract_release_id = v_release_id;

  UPDATE cx22073jw.source_to_cx_fixed_contract_release
     SET total_target_count    = v_total_target_count,
         released_target_count = v_released_target_count,
         blocked_target_count  = v_blocked_target_count,
         release_digest        = v_release_digest,
         release_status        = CASE
                                   WHEN v_blocked_target_count = 0 AND v_total_target_count > 0 THEN 'released'
                                   ELSE 'blocked'
                                 END,
         updated_at            = NOW()
   WHERE fixed_contract_release_id = v_release_id;

  RETURN v_release_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_fixed_contract_release_summary AS
SELECT
  release_code,
  release_scope,
  release_status,
  latest_sample_run_status,
  latest_gate_run_status,
  total_target_count,
  released_target_count,
  blocked_target_count,
  release_digest,
  created_at,
  updated_at
FROM cx22073jw.source_to_cx_fixed_contract_release
WHERE source_system_code = 'StaticArtOS'
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_fixed_contract_release_targets AS
SELECT
  r.release_code,
  rt.block_code,
  rt.area_slug,
  rt.contract_level,
  rt.target_payload_column_name,
  rt.target_table_name,
  rt.target_function_name,
  rt.key_count,
  rt.missing_key_count,
  rt.target_status_code,
  rt.contract_digest,
  rt.sort_order,
  rt.detail_json
FROM cx22073jw.source_to_cx_fixed_contract_release_target rt
JOIN cx22073jw.source_to_cx_fixed_contract_release r
  ON r.fixed_contract_release_id = rt.fixed_contract_release_id
WHERE r.source_system_code = 'StaticArtOS'
ORDER BY r.created_at DESC, rt.sort_order, rt.area_slug, rt.contract_level;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_fixed_contract_release_keys AS
SELECT
  r.release_code,
  rt.block_code,
  rt.area_slug,
  rt.contract_level,
  rt.target_payload_column_name,
  rk.key_name,
  rk.key_role,
  rk.source_field_code,
  rk.target_slot_name,
  rk.sort_order
FROM cx22073jw.source_to_cx_fixed_contract_release_key rk
JOIN cx22073jw.source_to_cx_fixed_contract_release_target rt
  ON rt.fixed_contract_release_target_id = rk.fixed_contract_release_target_id
JOIN cx22073jw.source_to_cx_fixed_contract_release r
  ON r.fixed_contract_release_id = rt.fixed_contract_release_id
WHERE r.source_system_code = 'StaticArtOS'
ORDER BY r.created_at DESC, rt.sort_order, rk.sort_order, rk.key_name;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_fixed_contract_release_export_payload AS
SELECT
  r.release_code,
  rt.block_code,
  rt.area_slug,
  rt.target_payload_column_name,
  rt.target_table_name,
  rt.target_function_name,
  ARRAY_AGG(rk.key_name ORDER BY rk.sort_order) FILTER (WHERE rk.key_role = 'required') AS required_keys,
  ARRAY_AGG(rk.key_name ORDER BY rk.sort_order) FILTER (WHERE rk.key_role = 'optional') AS optional_keys,
  rt.target_status_code
FROM cx22073jw.source_to_cx_fixed_contract_release r
JOIN cx22073jw.source_to_cx_fixed_contract_release_target rt
  ON rt.fixed_contract_release_id = r.fixed_contract_release_id
LEFT JOIN cx22073jw.source_to_cx_fixed_contract_release_key rk
  ON rk.fixed_contract_release_target_id = rt.fixed_contract_release_target_id
WHERE r.source_system_code = 'StaticArtOS'
  AND rt.contract_level = 'payload'
GROUP BY
  r.release_code,
  rt.block_code,
  rt.area_slug,
  rt.target_payload_column_name,
  rt.target_table_name,
  rt.target_function_name,
  rt.target_status_code,
  rt.sort_order
ORDER BY rt.sort_order, rt.area_slug;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_fixed_contract_release_export_top_level AS
SELECT
  r.release_code,
  rt.block_code,
  rt.area_slug,
  rt.target_table_name,
  rt.target_function_name,
  ARRAY_AGG(rk.key_name ORDER BY rk.sort_order) AS top_level_keys,
  rt.target_status_code
FROM cx22073jw.source_to_cx_fixed_contract_release r
JOIN cx22073jw.source_to_cx_fixed_contract_release_target rt
  ON rt.fixed_contract_release_id = r.fixed_contract_release_id
LEFT JOIN cx22073jw.source_to_cx_fixed_contract_release_key rk
  ON rk.fixed_contract_release_target_id = rt.fixed_contract_release_target_id
WHERE r.source_system_code = 'StaticArtOS'
  AND rt.contract_level = 'top_level'
GROUP BY
  r.release_code,
  rt.block_code,
  rt.area_slug,
  rt.target_table_name,
  rt.target_function_name,
  rt.target_status_code,
  rt.sort_order
ORDER BY rt.sort_order, rt.area_slug;

SELECT cx22073jw.fn_publish_staticart_minimum_first_send_fixed_contract_release('staticart_minimum_first_send_fixed_v1');

COMMIT;

\echo '============================================================'
\echo 'FIXED CONTRACT RELEASE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_staticart_fixed_contract_release_summary;

\echo '============================================================'
\echo 'FIXED CONTRACT TARGETS'
\echo '============================================================'
TABLE cx22073jw.v_staticart_fixed_contract_release_targets;

\echo '============================================================'
\echo 'FIXED CONTRACT EXPORT PAYLOAD'
\echo '============================================================'
TABLE cx22073jw.v_staticart_fixed_contract_release_export_payload;

\echo '============================================================'
\echo 'FIXED CONTRACT EXPORT TOP LEVEL'
\echo '============================================================'
TABLE cx22073jw.v_staticart_fixed_contract_release_export_top_level;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART FIXED CONTRACT RELEASE DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
