#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
BINDING_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-company-binding.js"
POOL_WIRE_JS="$IMPL_APP_DIR/assets/js/aicm-businessos-db-robot-pool-wire.js"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_PREVIEW_EXISTING_ASSIGNMENT_RESOLVER_V9' "$PREVIEW_JS"
grep -q 'AICM_FINAL_PREVIEW_READINESS_ALIGNMENT_V8' "$PREVIEW_JS"
grep -q 'AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6' "$PREVIEW_JS"
grep -q 'AICM_BUSINESSOS_DB_COMPANY_BINDING_SCREEN_SCOPED_PERSISTENT_V3' "$BINDING_JS"
grep -q 'AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4' "$POOL_WIRE_JS"
grep -q 'robot_pool_id_not_canonical_uuid' "$PREVIEW_JS"
grep -q 'robot_selection_not_businessos_db' "$PREVIEW_JS"
grep -q 'aicm_businessos_db_company_binding_id' "$PREVIEW_JS"

node --check "$PREVIEW_JS" >/dev/null
node --check "$BINDING_JS" >/dev/null
node --check "$POOL_WIRE_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null
node --check "$SERVER_JS" >/dev/null

echo "RESULT: PASS"
echo "MANAGER_LEADER_WORKER_PAYLOAD_FINAL_CHECK_READY"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
echo "UI_CHANGE: NOT_EXECUTED"
