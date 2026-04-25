#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
SCRIPTS_DIR="$BASE/scripts"
DOCS_DIR="$BASE/docs"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
LATEST_DIR="$BASE/latest"

count_files() {
  local dir_path="$1"
  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -type f | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
}

count_dirs() {
  local dir_path="$1"
  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
}

count_named_dirs() {
  local dir_path="$1"
  local pattern="$2"
  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -type d -name "$pattern" | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
}

dir_size_kb() {
  local dir_path="$1"
  if [ -d "$dir_path" ]; then
    du -sk "$dir_path" 2>/dev/null | awk '{print $1}'
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

TOOLS_COUNT="$(count_files "$TOOLS_DIR")"
SCRIPTS_COUNT="$(count_files "$SCRIPTS_DIR")"
DOCS_COUNT="$(count_files "$DOCS_DIR")"
LOG_DIR_COUNT="$(count_dirs "$LOGS_DIR")"
EXPORT_DIR_COUNT="$(count_dirs "$EXPORTS_DIR")"
LATEST_ENTRY_COUNT="$(
  if [ -d "$LATEST_DIR" ]; then
    find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
)"
CHECKPOINT_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_checkpoint')"
SHIFT_REPORT_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_shift_report')"
TIMELINE_REPORT_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_timeline_report')"
INCIDENT_BUNDLE_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_incident_bundle')"
MASTER_BUNDLE_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_master_bundle')"
REGRESSION_BUNDLE_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_regression_bundle')"
STORAGE_REPORT_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_storage_report')"

BASE_SIZE_KB="$(dir_size_kb "$BASE")"
LOGS_SIZE_KB="$(dir_size_kb "$LOGS_DIR")"
EXPORTS_SIZE_KB="$(dir_size_kb "$EXPORTS_DIR")"
TOOLS_SIZE_KB="$(dir_size_kb "$TOOLS_DIR")"
DOCS_SIZE_KB="$(dir_size_kb "$DOCS_DIR")"

BASELINE_STATUS="unknown"
LEGACY_STATUS="unknown"
OPERATIONS_STATUS="unknown"
CORE_BLOCKER_COUNT="0"

if view_exists "v_access_baseline_health_latest_summary"; then
  BASELINE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"
  LEGACY_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(legacy_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"
  OPERATIONS_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(operations_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"
  CORE_BLOCKER_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_blocker_count::text, '0')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"
fi

echo "============================================================"
echo "ACCESS WORKSPACE STATS"
echo "============================================================"
echo "[inventory counts]"
echo "tools_count=$TOOLS_COUNT"
echo "scripts_count=$SCRIPTS_COUNT"
echo "docs_count=$DOCS_COUNT"
echo "log_dir_count=$LOG_DIR_COUNT"
echo "export_dir_count=$EXPORT_DIR_COUNT"
echo "latest_entry_count=$LATEST_ENTRY_COUNT"
echo
echo "[artifact family counts]"
echo "checkpoint_count=$CHECKPOINT_COUNT"
echo "shift_report_count=$SHIFT_REPORT_COUNT"
echo "timeline_report_count=$TIMELINE_REPORT_COUNT"
echo "incident_bundle_count=$INCIDENT_BUNDLE_COUNT"
echo "master_bundle_count=$MASTER_BUNDLE_COUNT"
echo "regression_bundle_count=$REGRESSION_BUNDLE_COUNT"
echo "storage_report_count=$STORAGE_REPORT_COUNT"
echo
echo "[size kb]"
echo "base_size_kb=$BASE_SIZE_KB"
echo "logs_size_kb=$LOGS_SIZE_KB"
echo "exports_size_kb=$EXPORTS_SIZE_KB"
echo "tools_size_kb=$TOOLS_SIZE_KB"
echo "docs_size_kb=$DOCS_SIZE_KB"
echo
echo "[db snapshot]"
echo "baseline_status=$BASELINE_STATUS"
echo "legacy_status=$LEGACY_STATUS"
echo "operations_status=$OPERATIONS_STATUS"
echo "core_blocker_count=$CORE_BLOCKER_COUNT"
echo "============================================================"
echo "ACCESS WORKSPACE STATS DONE"
echo "============================================================"
