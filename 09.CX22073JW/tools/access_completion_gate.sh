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
