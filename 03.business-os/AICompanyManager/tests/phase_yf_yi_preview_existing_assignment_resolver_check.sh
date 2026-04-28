#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
BINDING_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-company-binding.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_PREVIEW_EXISTING_ASSIGNMENT_RESOLVER_V9' "$PREVIEW_JS"
grep -q 'resolveRobotForPayload' "$PREVIEW_JS"
grep -q 'existingAssignmentRobotPoolId' "$PREVIEW_JS"
grep -q 'robot_resolve_source' "$PREVIEW_JS"
grep -q 'existing_assignment_visible' "$PREVIEW_JS"
grep -q 'aicm_preview_existing_assignment_resolver_v9' "$INDEX_FILE"

if grep -q 'AICM_PREVIEW_EXISTING_ASSIGNMENT_RESOLVER_V9' "$MAIN_JS_FILE"; then
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
echo "PREVIEW_EXISTING_ASSIGNMENT_RESOLVER: ACTIVE"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
