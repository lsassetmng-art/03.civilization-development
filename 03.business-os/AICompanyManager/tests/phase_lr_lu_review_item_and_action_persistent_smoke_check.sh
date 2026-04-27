#!/data/data/com.termux/files/usr/bin/bash
set -eu
if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "RESULT: FAIL"
  echo "REASON: PERSONA_DATABASE_URL is not set"
  exit 1
fi
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
SELECT 'REVIEW_ITEM_COUNT|' || count(*)::text
FROM business.aicm_review_item
WHERE review_item_id = '00000000-0000-4000-8000-1eac7100aa01'::uuid;

SELECT 'REVIEW_ACTION_COUNT|' || count(*)::text
FROM business.aicm_review_action
WHERE review_action_id = '00000000-0000-4000-8000-1eac71000001'::uuid;
SQL
echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED BY CHECK SCRIPT"
