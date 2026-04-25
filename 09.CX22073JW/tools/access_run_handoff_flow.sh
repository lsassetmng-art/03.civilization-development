#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

SHIFT_CMD="$TOOLS_DIR/access_make_shift_report.sh"
TIMELINE_CMD="$TOOLS_DIR/access_make_timeline_report.sh"
BUNDLE_CMD="$TOOLS_DIR/access_export_current_bundle.sh"
LATEST_REFRESH_CMD="$TOOLS_DIR/access_refresh_latest_links.sh"
LATEST_SHOW_CMD="$TOOLS_DIR/access_show_latest_links.sh"

echo "============================================================"
echo "ACCESS HANDOFF FLOW START"
echo "============================================================"

if [ -x "$SHIFT_CMD" ]; then
  echo "[1/5] shift report"
  "$SHIFT_CMD"
else
  echo "WARN: missing cmd -> $SHIFT_CMD"
fi

if [ -x "$TIMELINE_CMD" ]; then
  echo "[2/5] timeline report"
  "$TIMELINE_CMD"
else
  echo "WARN: missing cmd -> $TIMELINE_CMD"
fi

if [ -x "$BUNDLE_CMD" ]; then
  echo "[3/5] current bundle export"
  "$BUNDLE_CMD"
else
  echo "WARN: missing cmd -> $BUNDLE_CMD"
fi

if [ -x "$LATEST_REFRESH_CMD" ]; then
  echo "[4/5] refresh latest links"
  "$LATEST_REFRESH_CMD"
else
  echo "WARN: missing cmd -> $LATEST_REFRESH_CMD"
fi

if [ -x "$LATEST_SHOW_CMD" ]; then
  echo "[5/5] show latest links"
  "$LATEST_SHOW_CMD"
else
  echo "WARN: missing cmd -> $LATEST_SHOW_CMD"
fi

echo "============================================================"
echo "ACCESS HANDOFF FLOW DONE"
echo "============================================================"
