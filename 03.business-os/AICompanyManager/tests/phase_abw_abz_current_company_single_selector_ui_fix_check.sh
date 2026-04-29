#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_175552_phase_abw_abz_current_company_single_selector_ui_fix/099_current_company_single_selector_ui_fix_verify.log"
SINGLE_SELECTOR_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'CURRENT_COMPANY_SOURCE=TOP_AI_COMPANY_SELECT_ONLY' "$VERIFY_LOG"
grep -q 'AI_COMPANY_DISPLAY_REFLECTS_SELECTED_COMPANY=YES' "$VERIFY_LOG"
grep -q 'DUPLICATE_COMPANY_EDIT_SELECTOR_HIDDEN=YES' "$VERIFY_LOG"
grep -q 'BUSINESSOS_COMPANY_BIND_CARD_HIDDEN=YES' "$VERIFY_LOG"
grep -q 'AICM_CURRENT_COMPANY_SINGLE_SELECTOR_UI_V1' "$SINGLE_SELECTOR_JS"
grep -q 'aicm-current-company-single-selector-ui.js' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "CURRENT_COMPANY_SINGLE_SELECTOR_UI_FIX: PASS"
echo "DB_WRITE: NOT_EXECUTED"
