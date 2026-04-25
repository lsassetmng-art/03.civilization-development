#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== RELEASE SUMMARY ==='
TABLE cx22073jw.v_staticart_fixed_contract_release_summary;

\echo '=== TARGETS ==='
TABLE cx22073jw.v_staticart_fixed_contract_release_targets;

\echo '=== KEYS ==='
TABLE cx22073jw.v_staticart_fixed_contract_release_keys;

\echo '=== EXPORT PAYLOAD ==='
TABLE cx22073jw.v_staticart_fixed_contract_release_export_payload;

\echo '=== EXPORT TOP LEVEL ==='
TABLE cx22073jw.v_staticart_fixed_contract_release_export_top_level;

\echo '=== BLOCKED TARGETS ONLY ==='
SELECT *
FROM cx22073jw.v_staticart_fixed_contract_release_targets
WHERE target_status_code = 'blocked'
ORDER BY sort_order, area_slug;

\echo '=== RELEASED TARGETS ONLY ==='
SELECT *
FROM cx22073jw.v_staticart_fixed_contract_release_targets
WHERE target_status_code = 'released'
ORDER BY sort_order, area_slug;
SQL
