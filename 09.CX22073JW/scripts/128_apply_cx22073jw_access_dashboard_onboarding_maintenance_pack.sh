#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"
LOGS_DIR="$BASE/logs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR" "$LOGS_DIR"

cat > "$TOOLS_DIR/access_dashboard.sh" <<'ACCESS_DASHBOARD_CMD'
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
ACCESS_DASHBOARD_CMD
chmod +x "$TOOLS_DIR/access_dashboard.sh"

cat > "$TOOLS_DIR/access_quickstart.sh" <<'ACCESS_QUICKSTART_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

echo "============================================================"
echo "ACCESS QUICKSTART"
echo "============================================================"

cat <<'ACCESS_QUICKSTART_TEXT'
[1] 朝の確認
- ./access_dashboard.sh
- ./access_run_review_flow.sh
- ./access_legacy_readiness.sh

[2] pending 対応
- ./access_list_pending_requests.sh
- ./access_trace_request.sh REQUEST_CODE
- ./access_confirm_request.sh REQUEST_CODE confirmed_applied
- ./access_reverify_confirmed.sh
- ./access_export_current_bundle.sh

[3] 一括処理
- ./access_bulk_confirm_all_pending.sh confirmed_applied
- ./access_bulk_apply_cycle.sh confirmed_applied

[4] 調査
- ./access_trace_request.sh REQUEST_CODE
- ./access_trace_logical_view.sh LOGICAL_VIEW_NAME
- ./access_make_request_trace_bundle.sh REQUEST_CODE
- ./access_make_logical_view_trace_bundle.sh LOGICAL_VIEW_NAME

[5] 引き継ぎ
- ./access_make_shift_report.sh
- ./access_make_timeline_report.sh
- ./access_make_master_bundle.sh
- ./access_refresh_latest_links.sh
- ./access_show_latest_links.sh

[6] 健全性 / 回帰
- ./access_doctor.sh
- ./access_validate_workspace.sh
- ./access_smoke_suite.sh
- ./access_make_regression_bundle.sh

[7] checkpoint / 差分
- ./access_make_checkpoint.sh
- ./access_list_checkpoints.sh
- ./access_compare_checkpoints.sh
- ./access_make_checkpoint_diff_report.sh

[8] 全体まとめ
- ./access_run_master_flow.sh
- ./access_make_master_bundle.sh
ACCESS_QUICKSTART_TEXT

echo "============================================================"
echo "ACCESS QUICKSTART DONE"
echo "============================================================"
ACCESS_QUICKSTART_CMD
chmod +x "$TOOLS_DIR/access_quickstart.sh"

cat > "$TOOLS_DIR/access_validate_workspace.sh" <<'ACCESS_VALIDATE_WORKSPACE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"
LATEST_DIR="$BASE/latest"

pass_count=0
warn_count=0
fail_count=0

pass() {
  pass_count=$((pass_count + 1))
  printf 'PASS | %s\n' "$1"
}

warn() {
  warn_count=$((warn_count + 1))
  printf 'WARN | %s\n' "$1"
}

fail() {
  fail_count=$((fail_count + 1))
  printf 'FAIL | %s\n' "$1"
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

echo "============================================================"
echo "ACCESS VALIDATE WORKSPACE"
echo "============================================================"

for dir_path in "$TOOLS_DIR" "$DOCS_DIR" "$LATEST_DIR"; do
  if [ -d "$dir_path" ]; then
    pass "dir exists: $dir_path"
  else
    fail "dir missing: $dir_path"
  fi
done

for file_path in \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md" \
  "$TOOLS_DIR/access_dashboard.sh" \
  "$TOOLS_DIR/access_quickstart.sh" \
  "$TOOLS_DIR/access_validate_workspace.sh" \
  "$TOOLS_DIR/access_make_command_matrix.sh" \
  "$TOOLS_DIR/access_run_master_flow.sh" \
  "$TOOLS_DIR/access_make_master_bundle.sh"
do
  if [ -e "$file_path" ]; then
    if [ -x "$file_path" ] || [ "${file_path##*.}" = "md" ]; then
      pass "file exists: $file_path"
    else
      warn "file exists but not executable: $file_path"
    fi
  else
    fail "file missing: $file_path"
  fi
done

for v in \
  v_access_baseline_health_latest_summary \
  v_access_baseline_health_latest_items \
  v_access_legacy_cutover_gate_latest_summary \
  v_access_legacy_retirement_plan_latest_summary \
  v_access_manual_apply_receipt_latest_pending_summary \
  v_access_post_apply_verification_latest_confirmed_only_summary \
  v_access_current_state_bundle_export_latest_summary
do
  if view_exists "$v"; then
    pass "view exists: cx22073jw.$v"
  else
    fail "view missing: cx22073jw.$v"
  fi
done

latest_entry_count="$(find "$LATEST_DIR" -maxdepth 1 -mindepth 1 2>/dev/null | wc -l | tr -d '[:space:]' || true)"
case "${latest_entry_count:-}" in
  ''|*[!0-9]*) latest_entry_count=0 ;;
esac

if [ "$latest_entry_count" -gt 0 ]; then
  pass "latest dir has entries: $latest_entry_count"
else
  warn "latest dir has no entries"
fi

echo "============================================================"
echo "ACCESS VALIDATE WORKSPACE SUMMARY"
echo "============================================================"
echo "pass_count=$pass_count"
echo "warn_count=$warn_count"
echo "fail_count=$fail_count"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
ACCESS_VALIDATE_WORKSPACE_CMD
chmod +x "$TOOLS_DIR/access_validate_workspace.sh"

cat > "$TOOLS_DIR/access_make_command_matrix.sh" <<'ACCESS_COMMAND_MATRIX_CMD'
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
ACCESS_COMMAND_MATRIX_CMD
chmod +x "$TOOLS_DIR/access_make_command_matrix.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_dashboard.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_128'

dashboard_onboarding_commands:
- ./access_dashboard.sh
- ./access_quickstart.sh
- ./access_validate_workspace.sh
- ./access_make_command_matrix.sh

recommended_entry_flow:
1. ./access_dashboard.sh
2. ./access_quickstart.sh
3. ./access_validate_workspace.sh
4. ./access_make_command_matrix.sh
README_APPEND_128
  fi
else
  cat > "$README_FILE" <<'README_NEW_128'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

dashboard_onboarding_commands:
- ./access_dashboard.sh
- ./access_quickstart.sh
- ./access_validate_workspace.sh
- ./access_make_command_matrix.sh
README_NEW_128
fi

echo "============================================================"
echo "ACCESS DASHBOARD ONBOARDING MAINTENANCE PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
