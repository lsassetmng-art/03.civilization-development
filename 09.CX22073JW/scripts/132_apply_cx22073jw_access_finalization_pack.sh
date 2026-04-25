#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_release_readiness.sh" <<'ACCESS_RELEASE_READINESS_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_release_readiness"
SUMMARY_TXT="$OUT_DIR/000_summary.txt"
RESULTS_TSV="$OUT_DIR/010_results.tsv"

mkdir -p "$OUT_DIR"
: > "$RESULTS_TSV"

pass_count=0
warn_count=0
fail_count=0

run_one() {
  local label="$1"
  local path="$2"
  local out_file="$3"

  if [ ! -x "$path" ]; then
    printf '%s\t%s\t%s\n' "missing" "$label" "$path" >> "$RESULTS_TSV"
    warn_count=$((warn_count + 1))
    return 0
  fi

  if "$path" > "$out_file" 2>&1; then
    printf '%s\t%s\t%s\n' "pass" "$label" "$path" >> "$RESULTS_TSV"
    pass_count=$((pass_count + 1))
  else
    printf '%s\t%s\t%s\n' "fail" "$label" "$path" >> "$RESULTS_TSV"
    fail_count=$((fail_count + 1))
  fi
}

echo "============================================================"
echo "ACCESS RELEASE READINESS"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

run_one "dashboard" "$TOOLS_DIR/access_dashboard.sh" "$OUT_DIR/100_dashboard.log"
run_one "doctor" "$TOOLS_DIR/access_doctor.sh" "$OUT_DIR/110_doctor.log"
run_one "validate_workspace" "$TOOLS_DIR/access_validate_workspace.sh" "$OUT_DIR/120_validate_workspace.log"
run_one "review_flow" "$TOOLS_DIR/access_run_review_flow.sh" "$OUT_DIR/130_review_flow.log"
run_one "compare_latest_runs" "$TOOLS_DIR/access_compare_latest_runs.sh" "$OUT_DIR/140_compare_latest_runs.log"
run_one "workspace_stats" "$TOOLS_DIR/access_workspace_stats.sh" "$OUT_DIR/150_workspace_stats.log"
run_one "smoke_suite" "$TOOLS_DIR/access_smoke_suite.sh" "$OUT_DIR/160_smoke_suite.log"

cat > "$SUMMARY_TXT" <<EOF_ACCESS_RELEASE_SUMMARY
============================================================
ACCESS RELEASE READINESS SUMMARY
============================================================
out_dir=$OUT_DIR
pass_count=$pass_count
warn_count=$warn_count
fail_count=$fail_count
results_tsv=$RESULTS_TSV
============================================================
EOF_ACCESS_RELEASE_SUMMARY

cat "$SUMMARY_TXT"
echo "[results]"
sed -n '1,120p' "$RESULTS_TSV"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
ACCESS_RELEASE_READINESS_CMD
chmod +x "$TOOLS_DIR/access_release_readiness.sh"

cat > "$TOOLS_DIR/access_make_final_handoff_bundle.sh" <<'ACCESS_FINAL_HANDOFF_BUNDLE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_final_handoff_bundle"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_final_handoff_summary.md"
DASHBOARD_LOG="$OUT_DIR/020_dashboard.log"
QUICKSTART_LOG="$OUT_DIR/030_quickstart.log"
HISTORY_LOG="$OUT_DIR/040_history.log"
CATALOG_LOG="$OUT_DIR/050_catalog.log"
LATEST_LINKS_LOG="$OUT_DIR/060_latest_links.log"
WORKSPACE_STATS_LOG="$OUT_DIR/070_workspace_stats.log"
OPEN_BLOCKERS_LOG="$OUT_DIR/080_open_blockers.log"
RELEASE_READINESS_LOG="$OUT_DIR/090_release_readiness.log"
MASTER_BUNDLE_STDOUT="$OUT_DIR/100_master_bundle_stdout.log"
REGRESSION_BUNDLE_STDOUT="$OUT_DIR/110_regression_bundle_stdout.log"
CHECKPOINT_STDOUT="$OUT_DIR/120_checkpoint_stdout.log"
CHECKPOINT_DIFF_STDOUT="$OUT_DIR/130_checkpoint_diff_stdout.log"
COMMAND_MATRIX_STDOUT="$OUT_DIR/140_command_matrix_stdout.log"
STORAGE_REPORT_STDOUT="$OUT_DIR/150_storage_report_stdout.log"
GENERATED_ARTIFACT_REFS_TSV="$OUT_DIR/160_generated_artifact_refs.tsv"
DB_STATUS_TSV="$OUT_DIR/170_db_status.tsv"

mkdir -p "$OUT_DIR"
: > "$GENERATED_ARTIFACT_REFS_TSV"

run_capture() {
  local path="$1"
  local out_file="$2"

  if [ -x "$path" ]; then
    "$path" > "$out_file" 2>&1 || true
  else
    echo "MISSING: $path" > "$out_file"
  fi
}

run_generator() {
  local label="$1"
  local path="$2"
  local out_file="$3"

  if [ -x "$path" ]; then
    "$path" > "$out_file" 2>&1 || true
  else
    echo "MISSING: $path" > "$out_file"
  fi

  grep -E '(^[a-z_]+[[:space:]]*:)|(^[a-z_]+=)' "$out_file" 2>/dev/null | while IFS= read -r line; do
    [ -n "${line:-}" ] || continue
    printf '%s\t%s\n' "$label" "$line" >> "$GENERATED_ARTIFACT_REFS_TSV"
  done
}

