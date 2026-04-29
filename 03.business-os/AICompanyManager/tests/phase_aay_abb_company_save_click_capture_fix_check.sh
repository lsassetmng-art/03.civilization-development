#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_172054_phase_aay_abb_company_save_click_capture_fix/090_company_save_click_capture_fix_verify.log"
COMPANY_CLIENT_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'COMPANY_CLICK_CAPTURE=ENABLED' "$VERIFY_LOG"
grep -q 'CONFIRM_EXPECTED_ON_COMPANY_ADD_OR_CHANGE=YES' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V2_CAPTURE' "$COMPANY_CLIENT_JS"
grep -q 'company_save_capture_v2' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "COMPANY_SAVE_CLICK_CAPTURE_FIX: PASS"
echo "CONFIRM_EXPECTED: YES"
echo "DB_WRITE: NOT_EXECUTED"
