#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"
INDEX_FILE="$IMPL_APP_DIR/index.html"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-robot-reference-safe-dom-wire.js"
CACHE_JSON="$IMPL_APP_DIR/assets/data/aicm-robot-reference-cache.json"

if [ ! -f "$WIRE_JS" ] || [ ! -f "$CACHE_JSON" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if ! grep -q 'aicm-robot-reference-safe-dom-wire.js' "$INDEX_FILE"; then
  echo "RESULT: FAIL"
  exit 1
fi

if ! grep -q 'AICM_ROBOT_REFERENCE_SAFE_SEPARATE_FILE_WIRE_V1' "$WIRE_JS"; then
  echo "RESULT: FAIL"
  exit 1
fi

if grep -q 'AICM_ROBOT_REFERENCE_SAFE_SEPARATE_FILE_WIRE_V1' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not contain separate wire marker"
  exit 1
fi

node --check "$WIRE_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "ROBOT_REFERENCE_SEPARATE_FILE_WIRE: PRESENT"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
echo "DB WRITE: NOT_EXECUTED"
echo "psql: READ_ONLY_ONLY"
echo "RLS APPLY: NOT_EXECUTED"
