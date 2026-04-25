#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_BASE="$BASE/exports/ai-employee-final-handoff"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
EXPORT_RUN_CODE="access_final_handoff_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_final_handoff_export.log"

EXPORT_ROOT="$EXPORTS_BASE/$RUN_TS"
mkdir -p "$LOGS_DIR" "$EXPORT_ROOT"

MANIFEST_MD="$EXPORT_ROOT/000_manifest.md"
PASS_ITEMS_TSV="$EXPORT_ROOT/010_pass_items.tsv"
FAIL_ITEMS_TSV="$EXPORT_ROOT/020_fail_or_skipped_items.tsv"
FINAL_SQL="$EXPORT_ROOT/030_final_apply_skeleton.sql"
EXPORT_SUMMARY_JSON="$EXPORT_ROOT/040_export_summary.json"

{
  echo "============================================================"
  echo "CX22073JW ACCESS FINAL HANDOFF EXPORT START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "export_run   : $EXPORT_RUN_CODE"
  echo "export_root  : $EXPORT_ROOT"
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
    WHERE table_schema='cx22073jw'
      AND table_name='v_access_governed_apply_execution_latest_summary'
  ) THEN
    RAISE EXCEPTION 'v_access_governed_apply_execution_latest_summary is required before final handoff export';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema='cx22073jw'
      AND table_name='v_access_governed_apply_execution_latest_items'
  ) THEN
    RAISE EXCEPTION 'v_access_governed_apply_execution_latest_items is required before final handoff export';
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema='cx22073jw'
      AND table_name='foundation_domain_master'
  ) THEN
    INSERT INTO cx22073jw.foundation_domain_master (
      domain_code, domain_name, layer_code, domain_family, description
    ) VALUES (
      'access_final_handoff_export',
      'AI Employee Final Handoff Export',
      'normal',
      'integration',
      'Export latest governed apply preflight result into final manual handoff package'
    )
    ON CONFLICT (domain_code) DO UPDATE
    SET domain_name   = EXCLUDED.domain_name,
        layer_code    = EXCLUDED.layer_code,
        domain_family = EXCLUDED.domain_family,
        description   = EXCLUDED.description,
        updated_at    = NOW();
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS cx22073jw.access_final_handoff_export_run (
  final_handoff_export_run_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                       text NOT NULL UNIQUE,
  source_execution_run_code      text NOT NULL,
  source_batch_code              text NOT NULL,
  export_root_path               text NOT NULL,
  manifest_md_path               text,
  pass_items_tsv_path            text,
  fail_items_tsv_path            text,
  final_sql_path                 text,
  export_summary_json_path       text,
  requested_item_count           integer NOT NULL DEFAULT 0,
  pass_item_count                integer NOT NULL DEFAULT 0,
  fail_item_count                integer NOT NULL DEFAULT 0,
  skipped_item_count             integer NOT NULL DEFAULT 0,
  run_status                     text NOT NULL CHECK (run_status IN ('running','pass','partial','error')),
  actor_name                     text NOT NULL DEFAULT 'Zero',
  note_text                      text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW(),
  ended_at                       timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_final_handoff_export_item (
  final_handoff_export_item_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  final_handoff_export_run_id    uuid NOT NULL REFERENCES cx22073jw.access_final_handoff_export_run(final_handoff_export_run_id) ON DELETE CASCADE,
  source_execution_run_code      text NOT NULL,
  source_batch_code              text NOT NULL,
  request_code                   text NOT NULL,
  target_domain_code             text NOT NULL,
  target_role_code               text NOT NULL,
  actual_view_code               text NOT NULL,
  logical_view_name              text NOT NULL,
  expected_db_role_name          text NOT NULL,
  preflight_status               text NOT NULL,
  execution_status               text NOT NULL,
  handoff_bucket                 text NOT NULL CHECK (handoff_bucket IN ('pass_item','fail_item','skipped_item')),
  prepared_sql_text              text,
  result_note                    text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (final_handoff_export_run_id, request_code, actual_view_code)
);

CREATE INDEX IF NOT EXISTS ix_access_final_handoff_export_run_created
  ON cx22073jw.access_final_handoff_export_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_final_handoff_export_item_run
  ON cx22073jw.access_final_handoff_export_item (final_handoff_export_run_id, handoff_bucket, request_code);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = 'fn_set_updated_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_final_handoff_export_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_final_handoff_export_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_final_handoff_export_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_final_handoff_export_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_final_handoff_export_latest_summary AS
SELECT
  run_code,
  source_execution_run_code,
  source_batch_code,
  export_root_path,
  requested_item_count,
  pass_item_count,
  fail_item_count,
  skipped_item_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_final_handoff_export_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_final_handoff_export_latest_items AS
SELECT
  r.run_code,
  i.source_execution_run_code,
  i.source_batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.preflight_status,
  i.execution_status,
  i.handoff_bucket,
  i.prepared_sql_text,
  i.result_note,
  i.created_at
FROM cx22073jw.access_final_handoff_export_item i
JOIN cx22073jw.access_final_handoff_export_run r
  ON r.final_handoff_export_run_id = i.final_handoff_export_run_id
WHERE r.final_handoff_export_run_id = (
  SELECT final_handoff_export_run_id
  FROM cx22073jw.access_final_handoff_export_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

COMMIT;
SQL

  SOURCE_EXECUTION_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT run_code
FROM cx22073jw.v_access_governed_apply_execution_latest_summary
LIMIT 1;
SQL
  )"

  SOURCE_BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT source_batch_code
FROM cx22073jw.v_access_governed_apply_execution_latest_summary
LIMIT 1;
SQL
  )"

  if [ -z "${SOURCE_EXECUTION_RUN_CODE:-}" ] || [ -z "${SOURCE_BATCH_CODE:-}" ]; then
    echo "ERROR: latest preflight execution summary not found"
    exit 1
  fi

  echo "SOURCE_EXECUTION_RUN_CODE=$SOURCE_EXECUTION_RUN_CODE"
  echo "SOURCE_BATCH_CODE=$SOURCE_BATCH_CODE"

  EXPORT_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_final_handoff_export_run (
  run_code,
  source_execution_run_code,
  source_batch_code,
  export_root_path,
  run_status,
  actor_name,
  note_text
)
VALUES (
  '$EXPORT_RUN_CODE',
  '$SOURCE_EXECUTION_RUN_CODE',
  '$SOURCE_BATCH_CODE',
  '$EXPORT_ROOT',
  'running',
  'Zero',
  'Exporting latest preflight result into final manual handoff package.'
)
RETURNING final_handoff_export_run_id;
SQL
  )"

  if [ -z "${EXPORT_RUN_ID:-}" ]; then
    echo "ERROR: final handoff export run was not created"
    exit 1
  fi

  echo "EXPORT_RUN_ID=$EXPORT_RUN_ID"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$PASS_ITEMS_TSV"
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  expected_db_role_name,
  preflight_status,
  execution_status
