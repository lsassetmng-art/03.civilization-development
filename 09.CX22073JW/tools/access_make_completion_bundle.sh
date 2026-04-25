#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_completion_bundle"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_completion_summary.md"
COMPLETION_GATE_LOG="$OUT_DIR/020_completion_gate.log"
END_STATE_LOG="$OUT_DIR/030_end_state.log"
RELEASE_READINESS_LOG="$OUT_DIR/040_release_readiness.log"
FINAL_HANDOFF_LOG="$OUT_DIR/050_final_handoff.log"
CLOSEOUT_LOG="$OUT_DIR/060_closeout.log"
WORKSPACE_MANIFEST_LOG="$OUT_DIR/070_workspace_manifest.log"
HANDBOOK_LOG="$OUT_DIR/080_operator_handbook.log"
LATEST_LINKS_LOG="$OUT_DIR/090_latest_links.log"
DB_STATUS_TSV="$OUT_DIR/100_db_status.tsv"
REFS_TSV="$OUT_DIR/110_refs.tsv"

mkdir -p "$OUT_DIR"
: > "$REFS_TSV"

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
    printf '%s\t%s\n' "$label" "$line" >> "$REFS_TSV"
  done
}

echo "============================================================"
echo "ACCESS COMPLETION BUNDLE"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

run_capture "$TOOLS_DIR/access_completion_gate.sh" "$COMPLETION_GATE_LOG"
run_capture "$TOOLS_DIR/access_show_end_state.sh" "$END_STATE_LOG"
run_capture "$TOOLS_DIR/access_release_readiness.sh" "$RELEASE_READINESS_LOG"
run_capture "$TOOLS_DIR/access_make_final_handoff_bundle.sh" "$FINAL_HANDOFF_LOG"
run_capture "$TOOLS_DIR/access_make_closeout_bundle.sh" "$CLOSEOUT_LOG"
run_capture "$TOOLS_DIR/access_make_workspace_manifest.sh" "$WORKSPACE_MANIFEST_LOG"
run_capture "$TOOLS_DIR/access_make_operator_handbook.sh" "$HANDBOOK_LOG"
run_capture "$TOOLS_DIR/access_show_latest_links.sh" "$LATEST_LINKS_LOG"

capture_refs "completion_gate" "$COMPLETION_GATE_LOG"
capture_refs "end_state" "$END_STATE_LOG"
capture_refs "release_readiness" "$RELEASE_READINESS_LOG"
capture_refs "final_handoff" "$FINAL_HANDOFF_LOG"
capture_refs "closeout" "$CLOSEOUT_LOG"
capture_refs "workspace_manifest" "$WORKSPACE_MANIFEST_LOG"
capture_refs "operator_handbook" "$HANDBOOK_LOG"

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
REF_COUNT="$(awk 'END{print NR+0}' "$REFS_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_COMPLETION_MANIFEST
# ============================================================
# ACCESS COMPLETION BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_completion_summary.md
- 020_completion_gate.log
- 030_end_state.log
- 040_release_readiness.log
- 050_final_handoff.log
- 060_closeout.log
- 070_workspace_manifest.log
- 080_operator_handbook.log
- 090_latest_links.log
- 100_db_status.tsv
- 110_refs.tsv
EOF_ACCESS_COMPLETION_MANIFEST

cat > "$SUMMARY_MD" <<EOF_ACCESS_COMPLETION_SUMMARY
# ============================================================
# ACCESS COMPLETION SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

status_snapshot:
- core_status: ${CORE_STATUS:-UNKNOWN}
- legacy_status: ${LEGACY_STATUS:-UNKNOWN}
- operations_status: ${OPERATIONS_STATUS:-UNKNOWN}

reference_rows:
- ref_count: $REF_COUNT

note:
This bundle is intended as the final completion package for the current access workspace.
EOF_ACCESS_COMPLETION_SUMMARY

echo "============================================================"
echo "ACCESS COMPLETION BUNDLE CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
