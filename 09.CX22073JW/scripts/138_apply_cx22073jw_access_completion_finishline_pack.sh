#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"
LOGS_DIR="$BASE/logs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR" "$LOGS_DIR"

cat > "$TOOLS_DIR/access_completion_gate.sh" <<'ACCESS_COMPLETION_GATE_CMD'
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

latest_target_exists() {
  local name="$1"
  local p="$LATEST_DIR/$name"
  if [ -L "$p" ]; then
    local t
    t="$(readlink "$p" || true)"
    [ -n "${t:-}" ] && [ -e "$t" ]
  else
    [ -e "$p" ]
  fi
}

echo "============================================================"
echo "ACCESS COMPLETION GATE"
echo "============================================================"

for file_path in \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md" \
  "$DOCS_DIR/068_ACCESS_CLOSEOUT_PACK_NOTE.md" \
  "$DOCS_DIR/069_ACCESS_COMPLETION_FINISHLINE_PACK_NOTE.md" \
  "$DOCS_DIR/068_ACCESS_OPERATOR_HANDBOOK.md"
do
  if [ -e "$file_path" ]; then
    pass "file exists: $file_path"
  else
    fail "file missing: $file_path"
  fi
done

for file_path in \
  "$TOOLS_DIR/access_dashboard.sh" \
  "$TOOLS_DIR/access_quickstart.sh" \
  "$TOOLS_DIR/access_doctor.sh" \
  "$TOOLS_DIR/access_validate_workspace.sh" \
  "$TOOLS_DIR/access_release_readiness.sh" \
  "$TOOLS_DIR/access_make_final_handoff_bundle.sh" \
  "$TOOLS_DIR/access_show_end_state.sh" \
  "$TOOLS_DIR/access_run_closeout_flow.sh" \
  "$TOOLS_DIR/access_make_closeout_bundle.sh" \
  "$TOOLS_DIR/access_make_workspace_manifest.sh" \
  "$TOOLS_DIR/access_make_operator_handbook.sh" \
  "$TOOLS_DIR/access_completion_gate.sh" \
  "$TOOLS_DIR/access_make_completion_bundle.sh" \
  "$TOOLS_DIR/access_finish_line.sh"
do
  if [ -x "$file_path" ]; then
    pass "executable exists: $file_path"
  else
    fail "executable missing: $file_path"
  fi
done

for v in \
  v_access_baseline_health_latest_summary \
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

for latest_name in \
  latest_shift_report_dir \
  latest_current_bundle_dir \
  latest_current_bundle_handoff_md \
  latest_timeline_report_dir
do
  if latest_target_exists "$latest_name"; then
    pass "latest target ok: $latest_name"
  else
    warn "latest target missing or broken: $latest_name"
  fi
done

echo "============================================================"
echo "ACCESS COMPLETION GATE SUMMARY"
echo "============================================================"
echo "pass_count=$pass_count"
echo "warn_count=$warn_count"
echo "fail_count=$fail_count"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
ACCESS_COMPLETION_GATE_CMD
chmod +x "$TOOLS_DIR/access_completion_gate.sh"

cat > "$TOOLS_DIR/access_make_completion_bundle.sh" <<'ACCESS_COMPLETION_BUNDLE_CMD'
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
ACCESS_COMPLETION_BUNDLE_CMD
chmod +x "$TOOLS_DIR/access_make_completion_bundle.sh"

cat > "$TOOLS_DIR/access_finish_line.sh" <<'ACCESS_FINISH_LINE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

pass_count=0
warn_count=0
fail_count=0

run_step() {
  local label="$1"
  local path="$2"
  shift 2 || true

  echo "============================================================"
  echo "$label"
  echo "============================================================"

  if [ ! -x "$path" ]; then
    echo "WARN: missing cmd -> $path"
    warn_count=$((warn_count + 1))
    return 0
  fi

  if "$path" "$@"; then
    pass_count=$((pass_count + 1))
  else
    echo "WARN: step failed -> $path"
    fail_count=$((fail_count + 1))
  fi
}

echo "============================================================"
echo "ACCESS FINISH LINE START"
echo "============================================================"

run_step "[1/5] completion gate" "$TOOLS_DIR/access_completion_gate.sh"
run_step "[2/5] release readiness" "$TOOLS_DIR/access_release_readiness.sh"
run_step "[3/5] completion bundle" "$TOOLS_DIR/access_make_completion_bundle.sh"
run_step "[4/5] refresh latest links" "$TOOLS_DIR/access_refresh_latest_links.sh"
run_step "[5/5] end state" "$TOOLS_DIR/access_show_end_state.sh"

echo "============================================================"
echo "ACCESS FINISH LINE SUMMARY"
echo "============================================================"
echo "pass_count=$pass_count"
echo "warn_count=$warn_count"
echo "fail_count=$fail_count"
echo "============================================================"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
ACCESS_FINISH_LINE_CMD
chmod +x "$TOOLS_DIR/access_finish_line.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_completion_gate.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_138'

completion_finishline_commands:
- ./access_completion_gate.sh
- ./access_make_completion_bundle.sh
- ./access_finish_line.sh

recommended_finish_line_flow:
1. ./access_completion_gate.sh
2. ./access_make_completion_bundle.sh
3. ./access_finish_line.sh
README_APPEND_138
  fi
else
  cat > "$README_FILE" <<'README_NEW_138'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

completion_finishline_commands:
- ./access_completion_gate.sh
- ./access_make_completion_bundle.sh
- ./access_finish_line.sh
README_NEW_138
fi

echo "============================================================"
echo "ACCESS COMPLETION FINISHLINE PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
