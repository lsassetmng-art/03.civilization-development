#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"
INDEX_FILE="$IMPL_APP_DIR/index.html"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-robot-reference-safe-dom-wire.js"

grep -q 'aicm-robot-reference-safe-dom-wire.js' "$INDEX_FILE"
grep -q 'AICM_ROBOT_REFERENCE_DECLUTTER_WIRE_V3' "$WIRE_JS"
grep -q 'decluttered_compact_owner_only' "$WIRE_JS"
grep -q 'shouldNeverInject' "$WIRE_JS"

if grep -q 'global-dashboard' "$WIRE_JS"; then
  echo "RESULT: FAIL"
  echo "REASON: global-dashboard should not exist"
  exit 1
fi

if grep -q 'AICM_ROBOT_REFERENCE_DECLUTTER_WIRE_V3' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$WIRE_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "ROBOT_REFERENCE_DECLUTTER: PRESENT"
echo "FORM_REFERENCE_CARDS: BLOCKED"
echo "GLOBAL_DASHBOARD_REFERENCE: REMOVED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
echo "DB WRITE: NOT_EXECUTED"
echo "psql: NOT_EXECUTED"
echo "RLS APPLY: NOT_EXECUTED"
