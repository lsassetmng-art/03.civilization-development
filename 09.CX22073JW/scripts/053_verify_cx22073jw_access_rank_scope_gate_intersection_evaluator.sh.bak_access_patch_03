#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== RANK REGISTRY SUMMARY ==='
TABLE cx22073jw.v_access_rank_registry_summary;

\echo '=== APP SCOPE SUMMARY ==='
TABLE cx22073jw.v_access_app_scope_summary;

\echo '=== APP SCOPE ALLOWLIST COUNTS ==='
SELECT
  s.domain_code,
  s.app_scope_code,
  COUNT(a.actual_view_code) AS allowlisted_view_count
FROM cx22073jw.access_app_scope_registry s
LEFT JOIN cx22073jw.access_app_scope_actual_view_allowlist a
  ON a.app_scope_code = s.app_scope_code
GROUP BY s.domain_code, s.app_scope_code
ORDER BY s.domain_code, s.app_scope_code;

\echo '=== ACTIVATION INTERSECTION SUMMARY ==='
SELECT *
FROM cx22073jw.v_access_activation_request_intersection_summary
LIMIT 20;

\echo '=== DECISION STATUS COUNTS AFTER INTERSECTION ==='
SELECT
  decision_status,
  COUNT(*) AS decision_count
FROM cx22073jw.access_activation_request_view_decision
GROUP BY decision_status
ORDER BY decision_status;

\echo '=== RECENT PRIVILEGED / RESTRICTED REJECTIONS ==='
SELECT
  r.request_code,
  r.target_domain_code,
  r.target_role_code,
  d.logical_view_name,
  d.decision_status,
  d.decision_note
FROM cx22073jw.access_activation_request_view_decision d
JOIN cx22073jw.access_activation_request r
  ON r.activation_request_id = d.activation_request_id
WHERE d.decision_status = 'rejected'
ORDER BY r.created_at DESC, d.logical_view_name
LIMIT 30;

\echo '=== LATEST INTERSECTION DECISIONS ==='
TABLE cx22073jw.v_access_activation_request_latest_intersection_decisions;
SQL
