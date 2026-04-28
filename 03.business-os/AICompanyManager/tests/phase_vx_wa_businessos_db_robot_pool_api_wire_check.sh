#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'aicm-businessos-db-robot-pool-wire.js' "$INDEX_FILE"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_V1' "$WIRE_JS"
grep -q '/api/aicm/business-robot-pool' "$SERVER_JS"
grep -q 'business.robot_pool' "$SERVER_JS"
grep -q 'business.robot_placement_role_catalog' "$SERVER_JS"

if grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_V1' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS must not be modified"
  exit 1
fi

node --check "$WIRE_JS" >/dev/null
node --check "$SERVER_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "BUSINESSOS_DB_ROBOT_POOL_API_WIRE: PRESENT"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
echo "DB WRITE: NOT_EXECUTED"
echo "psql: READ_ONLY_BY_LOCAL_API"
echo "RLS APPLY: NOT_EXECUTED"
