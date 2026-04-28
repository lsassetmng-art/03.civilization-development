#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_PREVIEW_ROLE_CANONICAL_ROBOT_RESOLVER_V10' "$PREVIEW_JS"
grep -q 'selectedRobotIsCanonicalBusinessOs' "$PREVIEW_JS"
grep -q 'role_businessos_db_fallback' "$PREVIEW_JS"
grep -q 'firstBusinessOsRobotForTarget' "$PREVIEW_JS"
grep -q 'BusinessOS DB' "$PREVIEW_JS"
grep -q 'aicm_preview_role_canonical_robot_resolver_v10_r2' "$INDEX_FILE"

if grep -q '\\n/\* AICM_PREVIEW_ROLE_CANONICAL_ROBOT_RESOLVER_V10 \*/' "$PREVIEW_JS"; then
  echo "RESULT: FAIL"
  echo "REASON: literal backslash-n marker found"
  exit 1
fi

if grep -q 'AICM_PREVIEW_ROLE_CANONICAL_ROBOT_RESOLVER_V10' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null
node --check "$SERVER_JS" >/dev/null

echo "RESULT: PASS"
echo "PREVIEW_ROLE_CANONICAL_ROBOT_RESOLVER_R2: ACTIVE"
echo "LITERAL_BACKSLASH_N_MARKER: NOT_FOUND"
echo "MANAGER_LEGACY_LOCAL_ROBOT_IGNORED: EXPECTED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
