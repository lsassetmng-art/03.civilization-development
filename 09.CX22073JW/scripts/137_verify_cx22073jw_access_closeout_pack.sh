#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS CLOSEOUT PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_show_end_state.sh" \
  "$TOOLS_DIR/access_run_closeout_flow.sh" \
  "$TOOLS_DIR/access_make_closeout_bundle.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "END STATE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_show_end_state.sh"

echo "============================================================"
echo "CLOSEOUT FLOW SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_run_closeout_flow.sh"

echo "============================================================"
echo "CLOSEOUT BUNDLE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_closeout_bundle.sh"

echo "============================================================"
echo "VERIFY ACCESS CLOSEOUT PACK DONE"
echo "============================================================"
