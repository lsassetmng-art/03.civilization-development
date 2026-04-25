#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS DASHBOARD ONBOARDING MAINTENANCE PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_dashboard.sh" \
  "$TOOLS_DIR/access_quickstart.sh" \
  "$TOOLS_DIR/access_validate_workspace.sh" \
  "$TOOLS_DIR/access_make_command_matrix.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "DASHBOARD SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_dashboard.sh"

echo "============================================================"
echo "QUICKSTART SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_quickstart.sh"

echo "============================================================"
echo "VALIDATE WORKSPACE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_validate_workspace.sh"

echo "============================================================"
echo "COMMAND MATRIX SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_command_matrix.sh"

echo "============================================================"
echo "VERIFY ACCESS DASHBOARD ONBOARDING MAINTENANCE PACK DONE"
echo "============================================================"
