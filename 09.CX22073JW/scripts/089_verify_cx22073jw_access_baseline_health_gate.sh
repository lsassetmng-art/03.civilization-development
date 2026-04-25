#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST BASELINE HEALTH SUMMARY ==='
TABLE cx22073jw.v_access_baseline_health_latest_summary;

\echo '=== CHECK COUNTS ==='
SELECT
  check_group,
  severity,
  check_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_baseline_health_latest_items
GROUP BY check_group, severity, check_status
ORDER BY check_group, severity, check_status;

\echo '=== CHECK ITEMS ==='
TABLE cx22073jw.v_access_baseline_health_latest_items;
SQL
