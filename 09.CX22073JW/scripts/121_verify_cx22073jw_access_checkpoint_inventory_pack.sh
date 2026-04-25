#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS CHECKPOINT INVENTORY PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_make_checkpoint.sh" \
  "$TOOLS_DIR/access_list_checkpoints.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "MAKE CHECKPOINT SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_checkpoint.sh"

echo "============================================================"
echo "LIST CHECKPOINTS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_list_checkpoints.sh"

echo "============================================================"
echo "VERIFY ACCESS CHECKPOINT INVENTORY PACK DONE"
echo "============================================================"
