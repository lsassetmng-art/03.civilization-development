#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
GUARD_JS="$IMPL_APP_DIR/assets/js/aicm-legacy-local-robot-selection-guard.js"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
BINDING_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-company-binding.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'aicm-legacy-local-robot-selection-guard.js' "$INDEX_FILE"
grep -q 'AICM_LEGACY_LOCAL_ROBOT_SELECTION_GUARD_V1' "$GUARD_JS"
grep -q 'isInvalidLegacySelection' "$GUARD_JS"
grep -q 'BusinessOS DB' "$GUARD_JS"
grep -q 'department-manager-robot' "$GUARD_JS"
grep -q 'repaired_to_businessos_db' "$GUARD_JS"

if grep -q 'AICM_LEGACY_LOCAL_ROBOT_SELECTION_GUARD_V1' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$GUARD_JS" >/dev/null
node --check "$PREVIEW_JS" >/dev/null
node --check "$BINDING_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null
node --check "$SERVER_JS" >/dev/null

echo "RESULT: PASS"
echo "LEGACY_LOCAL_ROBOT_SELECTION_GUARD: ACTIVE"
echo "MANAGER_LEGACY_SELECTION_REPAIR: EXPECTED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
