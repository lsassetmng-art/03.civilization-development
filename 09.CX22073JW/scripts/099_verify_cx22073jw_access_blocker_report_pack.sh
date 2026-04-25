#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS BLOCKER REPORT PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_open_blockers.sh" \
  "$TOOLS_DIR/access_make_shift_report.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "OPEN BLOCKERS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_open_blockers.sh"

echo "============================================================"
echo "SHIFT REPORT SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_shift_report.sh"

echo "============================================================"
echo "VERIFY ACCESS BLOCKER REPORT PACK DONE"
echo "============================================================"
