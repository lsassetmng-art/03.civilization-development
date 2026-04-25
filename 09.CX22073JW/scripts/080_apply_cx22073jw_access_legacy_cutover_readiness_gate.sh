#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_CODE="access_legacy_cutover_gate_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_legacy_cutover_readiness_gate.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS LEGACY CUTOVER READINESS GATE START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "run_code     : $RUN_CODE"
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
      AND table_name = 'v_access_legacy_compat_audit_latest_summary'
  ) THEN
    RAISE EXCEPTION 'v_access_legacy_compat_audit_latest_summary is required before readiness gate';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_legacy_compat_audit_latest_db_items'
  ) THEN
    RAISE EXCEPTION 'v_access_legacy_compat_audit_latest_db_items is required before readiness gate';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_legacy_compat_audit_latest_file_items'
  ) THEN
    RAISE EXCEPTION 'v_access_legacy_compat_audit_latest_file_items is required before readiness gate';
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_cutover_gate_run (
  legacy_cutover_gate_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                   text NOT NULL UNIQUE,
  source_audit_run_code      text NOT NULL,
  db_hit_count               integer NOT NULL DEFAULT 0,
  file_hit_count             integer NOT NULL DEFAULT 0,
  blocker_count              integer NOT NULL DEFAULT 0,
  readiness_status           text NOT NULL CHECK (readiness_status IN ('ready','blocked','error')),
  actor_name                 text NOT NULL DEFAULT 'Zero',
  note_text                  text,
  created_at                 timestamptz NOT NULL DEFAULT NOW(),
  updated_at                 timestamptz NOT NULL DEFAULT NOW(),
  ended_at                   timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_cutover_gate_blocker (
  legacy_cutover_gate_blocker_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_cutover_gate_run_id     uuid NOT NULL REFERENCES cx22073jw.access_legacy_cutover_gate_run(legacy_cutover_gate_run_id) ON DELETE CASCADE,
  blocker_group                  text NOT NULL CHECK (blocker_group IN ('db_view','db_function','file')),
  blocker_identity               text NOT NULL,
  blocker_detail                 text NOT NULL,
  created_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_legacy_cutover_gate_run_created
  ON cx22073jw.access_legacy_cutover_gate_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_legacy_cutover_gate_blocker_run
  ON cx22073jw.access_legacy_cutover_gate_blocker (legacy_cutover_gate_run_id, blocker_group, blocker_identity);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = 'fn_set_updated_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_legacy_cutover_gate_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_legacy_cutover_gate_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_legacy_cutover_gate_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_legacy_cutover_gate_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_cutover_gate_latest_summary AS
SELECT
  run_code,
  source_audit_run_code,
  db_hit_count,
  file_hit_count,
  blocker_count,
  readiness_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_cutover_gate_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_cutover_gate_latest_blockers AS
SELECT
  r.run_code,
  b.blocker_group,
  b.blocker_identity,
  b.blocker_detail,
  b.created_at
FROM cx22073jw.access_legacy_cutover_gate_blocker b
JOIN cx22073jw.access_legacy_cutover_gate_run r
  ON r.legacy_cutover_gate_run_id = b.legacy_cutover_gate_run_id
WHERE r.legacy_cutover_gate_run_id = (
  SELECT legacy_cutover_gate_run_id
  FROM cx22073jw.access_legacy_cutover_gate_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY b.blocker_group, b.blocker_identity;

COMMIT;
SQL

  SOURCE_AUDIT_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT run_code
FROM cx22073jw.v_access_legacy_compat_audit_latest_summary
LIMIT 1;
SQL
  )"

  if [ -z "${SOURCE_AUDIT_RUN_CODE:-}" ]; then
    echo "ERROR: latest access legacy compat audit summary not found"
    exit 1
  fi

  echo "SOURCE_AUDIT_RUN_CODE=$SOURCE_AUDIT_RUN_CODE"

  GATE_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_legacy_cutover_gate_run (
  run_code,
  source_audit_run_code,
  db_hit_count,
  file_hit_count,
  readiness_status,
  actor_name,
  note_text
)
SELECT
  '$RUN_CODE',
  run_code,
  db_hit_count,
  file_hit_count,
  CASE
    WHEN (db_hit_count + file_hit_count) = 0 THEN 'ready'
    ELSE 'blocked'
  END,
  'Zero',
  CASE
    WHEN (db_hit_count + file_hit_count) = 0
      THEN 'No legacy compat dependencies remain. Legacy views are eligible for later deprecation planning.'
    ELSE 'Legacy compat dependencies remain. Keep legacy v_access_* views for now.'
  END
FROM cx22073jw.v_access_legacy_compat_audit_latest_summary
RETURNING legacy_cutover_gate_run_id;
SQL
  )"

  if [ -z "${GATE_RUN_ID:-}" ]; then
    echo "ERROR: gate run was not created"
    exit 1
  fi

  echo "GATE_RUN_ID=$GATE_RUN_ID"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_legacy_cutover_gate_blocker (
  legacy_cutover_gate_run_id,
  blocker_group,
  blocker_identity,
  blocker_detail
)
SELECT
  '$GATE_RUN_ID',
  CASE
    WHEN object_group = 'view' THEN 'db_view'
    WHEN object_group = 'function' THEN 'db_function'
    ELSE 'db_function'
  END,
  object_schema || '.' || object_name,
  'references ' || referenced_legacy_name
FROM cx22073jw.v_access_legacy_compat_audit_latest_db_items;

INSERT INTO cx22073jw.access_legacy_cutover_gate_blocker (
  legacy_cutover_gate_run_id,
  blocker_group,
  blocker_identity,
  blocker_detail
)
SELECT
  '$GATE_RUN_ID',
  'file',
  file_path || ':' || line_no::text,
  matched_text
FROM cx22073jw.v_access_legacy_compat_audit_latest_file_items;

UPDATE cx22073jw.access_legacy_cutover_gate_run
   SET blocker_count = (
         SELECT COUNT(*)
         FROM cx22073jw.access_legacy_cutover_gate_blocker
         WHERE legacy_cutover_gate_run_id = '$GATE_RUN_ID'
       ),
       ended_at = NOW(),
       updated_at = NOW()
 WHERE legacy_cutover_gate_run_id = '$GATE_RUN_ID';
SQL

  echo "============================================================"
  echo "VERIFY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_legacy_cutover_gate_latest_summary;

SELECT
  blocker_group,
  COUNT(*) AS blocker_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
GROUP BY blocker_group
ORDER BY blocker_group;

TABLE cx22073jw.v_access_legacy_cutover_gate_latest_blockers;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS LEGACY CUTOVER READINESS GATE DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
