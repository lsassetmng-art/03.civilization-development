#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
BINDING_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-company-binding.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_FINAL_PREVIEW_READINESS_ALIGNMENT_V8' "$PREVIEW_JS"
grep -q 'AICM_BUSINESSOS_DB_COMPANY_BINDING_STORAGE_V2' "$BINDING_JS"
grep -q 'aicm_businessos_db_company_binding_id' "$PREVIEW_JS"
grep -q 'localStorage.setItem(STORAGE_KEY' "$BINDING_JS"
grep -q 'robot_pool_id_not_canonical_uuid' "$PREVIEW_JS"
grep -q 'robot_selection_not_businessos_db' "$PREVIEW_JS"
grep -q 'aicm_final_preview_readiness_v8' "$INDEX_FILE"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4' "$POOL_WIRE_JS"

if grep -q 'AICM_FINAL_PREVIEW_READINESS_ALIGNMENT_V8' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$BINDING_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$SERVER_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "FINAL_PREVIEW_READINESS_ALIGNMENT: PRESENT"
echo "COMPANY_BINDING_LOCALSTORAGE: ACTIVE"
echo "ROBOT_POOL_ID_UUID_STRICT: ACTIVE"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
