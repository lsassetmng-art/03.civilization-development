#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS DAILY RUNNER PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_legacy_readiness.sh" \
  "$TOOLS_DIR/access_daily_refresh.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "LEGACY READINESS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_legacy_readiness.sh"

echo "============================================================"
echo "VERIFY ACCESS DAILY RUNNER PACK DONE"
echo "============================================================"
