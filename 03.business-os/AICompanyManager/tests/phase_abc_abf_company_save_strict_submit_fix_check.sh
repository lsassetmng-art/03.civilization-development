#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_172419_phase_abc_abf_company_save_strict_submit_fix/090_company_save_strict_submit_fix_verify.log"
COMPANY_CLIENT_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'STRICT_COMPANY_SUBMIT_ONLY=ENABLED' "$VERIFY_LOG"
grep -q 'NEW_ADD_NAVIGATION_EXCLUDED=YES' "$VERIFY_LOG"
grep -q 'BARE_ADD_CHANGE_EXCLUDED=YES' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V3_STRICT_SUBMIT' "$COMPANY_CLIENT_JS"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "COMPANY_SAVE_STRICT_SUBMIT_FIX: PASS"
echo "NEW_ADD_NAVIGATION_EXCLUDED: YES"
echo "DB_WRITE: NOT_EXECUTED"
