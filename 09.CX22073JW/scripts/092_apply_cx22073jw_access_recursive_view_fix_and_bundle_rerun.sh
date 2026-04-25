#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_DIR="$LOGS_DIR/${RUN_TS}_access_recursive_view_fix"
LOG_FILE="$RUN_DIR/000_run.log"
VIEWDEF_BEFORE="$RUN_DIR/010_viewdef_before.tsv"
VIEWDEF_AFTER="$RUN_DIR/020_viewdef_after.tsv"

APPLY_090="$BASE/scripts/090_apply_cx22073jw_access_current_state_bundle_export.sh"
VERIFY_091="$BASE/scripts/091_verify_cx22073jw_access_current_state_bundle_export.sh"

mkdir -p "$RUN_DIR"

{
  echo "============================================================"
  echo "ACCESS RECURSIVE VIEW FIX START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "run_dir      : $RUN_DIR"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 1: BEFORE VIEW DEF SNAPSHOT"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$VIEWDEF_BEFORE"
SELECT
  table_name,
  pg_get_viewdef(('cx22073jw.' || table_name)::regclass, true)
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name IN (
    'v_access_manual_apply_receipt_latest_batch_summary',
    'v_access_manual_apply_receipt_latest_items',
    'v_access_manual_apply_receipt_latest_pending_summary',
    'v_access_manual_apply_confirmation_latest_log',
    'v_access_post_apply_verification_latest_summary',
    'v_access_post_apply_verification_latest_items',
    'v_access_post_apply_verification_latest_confirmed_only_summary',
    'v_access_post_apply_verification_latest_confirmed_only_items'
  )
ORDER BY table_name;
SQL

  sed -n '1,120p' "$VIEWDEF_BEFORE" || true

  echo "============================================================"
  echo "PHASE 2: REBUILD VIEWS FROM BASE TABLES"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

SET search_path TO cx22073jw, public;

CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_receipt_latest_batch_summary AS
SELECT
  batch_code,
  source_handoff_run_code,
  source_export_root_path,
  requested_item_count,
  seeded_item_count,
  batch_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_receipt_latest_items AS
SELECT
  b.batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.receipt_status,
  i.manual_executor_name,
  i.manual_apply_note,
  i.created_at
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_receipt_latest_pending_summary AS
SELECT
  b.batch_code,
  COUNT(*) AS total_item_count,
  COUNT(*) FILTER (WHERE i.receipt_status = 'pending_confirmation') AS pending_confirmation_count,
  COUNT(*) FILTER (WHERE i.receipt_status = 'confirmed_applied') AS confirmed_applied_count,
  COUNT(*) FILTER (WHERE i.receipt_status = 'confirmed_skipped') AS confirmed_skipped_count,
  COUNT(*) FILTER (WHERE i.receipt_status = 'confirmed_failed') AS confirmed_failed_count
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
GROUP BY b.batch_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_confirmation_latest_log AS
SELECT
  b.batch_code,
  l.request_code,
  l.actual_view_code,
  l.logical_view_name,
  l.previous_receipt_status,
  l.new_receipt_status,
  l.executor_name,
  l.confirmation_note,
  l.created_at
FROM cx22073jw.access_manual_apply_confirmation_log l
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = l.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY l.created_at DESC, l.request_code, l.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_summary AS
SELECT
  run_code,
  source_receipt_batch_code,
  requested_item_count,
  verified_applied_count,
  not_yet_applied_count,
  precheck_fail_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_post_apply_verification_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_items AS
SELECT
  r.run_code,
  i.source_receipt_batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.role_exists_flag,
  i.view_exists_flag,
  i.select_grant_present_flag,
  i.verification_status,
  i.result_note,
  i.created_at
FROM cx22073jw.access_post_apply_verification_item i
JOIN cx22073jw.access_post_apply_verification_run r
  ON r.post_apply_verification_run_id = i.post_apply_verification_run_id
WHERE r.post_apply_verification_run_id = (
  SELECT post_apply_verification_run_id
  FROM cx22073jw.access_post_apply_verification_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary AS
SELECT
  run_code,
  source_receipt_batch_code,
  requested_item_count,
  verified_applied_count,
  not_yet_applied_count,
  precheck_fail_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_post_apply_verification_run
WHERE note_text ILIKE 'Confirmed-only%'
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items AS
SELECT
  r.run_code,
  i.source_receipt_batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.role_exists_flag,
  i.view_exists_flag,
  i.select_grant_present_flag,
  i.verification_status,
  i.result_note,
  i.created_at
FROM cx22073jw.access_post_apply_verification_item i
JOIN cx22073jw.access_post_apply_verification_run r
  ON r.post_apply_verification_run_id = i.post_apply_verification_run_id
WHERE r.post_apply_verification_run_id = (
  SELECT post_apply_verification_run_id
  FROM cx22073jw.access_post_apply_verification_run
  WHERE note_text ILIKE 'Confirmed-only%'
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

COMMIT;
SQL

  echo "============================================================"
  echo "PHASE 3: AFTER VIEW DEF SNAPSHOT"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$VIEWDEF_AFTER"
SELECT
  table_name,
  pg_get_viewdef(('cx22073jw.' || table_name)::regclass, true)
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name IN (
    'v_access_manual_apply_receipt_latest_batch_summary',
    'v_access_manual_apply_receipt_latest_items',
    'v_access_manual_apply_receipt_latest_pending_summary',
    'v_access_manual_apply_confirmation_latest_log',
    'v_access_post_apply_verification_latest_summary',
    'v_access_post_apply_verification_latest_items',
    'v_access_post_apply_verification_latest_confirmed_only_summary',
    'v_access_post_apply_verification_latest_confirmed_only_items'
  )
ORDER BY table_name;
SQL

  sed -n '1,120p' "$VIEWDEF_AFTER" || true

  echo "============================================================"
  echo "PHASE 4: SMOKE VERIFY"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'v_access_manual_apply_receipt_latest_batch_summary' AS view_name, COUNT(*) AS row_count
FROM cx22073jw.v_access_manual_apply_receipt_latest_batch_summary
UNION ALL
SELECT 'v_access_manual_apply_receipt_latest_items', COUNT(*)
FROM cx22073jw.v_access_manual_apply_receipt_latest_items
UNION ALL
SELECT 'v_access_manual_apply_receipt_latest_pending_summary', COUNT(*)
FROM cx22073jw.v_access_manual_apply_receipt_latest_pending_summary
UNION ALL
SELECT 'v_access_post_apply_verification_latest_summary', COUNT(*)
FROM cx22073jw.v_access_post_apply_verification_latest_summary
UNION ALL
SELECT 'v_access_post_apply_verification_latest_confirmed_only_summary', COUNT(*)
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL

  echo "============================================================"
  echo "PHASE 5: RERUN 090/091"
  echo "============================================================"

  if [ -x "$APPLY_090" ]; then
    "$APPLY_090"
  else
    echo "WARN: missing 090 apply -> $APPLY_090"
  fi

  if [ -x "$VERIFY_091" ]; then
    "$VERIFY_091"
  else
    echo "WARN: missing 091 verify -> $VERIFY_091"
  fi

  echo "============================================================"
  echo "ACCESS RECURSIVE VIEW FIX DONE"
  echo "viewdef_before: $VIEWDEF_BEFORE"
  echo "viewdef_after : $VIEWDEF_AFTER"
  echo "log_file      : $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
