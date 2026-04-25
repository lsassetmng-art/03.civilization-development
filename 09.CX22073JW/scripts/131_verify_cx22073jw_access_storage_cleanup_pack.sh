#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS STORAGE CLEANUP PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_workspace_stats.sh" \
  "$TOOLS_DIR/access_make_storage_report.sh" \
  "$TOOLS_DIR/access_cleanup_preview.sh" \
  "$TOOLS_DIR/access_cleanup_empty_dirs.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "WORKSPACE STATS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_workspace_stats.sh"

echo "============================================================"
echo "STORAGE REPORT SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_storage_report.sh"

echo "============================================================"
echo "CLEANUP PREVIEW SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_cleanup_preview.sh" 14

echo "============================================================"
echo "EMPTY DIR CLEANUP SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_cleanup_empty_dirs.sh"

echo "============================================================"
echo "VERIFY ACCESS STORAGE CLEANUP PACK DONE"
echo "============================================================"
