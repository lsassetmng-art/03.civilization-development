#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

run_if_exists() {
  local step_label="$1"
  local cmd_path="$2"
  shift 2 || true

  echo "============================================================"
  echo "$step_label"
  echo "============================================================"

  if [ -x "$cmd_path" ]; then
    "$cmd_path" "$@"
  else
    echo "WARN: missing cmd -> $cmd_path"
  fi
}

echo "============================================================"
echo "ACCESS MASTER FLOW START"
echo "============================================================"

run_if_exists "[1/8] doctor" "$TOOLS_DIR/access_doctor.sh"
run_if_exists "[2/8] daily refresh" "$TOOLS_DIR/access_daily_refresh.sh"
run_if_exists "[3/8] review flow" "$TOOLS_DIR/access_run_review_flow.sh"
run_if_exists "[4/8] handoff flow" "$TOOLS_DIR/access_run_handoff_flow.sh"
run_if_exists "[5/8] checkpoint" "$TOOLS_DIR/access_make_checkpoint.sh"
run_if_exists "[6/8] delta report" "$TOOLS_DIR/access_make_delta_report.sh"
run_if_exists "[7/8] regression bundle" "$TOOLS_DIR/access_make_regression_bundle.sh"
run_if_exists "[8/8] latest links refresh" "$TOOLS_DIR/access_refresh_latest_links.sh"

echo "============================================================"
echo "ACCESS MASTER FLOW DONE"
echo "============================================================"
