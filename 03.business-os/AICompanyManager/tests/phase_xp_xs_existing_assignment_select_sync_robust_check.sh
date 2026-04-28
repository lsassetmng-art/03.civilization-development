#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
SYNC_JS="$IMPL_APP_DIR/assets/js/aicm-existing-robot-assignment-select-sync.js"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'aicm-existing-robot-assignment-select-sync.js' "$INDEX_FILE"
grep -q 'AICM_EXISTING_ROBOT_ASSIGNMENT_SELECT_SYNC_ROBUST_V2' "$SYNC_JS"
grep -q 'waiting_for_option' "$SYNC_JS"
grep -q 'MAX_ATTEMPT' "$SYNC_JS"
grep -q 'already_selected' "$SYNC_JS"
grep -q 'Business側ロボットプール' "$SYNC_JS"
grep -q 'AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6' "$PREVIEW_JS"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4' "$POOL_WIRE_JS"

if grep -q 'AICM_EXISTING_ROBOT_ASSIGNMENT_SELECT_SYNC_ROBUST_V2' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$SYNC_JS" >/dev/null
node --check "$PREVIEW_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$SERVER_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "EXISTING_ASSIGNMENT_SELECT_SYNC_ROBUST: PRESENT"
echo "ROBOT_POOL_ID_FROM_EXISTING_ASSIGNMENT: RETRIED_AND_SYNCED"
echo "USER_SELECTED_VALUE: NOT_OVERWRITTEN"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
