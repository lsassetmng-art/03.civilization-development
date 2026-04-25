#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

EXPORT_ROOT_PATH="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
)"

echo "============================================================"
echo "EXPORT_ROOT_PATH=$EXPORT_ROOT_PATH"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== DELIVERY MASTER STATUS ==='
TABLE cx22073jw.v_staticart_delivery_master_status;

\echo '=== FINAL PACKAGE SUMMARY ==='
TABLE cx22073jw.v_staticart_final_handoff_package_summary;

\echo '=== DELIVERY CLOSEOUT SUMMARY ==='
TABLE cx22073jw.v_staticart_delivery_closeout_summary;
SQL

if [ -n "${EXPORT_ROOT_PATH:-}" ] && [ -d "$EXPORT_ROOT_PATH" ]; then
  echo "============================================================"
  echo "FINAL FILE CHECK"
  echo "============================================================"
  ls -l "$EXPORT_ROOT_PATH"

  echo "============================================================"
  echo "995_FINAL_COMPLETION_CERTIFICATE HEAD"
  echo "============================================================"
  sed -n '1,220p' "$EXPORT_ROOT_PATH/995_FINAL_COMPLETION_CERTIFICATE.md"

  echo "============================================================"
  echo "996_HANDOFF_REENTRY_INDEX HEAD"
  echo "============================================================"
  sed -n '1,220p' "$EXPORT_ROOT_PATH/996_HANDOFF_REENTRY_INDEX.md"
else
  echo "ERROR: export root path not found"
  exit 1
fi
