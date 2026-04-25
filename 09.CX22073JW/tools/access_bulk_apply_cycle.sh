#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

STATUS_VALUE="${1:-confirmed_applied}"
EXECUTOR_NAME="${2:-Zero}"
NOTE_TEXT="${3:-bulk cycle from access_bulk_apply_cycle.sh}"
BATCH_CODE="${4:-}"

BULK_CONFIRM_CMD="$TOOLS_DIR/access_bulk_confirm_all_pending.sh"
REVERIFY_CMD="$TOOLS_DIR/access_reverify_confirmed.sh"
EXPORT_CMD="$TOOLS_DIR/access_export_current_bundle.sh"
STATUS_CMD="$TOOLS_DIR/access_status.sh"

echo "============================================================"
echo "ACCESS BULK APPLY CYCLE START"
echo "============================================================"

if [ ! -x "$BULK_CONFIRM_CMD" ]; then
  echo "ERROR: missing command -> $BULK_CONFIRM_CMD"
  exit 1
fi

"$BULK_CONFIRM_CMD" "$STATUS_VALUE" "$EXECUTOR_NAME" "$NOTE_TEXT" "${BATCH_CODE:-}"

if [ "$STATUS_VALUE" = "confirmed_applied" ]; then
  if [ -x "$REVERIFY_CMD" ]; then
    "$REVERIFY_CMD" "${BATCH_CODE:-}" "$EXECUTOR_NAME"
  else
    echo "WARN: missing reverify cmd -> $REVERIFY_CMD"
  fi

  if [ -x "$EXPORT_CMD" ]; then
    "$EXPORT_CMD"
  else
    echo "WARN: missing export cmd -> $EXPORT_CMD"
  fi
fi

if [ -x "$STATUS_CMD" ]; then
  "$STATUS_CMD"
fi

echo "============================================================"
echo "ACCESS BULK APPLY CYCLE DONE"
echo "============================================================"
