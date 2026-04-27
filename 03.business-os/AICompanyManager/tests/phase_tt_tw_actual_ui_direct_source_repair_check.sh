#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"
INDEX_FILE="$IMPL_APP_DIR/index.html"
JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"

SCRIPT_COUNT="$(grep -oi '<script' "$INDEX_FILE" | wc -l | tr -d ' ')"
PATCH_MARKER_COUNT="$(grep -c 'AICM_.*PATCH_BEGIN' "$JS_FILE" || true)"
HELPER_COUNT="$(grep -c 'AICM_DIRECT_SOURCE_REPAIR_HELPERS_BEGIN' "$JS_FILE" || true)"
OPERATION_CARD_COUNT="$(grep -c '<div class="aicm-card"><h2>操作入口</h2>' "$JS_FILE" || true)"
PRESIDENT_ACTION_COUNT="$(grep -c 'save-company-president' "$JS_FILE" || true)"

echo "SCRIPT_COUNT=$SCRIPT_COUNT"
echo "PATCH_MARKER_COUNT=$PATCH_MARKER_COUNT"
echo "HELPER_COUNT=$HELPER_COUNT"
echo "OPERATION_CARD_COUNT=$OPERATION_CARD_COUNT"
echo "PRESIDENT_ACTION_COUNT=$PRESIDENT_ACTION_COUNT"

if [ "$SCRIPT_COUNT" != "1" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$PATCH_MARKER_COUNT" != "0" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$HELPER_COUNT" = "0" ] || [ "$OPERATION_CARD_COUNT" != "0" ] || [ "$PRESIDENT_ACTION_COUNT" = "0" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

node --check "$JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED"
echo "psql: NOT EXECUTED"
echo "API WRITE: NOT EXECUTED"
echo "RLS APPLY: NOT EXECUTED"
