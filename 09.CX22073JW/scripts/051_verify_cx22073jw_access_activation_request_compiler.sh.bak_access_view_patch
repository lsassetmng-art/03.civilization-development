#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== ACTIVATION REQUEST COMPILED SUMMARY ==='
SELECT *
FROM cx22073jw.v_access_activation_request_compiled_summary
LIMIT 20;

\echo '=== REQUEST COUNTS BY DOMAIN / ROLE ==='
SELECT
  target_domain_code,
  target_role_code,
  COUNT(*) AS request_count
FROM cx22073jw.access_activation_request
GROUP BY target_domain_code, target_role_code
ORDER BY target_domain_code, target_role_code;

\echo '=== DECISION STATUS COUNTS ==='
SELECT
  decision_status,
  COUNT(*) AS decision_count
FROM cx22073jw.access_activation_request_view_decision
GROUP BY decision_status
ORDER BY decision_status;

\echo '=== LATEST REQUEST DECISIONS ==='
TABLE cx22073jw.v_access_activation_request_latest_decisions;

\echo '=== RECENT REQUESTS WITH GATE COUNTS ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  total_decision_count,
  allowed_upper_bound_count,
  requires_gate_count,
  requires_scope_count,
  requires_rank_count,
  rejected_count
FROM cx22073jw.v_access_activation_request_compiled_summary
LIMIT 10;
SQL
