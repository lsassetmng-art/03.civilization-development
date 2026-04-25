#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS CHECKPOINT COMPARE PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_compare_checkpoints.sh" \
  "$TOOLS_DIR/access_make_checkpoint_diff_report.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "COMPARE CHECKPOINTS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_compare_checkpoints.sh"

echo "============================================================"
echo "CHECKPOINT DIFF REPORT SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_checkpoint_diff_report.sh"

echo "============================================================"
echo "VERIFY ACCESS CHECKPOINT COMPARE PACK DONE"
echo "============================================================"
