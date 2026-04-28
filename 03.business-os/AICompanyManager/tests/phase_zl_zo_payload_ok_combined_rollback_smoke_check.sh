#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"
AIWORKER_DIR="$HOME_DIR/03.civilization-development/03.business-os/_aiworker"

PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
UI_SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"
AIWORKER_API_JS="$AIWORKER_DIR/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js"

grep -q 'AICM_FINAL_PAYLOAD_ROLE_MODEL_NORMALIZER_V13' "$PREVIEW_JS"
grep -q 'AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6' "$PREVIEW_JS"
grep -q 'HD-R5", "BYD2-002", "BYD2-003' "$PREVIEW_JS"

node --check "$PREVIEW_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null
node --check "$UI_SERVER_JS" >/dev/null
node --check "$AIWORKER_API_JS" >/dev/null

echo "RESULT: PASS"
echo "PAYLOAD_OK_ROLLBACK_SMOKE_READY"
echo "DB_WRITE: ROLLBACK_ONLY"
echo "API_WRITE: ROLLBACK_SMOKE_ONLY"
echo "RLS_APPLY: NOT_EXECUTED"