FROM cx22073jw.v_access_governed_apply_execution_latest_items
WHERE preflight_status = 'pass'
ORDER BY request_code, logical_view_name;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$FAIL_ITEMS_TSV"
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  expected_db_role_name,
  preflight_status,
  execution_status,
  COALESCE(result_note, '')
FROM cx22073jw.v_access_governed_apply_execution_latest_items
WHERE preflight_status IN ('fail','skipped')
ORDER BY request_code, logical_view_name;
SQL

  cat > "$MANIFEST_MD" <<__MANIFEST070__
# ============================================================
# ACCESS FINAL HANDOFF PACKAGE MANIFEST
# ============================================================

export_run_code: $EXPORT_RUN_CODE
source_execution_run_code: $SOURCE_EXECUTION_RUN_CODE
source_batch_code: $SOURCE_BATCH_CODE
generated_at: $RUN_TS
export_root: $EXPORT_ROOT

files:
- 000_manifest.md
- 010_pass_items.tsv
- 020_fail_or_skipped_items.tsv
- 030_final_apply_skeleton.sql
- 040_export_summary.json

notes:
- pass_items are latest preflight pass items only
- fail_or_skipped_items must not be manually applied as-is
- final_apply_skeleton.sql is manual handoff skeleton only
__MANIFEST070__

  cat > "$FINAL_SQL" <<__FINALSQL070__
-- ============================================================
-- ACCESS FINAL APPLY SKELETON
-- ============================================================
-- export_run_code: $EXPORT_RUN_CODE
-- source_execution_run_code: $SOURCE_EXECUTION_RUN_CODE
-- source_batch_code: $SOURCE_BATCH_CODE
-- generated_at: $RUN_TS
-- caution:
--   manual handoff skeleton only
--   review before any execution
-- ============================================================

