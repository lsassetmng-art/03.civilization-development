#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST REMEDIATION BATCH SUMMARY ==='
SELECT *
FROM cx22073jw.v_contract_remediation_batch_summary
LIMIT 1;

\echo '=== LATEST REMEDIATION ITEMS ==='
SELECT *
FROM cx22073jw.v_contract_remediation_item_detail
WHERE batch_code = (
  SELECT batch_code
  FROM cx22073jw.v_contract_remediation_batch_summary
  LIMIT 1
);

\echo '=== COVERAGE MISSING KEYS ONLY ==='
SELECT block_code, area_slug, target_payload_column_name, missing_contract_keys
FROM cx22073jw.v_staticart_minimum_first_send_contract_coverage
WHERE cardinality(missing_contract_keys) > 0
ORDER BY block_code, area_slug;

\echo '=== LATEST STATICART SAMPLE RUN SUMMARY ==='
SELECT
  sample_code,
  run_status,
  total_area_count,
  preflight_pass_count,
  preflight_fail_count,
  wrapper_applied_count,
  wrapper_skipped_count,
  note_text
FROM cx22073jw.v_staticart_knowledge_pack_run_latest
LIMIT 1;

\echo '=== LATEST STATICART SAMPLE RUN ITEMS ==='
TABLE cx22073jw.v_staticart_knowledge_pack_run_item_latest;

\echo '=== SAMPLE PREFLIGHT FAILURES ONLY ==='
SELECT
  area_slug,
  preflight_status,
  missing_detail_json,
  wrapper_apply_status,
  error_text
FROM cx22073jw.v_staticart_knowledge_pack_run_item_latest
WHERE preflight_status = 'fail'
ORDER BY area_slug;

\echo '=== LATEST READINESS GATE SUMMARY ==='
TABLE cx22073jw.v_readiness_gate_latest_run_summary;

\echo '=== LATEST READINESS GATE FAILED CHECKS ==='
TABLE cx22073jw.v_readiness_gate_latest_failed_checks;
SQL
