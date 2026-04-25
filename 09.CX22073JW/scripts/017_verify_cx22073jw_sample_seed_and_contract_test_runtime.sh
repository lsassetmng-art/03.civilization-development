#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== SAMPLE CASE COUNTS ==='
TABLE cx22073jw.v_exact_contract_sample_case_summary;

\echo '=== SAMPLE RUN SUMMARY ==='
TABLE cx22073jw.v_exact_contract_sample_run_summary;

\echo '=== VALID CASE LATEST RUNS ==='
SELECT case_code, area_slug, execution_status, result_row_id
FROM cx22073jw.v_exact_contract_sample_run_latest
WHERE case_kind = 'valid_sample'
ORDER BY case_code;

\echo '=== INVALID CASE LATEST RUNS ==='
SELECT case_code, area_slug, execution_status, error_text
FROM cx22073jw.v_exact_contract_sample_run_latest
WHERE case_kind = 'invalid_contract'
ORDER BY case_code;

\echo '=== VALIDATION ISSUE LOG ==='
SELECT area_slug, payload_column_name, missing_keys, created_at
FROM cx22073jw.exact_payload_validation_issue_log
ORDER BY created_at DESC;

\echo '=== SAMPLE PHYSICAL ROW CHECK ==='
SELECT 'streaming_category_tree_area' AS area_name, COUNT(*) AS row_count FROM cx22073jw.streaming_category_tree_area
UNION ALL
SELECT 'streaming_view_history_area', COUNT(*) FROM cx22073jw.streaming_view_history_area
UNION ALL
SELECT 'streaming_continue_watching_area', COUNT(*) FROM cx22073jw.streaming_continue_watching_area
UNION ALL
SELECT 'streaming_progress_resume_area', COUNT(*) FROM cx22073jw.streaming_progress_resume_area
UNION ALL
SELECT 'static_art_asset_area', COUNT(*) FROM cx22073jw.static_art_asset_area
UNION ALL
SELECT 'asset_metadata_localization_area', COUNT(*) FROM cx22073jw.asset_metadata_localization_area
UNION ALL
SELECT 'streaming_publish_setting_area', COUNT(*) FROM cx22073jw.streaming_publish_setting_area
UNION ALL
SELECT 'streaming_connector_audit_area', COUNT(*) FROM cx22073jw.streaming_connector_audit_area
ORDER BY area_name;
SQL
