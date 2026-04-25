#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS MANIFEST HANDBOOK ARCHIVE PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_make_workspace_manifest.sh" \
  "$TOOLS_DIR/access_make_operator_handbook.sh" \
  "$TOOLS_DIR/access_archive_old_artifacts_preview.sh" \
  "$TOOLS_DIR/access_archive_old_artifacts_move.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "WORKSPACE MANIFEST SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_workspace_manifest.sh"

echo "============================================================"
echo "OPERATOR HANDBOOK SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_make_operator_handbook.sh"

echo "============================================================"
echo "ARCHIVE PREVIEW SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_archive_old_artifacts_preview.sh" 30

echo "============================================================"
echo "ARCHIVE MOVE DRY-RUN SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_archive_old_artifacts_move.sh" 30 dry_run

echo "============================================================"
echo "VERIFY ACCESS MANIFEST HANDBOOK ARCHIVE PACK DONE"
echo "============================================================"
