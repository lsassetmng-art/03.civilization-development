#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_172808_phase_abg_abj_company_final_form_detection_fix/090_company_final_form_detection_fix_verify.log"
COMPANY_CLIENT_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'FINAL_FORM_BARE_ADD_ENABLED=YES' "$VERIFY_LOG"
grep -q 'NEW_ADD_NAVIGATION_EXCLUDED=YES' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V4_FINAL_FORM_SUBMIT' "$COMPANY_CLIENT_JS"
grep -q 'company_final_form_submit_v4' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "COMPANY_FINAL_FORM_DETECTION_FIX: PASS"
echo "NEW_ADD_NAVIGATION_EXCLUDED: YES"
echo "FINAL_FORM_BARE_ADD_ENABLED: YES"
echo "DB_WRITE: NOT_EXECUTED"
