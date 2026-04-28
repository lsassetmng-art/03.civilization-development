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
grep -q 'AICM_TARGET_ID_CANONICALIZATION_PREVIEW_V2' "$PREVIEW_JS"
grep -q 'target_id_input' "$PREVIEW_JS"
grep -q 'target_id_source' "$PREVIEW_JS"
grep -q 'target_id_canonicalization_status' "$PREVIEW_JS"
grep -q 'save_blocked' "$PREVIEW_JS"
grep -q '/api/aicm/structure-map' "$SERVER_JS"
grep -q 'business.aicm_company' "$SERVER_JS"
grep -q 'business.aicm_department' "$SERVER_JS"
grep -q 'business.aicm_organization' "$SERVER_JS"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4' "$POOL_WIRE_JS"

if grep -q 'AICM_TARGET_ID_CANONICALIZATION_PREVIEW_V2' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$SERVER_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "TARGET_ID_CANONICALIZATION_PREVIEW: PRESENT"
echo "STRUCTURE_MAP_API: PRESENT"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
echo "QUANTITY_CONSUMPTION: NOT_EXECUTED"
