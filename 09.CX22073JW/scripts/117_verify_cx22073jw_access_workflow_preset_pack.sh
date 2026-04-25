#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS WORKFLOW PRESET PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_run_review_flow.sh" \
  "$TOOLS_DIR/access_run_request_investigation_flow.sh" \
  "$TOOLS_DIR/access_run_handoff_flow.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

echo "============================================================"
echo "REVIEW FLOW SMOKE"
echo "============================================================"
"$TOOLS_DIR/access_run_review_flow.sh"

LATEST_REQUEST_CODE="$(
PERSONA_DATABASE_URL="${PERSONA_DATABASE_URL:-}" psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT request_code
FROM cx22073jw.access_manual_apply_receipt_item
ORDER BY created_at DESC
LIMIT 1;
SQL
)"

if [ -n "${LATEST_REQUEST_CODE:-}" ]; then
  echo "============================================================"
  echo "REQUEST INVESTIGATION FLOW SMOKE"
  echo "============================================================"
  "$TOOLS_DIR/access_run_request_investigation_flow.sh" "$LATEST_REQUEST_CODE"
else
  echo "REQUEST INVESTIGATION FLOW SMOKE SKIPPED: no request_code found"
fi

echo "============================================================"
echo "VERIFY ACCESS WORKFLOW PRESET PACK DONE"
echo "============================================================"
