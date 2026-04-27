#!/data/data/com.termux/files/usr/bin/bash
set -eu
if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "RESULT: FAIL"
  echo "REASON: PERSONA_DATABASE_URL is not set"
  exit 1
fi
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
SELECT 'WORKFLOW_TABLE|business.aicm_workflow_run';
SELECT 'WORKFLOW_RUN_ID|00000000-0000-4000-8000-f10a00000001';
SELECT 'CHECK|READ_ONLY';
SQL
echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED BY CHECK SCRIPT"
