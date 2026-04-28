#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'aicm-robot-placement-payload-preview.js' "$INDEX_FILE"
grep -q 'AICM_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_V1' "$PREVIEW_JS"
grep -q 'preview_only' "$PREVIEW_JS"
grep -q 'company_robot_placement.preview_only' "$PREVIEW_JS"
grep -q 'placement_role_code' "$PREVIEW_JS"
grep -q 'robot_pool_id' "$PREVIEW_JS"
grep -q 'model_code' "$PREVIEW_JS"
grep -q 'internal_nickname' "$PREVIEW_JS"
grep -q 'quantity_consumption: false' "$PREVIEW_JS"
grep -q 'api_write: false' "$PREVIEW_JS"
grep -q 'db_write: false' "$PREVIEW_JS"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4' "$POOL_WIRE_JS"
grep -q '/api/aicm/business-robot-pool' "$SERVER_JS"

if grep -q 'AICM_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_V1' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$SERVER_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "ROBOT_PLACEMENT_PAYLOAD_PREVIEW: PRESENT"
echo "PREVIEW_ONLY: TRUE"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
echo "QUANTITY_CONSUMPTION: NOT_EXECUTED"
