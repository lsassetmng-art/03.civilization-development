#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_180509_phase_ace_ach_company_change_white_screen_guard/099_company_change_white_screen_guard_verify.log"
GUARD_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'COMPANY_CHANGE_WHITE_SCREEN_GUARD=ENABLED' "$VERIFY_LOG"
grep -q 'COMPANY_CHANGE_EARLY_CAPTURE=YES' "$VERIFY_LOG"
grep -q 'COMPANY_CHANGE_NATIVE_SUBMIT_BLOCKED=YES' "$VERIFY_LOG"
grep -q 'SCRIPT_ORDER_STATUS=GUARD_BEFORE_COMPANY_CLIENT' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_CHANGE_WHITE_SCREEN_GUARD_V1' "$GUARD_JS"
grep -q 'aicm-company-change-white-screen-guard.js' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "COMPANY_CHANGE_WHITE_SCREEN_GUARD: PASS"
echo "DB_WRITE: NOT_EXECUTED"
