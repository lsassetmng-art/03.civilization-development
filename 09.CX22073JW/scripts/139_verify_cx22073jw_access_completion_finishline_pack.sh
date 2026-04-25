#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS COMPLETION FINISHLINE PACK (LIGHT)"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_completion_gate.sh" \
  "$TOOLS_DIR/access_make_completion_bundle.sh" \
  "$TOOLS_DIR/access_finish_line.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "COMPLETION GATE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_completion_gate.sh"

echo "============================================================"
echo "END STATE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_show_end_state.sh"

echo "============================================================"
echo "FINISH LINE LIGHT SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_finish_line.sh"

echo "============================================================"
echo "HEAVY SMOKES SKIPPED BY DESIGN"
echo "============================================================"
echo "Skipped:"
echo "- access_make_completion_bundle.sh"
echo "- nested heavy bundle recursion inside old finish_line"
echo
echo "Run manually only when needed:"
echo "  $TOOLS_DIR/access_make_completion_bundle.sh"

echo "============================================================"
echo "VERIFY ACCESS COMPLETION FINISHLINE PACK DONE"
echo "============================================================"
