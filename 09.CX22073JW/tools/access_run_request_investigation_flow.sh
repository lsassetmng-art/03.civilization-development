#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

REQUEST_CODE="${1:-}"
BATCH_CODE="${2:-}"

if [ -z "$REQUEST_CODE" ]; then
  echo "USAGE: access_run_request_investigation_flow.sh REQUEST_CODE [BATCH_CODE]"
  exit 1
fi

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

TRACE_CMD="$TOOLS_DIR/access_trace_request.sh"
TRACE_BUNDLE_CMD="$TOOLS_DIR/access_make_request_trace_bundle.sh"
STATUS_CMD="$TOOLS_DIR/access_status.sh"

echo "============================================================"
echo "ACCESS REQUEST INVESTIGATION FLOW START"
echo "============================================================"
echo "request_code : $REQUEST_CODE"
echo "batch_code   : ${BATCH_CODE:-latest}"
echo "============================================================"

if [ -x "$TRACE_CMD" ]; then
  echo "[1/3] request trace"
  "$TRACE_CMD" "$REQUEST_CODE" "${BATCH_CODE:-}"
else
  echo "WARN: missing cmd -> $TRACE_CMD"
fi

if [ -x "$TRACE_BUNDLE_CMD" ]; then
  echo "[2/3] request trace bundle"
  "$TRACE_BUNDLE_CMD" "$REQUEST_CODE" "${BATCH_CODE:-}"
else
  echo "WARN: missing cmd -> $TRACE_BUNDLE_CMD"
fi

if [ -x "$STATUS_CMD" ]; then
  echo "[3/3] status"
  "$STATUS_CMD"
else
  echo "WARN: missing cmd -> $STATUS_CMD"
fi

echo "============================================================"
echo "ACCESS REQUEST INVESTIGATION FLOW DONE"
echo "============================================================"
