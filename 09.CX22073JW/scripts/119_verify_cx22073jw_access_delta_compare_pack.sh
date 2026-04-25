#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS DELTA COMPARE PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_compare_latest_runs.sh" \
  "$TOOLS_DIR/access_make_delta_report.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "COMPARE LATEST RUNS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_compare_latest_runs.sh"

echo "============================================================"
echo "DELTA REPORT SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_delta_report.sh"

echo "============================================================"
echo "VERIFY ACCESS DELTA COMPARE PACK DONE"
echo "============================================================"
