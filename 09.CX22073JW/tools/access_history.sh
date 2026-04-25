#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"

latest_dir() {
  local root="$1"
  local pattern="$2"
  if [ -d "$root" ]; then
    find "$root" -maxdepth 1 -mindepth 1 \( -type d -o -type f \) -name "$pattern" 2>/dev/null | sort | tail -n 1
  fi
}

echo "============================================================"
echo "ACCESS HISTORY"
echo "============================================================"

echo "[recent baseline health runs]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  core_status,
  legacy_status,
  operations_status,
  core_blocker_count,
  info_count,
  created_at,
  ended_at
FROM cx22073jw.access_baseline_health_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[recent legacy cutover gate runs]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  source_audit_run_code,
  readiness_status,
  blocker_count,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_cutover_gate_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[recent retirement plan runs]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  source_gate_run_code,
  readiness_status_snapshot,
  plan_status,
  legacy_view_count,
  planned_drop_count,
  blocker_count,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_retirement_plan_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[recent current-state bundle exports]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  export_root_path,
  baseline_run_code,
  legacy_gate_run_code,
  retirement_plan_run_code,
  manual_receipt_batch_code,
  confirmed_reverify_run_code,
  file_count,
  export_status,
  created_at,
  ended_at
FROM cx22073jw.access_current_state_bundle_export_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[recent db blocker patch runs]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  target_view_count,
  target_function_count,
  patched_view_count,
  patched_function_count,
  error_count,
  run_status,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_db_blocker_patch_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[filesystem latest artifacts]"
echo "latest_shift_report_dir      : $(latest_dir "$LOGS_DIR" '*_access_shift_report' || true)"
echo "latest_incident_bundle_dir   : $(latest_dir "$LOGS_DIR" '*_access_incident_bundle' || true)"
echo "latest_timeline_report_dir   : $(latest_dir "$LOGS_DIR" '*_access_timeline_report' || true)"
echo "latest_current_bundle_dir    : $(latest_dir "$EXPORTS_DIR/access-current-state-bundle" '*' || true)"
echo "latest_retirement_export_dir : $(latest_dir "$EXPORTS_DIR/access-legacy-retirement-plan" '*' || true)"

echo "============================================================"
echo "ACCESS HISTORY DONE"
echo "============================================================"
