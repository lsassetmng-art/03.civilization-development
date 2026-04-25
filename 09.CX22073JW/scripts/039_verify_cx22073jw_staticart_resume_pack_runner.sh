#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

EXPORT_ROOT_PATH="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_staticart_resume_pack_summary
LIMIT 1;
SQL
)"

echo "============================================================"
echo "EXPORT_ROOT_PATH=$EXPORT_ROOT_PATH"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== RESUME PACK SUMMARY ==='
TABLE cx22073jw.v_staticart_resume_pack_summary;

\echo '=== DELIVERY MASTER STATUS ==='
TABLE cx22073jw.v_staticart_delivery_master_status;
SQL

if [ -n "${EXPORT_ROOT_PATH:-}" ] && [ -d "$EXPORT_ROOT_PATH" ]; then
  echo "============================================================"
  echo "997_OPERATIONS_INDEX HEAD"
  echo "============================================================"
  sed -n '1,240p' "$EXPORT_ROOT_PATH/997_OPERATIONS_INDEX.md"

  echo "============================================================"
  echo "998_RESUME_CONTEXT HEAD"
  echo "============================================================"
  sed -n '1,240p' "$EXPORT_ROOT_PATH/998_RESUME_CONTEXT.json"
else
  echo "ERROR: export root path not found"
  exit 1
fi
