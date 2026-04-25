#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS HISTORY TIMELINE PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_history.sh" \
  "$TOOLS_DIR/access_make_timeline_report.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "HISTORY SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_history.sh"

echo "============================================================"
echo "TIMELINE REPORT SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_timeline_report.sh"

echo "============================================================"
echo "VERIFY ACCESS HISTORY TIMELINE PACK DONE"
echo "============================================================"
