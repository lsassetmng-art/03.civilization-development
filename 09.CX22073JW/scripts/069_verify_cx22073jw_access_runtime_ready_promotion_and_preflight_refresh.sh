#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== RUNTIME READY PROMOTION LATEST BATCH SUMMARY ==='
TABLE cx22073jw.v_access_runtime_ready_promotion_latest_batch_summary;

\echo '=== RUNTIME READY PROMOTION LATEST ITEMS ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  previous_runtime_apply_ready,
  new_runtime_apply_ready,
  gate_check_required,
  action_status
FROM cx22073jw.v_access_runtime_ready_promotion_latest_items
ORDER BY request_code, logical_view_name;

\echo '=== GOVERNED APPLY BATCH LATEST SUMMARY ==='
TABLE cx22073jw.v_access_governed_apply_batch_latest_summary;

\echo '=== GOVERNED APPLY BATCH LATEST ITEMS ==='
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

\echo '=== PREFLIGHT EXECUTION LATEST SUMMARY ==='
TABLE cx22073jw.v_access_governed_apply_execution_latest_summary;

\echo '=== PREFLIGHT EXECUTION LATEST ITEMS ==='
SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  runtime_apply_ready,
  gate_check_required,
  role_exists_flag,
  view_exists_flag,
  sql_present_flag,
  preflight_status,
  execution_status,
  result_note
FROM cx22073jw.v_access_governed_apply_execution_latest_items
ORDER BY request_code, logical_view_name;

\echo '=== PREFLIGHT STATUS COUNTS ==='
SELECT
  preflight_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_governed_apply_execution_latest_items
GROUP BY preflight_status
ORDER BY preflight_status;
SQL
