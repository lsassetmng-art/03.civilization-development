#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_114326_phase_aam_aap_production_role_button_save_route/090_production_role_button_save_route_verify.log"
SAVE_CLIENT_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'AICM_PRODUCTION_ROLE_BUTTON_SAVE_ROUTE_V1' "$SAVE_CLIENT_JS"
grep -q 'ROLE_BUTTON_SAVE_ROUTE=ENABLED' "$VERIFY_LOG"
grep -q 'GENERIC_DB_SAVE_BUTTON=REMOVED' "$VERIFY_LOG"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'aicm-robot-placement-persistent-save-client.js' "$INDEX_FILE"

echo "RESULT: PASS"
echo "PRODUCTION_ROLE_BUTTON_SAVE_ROUTE: PASS"
echo "GENERIC_DB_SAVE_BUTTON: REMOVED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_SAVE: NOT_EXECUTED"
