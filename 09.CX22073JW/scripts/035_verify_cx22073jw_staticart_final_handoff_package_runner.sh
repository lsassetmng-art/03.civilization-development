#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

LATEST_EXPORT_ROOT="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_staticart_final_handoff_package_summary
LIMIT 1;
SQL
)"

echo "============================================================"
echo "LATEST_EXPORT_ROOT=$LATEST_EXPORT_ROOT"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== FINAL PACKAGE SUMMARY ==='
TABLE cx22073jw.v_staticart_final_handoff_package_summary;
SQL

if [ -n "${LATEST_EXPORT_ROOT:-}" ] && [ -d "$LATEST_EXPORT_ROOT" ]; then
  echo "============================================================"
  echo "PACKAGE FILE CHECK"
  echo "============================================================"
  ls -l "$LATEST_EXPORT_ROOT"

  echo "============================================================"
  echo "FILE INDEX HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/991_FILE_INDEX.tsv"

  echo "============================================================"
  echo "SHA256 MANIFEST HEAD"
  echo "============================================================"
  sed -n '1,40p' "$LATEST_EXPORT_ROOT/992_SHA256SUMS.txt"

  echo "============================================================"
  echo "DB SUMMARY HEAD"
  echo "============================================================"
  sed -n '1,220p' "$LATEST_EXPORT_ROOT/993_DB_SUMMARY.json"

  echo "============================================================"
  echo "PACKAGE MANIFEST HEAD"
  echo "============================================================"
  sed -n '1,220p' "$LATEST_EXPORT_ROOT/994_PACKAGE_MANIFEST.json"
else
  echo "ERROR: latest package export root not found"
  exit 1
fi
