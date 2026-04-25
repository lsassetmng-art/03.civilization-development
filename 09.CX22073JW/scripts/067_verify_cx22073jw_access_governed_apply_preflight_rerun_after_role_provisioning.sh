#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST PREFLIGHT EXECUTION SUMMARY ==='
TABLE cx22073jw.v_access_governed_apply_execution_latest_summary;

\echo '=== ROLE REGISTRY SUMMARY ==='
SELECT
  role_code,
  domain_code,
  expected_db_role_name,
  role_status,
  role_exists_flag
FROM cx22073jw.v_access_db_role_registry_summary
ORDER BY domain_code, role_code;

\echo '=== PREFLIGHT STATUS COUNTS ==='
SELECT
  preflight_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_governed_apply_execution_latest_items
GROUP BY preflight_status
ORDER BY preflight_status;

\echo '=== ROLE EXISTS / VIEW EXISTS MATRIX ==='
SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  role_exists_flag,
  view_exists_flag,
  runtime_apply_ready,
  gate_check_required,
  preflight_status,
  execution_status
FROM cx22073jw.v_access_governed_apply_execution_latest_items
ORDER BY request_code, logical_view_name;

\echo '=== FAIL / SKIPPED ONLY ==='
SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  preflight_status,
  execution_status,
  result_note
FROM cx22073jw.v_access_governed_apply_execution_latest_items
WHERE preflight_status IN ('fail','skipped')
ORDER BY request_code, logical_view_name;
SQL
