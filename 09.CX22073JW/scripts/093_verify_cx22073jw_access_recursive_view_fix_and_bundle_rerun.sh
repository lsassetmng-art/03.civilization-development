#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== RECEIPT BATCH SUMMARY ==='
TABLE cx22073jw.v_access_manual_apply_receipt_latest_batch_summary;

\echo '=== RECEIPT PENDING SUMMARY ==='
TABLE cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;

\echo '=== CONFIRMED-ONLY REVERIFY SUMMARY ==='
TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;

\echo '=== CURRENT STATE BUNDLE SUMMARY ==='
TABLE cx22073jw.v_access_current_state_bundle_export_latest_summary;

\echo '=== CURRENT STATE BUNDLE FILES ==='
TABLE cx22073jw.v_access_current_state_bundle_export_latest_files;
SQL
