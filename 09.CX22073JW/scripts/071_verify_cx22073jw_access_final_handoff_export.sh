#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

LATEST_EXPORT_ROOT="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_access_final_handoff_export_latest_summary
LIMIT 1;
SQL
)"

echo "============================================================"
echo "LATEST_EXPORT_ROOT=$LATEST_EXPORT_ROOT"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== FINAL HANDOFF EXPORT LATEST SUMMARY ==='
TABLE cx22073jw.v_access_final_handoff_export_latest_summary;

\echo '=== FINAL HANDOFF EXPORT ITEM COUNTS ==='
SELECT
  request_code,
  handoff_bucket,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_final_handoff_export_latest_items
GROUP BY request_code, handoff_bucket
ORDER BY request_code, handoff_bucket;

\echo '=== PASS ITEMS ONLY ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  expected_db_role_name,
  handoff_bucket
FROM cx22073jw.v_access_final_handoff_export_latest_items
WHERE handoff_bucket = 'pass_item'
ORDER BY request_code, logical_view_name;

\echo '=== FAIL / SKIPPED ONLY ==='
SELECT
  request_code,
  logical_view_name,
  preflight_status,
  execution_status,
  result_note
FROM cx22073jw.v_access_final_handoff_export_latest_items
WHERE handoff_bucket IN ('fail_item','skipped_item')
ORDER BY request_code, logical_view_name;
SQL

if [ -n "${LATEST_EXPORT_ROOT:-}" ] && [ -d "$LATEST_EXPORT_ROOT" ]; then
  echo "============================================================"
  echo "EXPORT ROOT FILES"
  echo "============================================================"
  find "$LATEST_EXPORT_ROOT" -maxdepth 1 -type f | LC_ALL=C sort

  echo "============================================================"
  echo "MANIFEST HEAD"
  echo "============================================================"
  sed -n '1,220p' "$LATEST_EXPORT_ROOT/000_manifest.md"

  echo "============================================================"
  echo "PASS ITEMS HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/010_pass_items.tsv"

  echo "============================================================"
  echo "FAIL/SKIPPED ITEMS HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/020_fail_or_skipped_items.tsv"

  echo "============================================================"
  echo "FINAL SQL HEAD"
  echo "============================================================"
  sed -n '1,160p' "$LATEST_EXPORT_ROOT/030_final_apply_skeleton.sql"
else
  echo "ERROR: latest export root not found"
  exit 1
fi
