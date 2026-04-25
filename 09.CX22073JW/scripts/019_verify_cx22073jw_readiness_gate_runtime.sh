#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST READINESS GATE SUMMARY ==='
TABLE cx22073jw.v_readiness_gate_latest_run_summary;

\echo '=== LATEST AREA STATUS ==='
TABLE cx22073jw.v_readiness_gate_latest_area_status;

\echo '=== FAILED CHECK COUNTS BY RULE ==='
SELECT rule_code, COUNT(*) AS failed_count
FROM cx22073jw.v_readiness_gate_latest_failed_checks
GROUP BY rule_code
ORDER BY rule_code;

\echo '=== FAILED CHECK DETAILS ==='
TABLE cx22073jw.v_readiness_gate_latest_failed_checks;

\echo '=== RULE MASTER ==='
SELECT rule_code, rule_group, comparator_code, threshold_numeric, sort_order
FROM cx22073jw.readiness_gate_rule_master
ORDER BY sort_order;

\echo '=== RUN HISTORY ==='
SELECT run_status, total_checks, passed_checks, failed_checks, target_area_count, started_at, ended_at
FROM cx22073jw.readiness_gate_run
ORDER BY started_at DESC
LIMIT 10;
SQL
