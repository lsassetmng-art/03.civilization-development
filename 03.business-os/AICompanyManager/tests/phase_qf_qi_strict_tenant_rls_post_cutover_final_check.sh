#!/data/data/com.termux/files/usr/bin/bash
set -eu

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "RESULT: FAIL"
  echo "REASON: PERSONA_DATABASE_URL is not set"
  exit 1
fi

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
SELECT 'SMOKE_SAFE_POLICY_COUNT|' || count(*)::text
FROM pg_policies
WHERE schemaname = 'business'
  AND policyname = 'aicm_authenticated_all_smoke_safe';

SELECT 'STRICT_POLICY_COUNT|' || count(*)::text
FROM pg_policies
WHERE schemaname = 'business'
  AND policyname LIKE 'aicm_%_strict';

SELECT 'SERVICE_ROLE_POLICY_COUNT|' || count(*)::text
FROM pg_policies
WHERE schemaname = 'business'
  AND policyname = 'aicm_service_role_all';

SELECT 'CHECK|READ_ONLY';
SQL

echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED BY CHECK SCRIPT"
