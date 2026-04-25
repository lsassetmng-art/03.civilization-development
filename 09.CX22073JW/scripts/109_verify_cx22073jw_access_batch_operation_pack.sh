#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS BATCH OPERATION PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_list_pending_requests.sh" \
  "$TOOLS_DIR/access_bulk_confirm_all_pending.sh" \
  "$TOOLS_DIR/access_bulk_apply_cycle.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "LIST PENDING SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_list_pending_requests.sh"

echo "============================================================"
echo "VERIFY ACCESS BATCH OPERATION PACK DONE"
echo "============================================================"
