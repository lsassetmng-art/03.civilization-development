#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== ROLE ACCESS BUNDLE SUMMARY ==='
TABLE cx22073jw.v_access_role_access_bundle_summary;

\echo '=== ROLE ACCESS BUNDLE ITEM COUNTS ==='
SELECT
  domain_code,
  role_code,
  COUNT(*) AS item_count,
  COUNT(*) FILTER (WHERE gate_needed) AS gate_item_count
FROM cx22073jw.v_access_role_access_bundle_item_matrix
GROUP BY domain_code, role_code
ORDER BY domain_code, role_code;

\echo '=== BUNDLE ITEM MATRIX SAMPLE (operations / streaming / game) ==='
SELECT
  domain_code,
  role_code,
  logical_view_name,
  grant_mode,
  gate_needed
FROM cx22073jw.v_access_role_access_bundle_item_matrix
WHERE domain_code IN ('operations','streaming','game')
ORDER BY domain_code, role_code, sort_order;

\echo '=== BUNDLE ITEM MATRIX SAMPLE (education / qualification_prep / utility_assist) ==='
SELECT
  domain_code,
  role_code,
  logical_view_name,
  grant_mode,
  gate_needed
FROM cx22073jw.v_access_role_access_bundle_item_matrix
WHERE domain_code IN ('education','qualification_prep','utility_assist')
ORDER BY domain_code, role_code, sort_order;

\echo '=== BUNDLE ITEM MATRIX SAMPLE (casual / workforce / combat / clerical) ==='
SELECT
  domain_code,
  role_code,
  logical_view_name,
  grant_mode,
  gate_needed
FROM cx22073jw.v_access_role_access_bundle_item_matrix
WHERE domain_code IN ('casual_relationship','workforce_execution','combat_unit','clerical_execution','clerical_control','senior_clerical_control')
ORDER BY domain_code, role_code, sort_order;

\echo '=== ACTIVATION REQUEST LATEST SUMMARY ==='
TABLE cx22073jw.v_access_activation_request_latest_summary;
SQL
