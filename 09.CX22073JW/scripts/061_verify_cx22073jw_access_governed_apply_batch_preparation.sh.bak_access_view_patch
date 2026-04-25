#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST GOVERNED APPLY BATCH SUMMARY ==='
TABLE cx22073jw.v_access_governed_apply_batch_latest_summary;

\echo '=== LATEST GOVERNED APPLY BATCH ITEMS ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  apply_status,
  runtime_apply_ready,
  gate_check_required
FROM cx22073jw.v_access_governed_apply_batch_latest_items
ORDER BY request_code, logical_view_name;

\echo '=== APPLY STATUS COUNTS ==='
SELECT
  apply_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_governed_apply_batch_latest_items
GROUP BY apply_status
ORDER BY apply_status;

\echo '=== SAMPLE PREPARED SQL ==='
SELECT
  request_code,
  logical_view_name,
  prepared_sql_text
FROM cx22073jw.v_access_governed_apply_batch_latest_items
ORDER BY request_code, logical_view_name
LIMIT 20;

\echo '=== LATEST ATTEMPT SUMMARY ==='
TABLE cx22073jw.v_access_governed_apply_attempt_latest_summary;
SQL
