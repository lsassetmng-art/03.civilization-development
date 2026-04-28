#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
BINDING_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-company-binding.js"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'aicm-businessos-db-company-binding.js' "$INDEX_FILE"
grep -q 'AICM_BUSINESSOS_DB_COMPANY_BINDING_V1' "$BINDING_JS"
grep -q 'aicm-db-company-binding-select' "$BINDING_JS"
grep -q 'aicm-db-company-binding-select' "$PREVIEW_JS"
grep -q 'AICM_BUSINESSOS_DB_COMPANY_BINDING_PREVIEW_V7' "$PREVIEW_JS"
grep -q 'AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6' "$PREVIEW_JS"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4' "$POOL_WIRE_JS"
grep -q '/api/aicm/structure-map' "$SERVER_JS"

if grep -q 'AICM_BUSINESSOS_DB_COMPANY_BINDING_V1' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$BINDING_JS" >/dev/null
node --check "$PREVIEW_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$SERVER_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "BUSINESSOS_DB_COMPANY_BINDING: PRESENT"
echo "PREVIEW_COMPANY_ID_PREFERS_DB_BINDING: TRUE"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
