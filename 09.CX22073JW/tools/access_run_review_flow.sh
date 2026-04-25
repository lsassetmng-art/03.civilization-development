#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

STATUS_CMD="$TOOLS_DIR/access_status.sh"
PENDING_CMD="$TOOLS_DIR/access_list_pending_requests.sh"
BLOCKERS_CMD="$TOOLS_DIR/access_open_blockers.sh"
LATEST_BATCH_CMD="$TOOLS_DIR/access_show_latest_batch.sh"

echo "============================================================"
echo "ACCESS REVIEW FLOW START"
echo "============================================================"

if [ -x "$STATUS_CMD" ]; then
  echo "[1/4] status"
  "$STATUS_CMD"
else
  echo "WARN: missing cmd -> $STATUS_CMD"
fi

if [ -x "$LATEST_BATCH_CMD" ]; then
  echo "[2/4] latest batch"
  "$LATEST_BATCH_CMD"
else
  echo "WARN: missing cmd -> $LATEST_BATCH_CMD"
fi

if [ -x "$PENDING_CMD" ]; then
  echo "[3/4] pending requests"
  "$PENDING_CMD"
else
  echo "WARN: missing cmd -> $PENDING_CMD"
fi

if [ -x "$BLOCKERS_CMD" ]; then
  echo "[4/4] open blockers"
  "$BLOCKERS_CMD"
else
  echo "WARN: missing cmd -> $BLOCKERS_CMD"
fi

echo "============================================================"
echo "ACCESS REVIEW FLOW DONE"
echo "============================================================"
