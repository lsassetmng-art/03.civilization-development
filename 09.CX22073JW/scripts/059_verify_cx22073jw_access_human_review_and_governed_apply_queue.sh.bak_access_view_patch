#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST REVIEW DECISION BATCH SUMMARY ==='
TABLE cx22073jw.v_access_activation_review_decision_latest_batch_summary;

\echo '=== LATEST HUMAN REVIEW ACTION LOG ==='
TABLE cx22073jw.v_access_human_review_latest_action_log;

\echo '=== HUMAN REVIEW STATUS COUNTS ==='
SELECT
  review_bucket,
  human_review_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_activation_review_decision_latest_items
GROUP BY review_bucket, human_review_status
ORDER BY review_bucket, human_review_status;

\echo '=== GOVERNED APPLY QUEUE LATEST SUMMARY ==='
TABLE cx22073jw.v_access_governed_apply_queue_latest_summary;

\echo '=== GOVERNED APPLY QUEUE LATEST ITEMS ==='
TABLE cx22073jw.v_access_governed_apply_queue_latest_items;

\echo '=== APPROVED + APPLY READY ITEMS IN LATEST BATCH ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  review_bucket,
  human_review_status,
  governed_apply_ready
FROM cx22073jw.v_access_activation_review_decision_latest_items
WHERE human_review_status = 'approved'
ORDER BY request_code, logical_view_name;
SQL
