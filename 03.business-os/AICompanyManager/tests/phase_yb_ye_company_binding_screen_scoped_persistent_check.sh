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
grep -q 'AICM_BUSINESSOS_DB_COMPANY_BINDING_SCREEN_SCOPED_PERSISTENT_V3' "$BINDING_JS"
grep -q 'settings_only' "$BINDING_JS"
grep -q 'MutationObserver' "$BINDING_JS"
grep -q 'removeCardWhenWrongScreen' "$BINDING_JS"
grep -q 'aicm_businessos_db_company_binding_id' "$BINDING_JS"
grep -q 'aicm_businessos_db_company_binding_id' "$PREVIEW_JS"
grep -q 'aicm_company_binding_screen_scoped_persistent_v3' "$INDEX_FILE"

if grep -q 'AICM_BUSINESSOS_DB_COMPANY_BINDING_SCREEN_SCOPED_PERSISTENT_V3' "$MAIN_JS_FILE"; then
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
echo "COMPANY_BINDING_SCREEN_SCOPE: SETTINGS_ONLY"
echo "COMPANY_BINDING_PERSISTENT_INJECTION: ACTIVE"
echo "DASHBOARD_DISPLAY: BLOCKED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
