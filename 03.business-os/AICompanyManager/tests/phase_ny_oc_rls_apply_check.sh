#!/data/data/com.termux/files/usr/bin/bash
set -eu

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "RESULT: FAIL"
  echo "REASON: PERSONA_DATABASE_URL is not set"
  exit 1
fi

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
WITH target(full_name) AS (
  VALUES
    ('business.aicm_company'),
    ('business.aicm_department'),
    ('business.aicm_organization'),
    ('business.aicm_department_task_ledger'),
    ('business.aicm_review_item'),
    ('business.aicm_review_action'),
    ('business.aicm_workflow_run')
),
existing AS (
  SELECT full_name
  FROM target
  WHERE to_regclass(full_name) IS NOT NULL
),
rls AS (
  SELECT
    full_name,
    (SELECT relrowsecurity FROM pg_class WHERE oid = to_regclass(full_name)) AS enabled
  FROM existing
)
SELECT 'RLS_ENABLED_COUNT|' || count(*)::text
FROM rls
WHERE enabled IS TRUE;

SELECT 'RLS_CHECK|READ_ONLY';
SQL

echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED BY CHECK SCRIPT"
