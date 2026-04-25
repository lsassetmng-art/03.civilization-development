#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

LATEST_EXPORT_ROOT="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_access_activation_review_export_latest_summary
LIMIT 1;
SQL
)"

echo "============================================================"
echo "LATEST_EXPORT_ROOT=$LATEST_EXPORT_ROOT"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== ACTIVATION REVIEW EXPORT LATEST SUMMARY ==='
TABLE cx22073jw.v_access_activation_review_export_latest_summary;

\echo '=== EXPORTED ITEM COUNTS BY REQUEST ==='
SELECT
  request_code,
  COUNT(*) AS exported_item_count
FROM cx22073jw.v_access_activation_review_export_latest_items
GROUP BY request_code
ORDER BY request_code;

\echo '=== STATUS COUNTS ==='
SELECT
  decision_status,
  COUNT(*) AS decision_count
FROM cx22073jw.v_access_activation_review_export_latest_items
GROUP BY decision_status
ORDER BY decision_status;

\echo '=== GATE / REJECTED ONLY ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  decision_status,
  decision_action_hint
FROM cx22073jw.v_access_activation_review_export_latest_items
WHERE decision_status IN ('requires_gate','rejected')
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
  echo "REQUEST SUMMARY HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/010_request_summary.tsv"

  echo "============================================================"
  echo "DECISION MATRIX HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/020_decision_matrix.tsv"

  echo "============================================================"
  echo "GATE / REJECTED HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/040_gate_or_rejected.tsv"

  echo "============================================================"
  echo "APPLY PLAN SQL HEAD"
  echo "============================================================"
  sed -n '1,120p' "$LATEST_EXPORT_ROOT/030_apply_plan_skeleton.sql"
else
  echo "ERROR: latest export root not found"
  exit 1
fi
