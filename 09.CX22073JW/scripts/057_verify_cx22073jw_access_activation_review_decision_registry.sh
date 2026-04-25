#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST REVIEW DECISION BATCH SUMMARY ==='
TABLE cx22073jw.v_access_activation_review_decision_latest_batch_summary;

\echo '=== REQUEST / BUCKET COUNTS ==='
SELECT
  request_code,
  review_bucket,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_activation_review_decision_latest_items
GROUP BY request_code, review_bucket
ORDER BY request_code, review_bucket;

\echo '=== APPROVED CANDIDATE ONLY ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  review_bucket,
  human_review_status,
  governed_apply_ready
FROM cx22073jw.v_access_activation_review_decision_latest_items
WHERE review_bucket = 'approved_candidate'
ORDER BY request_code, logical_view_name;

\echo '=== HOLD / REJECT ONLY ==='
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  logical_view_name,
  review_bucket,
  human_review_status,
  review_note
FROM cx22073jw.v_access_activation_review_decision_latest_items
WHERE review_bucket IN ('gate_hold','scope_hold','rank_hold','rejected_hold')
ORDER BY request_code, review_bucket, logical_view_name;

\echo '=== STATUS COUNTS ==='
SELECT
  human_review_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_activation_review_decision_latest_items
GROUP BY human_review_status
ORDER BY human_review_status;
SQL
