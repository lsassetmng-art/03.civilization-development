#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
SCRIPTS_DIR="$BASE/scripts"
DOCS_DIR="$BASE/docs"
LATEST_DIR="$BASE/latest"
LOGS_DIR="$BASE/logs"

count_files() {
  local dir_path="$1"
  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -type f | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
}

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

latest_link_target() {
  local name="$1"
  local p="$LATEST_DIR/$name"
  if [ -L "$p" ]; then
    readlink "$p" || true
  elif [ -e "$p" ]; then
    printf '%s\n' "$p"
  fi
}

TOOLS_COUNT="$(count_files "$TOOLS_DIR")"
SCRIPTS_COUNT="$(count_files "$SCRIPTS_DIR")"
DOCS_COUNT="$(count_files "$DOCS_DIR")"
LOG_DIR_COUNT="$(
  if [ -d "$LOGS_DIR" ]; then
    find "$LOGS_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
)"
LATEST_ENTRY_COUNT="$(
  if [ -d "$LATEST_DIR" ]; then
    find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
)"

echo "============================================================"
echo "ACCESS END STATE"
echo "============================================================"
echo "[workspace inventory]"
echo "tools_count=$TOOLS_COUNT"
echo "scripts_count=$SCRIPTS_COUNT"
echo "docs_count=$DOCS_COUNT"
echo "log_dir_count=$LOG_DIR_COUNT"
echo "latest_entry_count=$LATEST_ENTRY_COUNT"

echo
echo "[db snapshot]"
if view_exists "v_access_baseline_health_latest_summary"; then
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

if view_exists "v_access_current_state_bundle_export_latest_summary"; then
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

echo
echo "[latest pointers]"
echo "latest_shift_report_dir=$(latest_link_target latest_shift_report_dir)"
echo "latest_incident_bundle_dir=$(latest_link_target latest_incident_bundle_dir)"
echo "latest_timeline_report_dir=$(latest_link_target latest_timeline_report_dir)"
echo "latest_current_bundle_dir=$(latest_link_target latest_current_bundle_dir)"
echo "latest_current_bundle_handoff_md=$(latest_link_target latest_current_bundle_handoff_md)"
echo "latest_retirement_plan_dir=$(latest_link_target latest_retirement_plan_dir)"

echo
echo "[recommended commands]"
echo "./access_dashboard.sh"
echo "./access_release_readiness.sh"
echo "./access_make_final_handoff_bundle.sh"
echo "./access_make_workspace_manifest.sh"
echo "./access_make_operator_handbook.sh"

echo "============================================================"
echo "ACCESS END STATE DONE"
echo "============================================================"
