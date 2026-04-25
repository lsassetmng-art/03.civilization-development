#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== DOMAIN SUMMARY ==='
TABLE cx22073jw.v_access_domain_bootstrap_summary;

\echo '=== GLOBAL RULES ==='
SELECT rule_code, rule_group, rule_text
FROM cx22073jw.access_global_rule_registry
ORDER BY rule_group, rule_code;

\echo '=== DOMAIN RULES ==='
SELECT domain_code, rule_code, rule_text
FROM cx22073jw.access_domain_rule_registry
ORDER BY domain_code, rule_code;

\echo '=== VIEW FAMILY SUMMARY ==='
SELECT domain_code, sensitivity_code, COUNT(*) AS family_count
FROM cx22073jw.access_view_family_master
GROUP BY domain_code, sensitivity_code
ORDER BY domain_code, sensitivity_code;

\echo '=== SAMPLE ROLE POLICY MATRIX (operations / streaming / game) ==='
SELECT domain_code, role_code, view_family_code, access_mode, scope_note
FROM cx22073jw.v_access_role_policy_matrix
WHERE domain_code IN ('operations','streaming','game')
ORDER BY domain_code, role_code, view_family_code;

\echo '=== SAMPLE ROLE POLICY MATRIX (education / qualification_prep / utility_assist) ==='
SELECT domain_code, role_code, view_family_code, access_mode, scope_note
FROM cx22073jw.v_access_role_policy_matrix
WHERE domain_code IN ('education','qualification_prep','utility_assist')
ORDER BY domain_code, role_code, view_family_code;

\echo '=== SAMPLE ROLE POLICY MATRIX (casual / workforce / combat / clerical) ==='
SELECT domain_code, role_code, view_family_code, access_mode, scope_note
FROM cx22073jw.v_access_role_policy_matrix
WHERE domain_code IN ('casual_relationship','workforce_execution','combat_unit','clerical_execution','clerical_control','senior_clerical_control')
ORDER BY domain_code, role_code, view_family_code;

\echo '=== PRIVILEGED / RESTRICTED / SAFETY FAMILIES ==='
TABLE cx22073jw.v_access_privileged_family_summary;
SQL
