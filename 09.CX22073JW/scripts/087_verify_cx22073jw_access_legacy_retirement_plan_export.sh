#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST RETIREMENT PLAN SUMMARY ==='
TABLE cx22073jw.v_access_legacy_retirement_plan_latest_summary;

\echo '=== ITEM COUNTS ==='
SELECT
  item_group,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_legacy_retirement_plan_latest_items
GROUP BY item_group
ORDER BY item_group;

\echo '=== ITEMS ==='
TABLE cx22073jw.v_access_legacy_retirement_plan_latest_items;
SQL
