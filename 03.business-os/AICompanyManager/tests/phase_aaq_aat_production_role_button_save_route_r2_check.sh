#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_114922_phase_aaq_aat_production_role_button_save_route_r2/090_production_role_button_save_route_r2_verify.log"
SAVE_CLIENT_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'DIRECT_SELECT_SAVE=ENABLED' "$VERIFY_LOG"
grep -q 'PAYLOAD_DEPENDENT_SAVE=REMOVED' "$VERIFY_LOG"
grep -q 'EXISTING_VALUE_SELECT_SYNC=ENABLED' "$VERIFY_LOG"
grep -q 'AICM_PRODUCTION_ROLE_BUTTON_DIRECT_SELECT_SAVE_ROUTE_V2' "$SAVE_CLIENT_JS"
grep -q 'aicm-robot-placement-persistent-save-client.js' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "PRODUCTION_ROLE_BUTTON_DIRECT_SELECT_SAVE_ROUTE_R2: PASS"
echo "PAYLOAD_DEPENDENT_SAVE: REMOVED"
echo "EXISTING_VALUE_SELECT_SYNC: ENABLED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_SAVE: NOT_EXECUTED"
