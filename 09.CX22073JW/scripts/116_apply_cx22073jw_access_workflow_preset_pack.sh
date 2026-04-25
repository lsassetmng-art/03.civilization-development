#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_run_review_flow.sh" <<'ACCESS_REVIEW_FLOW_CMD'
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
ACCESS_REVIEW_FLOW_CMD
chmod +x "$TOOLS_DIR/access_run_review_flow.sh"

cat > "$TOOLS_DIR/access_run_request_investigation_flow.sh" <<'ACCESS_REQUEST_INVESTIGATION_FLOW_CMD'
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
ACCESS_REQUEST_INVESTIGATION_FLOW_CMD
chmod +x "$TOOLS_DIR/access_run_request_investigation_flow.sh"

cat > "$TOOLS_DIR/access_run_handoff_flow.sh" <<'ACCESS_HANDOFF_FLOW_CMD'
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
ACCESS_HANDOFF_FLOW_CMD
chmod +x "$TOOLS_DIR/access_run_handoff_flow.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_run_review_flow.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_116'

workflow_preset_commands:
- ./access_run_review_flow.sh
- ./access_run_request_investigation_flow.sh REQUEST_CODE [BATCH_CODE]
- ./access_run_handoff_flow.sh

recommended_preset_flow:
1. ./access_run_review_flow.sh
2. ./access_run_request_investigation_flow.sh REQUEST_CODE
3. ./access_run_handoff_flow.sh
README_APPEND_116
  fi
else
  cat > "$README_FILE" <<'README_NEW_116'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

workflow_preset_commands:
- ./access_run_review_flow.sh
- ./access_run_request_investigation_flow.sh REQUEST_CODE [BATCH_CODE]
- ./access_run_handoff_flow.sh
README_NEW_116
fi

echo "============================================================"
echo "ACCESS WORKFLOW PRESET PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
