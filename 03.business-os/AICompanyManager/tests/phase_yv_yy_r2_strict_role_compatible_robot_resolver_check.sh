#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_STRICT_ROLE_COMPATIBLE_ROBOT_RESOLVER_V11' "$PREVIEW_JS"
grep -q 'businessOsTextSupportsTargetRole' "$PREVIEW_JS"
grep -q 'select_role_businessos_db_option' "$PREVIEW_JS"
grep -q 'AICompanyManager/g' "$PREVIEW_JS"
grep -q 'roleTokenMatch' "$PREVIEW_JS"
grep -q 'aicm_strict_role_compatible_robot_resolver_v11_r2' "$INDEX_FILE"

if grep -q '\\n/\* AICM_STRICT_ROLE_COMPATIBLE_ROBOT_RESOLVER_V11 \*/' "$PREVIEW_JS"; then
  echo "RESULT: FAIL"
  echo "REASON: literal backslash-n marker found"
  exit 1
fi

if grep -q 'AICM_STRICT_ROLE_COMPATIBLE_ROBOT_RESOLVER_V11' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null
node --check "$SERVER_JS" >/dev/null

echo "RESULT: PASS"
echo "STRICT_ROLE_COMPATIBLE_ROBOT_RESOLVER_R2: ACTIVE"
echo "MANAGER_SHOULD_NOT_PICK_LEADER_HD_R4: EXPECTED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
