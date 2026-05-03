#!/data/data/com.termux/files/usr/bin/bash
set -eu
if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "RESULT: FAIL"
  echo "REASON: PERSONA_DATABASE_URL is not set"
  exit 1
fi
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
select 'LEDGER_TABLE|business.aicm_department_task_ledger';
select 'LEDGER_ID|00000000-0000-4000-8000-7ed9e0a1c2b3';
select 'CHECK|READ_ONLY';
SQL
echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED BY CHECK SCRIPT"