__FINALSQL070__

  if [ -s "$PASS_ITEMS_TSV" ]; then
    awk -F'\t' '
      {
        req=$1
        domain=$2
        role=$3
        actual=$4
        logical=$5
        dbrole=$6
        print "-- ------------------------------------------------------------"
        print "-- request_code: " req
        print "-- domain_code : " domain
        print "-- role_code   : " role
        print "-- actual_view : " actual
        print "-- logical_view: " logical
        print "-- db_role     : " dbrole
        print "GRANT SELECT ON cx22073jw." logical " TO " dbrole ";"
        print ""
      }
    ' "$PASS_ITEMS_TSV" >> "$FINAL_SQL"
  fi

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_final_handoff_export_item (
  final_handoff_export_run_id,
  source_execution_run_code,
  source_batch_code,
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  expected_db_role_name,
  preflight_status,
  execution_status,
  handoff_bucket,
  prepared_sql_text,
  result_note
)
SELECT
  '$EXPORT_RUN_ID',
  '$SOURCE_EXECUTION_RUN_CODE',
  '$SOURCE_BATCH_CODE',
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.preflight_status,
  i.execution_status,
  CASE
    WHEN i.preflight_status = 'pass' THEN 'pass_item'
    WHEN i.preflight_status = 'skipped' THEN 'skipped_item'
    ELSE 'fail_item'
  END,
  i.prepared_sql_text,
  i.result_note
FROM cx22073jw.v_access_governed_apply_execution_latest_items i;

UPDATE cx22073jw.access_final_handoff_export_run
   SET manifest_md_path         = '$MANIFEST_MD',
       pass_items_tsv_path      = '$PASS_ITEMS_TSV',
       fail_items_tsv_path      = '$FAIL_ITEMS_TSV',
       final_sql_path           = '$FINAL_SQL',
       requested_item_count     = (
         SELECT COUNT(*)
         FROM cx22073jw.access_final_handoff_export_item
         WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID'
       ),
       pass_item_count          = (
         SELECT COUNT(*)
         FROM cx22073jw.access_final_handoff_export_item
         WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID'
           AND handoff_bucket = 'pass_item'
       ),
       fail_item_count          = (
         SELECT COUNT(*)
         FROM cx22073jw.access_final_handoff_export_item
         WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID'
           AND handoff_bucket = 'fail_item'
       ),
       skipped_item_count       = (
         SELECT COUNT(*)
         FROM cx22073jw.access_final_handoff_export_item
         WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID'
           AND handoff_bucket = 'skipped_item'
       ),
       run_status               = CASE
                                    WHEN (
                                      SELECT COUNT(*)
                                      FROM cx22073jw.access_final_handoff_export_item
                                      WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID'
                                    ) = 0 THEN 'error'
                                    WHEN (
                                      SELECT COUNT(*)
                                      FROM cx22073jw.access_final_handoff_export_item
                                      WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID'
                                        AND handoff_bucket = 'pass_item'
                                    ) > 0 THEN 'pass'
                                    ELSE 'partial'
                                  END,
       export_summary_json_path = '$EXPORT_SUMMARY_JSON',
       note_text                = 'Final manual handoff package exported from latest preflight execution.',
       ended_at                 = NOW(),
       updated_at               = NOW()
 WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID';
SQL

  PASS_COUNT="$(wc -l < "$PASS_ITEMS_TSV" | tr -d '[:space:]')"
  FAIL_COUNT="$(awk 'END{print NR+0}' "$FAIL_ITEMS_TSV")"
  REQUESTED_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT requested_item_count
FROM cx22073jw.access_final_handoff_export_run
WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID';
SQL
  )"
  SKIPPED_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT skipped_item_count
FROM cx22073jw.access_final_handoff_export_run
WHERE final_handoff_export_run_id = '$EXPORT_RUN_ID';
SQL
  )"

  cat > "$EXPORT_SUMMARY_JSON" <<__SUMMARY070__
{
  "export_run_code": "$EXPORT_RUN_CODE",
  "source_execution_run_code": "$SOURCE_EXECUTION_RUN_CODE",
  "source_batch_code": "$SOURCE_BATCH_CODE",
  "generated_at": "$RUN_TS",
  "export_root": "$EXPORT_ROOT",
  "requested_item_count": $REQUESTED_COUNT,
  "pass_item_count": $PASS_COUNT,
  "fail_or_skipped_line_count": $FAIL_COUNT,
  "skipped_item_count": $SKIPPED_COUNT,
  "notes": [
    "pass items only are included in final apply skeleton",
    "fail or skipped items must be resolved before any apply",
    "manual handoff package only"
  ]
}
__SUMMARY070__

  echo "============================================================"
  echo "EXPORTED FILES"
  echo "============================================================"
  find "$EXPORT_ROOT" -maxdepth 1 -type f | LC_ALL=C sort

  echo "============================================================"
  echo "LATEST FINAL HANDOFF EXPORT SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_final_handoff_export_latest_summary;

SELECT
  request_code,
  handoff_bucket,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_final_handoff_export_latest_items
GROUP BY request_code, handoff_bucket
ORDER BY request_code, handoff_bucket;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS FINAL HANDOFF EXPORT DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
