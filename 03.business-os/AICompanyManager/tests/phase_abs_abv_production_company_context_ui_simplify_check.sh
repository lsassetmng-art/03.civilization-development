#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_174723_phase_abs_abv_production_company_context_ui_simplify/099_production_company_context_ui_simplify_verify.log"
UI_SIMPLIFY_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'DUPLICATE_COMPANY_EDIT_SELECTOR_HIDDEN=YES' "$VERIFY_LOG"
grep -q 'BUSINESSOS_COMPANY_ID_CARD_HIDDEN=YES' "$VERIFY_LOG"
grep -q 'COMPANY_SAVE_DEBUG_BADGE_HIDDEN=YES' "$VERIFY_LOG"
grep -q 'CURRENT_COMPANY_SOURCE=TOP_AI_COMPANY_SELECT' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_CONTEXT_PRODUCTION_UI_V1' "$UI_SIMPLIFY_JS"
grep -q 'aicm-company-context-production-ui.js' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "PRODUCTION_COMPANY_CONTEXT_UI_SIMPLIFY: PASS"
echo "DUPLICATE_COMPANY_EDIT_SELECTOR_HIDDEN: YES"
echo "BUSINESSOS_COMPANY_ID_CARD_HIDDEN: YES"
echo "DB_WRITE: NOT_EXECUTED"
