#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST PENDING SUMMARY ==='
TABLE cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;

\echo '=== LATEST RECEIPT ITEMS ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  expected_db_role_name,
  receipt_status,
  manual_executor_name,
  manual_apply_note
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY request_code, logical_view_name;

\echo '=== LATEST CONFIRMATION LOG ==='
TABLE cx22073jw.v_access_manual_apply_confirmation_latest_log;

\echo '=== LATEST CONFIRMED-ONLY REVERIFY SUMMARY ==='
TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;

\echo '=== LATEST CONFIRMED-ONLY REVERIFY ITEMS ==='
TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items;
SQL
