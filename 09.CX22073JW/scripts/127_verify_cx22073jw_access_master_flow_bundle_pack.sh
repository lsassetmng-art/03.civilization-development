#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS MASTER FLOW BUNDLE PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_run_master_flow.sh" \
  "$TOOLS_DIR/access_make_master_bundle.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "MASTER BUNDLE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_master_bundle.sh"

echo "============================================================"
echo "VERIFY ACCESS MASTER FLOW BUNDLE PACK DONE"
echo "============================================================"
