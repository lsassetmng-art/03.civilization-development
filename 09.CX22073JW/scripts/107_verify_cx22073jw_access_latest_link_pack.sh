#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LATEST_DIR="$BASE/latest"

echo "============================================================"
echo "VERIFY ACCESS LATEST LINK PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_refresh_latest_links.sh" \
  "$TOOLS_DIR/access_show_latest_links.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "REFRESH LATEST LINKS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_refresh_latest_links.sh"

echo "============================================================"
echo "SHOW LATEST LINKS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_show_latest_links.sh"

echo "============================================================"
echo "LATEST DIR HEAD"
echo "============================================================"
find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | sort | sed -n '1,120p'

echo "============================================================"
echo "VERIFY ACCESS LATEST LINK PACK DONE"
echo "============================================================"
