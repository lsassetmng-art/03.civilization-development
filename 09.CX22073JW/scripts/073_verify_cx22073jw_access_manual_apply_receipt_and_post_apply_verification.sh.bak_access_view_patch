#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== MANUAL APPLY RECEIPT LATEST BATCH SUMMARY ==='
TABLE cx22073jw.v_access_manual_apply_receipt_latest_batch_summary;

\echo '=== MANUAL APPLY RECEIPT LATEST ITEMS ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  expected_db_role_name,
  receipt_status
FROM cx22073jw.v_access_manual_apply_receipt_latest_items
ORDER BY request_code, logical_view_name;

\echo '=== POST-APPLY VERIFICATION LATEST SUMMARY ==='
TABLE cx22073jw.v_access_post_apply_verification_latest_summary;

\echo '=== POST-APPLY VERIFICATION LATEST ITEMS ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  expected_db_role_name,
  role_exists_flag,
  view_exists_flag,
  select_grant_present_flag,
  verification_status,
  result_note
FROM cx22073jw.v_access_post_apply_verification_latest_items
ORDER BY request_code, logical_view_name;

\echo '=== VERIFICATION STATUS COUNTS ==='
SELECT
  verification_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_post_apply_verification_latest_items
GROUP BY verification_status
ORDER BY verification_status;
SQL
