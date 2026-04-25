#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_closeout_bundle"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_closeout_summary.md"
END_STATE_LOG="$OUT_DIR/020_end_state.log"
CLOSEOUT_FLOW_LOG="$OUT_DIR/030_closeout_flow.log"
RELEASE_READINESS_LOG="$OUT_DIR/040_release_readiness.log"
FINAL_HANDOFF_LOG="$OUT_DIR/050_final_handoff_bundle.log"
WORKSPACE_MANIFEST_LOG="$OUT_DIR/060_workspace_manifest.log"
OPERATOR_HANDBOOK_LOG="$OUT_DIR/070_operator_handbook.log"
MASTER_BUNDLE_LOG="$OUT_DIR/080_master_bundle.log"
STORAGE_REPORT_LOG="$OUT_DIR/090_storage_report.log"
LATEST_LINKS_LOG="$OUT_DIR/100_latest_links.log"
DB_STATUS_TSV="$OUT_DIR/110_db_status.tsv"
GENERATED_REFS_TSV="$OUT_DIR/120_generated_refs.tsv"

mkdir -p "$OUT_DIR"
: > "$GENERATED_REFS_TSV"

run_capture() {
  local path="$1"
  local out_file="$2"

  if [ -x "$path" ]; then
    "$path" > "$out_file" 2>&1 || true
  else
    echo "MISSING: $path" > "$out_file"
  fi
}

capture_refs() {
  local label="$1"
  local file_path="$2"
  grep -E '(^[a-z_]+[[:space:]]*:)|(^[a-z_]+=)' "$file_path" 2>/dev/null | while IFS= read -r line; do
    [ -n "${line:-}" ] || continue
    printf '%s\t%s\n' "$label" "$line" >> "$GENERATED_REFS_TSV"
  done
}

echo "============================================================"
echo "ACCESS CLOSEOUT BUNDLE"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

run_capture "$TOOLS_DIR/access_show_end_state.sh" "$END_STATE_LOG"
run_capture "$TOOLS_DIR/access_run_closeout_flow.sh" "$CLOSEOUT_FLOW_LOG"
run_capture "$TOOLS_DIR/access_release_readiness.sh" "$RELEASE_READINESS_LOG"
run_capture "$TOOLS_DIR/access_make_final_handoff_bundle.sh" "$FINAL_HANDOFF_LOG"
run_capture "$TOOLS_DIR/access_make_workspace_manifest.sh" "$WORKSPACE_MANIFEST_LOG"
run_capture "$TOOLS_DIR/access_make_operator_handbook.sh" "$OPERATOR_HANDBOOK_LOG"
run_capture "$TOOLS_DIR/access_make_master_bundle.sh" "$MASTER_BUNDLE_LOG"
run_capture "$TOOLS_DIR/access_make_storage_report.sh" "$STORAGE_REPORT_LOG"
run_capture "$TOOLS_DIR/access_show_latest_links.sh" "$LATEST_LINKS_LOG"

capture_refs "closeout_flow" "$CLOSEOUT_FLOW_LOG"
capture_refs "release_readiness" "$RELEASE_READINESS_LOG"
capture_refs "final_handoff" "$FINAL_HANDOFF_LOG"
capture_refs "workspace_manifest" "$WORKSPACE_MANIFEST_LOG"
capture_refs "operator_handbook" "$OPERATOR_HANDBOOK_LOG"
capture_refs "master_bundle" "$MASTER_BUNDLE_LOG"
capture_refs "storage_report" "$STORAGE_REPORT_LOG"

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
REF_COUNT="$(awk 'END{print NR+0}' "$GENERATED_REFS_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_CLOSEOUT_MANIFEST
# ============================================================
# ACCESS CLOSEOUT BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_closeout_summary.md
- 020_end_state.log
- 030_closeout_flow.log
- 040_release_readiness.log
- 050_final_handoff_bundle.log
- 060_workspace_manifest.log
- 070_operator_handbook.log
- 080_master_bundle.log
- 090_storage_report.log
- 100_latest_links.log
- 110_db_status.tsv
- 120_generated_refs.tsv
EOF_ACCESS_CLOSEOUT_MANIFEST

cat > "$SUMMARY_MD" <<EOF_ACCESS_CLOSEOUT_SUMMARY
# ============================================================
# ACCESS CLOSEOUT SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

status_snapshot:
- core_status: ${CORE_STATUS:-UNKNOWN}
- legacy_status: ${LEGACY_STATUS:-UNKNOWN}
- operations_status: ${OPERATIONS_STATUS:-UNKNOWN}

generated_reference_rows:
- ref_count: $REF_COUNT

note:
This bundle is intended as the final closeout package for the current access workspace.
EOF_ACCESS_CLOSEOUT_SUMMARY

echo "============================================================"
echo "ACCESS CLOSEOUT BUNDLE CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
