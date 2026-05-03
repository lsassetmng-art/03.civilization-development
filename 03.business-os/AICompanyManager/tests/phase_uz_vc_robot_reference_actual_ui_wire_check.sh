#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"
JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
CACHE_JSON="$IMPL_APP_DIR/assets/data/aicm-robot-reference-cache.json"

if [ ! -f "$CACHE_JSON" ]; then
  echo "RESULT: FAIL"
  echo "REASON: cache missing"
  exit 1
fi

if ! grep -q 'AICM_ROBOT_REFERENCE_ACTUAL_UI_WIRE_BEGIN' "$JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: UI reference helper missing"
  exit 1
fi

if ! grep -q 'aicmRobotReferenceCard' "$JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: UI reference card missing"
  exit 1
fi

node --check "$JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "ROBOT_REFERENCE_ACTUAL_UI_WIRE: PRESENT"
echo "CACHE_JSON: PRESENT"
echo "DB WRITE: NOT EXECUTED"
echo "psql: READ_ONLY_ONLY"
echo "API WRITE: NOT EXECUTED"
echo "RLS APPLY: NOT EXECUTED"
