#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
OUT_DIR="$BASE/logs/$(date +%Y%m%d_%H%M%S)_access_command_matrix"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
MATRIX_TSV="$OUT_DIR/010_command_matrix.tsv"
MATRIX_MD="$OUT_DIR/020_command_matrix.md"

mkdir -p "$OUT_DIR"

describe_category() {
  case "$1" in
    access_status.sh|access_dashboard.sh|access_doctor.sh|access_validate_workspace.sh) echo "status-health" ;;
    access_legacy_readiness.sh|access_open_blockers.sh|access_compare_latest_runs.sh) echo "readiness-blockers" ;;
    access_show_latest_batch.sh|access_confirm_request.sh|access_reverify_confirmed.sh|access_list_pending_requests.sh|access_bulk_confirm_all_pending.sh|access_bulk_apply_cycle.sh) echo "manual-apply" ;;
    access_export_current_bundle.sh|access_make_master_bundle.sh|access_make_regression_bundle.sh) echo "bundle-export" ;;
    access_make_shift_report.sh|access_make_timeline_report.sh|access_make_delta_report.sh|access_make_checkpoint_diff_report.sh) echo "report" ;;
    access_trace_request.sh|access_trace_logical_view.sh|access_make_request_trace_bundle.sh|access_make_logical_view_trace_bundle.sh) echo "trace" ;;
    access_make_checkpoint.sh|access_list_checkpoints.sh|access_compare_checkpoints.sh) echo "checkpoint" ;;
    access_refresh_latest_links.sh|access_show_latest_links.sh|access_latest_artifacts.sh) echo "latest-artifacts" ;;
    access_catalog.sh|access_find_keyword.sh|access_quickstart.sh) echo "catalog-onboarding" ;;
    access_menu.sh|access_daily_refresh.sh|access_run_review_flow.sh|access_run_request_investigation_flow.sh|access_run_handoff_flow.sh|access_run_master_flow.sh|access_smoke_suite.sh) echo "flow-suite" ;;
    access_history.sh) echo "history" ;;
    access_collect_incident_bundle.sh) echo "incident" ;;
    *) echo "other" ;;
  esac
}

describe_purpose() {
  case "$1" in
    access_status.sh) echo "latest status snapshot" ;;
    access_dashboard.sh) echo "concise operations dashboard" ;;
    access_doctor.sh) echo "workspace and DB doctor check" ;;
    access_validate_workspace.sh) echo "workspace integrity validation" ;;
    access_quickstart.sh) echo "recommended operator flows" ;;
    access_make_command_matrix.sh) echo "command inventory export" ;;
    access_run_master_flow.sh) echo "high-level routine flow" ;;
    access_make_master_bundle.sh) echo "high-level bundle export" ;;
    *) echo "see README / command help" ;;
  esac
}

: > "$MATRIX_TSV"
printf 'category\tcommand_name\tpath\tpurpose\n' >> "$MATRIX_TSV"

find "$TOOLS_DIR" -maxdepth 1 -type f | sort | while IFS= read -r path; do
  [ -n "${path:-}" ] || continue
  name="$(basename "$path")"
  category="$(describe_category "$name")"
  purpose="$(describe_purpose "$name")"
  printf '%s\t%s\t%s\t%s\n' "$category" "$name" "$path" "$purpose" >> "$MATRIX_TSV"
done

cat > "$MANIFEST_MD" <<EOF_COMMAND_MATRIX_MANIFEST
# ============================================================
# ACCESS COMMAND MATRIX MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_command_matrix.tsv
- 020_command_matrix.md
EOF_COMMAND_MATRIX_MANIFEST

{
  echo "# ============================================================"
  echo "# ACCESS COMMAND MATRIX"
  echo "# ============================================================"
  echo
  echo "generated_at: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "out_dir: $OUT_DIR"
  echo
  echo "| category | command_name | purpose |"
  echo "|---|---|---|"
  awk -F $'\t' 'NR>1{printf "| %s | %s | %s |\n",$1,$2,$4}' "$MATRIX_TSV"
} > "$MATRIX_MD"

echo "============================================================"
echo "ACCESS COMMAND MATRIX CREATED"
echo "============================================================"
echo "out_dir    : $OUT_DIR"
echo "manifest_md: $MANIFEST_MD"
echo "matrix_md  : $MATRIX_MD"
echo "============================================================"
sed -n '1,120p' "$MATRIX_MD"