echo "============================================================"
echo "ACCESS FINAL HANDOFF BUNDLE"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

run_capture "$TOOLS_DIR/access_dashboard.sh" "$DASHBOARD_LOG"
run_capture "$TOOLS_DIR/access_quickstart.sh" "$QUICKSTART_LOG"
run_capture "$TOOLS_DIR/access_history.sh" "$HISTORY_LOG"
run_capture "$TOOLS_DIR/access_catalog.sh" "$CATALOG_LOG"
run_capture "$TOOLS_DIR/access_show_latest_links.sh" "$LATEST_LINKS_LOG"
run_capture "$TOOLS_DIR/access_workspace_stats.sh" "$WORKSPACE_STATS_LOG"
run_capture "$TOOLS_DIR/access_open_blockers.sh" "$OPEN_BLOCKERS_LOG"
run_capture "$TOOLS_DIR/access_release_readiness.sh" "$RELEASE_READINESS_LOG"

run_generator "master_bundle" "$TOOLS_DIR/access_make_master_bundle.sh" "$MASTER_BUNDLE_STDOUT"
run_generator "regression_bundle" "$TOOLS_DIR/access_make_regression_bundle.sh" "$REGRESSION_BUNDLE_STDOUT"
run_generator "checkpoint" "$TOOLS_DIR/access_make_checkpoint.sh" "$CHECKPOINT_STDOUT"
run_generator "checkpoint_diff" "$TOOLS_DIR/access_make_checkpoint_diff_report.sh" "$CHECKPOINT_DIFF_STDOUT"
run_generator "command_matrix" "$TOOLS_DIR/access_make_command_matrix.sh" "$COMMAND_MATRIX_STDOUT"
run_generator "storage_report" "$TOOLS_DIR/access_make_storage_report.sh" "$STORAGE_REPORT_STDOUT"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DB_STATUS_TSV"
SELECT
  b.run_code AS baseline_run_code,
  b.core_status,
  b.legacy_status,
  b.operations_status,
  b.core_blocker_count,
  g.run_code AS legacy_gate_run_code,
  g.readiness_status,
  g.blocker_count,
  r.run_code AS retirement_run_code,
  r.plan_status,
  c.run_code AS bundle_run_code,
  c.export_status,
  c.file_count
FROM cx22073jw.v_access_baseline_health_latest_summary b
LEFT JOIN cx22073jw.v_access_legacy_cutover_gate_latest_summary g
  ON TRUE
LEFT JOIN cx22073jw.v_access_legacy_retirement_plan_latest_summary r
  ON TRUE
LEFT JOIN cx22073jw.v_access_current_state_bundle_export_latest_summary c
  ON TRUE;
SQL

CORE_STATUS="$(awk -F '\t' 'NR==1{print $2}' "$DB_STATUS_TSV" 2>/dev/null || true)"
LEGACY_STATUS="$(awk -F '\t' 'NR==1{print $3}' "$DB_STATUS_TSV" 2>/dev/null || true)"
OPERATIONS_STATUS="$(awk -F '\t' 'NR==1{print $4}' "$DB_STATUS_TSV" 2>/dev/null || true)"
GENERATED_REF_COUNT="$(awk 'END{print NR+0}' "$GENERATED_ARTIFACT_REFS_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_FINAL_HANDOFF_MANIFEST
# ============================================================
# ACCESS FINAL HANDOFF BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_final_handoff_summary.md
- 020_dashboard.log
- 030_quickstart.log
- 040_history.log
- 050_catalog.log
- 060_latest_links.log
- 070_workspace_stats.log
- 080_open_blockers.log
- 090_release_readiness.log
- 100_master_bundle_stdout.log
- 110_regression_bundle_stdout.log
- 120_checkpoint_stdout.log
- 130_checkpoint_diff_stdout.log
- 140_command_matrix_stdout.log
- 150_storage_report_stdout.log
- 160_generated_artifact_refs.tsv
- 170_db_status.tsv
EOF_ACCESS_FINAL_HANDOFF_MANIFEST

cat > "$SUMMARY_MD" <<EOF_ACCESS_FINAL_HANDOFF_SUMMARY
# ============================================================
# ACCESS FINAL HANDOFF SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

status_snapshot:
- core_status: ${CORE_STATUS:-UNKNOWN}
- legacy_status: ${LEGACY_STATUS:-UNKNOWN}
- operations_status: ${OPERATIONS_STATUS:-UNKNOWN}

generated_reference_rows:
- generated_ref_count: $GENERATED_REF_COUNT

note:
This bundle is intended as the final broad handoff package for current access operations.
EOF_ACCESS_FINAL_HANDOFF_SUMMARY

echo "============================================================"
echo "ACCESS FINAL HANDOFF BUNDLE CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
ACCESS_FINAL_HANDOFF_BUNDLE_CMD
chmod +x "$TOOLS_DIR/access_make_final_handoff_bundle.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_release_readiness.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_132'

finalization_commands:
- ./access_release_readiness.sh
- ./access_make_final_handoff_bundle.sh

recommended_final_flow:
1. ./access_release_readiness.sh
2. ./access_make_final_handoff_bundle.sh
README_APPEND_132
  fi
else
  cat > "$README_FILE" <<'README_NEW_132'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

finalization_commands:
- ./access_release_readiness.sh
- ./access_make_final_handoff_bundle.sh
README_NEW_132
fi

echo "============================================================"
echo "ACCESS FINALIZATION PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
