#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST STUB VIEW GENERATION SUMMARY ==='
TABLE cx22073jw.v_access_stub_view_generation_latest_summary;

\echo '=== LATEST STUB VIEW GENERATION ITEMS ==='
TABLE cx22073jw.v_access_stub_view_generation_latest_items;

\echo '=== RUNTIME CATALOG COUNTS ==='
SELECT
  domain_code,
  COUNT(*) AS total_views,
  COUNT(*) FILTER (WHERE stub_view_exists) AS existing_views,
  COUNT(*) FILTER (WHERE NOT stub_view_exists) AS missing_views
FROM cx22073jw.v_access_stub_view_runtime_catalog
GROUP BY domain_code
ORDER BY domain_code;

\echo '=== MISSING STUB VIEWS ==='
TABLE cx22073jw.v_access_stub_view_missing;

\echo '=== SAMPLE EXISTING STUB VIEWS (operations / streaming / game) ==='
SELECT domain_code, logical_view_name, stub_view_exists
FROM cx22073jw.v_access_stub_view_runtime_catalog
WHERE domain_code IN ('operations','streaming','game')
ORDER BY domain_code, logical_view_name;

\echo '=== SAMPLE EXISTING STUB VIEWS (education / qualification_prep / utility_assist) ==='
SELECT domain_code, logical_view_name, stub_view_exists
FROM cx22073jw.v_access_stub_view_runtime_catalog
WHERE domain_code IN ('education','qualification_prep','utility_assist')
ORDER BY domain_code, logical_view_name;

\echo '=== SAMPLE EXISTING STUB VIEWS (casual / workforce / combat / clerical) ==='
SELECT domain_code, logical_view_name, stub_view_exists
FROM cx22073jw.v_access_stub_view_runtime_catalog
WHERE domain_code IN ('casual_relationship','workforce_execution','combat_unit','clerical_execution','clerical_control','senior_clerical_control')
ORDER BY domain_code, logical_view_name;
SQL
