#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_180033_phase_aca_acd_company_edit_action_stable_fix/099_company_edit_action_stable_fix_verify.log"
EDIT_ACTION_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'BOGUS_COMPANY_OPTION_REMOVED=YES' "$VERIFY_LOG"
grep -q 'COMPANY_CHANGE_NATIVE_SUBMIT_BLOCKED=YES' "$VERIFY_LOG"
grep -q 'COMPANY_CHANGE_STABLE_HANDLER_ENABLED=YES' "$VERIFY_LOG"
grep -q 'COMPANY_DELETE_SAFETY_BLOCKED=YES' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_EDIT_ACTION_STABLE_UI_V1' "$EDIT_ACTION_JS"
grep -q 'aicm-company-edit-action-stable-ui.js' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "COMPANY_EDIT_ACTION_STABLE_FIX: PASS"
echo "DB_WRITE: NOT_EXECUTED"
