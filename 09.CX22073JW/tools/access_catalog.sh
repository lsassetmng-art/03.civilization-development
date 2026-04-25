#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

print_entry() {
  local file_name="$1"
  local description="$2"
  local full_path="$TOOLS_DIR/$file_name"

  if [ -x "$full_path" ]; then
    printf '%-42s | %s\n' "./$file_name" "$description"
  fi
}

echo "============================================================"
echo "ACCESS CATALOG"
echo "============================================================"

echo "[core status / readiness]"
print_entry "access_status.sh" "latest baseline / pending / reverify / bundle summary"
print_entry "access_legacy_readiness.sh" "latest legacy cutover and retirement readiness"
print_entry "access_doctor.sh" "environment / table / view / self-reference health check"

echo
echo "[daily / launcher]"
print_entry "access_menu.sh" "interactive launcher menu"
print_entry "access_daily_refresh.sh" "baseline refresh + bundle export + status + legacy readiness"

echo
echo "[manual apply / batch]"
print_entry "access_show_latest_batch.sh" "show latest manual receipt batch"
print_entry "access_confirm_request.sh" "confirm one request"
print_entry "access_reverify_confirmed.sh" "run confirmed-only reverify"
print_entry "access_list_pending_requests.sh" "list pending request_code values"
print_entry "access_bulk_confirm_all_pending.sh" "bulk confirm all pending requests"
print_entry "access_bulk_apply_cycle.sh" "bulk confirm + reverify + bundle export"

echo
echo "[blockers / reports]"
print_entry "access_open_blockers.sh" "show current blockers"
print_entry "access_make_shift_report.sh" "generate shift handoff report"
print_entry "access_history.sh" "show recent run history"
print_entry "access_make_timeline_report.sh" "generate timeline report"

echo
echo "[artifacts / bundles / incident]"
print_entry "access_export_current_bundle.sh" "export current-state bundle"
print_entry "access_latest_artifacts.sh" "show latest artifact locations"
print_entry "access_collect_incident_bundle.sh" "collect incident evidence bundle"
print_entry "access_refresh_latest_links.sh" "refresh latest/ symlinks"
print_entry "access_show_latest_links.sh" "show latest/ symlinks"

echo
echo "[trace / investigation]"
print_entry "access_trace_request.sh" "trace one request_code"
print_entry "access_trace_logical_view.sh" "trace one logical_view_name"
print_entry "access_make_request_trace_bundle.sh" "export request trace bundle"
print_entry "access_make_logical_view_trace_bundle.sh" "export logical-view trace bundle"

echo
echo "[catalog / search]"
print_entry "access_catalog.sh" "show this catalog"
print_entry "access_find_keyword.sh" "search tools / docs / scripts by keyword"

echo
echo "[inventory]"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort

echo "============================================================"
echo "ACCESS CATALOG DONE"
echo "============================================================"
