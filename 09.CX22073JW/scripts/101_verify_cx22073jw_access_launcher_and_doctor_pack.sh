#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS LAUNCHER AND DOCTOR PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_menu.sh" \
  "$TOOLS_DIR/access_doctor.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "DOCTOR SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_doctor.sh"

echo "============================================================"
echo "VERIFY ACCESS LAUNCHER AND DOCTOR PACK DONE"
echo "============================================================"
