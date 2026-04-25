#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

echo "============================================================"
echo "ACCESS LEGACY READINESS"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  source_audit_run_code,
  db_hit_count,
  file_hit_count,
  blocker_count,
  readiness_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary;

SELECT
  run_code,
  source_gate_run_code,
  readiness_status_snapshot,
  legacy_view_count,
  planned_drop_count,
  blocker_count,
  plan_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.v_access_legacy_retirement_plan_latest_summary;

SELECT
  blocker_group,
  COUNT(*) AS blocker_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
GROUP BY blocker_group
ORDER BY blocker_group;
SQL

echo "============================================================"
echo "ACCESS LEGACY READINESS DONE"
echo "============================================================"
