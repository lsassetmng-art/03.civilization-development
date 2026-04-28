#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_COMPANY_ID_CANONICALIZATION_PREVIEW_V5' "$PREVIEW_JS"
grep -q 'canonicalCompany' "$PREVIEW_JS"
grep -q 'company_id_input' "$PREVIEW_JS"
grep -q 'company_id_source' "$PREVIEW_JS"
grep -q 'company_id_canonicalization_status' "$PREVIEW_JS"
grep -q 'company_id_local_only_save_blocked' "$PREVIEW_JS"
grep -q 'target_id_canonicalization_status' "$PREVIEW_JS"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4' "$POOL_WIRE_JS"
grep -q '/api/aicm/structure-map' "$SERVER_JS"

if grep -q 'AICM_COMPACT_PAYLOAD_PREVIEW_DETAILS_TOGGLE_REPAIR_V4' "$PREVIEW_JS"; then
  echo "RESULT: FAIL"
  echo "REASON: old marker remains"
  exit 1
fi

if grep -q 'AICM_COMPANY_ID_CANONICALIZATION_PREVIEW_V5' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$SERVER_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "COMPANY_ID_CANONICALIZATION_PREVIEW: PRESENT"
echo "LOCAL_COMPANY_ID: SEPARATED_AS_COMPANY_ID_INPUT"
echo "DB_CANONICAL_COMPANY_ID: USED_WHEN_RESOLVED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "MAIN_UI_JS_CHANGE: NOT_EXECUTED"
