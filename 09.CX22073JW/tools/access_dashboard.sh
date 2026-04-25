#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

view_exists() {
  local v="$1"
  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | grep -qx 't'
SELECT EXISTS (
  SELECT 1
  FROM information_schema.views
  WHERE table_schema = 'cx22073jw'
    AND table_name = '$v'
);
SQL
}

echo "============================================================"
echo "ACCESS DASHBOARD"
echo "============================================================"

if view_exists "v_access_baseline_health_latest_summary"; then
  echo "[baseline health]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  core_status,
  legacy_status,
  operations_status,
  core_blocker_count,
  info_count,
  created_at
FROM cx22073jw.v_access_baseline_health_latest_summary;
SQL
else
  echo "VIEW_MISSING: v_access_baseline_health_latest_summary"
fi

if view_exists "v_access_legacy_cutover_gate_latest_summary"; then
  echo "[legacy cutover]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  db_hit_count,
  file_hit_count,
  blocker_count,
  readiness_status,
  created_at
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary;
SQL
else
  echo "VIEW_MISSING: v_access_legacy_cutover_gate_latest_summary"
fi

if view_exists "v_access_legacy_retirement_plan_latest_summary"; then
  echo "[retirement plan]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  readiness_status_snapshot,
  legacy_view_count,
  planned_drop_count,
  blocker_count,
  plan_status,
  created_at
FROM cx22073jw.v_access_legacy_retirement_plan_latest_summary;
SQL
else
  echo "VIEW_MISSING: v_access_legacy_retirement_plan_latest_summary"
fi

if view_exists "v_access_manual_apply_receipt_latest_pending_summary"; then
  echo "[manual pending]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;
SQL
else
  echo "VIEW_MISSING: v_access_manual_apply_receipt_latest_pending_summary"
fi

if view_exists "v_access_post_apply_verification_latest_confirmed_only_summary"; then
  echo "[confirmed-only reverify]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL
else
  echo "VIEW_MISSING: v_access_post_apply_verification_latest_confirmed_only_summary"
fi

if view_exists "v_access_current_state_bundle_export_latest_summary"; then
  echo "[current-state bundle]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  export_root_path,
  file_count,
  export_status,
  created_at
FROM cx22073jw.v_access_current_state_bundle_export_latest_summary;
SQL
else
  echo "VIEW_MISSING: v_access_current_state_bundle_export_latest_summary"
fi

if view_exists "v_access_baseline_health_latest_items"; then
  echo "[open core blockers]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  check_code,
  observed_value,
  expected_rule,
  check_status
FROM cx22073jw.v_access_baseline_health_latest_items
WHERE severity = 'blocker'
  AND check_status = 'fail'
ORDER BY check_code;
SQL
else
  echo "VIEW_MISSING: v_access_baseline_health_latest_items"
fi

echo "============================================================"
echo "ACCESS DASHBOARD DONE"
echo "============================================================"
