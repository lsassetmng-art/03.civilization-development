#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST LEGACY COMPAT AUDIT SUMMARY ==='
TABLE cx22073jw.v_access_legacy_compat_audit_latest_summary;

\echo '=== DB ITEMS ==='
TABLE cx22073jw.v_access_legacy_compat_audit_latest_db_items;

\echo '=== FILE ITEMS ==='
TABLE cx22073jw.v_access_legacy_compat_audit_latest_file_items;
SQL
