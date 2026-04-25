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
