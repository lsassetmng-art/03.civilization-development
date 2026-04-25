#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST CURRENT STATE BUNDLE SUMMARY ==='
TABLE cx22073jw.v_access_current_state_bundle_export_latest_summary;

\echo '=== LATEST CURRENT STATE BUNDLE FILES ==='
TABLE cx22073jw.v_access_current_state_bundle_export_latest_files;
SQL
