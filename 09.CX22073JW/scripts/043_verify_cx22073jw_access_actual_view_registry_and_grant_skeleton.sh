#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== NAMING RULES ==='
SELECT domain_code, naming_rule_code, rule_group, pattern_example
FROM cx22073jw.access_view_naming_rule_registry
ORDER BY domain_code, naming_rule_code;

\echo '=== ACTUAL VIEW FAMILY SUMMARY ==='
TABLE cx22073jw.v_access_actual_view_family_summary;

\echo '=== ACTUAL VIEW REGISTRY SAMPLE (operations / streaming / game) ==='
SELECT domain_code, view_family_code, actual_view_code, logical_view_name, sensitivity_code, exposure_scope, gate_required
FROM cx22073jw.v_access_actual_view_registry_summary
WHERE domain_code IN ('operations','streaming','game')
ORDER BY domain_code, view_family_code, logical_view_name;

\echo '=== ACTUAL VIEW REGISTRY SAMPLE (education / qualification_prep / utility_assist) ==='
SELECT domain_code, view_family_code, actual_view_code, logical_view_name, sensitivity_code, exposure_scope, gate_required
FROM cx22073jw.v_access_actual_view_registry_summary
WHERE domain_code IN ('education','qualification_prep','utility_assist')
ORDER BY domain_code, view_family_code, logical_view_name;

\echo '=== ACTUAL VIEW REGISTRY SAMPLE (casual / workforce / combat / clerical) ==='
SELECT domain_code, view_family_code, actual_view_code, logical_view_name, sensitivity_code, exposure_scope, gate_required
FROM cx22073jw.v_access_actual_view_registry_summary
WHERE domain_code IN ('casual_relationship','workforce_execution','combat_unit','clerical_execution','clerical_control','senior_clerical_control')
ORDER BY domain_code, view_family_code, logical_view_name;

\echo '=== ROLE TO ACTUAL VIEW GRANT MATRIX COUNTS ==='
SELECT domain_code, role_code, COUNT(*) AS actual_view_grant_count
FROM cx22073jw.v_access_role_actual_view_grant_matrix
GROUP BY domain_code, role_code
ORDER BY domain_code, role_code;

\echo '=== ROLE TO ACTUAL VIEW GRANT MATRIX SAMPLE (operations / streaming / game) ==='
SELECT domain_code, role_code, logical_view_name, grant_mode, gate_needed
FROM cx22073jw.v_access_role_actual_view_grant_matrix
WHERE domain_code IN ('operations','streaming','game')
ORDER BY domain_code, role_code, logical_view_name;

\echo '=== GATE CONTROLLED ACTUAL VIEWS ==='
TABLE cx22073jw.v_access_gate_controlled_actual_views;
SQL
