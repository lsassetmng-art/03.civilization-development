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

for needle in \
  'AICM_ROBOT_REFERENCE_ACTUAL_UI_WIRE_RECOVERY_BEGIN' \
  'aicmRobotReferenceCard("President")' \
  'aicmRobotReferenceCard("Manager")' \
  'aicmRobotReferenceCard("Leader")' \
  'aicmRobotReferenceCard("Worker")'
do
  if ! grep -q "$needle" "$JS_FILE"; then
    echo "RESULT: FAIL"
    echo "REASON: missing $needle"
    exit 1
  fi
done

node --check "$JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "ROBOT_REFERENCE_ACTUAL_UI_WIRE_RECOVERY: PRESENT"
echo "CACHE_JSON: PRESENT"
echo "DB WRITE: NOT EXECUTED"
echo "psql: READ_ONLY_ONLY"
echo "API WRITE: NOT EXECUTED"
echo "RLS APPLY: NOT EXECUTED"
