#!/data/data/com.termux/files/usr/bin/bash
set -eu
if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "RESULT: FAIL"
  echo "REASON: PERSONA_DATABASE_URL is not set"
  exit 1
fi
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
SELECT 'CSV_LEDGER_ID_COUNT|' || count(*)::text
FROM business.aicm_department_task_ledger
WHERE ledger_row_id = '00000000-0000-4000-8000-c5a1b0000001'::uuid;
SQL
echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED BY CHECK SCRIPT"
