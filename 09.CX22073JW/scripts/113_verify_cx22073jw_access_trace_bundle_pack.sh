#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

echo "============================================================"
echo "VERIFY ACCESS TRACE BUNDLE PACK"
echo "============================================================"

ls -l \
  "$TOOLS_DIR/access_make_request_trace_bundle.sh" \
  "$TOOLS_DIR/access_make_logical_view_trace_bundle.sh" \
  "$TOOLS_DIR/README_ACCESS_COMMANDS.md"

LATEST_REQUEST_CODE="$(
PERSONA_DATABASE_URL="${PERSONA_DATABASE_URL:-}" psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT request_code
FROM cx22073jw.access_manual_apply_receipt_item
ORDER BY created_at DESC
LIMIT 1;
SQL
)"

LATEST_LOGICAL_VIEW_NAME="$(
PERSONA_DATABASE_URL="${PERSONA_DATABASE_URL:-}" psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT logical_view_name
FROM cx22073jw.access_manual_apply_receipt_item
ORDER BY created_at DESC
LIMIT 1;
SQL
)"

if [ -n "${LATEST_REQUEST_CODE:-}" ]; then
  echo "============================================================"
  echo "REQUEST TRACE BUNDLE SMOKE"
  echo "============================================================"
  "$TOOLS_DIR/access_make_request_trace_bundle.sh" "$LATEST_REQUEST_CODE"
else
  echo "REQUEST TRACE BUNDLE SMOKE SKIPPED: no request_code found"
fi

if [ -n "${LATEST_LOGICAL_VIEW_NAME:-}" ]; then
  echo "============================================================"
  echo "LOGICAL VIEW TRACE BUNDLE SMOKE"
  echo "============================================================"
  "$TOOLS_DIR/access_make_logical_view_trace_bundle.sh" "$LATEST_LOGICAL_VIEW_NAME"
else
  echo "LOGICAL VIEW TRACE BUNDLE SMOKE SKIPPED: no logical_view_name found"
fi

echo "============================================================"
echo "VERIFY ACCESS TRACE BUNDLE PACK DONE"
echo "============================================================"
