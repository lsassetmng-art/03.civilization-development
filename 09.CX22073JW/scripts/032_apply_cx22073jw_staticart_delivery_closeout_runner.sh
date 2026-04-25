#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_delivery_closeout_runner.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART DELIVERY CLOSEOUT RUNNER START"
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
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_staticart_fixed_contract_release_summary'
  ) THEN
    RAISE EXCEPTION 'v_staticart_fixed_contract_release_summary is required before delivery closeout';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_staticart_handoff_export_batch_summary'
  ) THEN
    RAISE EXCEPTION 'v_staticart_handoff_export_batch_summary is required before delivery closeout';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_readiness_gate_latest_run_summary'
  ) THEN
    RAISE EXCEPTION 'v_readiness_gate_latest_run_summary is required before delivery closeout';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_delivery_closeout',
    'StaticArt Delivery Closeout',
    'normal',
    'integration',
    'Final closeout runner for StaticArt handoff delivery'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_delivery_closeout_run (
  delivery_closeout_run_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                  text NOT NULL UNIQUE,
  overall_status            text NOT NULL CHECK (overall_status IN ('pass','partial','blocked')),
  release_code              text,
  release_status            text,
  export_code               text,
  export_status             text,
  export_root_path          text,
  sample_run_status         text,
  readiness_gate_status     text,
  total_target_count        integer NOT NULL DEFAULT 0,
  released_target_count     integer NOT NULL DEFAULT 0,
  blocked_target_count      integer NOT NULL DEFAULT 0,
  actor_name                text NOT NULL DEFAULT 'Zero',
  note_text                 text,
  created_at                timestamptz NOT NULL DEFAULT NOW(),
  updated_at                timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_staticart_delivery_closeout_run_created
  ON cx22073jw.staticart_delivery_closeout_run (created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c
      ON c.oid = tg.tgrelid
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE tg.tgname = 'trg_staticart_delivery_closeout_run_updated_at'
      AND n.nspname = 'cx22073jw'
      AND c.relname = 'staticart_delivery_closeout_run'
  ) THEN
    EXECUTE '
      CREATE TRIGGER trg_staticart_delivery_closeout_run_updated_at
      BEFORE UPDATE ON cx22073jw.staticart_delivery_closeout_run
      FOR EACH ROW
      EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
    ';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_run_staticart_delivery_closeout()
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id uuid;
  v_run_code text := 'staticart_delivery_closeout_' || to_char(NOW(), 'YYYYMMDD_HH24MISS');
  v_release record;
  v_export record;
  v_sample record;
  v_gate record;
  v_overall_status text;
  v_note_text text;
BEGIN
  SELECT *
    INTO v_release
  FROM cx22073jw.v_staticart_fixed_contract_release_summary
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT *
    INTO v_export
  FROM cx22073jw.v_staticart_handoff_export_batch_summary
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT *
    INTO v_sample
  FROM cx22073jw.v_staticart_knowledge_pack_run_latest
  LIMIT 1;

  SELECT *
    INTO v_gate
  FROM cx22073jw.v_readiness_gate_latest_run_summary
  LIMIT 1;

  v_overall_status := CASE
    WHEN COALESCE(v_release.release_status, 'blocked') = 'released'
     AND COALESCE(v_export.export_status, 'failed') = 'done'
     AND COALESCE(v_sample.run_status, 'fail') IN ('pass','partial')
     AND COALESCE(v_gate.run_status, 'fail') IN ('pass','fail')
     AND COALESCE(v_release.blocked_target_count, 1) = 0
    THEN 'pass'
    WHEN COALESCE(v_export.export_status, 'failed') = 'done'
    THEN 'partial'
    ELSE 'blocked'
  END;

  v_note_text := CASE
    WHEN v_overall_status = 'pass'
    THEN 'Release/export completed and no blocked targets remain.'
    WHEN v_overall_status = 'partial'
    THEN 'Export exists, but blocked targets or incomplete gate/sample conditions remain.'
    ELSE 'Release/export not in a shippable state yet.'
  END;

  INSERT INTO cx22073jw.staticart_delivery_closeout_run (
    run_code,
    overall_status,
    release_code,
    release_status,
    export_code,
    export_status,
    export_root_path,
    sample_run_status,
    readiness_gate_status,
    total_target_count,
    released_target_count,
    blocked_target_count,
    actor_name,
    note_text
  )
  VALUES (
    v_run_code,
    v_overall_status,
    v_release.release_code,
    v_release.release_status,
    v_export.export_code,
    v_export.export_status,
    v_export.export_root_path,
    v_sample.run_status,
    v_gate.run_status,
    COALESCE(v_release.total_target_count, 0),
    COALESCE(v_release.released_target_count, 0),
    COALESCE(v_release.blocked_target_count, 0),
    'Zero',
    v_note_text
  )
  RETURNING delivery_closeout_run_id INTO v_run_id;

  RETURN v_run_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_delivery_closeout_summary AS
SELECT
  run_code,
  overall_status,
  release_code,
  release_status,
  export_code,
  export_status,
  export_root_path,
  sample_run_status,
  readiness_gate_status,
  total_target_count,
  released_target_count,
  blocked_target_count,
  note_text,
  created_at
FROM cx22073jw.staticart_delivery_closeout_run
ORDER BY created_at DESC;

SELECT cx22073jw.fn_run_staticart_delivery_closeout();

COMMIT;

\echo '============================================================'
\echo 'DELIVERY CLOSEOUT SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_staticart_delivery_closeout_summary;
SQL

  LATEST_EXPORT_ROOT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_staticart_handoff_export_batch_summary
LIMIT 1;
SQL
  )"

  if [ -z "${LATEST_EXPORT_ROOT:-}" ] || [ ! -d "$LATEST_EXPORT_ROOT" ]; then
    echo "ERROR: latest export root not found"
    exit 1
  fi

  CLOSEOUT_FILE="$LATEST_EXPORT_ROOT/999_FINAL_DELIVERY_CLOSEOUT.md"

  RELEASE_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(release_code, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  OVERALL_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(overall_status, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  EXPORT_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(export_code, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  RELEASE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(release_status, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  EXPORT_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(export_status, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  SAMPLE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(sample_run_status, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  GATE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(readiness_gate_status, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  TOTAL_TARGET_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(total_target_count::text, '0')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  RELEASED_TARGET_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(released_target_count::text, '0')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  BLOCKED_TARGET_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(blocked_target_count::text, '0')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  NOTE_TEXT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(note_text, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  cat > "$CLOSEOUT_FILE" <<EORD
# ============================================================
# STATICART FINAL DELIVERY CLOSEOUT
# ============================================================

run_ts: $RUN_TS
release_code: $RELEASE_CODE
export_code: $EXPORT_CODE
overall_status: $OVERALL_STATUS

## 1. Summary

- release_status: $RELEASE_STATUS
- export_status: $EXPORT_STATUS
- sample_run_status: $SAMPLE_STATUS
- readiness_gate_status: $GATE_STATUS
- total_target_count: $TOTAL_TARGET_COUNT
- released_target_count: $RELEASED_TARGET_COUNT
- blocked_target_count: $BLOCKED_TARGET_COUNT

note:
- $NOTE_TEXT

## 2. Export Root

$LATEST_EXPORT_ROOT

## 3. Files

- 000_README.md
- 010_manifest.json
- 020_release_summary.json
- 030_targets.jsonl
- 040_payload_contracts.jsonl
- 050_top_level_contracts.jsonl
- 060_blocked_targets.jsonl
- 070_targets.tsv
- 080_payload_contracts.tsv
- 090_top_level_contracts.tsv
- 999_FINAL_DELIVERY_CLOSEOUT.md
EORD

  echo "============================================================"
  echo "FINAL CLOSEOUT FILE"
  echo "============================================================"
  ls -l "$CLOSEOUT_FILE"
  sed -n '1,220p' "$CLOSEOUT_FILE"

  echo "============================================================"
  echo "CX22073JW STATICART DELIVERY CLOSEOUT RUNNER DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
