#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS FINALIZATION PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_release_readiness.sh" \
  "$TOOLS_DIR/access_make_final_handoff_bundle.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "RELEASE READINESS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_release_readiness.sh"

echo "============================================================"
echo "FINAL HANDOFF BUNDLE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_final_handoff_bundle.sh"

echo "============================================================"
echo "VERIFY ACCESS FINALIZATION PACK DONE"
echo "============================================================"
