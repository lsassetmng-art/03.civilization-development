#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_173228_phase_abk_abn_company_save_event_capture_hard_fix/090_company_save_event_capture_hard_fix_verify.log"
COMPANY_CLIENT_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'COMPANY_EVENT_HARD_CAPTURE=ENABLED' "$VERIFY_LOG"
grep -q 'CAPTURE_CLICK=YES' "$VERIFY_LOG"
grep -q 'CAPTURE_POINTERUP=YES' "$VERIFY_LOG"
grep -q 'CAPTURE_TOUCHEND=YES' "$VERIFY_LOG"
grep -q 'CAPTURE_SUBMIT=YES' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V5_EVENT_HARD_CAPTURE' "$COMPANY_CLIENT_JS"
grep -q 'company_event_hard_capture_v5' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "COMPANY_SAVE_EVENT_CAPTURE_HARD_FIX: PASS"
echo "DB_WRITE: NOT_EXECUTED"
