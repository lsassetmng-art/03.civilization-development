#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_115446_phase_aau_aax_company_save_route_first/090_company_save_route_first_verify.log"
COMPANY_API_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-company-write-api.mjs"
COMPANY_CLIENT_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js"
ROBOT_DISABLED_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"
ROLLBACK_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_115446_phase_aau_aax_company_save_route_first/070_company_save_rollback_smoke.log"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'COMPANY_SAVE_ROUTE=ENABLED' "$VERIFY_LOG"
grep -q 'ROBOT_PLACEMENT_UI_SAVE=DISABLED_UNTIL_COMPANY_CANONICAL' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_WRITE_API_V1' "$COMPANY_API_JS"
grep -q 'AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V1' "$COMPANY_CLIENT_JS"
grep -q 'ROBOT_PLACEMENT_SAVE_CLIENT_DISABLED' "$ROBOT_DISABLED_JS"
grep -q 'aicm-company-persistent-save-client.js' "$INDEX_FILE"
grep -q '"ok": true' "$ROLLBACK_LOG"

echo "RESULT: PASS"
echo "COMPANY_SAVE_ROUTE_FIRST: PASS"
echo "COMPANY_SAVE_ROUTE: ENABLED"
echo "ROBOT_PLACEMENT_UI_SAVE: DISABLED_UNTIL_COMPANY_CANONICAL"
echo "DB_WRITE: ROLLBACK_ONLY"
