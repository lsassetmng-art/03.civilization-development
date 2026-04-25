#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS REGRESSION SMOKE PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_smoke_suite.sh" \
  "$TOOLS_DIR/access_make_regression_bundle.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "SMOKE SUITE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_smoke_suite.sh"

echo "============================================================"
echo "REGRESSION BUNDLE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_regression_bundle.sh"

echo "============================================================"
echo "VERIFY ACCESS REGRESSION SMOKE PACK DONE"
echo "============================================================"
