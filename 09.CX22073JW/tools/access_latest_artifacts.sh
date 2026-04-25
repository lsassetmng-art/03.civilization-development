#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"

latest_dir() {
  local pattern="$1"
  find "$LOGS_DIR" -maxdepth 1 -type d -name "$pattern" 2>/dev/null | sort | tail -n 1
}

latest_file_under() {
  local dir="$1"
  local pattern="$2"
  if [ -n "${dir:-}" ] && [ -d "$dir" ]; then
    find "$dir" -maxdepth 1 -type f -name "$pattern" 2>/dev/null | sort | tail -n 1
  fi
}

latest_export_dir() {
  local sub="$1"
  if [ -d "$EXPORTS_DIR/$sub" ]; then
    find "$EXPORTS_DIR/$sub" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | sort | tail -n 1
  fi
}

LATEST_SHIFT_DIR="$(latest_dir '*_access_shift_report')"
LATEST_BUNDLE_DIR="$(latest_export_dir 'access-current-state-bundle')"
LATEST_BASELINE_DIR="$(latest_dir '*_access_baseline_health_gate')"
LATEST_RETIRE_DIR="$(latest_dir '*_access_legacy_retirement_plan_export')"
LATEST_INCIDENT_DIR="$(latest_dir '*_access_incident_bundle')"

echo "============================================================"
echo "ACCESS LATEST ARTIFACTS"
echo "============================================================"
echo "latest_shift_report_dir     : ${LATEST_SHIFT_DIR:-NOT_FOUND}"
echo "latest_shift_report_md      : $(latest_file_under "$LATEST_SHIFT_DIR" '*.md' || true)"
echo "latest_current_bundle_dir   : ${LATEST_BUNDLE_DIR:-NOT_FOUND}"
echo "latest_current_bundle_md    : $(latest_file_under "$LATEST_BUNDLE_DIR" '*.md' || true)"
echo "latest_baseline_gate_dir    : ${LATEST_BASELINE_DIR:-NOT_FOUND}"
echo "latest_retirement_plan_dir  : ${LATEST_RETIRE_DIR:-NOT_FOUND}"
echo "latest_incident_bundle_dir  : ${LATEST_INCIDENT_DIR:-NOT_FOUND}"
echo "============================================================"
echo "ACCESS LATEST ARTIFACTS DONE"
echo "============================================================"
