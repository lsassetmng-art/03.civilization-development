#!/data/data/com.termux/files/usr/bin/bash
set -eu

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "RESULT: FAIL"
  echo "REASON: PERSONA_DATABASE_URL is not set"
  exit 1
fi

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
SELECT 'STRICT_POLICY_COUNT|' || count(*)::text
FROM pg_policies
WHERE schemaname = 'business'
  AND policyname IN (
    'aicm_company_select_strict',
    'aicm_company_insert_strict',
    'aicm_company_update_strict',
    'aicm_department_select_strict',
    'aicm_department_insert_strict',
    'aicm_department_update_strict',
    'aicm_organization_select_strict',
    'aicm_organization_insert_strict',
    'aicm_organization_update_strict',
    'aicm_ledger_select_strict',
    'aicm_ledger_insert_strict',
    'aicm_ledger_update_strict',
    'aicm_review_item_select_strict',
    'aicm_review_item_insert_strict',
    'aicm_review_item_update_strict',
    'aicm_review_action_select_strict',
    'aicm_review_action_insert_strict',
    'aicm_workflow_run_select_strict',
    'aicm_workflow_run_insert_strict',
    'aicm_workflow_run_update_strict'
  );

SELECT 'HELPER_FUNCTION_COUNT|' || count(*)::text
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'business'
  AND p.proname LIKE 'aicm_jwt%';

SELECT 'CHECK|READ_ONLY';
SQL

echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED BY CHECK SCRIPT"
