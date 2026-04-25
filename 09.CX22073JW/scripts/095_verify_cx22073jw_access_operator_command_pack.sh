#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS OPERATOR COMMAND PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_status.sh" \
  "$TOOLS_DIR/access_show_latest_batch.sh" \
  "$TOOLS_DIR/access_confirm_request.sh" \
  "$TOOLS_DIR/access_reverify_confirmed.sh" \
  "$TOOLS_DIR/access_export_current_bundle.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "STATUS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_status.sh"

echo "============================================================"
echo "VERIFY ACCESS OPERATOR COMMAND PACK DONE"
echo "============================================================"
