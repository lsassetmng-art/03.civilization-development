#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS CATALOG SEARCH PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_catalog.sh" \
  "$TOOLS_DIR/access_find_keyword.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "CATALOG SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_catalog.sh"

echo "============================================================"
echo "FIND KEYWORD SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_find_keyword.sh" "trace"

echo "============================================================"
echo "VERIFY ACCESS CATALOG SEARCH PACK DONE"
echo "============================================================"
