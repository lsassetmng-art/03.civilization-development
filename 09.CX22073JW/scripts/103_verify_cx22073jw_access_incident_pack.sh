#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS INCIDENT PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_latest_artifacts.sh" \
  "$TOOLS_DIR/access_collect_incident_bundle.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "LATEST ARTIFACTS SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_latest_artifacts.sh"

echo "============================================================"
echo "INCIDENT BUNDLE SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_collect_incident_bundle.sh"

echo "============================================================"
echo "VERIFY ACCESS INCIDENT PACK DONE"
echo "============================================================"
