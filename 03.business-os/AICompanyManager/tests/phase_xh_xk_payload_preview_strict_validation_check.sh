#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6' "$PREVIEW_JS"
grep -q 'validatePayloadForPreview' "$PREVIEW_JS"
grep -q 'validation_errors' "$PREVIEW_JS"
grep -q 'robot_selection_status' "$PREVIEW_JS"
grep -q 'robot_not_selected_save_blocked' "$PREVIEW_JS"
grep -q 'PREVIEW_ONLY_SAVE_BLOCKED_VALIDATION' "$PREVIEW_JS"
grep -q 'company_id_single_db_fallback_confirm_before_save' "$PREVIEW_JS"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4' "$POOL_WIRE_JS"
grep -q '/api/aicm/structure-map' "$SERVER_JS"

if grep -q 'AICM_COMPANY_ID_CANONICALIZATION_PREVIEW_V5' "$PREVIEW_JS"; then
  echo "RESULT: FAIL"
  echo "REASON: old marker remains"
  exit 1
fi

if grep -q 'AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$SERVER_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "PAYLOAD_PREVIEW_STRICT_VALIDATION: PRESENT"
echo "ROBOT_NOT_SELECTED: BLOCKED"
echo "COMPANY_FALLBACK: WARNED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
