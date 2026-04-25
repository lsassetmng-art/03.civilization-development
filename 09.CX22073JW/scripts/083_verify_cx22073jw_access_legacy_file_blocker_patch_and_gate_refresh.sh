#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST CUTOVER GATE SUMMARY ==='
TABLE cx22073jw.v_access_legacy_cutover_gate_latest_summary;

\echo '=== LATEST CUTOVER GATE BLOCKER COUNTS ==='
SELECT
  blocker_group,
  COUNT(*) AS blocker_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
GROUP BY blocker_group
ORDER BY blocker_group;

\echo '=== LATEST CUTOVER GATE BLOCKERS ==='
TABLE cx22073jw.v_access_legacy_cutover_gate_latest_blockers;
SQL
