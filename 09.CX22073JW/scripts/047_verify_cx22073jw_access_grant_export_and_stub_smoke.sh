#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

LATEST_EXPORT_ROOT="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_access_grant_export_latest_summary
LIMIT 1;
SQL
)"

echo "============================================================"
echo "LATEST_EXPORT_ROOT=$LATEST_EXPORT_ROOT"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== GRANT EXPORT LATEST SUMMARY ==='
TABLE cx22073jw.v_access_grant_export_latest_summary;

\echo '=== GRANT EXPORT ITEM COUNTS BY DOMAIN ==='
SELECT
  domain_code,
  COUNT(*) AS grant_item_count
FROM cx22073jw.v_access_grant_export_latest_items
GROUP BY domain_code
ORDER BY domain_code;

\echo '=== STUB SMOKE LATEST SUMMARY ==='
TABLE cx22073jw.v_access_stub_smoke_latest_summary;

\echo '=== STUB SMOKE FAIL / MISSING ONLY ==='
SELECT
  domain_code,
  logical_view_name,
  smoke_status,
  error_text
FROM cx22073jw.v_access_stub_smoke_latest_items
WHERE smoke_status IN ('fail','missing')
ORDER BY domain_code, logical_view_name;

\echo '=== STUB SMOKE PASS COUNTS BY DOMAIN ==='
SELECT
  domain_code,
  COUNT(*) FILTER (WHERE smoke_status = 'pass') AS pass_count,
  COUNT(*) FILTER (WHERE smoke_status = 'fail') AS fail_count,
  COUNT(*) FILTER (WHERE smoke_status = 'missing') AS missing_count
FROM cx22073jw.v_access_stub_smoke_latest_items
GROUP BY domain_code
ORDER BY domain_code;
SQL

if [ -n "${LATEST_EXPORT_ROOT:-}" ] && [ -d "$LATEST_EXPORT_ROOT" ]; then
  echo "============================================================"
  echo "EXPORT ROOT FILES"
  echo "============================================================"
  find "$LATEST_EXPORT_ROOT" -maxdepth 2 -type f | LC_ALL=C sort

  echo "============================================================"
  echo "MANIFEST HEAD"
  echo "============================================================"
  sed -n '1,220p' "$LATEST_EXPORT_ROOT/000_manifest.md"

  echo "============================================================"
  echo "ROLE MATRIX HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/010_role_actual_view_matrix.tsv"

  echo "============================================================"
  echo "DOMAIN SUMMARY HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/020_domain_summary.tsv"

  echo "============================================================"
  echo "GATE CONTROLLED HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/030_gate_controlled_views.tsv"

  echo "============================================================"
  echo "SAMPLE ROLE SQL FILES"
  echo "============================================================"
  find "$LATEST_EXPORT_ROOT/roles" -maxdepth 1 -type f -name '*.sql' | LC_ALL=C sort | head -n 5 | while read -r f; do
    echo "----- $f -----"
    sed -n '1,80p' "$f"
  done
else
  echo "ERROR: latest export root not found"
  exit 1
fi
