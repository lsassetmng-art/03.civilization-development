#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
LATEST_DIR="$BASE/latest"

mkdir -p "$LATEST_DIR"

latest_log_dir() {
  local pattern="$1"
  find "$LOGS_DIR" -maxdepth 1 -type d -name "$pattern" 2>/dev/null | sort | tail -n 1
}

latest_export_dir() {
  local sub="$1"
  if [ -d "$EXPORTS_DIR/$sub" ]; then
    find "$EXPORTS_DIR/$sub" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | sort | tail -n 1
  fi
}

latest_file_in_dir() {
  local dir="$1"
  local pattern="$2"
  if [ -n "${dir:-}" ] && [ -d "$dir" ]; then
    find "$dir" -maxdepth 1 -type f -name "$pattern" 2>/dev/null | sort | head -n 1
  fi
}

link_if_exists() {
  local target="$1"
  local link_name="$2"
  if [ -n "${target:-}" ] && [ -e "$target" ]; then
    ln -sfn "$target" "$LATEST_DIR/$link_name"
    printf 'LINKED\t%s\t%s\n' "$link_name" "$target"
  else
    printf 'MISSING\t%s\t%s\n' "$link_name" "${target:-NOT_FOUND}"
  fi
}

LATEST_SHIFT_DIR="$(latest_log_dir '*_access_shift_report')"
LATEST_INCIDENT_DIR="$(latest_log_dir '*_access_incident_bundle')"
LATEST_TIMELINE_DIR="$(latest_log_dir '*_access_timeline_report')"
LATEST_BASELINE_DIR="$(latest_log_dir '*_access_baseline_health_gate')"
LATEST_HISTORY_DIR="$(latest_log_dir '*_access_history_timeline_pack' || true)"
LATEST_CURRENT_BUNDLE_DIR="$(latest_export_dir 'access-current-state-bundle')"
LATEST_RETIREMENT_DIR="$(latest_export_dir 'access-legacy-retirement-plan')"

LATEST_SHIFT_MD="$(latest_file_in_dir "$LATEST_SHIFT_DIR" '000_access_shift_report.md')"
LATEST_INCIDENT_MD="$(latest_file_in_dir "$LATEST_INCIDENT_DIR" '010_incident_summary.md')"
LATEST_TIMELINE_MD="$(latest_file_in_dir "$LATEST_TIMELINE_DIR" '000_access_timeline_report.md')"
LATEST_CURRENT_MANIFEST="$(latest_file_in_dir "$LATEST_CURRENT_BUNDLE_DIR" '000_manifest.md')"
LATEST_CURRENT_HANDOFF="$(latest_file_in_dir "$LATEST_CURRENT_BUNDLE_DIR" '070_current_state_handoff.md')"
LATEST_RETIREMENT_MANIFEST="$(latest_file_in_dir "$LATEST_RETIREMENT_DIR" '000_manifest.md')"

echo "============================================================"
echo "ACCESS REFRESH LATEST LINKS"
echo "============================================================"

link_if_exists "$LATEST_SHIFT_DIR" "latest_shift_report_dir"
link_if_exists "$LATEST_SHIFT_MD" "latest_shift_report_md"

link_if_exists "$LATEST_INCIDENT_DIR" "latest_incident_bundle_dir"
link_if_exists "$LATEST_INCIDENT_MD" "latest_incident_summary_md"

link_if_exists "$LATEST_TIMELINE_DIR" "latest_timeline_report_dir"
link_if_exists "$LATEST_TIMELINE_MD" "latest_timeline_report_md"

link_if_exists "$LATEST_BASELINE_DIR" "latest_baseline_health_dir"

link_if_exists "$LATEST_CURRENT_BUNDLE_DIR" "latest_current_bundle_dir"
link_if_exists "$LATEST_CURRENT_MANIFEST" "latest_current_bundle_manifest_md"
link_if_exists "$LATEST_CURRENT_HANDOFF" "latest_current_bundle_handoff_md"

link_if_exists "$LATEST_RETIREMENT_DIR" "latest_retirement_plan_dir"
link_if_exists "$LATEST_RETIREMENT_MANIFEST" "latest_retirement_manifest_md"

link_if_exists "$BASE/tools" "tools_dir"
link_if_exists "$BASE/docs" "docs_dir"
link_if_exists "$BASE/logs" "logs_dir"
link_if_exists "$BASE/exports" "exports_dir"

echo "============================================================"
echo "ACCESS REFRESH LATEST LINKS DONE"
echo "latest_dir: $LATEST_DIR"
echo "============================================================"
