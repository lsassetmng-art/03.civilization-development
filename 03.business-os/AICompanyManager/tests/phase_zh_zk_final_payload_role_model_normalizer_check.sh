#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_FINAL_PAYLOAD_ROLE_MODEL_NORMALIZER_V13' "$PREVIEW_JS"
grep -q 'aicmNormalizeRobotForFinalPayload' "$PREVIEW_JS"
grep -q 'HD-R5", "BYD2-002", "BYD2-003' "$PREVIEW_JS"
grep -q 'final_payload_role_model_option' "$PREVIEW_JS"
grep -q 'aicm_final_payload_role_model_normalizer_v13' "$INDEX_FILE"

if grep -n 'role === "Manager"' "$PREVIEW_JS" | grep -q 'HD-R4'; then
  echo "RESULT: FAIL"
  echo "REASON: Manager allowlist contains HD-R4"
  exit 1
fi

if grep -q 'AICM_FINAL_PAYLOAD_ROLE_MODEL_NORMALIZER_V13' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null
node --check "$SERVER_JS" >/dev/null

echo "RESULT: PASS"
echo "FINAL_PAYLOAD_ROLE_MODEL_NORMALIZER: ACTIVE"
echo "MANAGER_ALLOWLIST: HD-R5 / BYD2-002 / BYD2-003"
echo "MANAGER_HD_R4_EXCLUDED: YES"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
