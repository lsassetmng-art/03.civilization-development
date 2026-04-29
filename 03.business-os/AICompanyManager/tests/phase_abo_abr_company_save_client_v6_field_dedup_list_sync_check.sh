#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_174012_phase_abo_abr_company_save_client_v6_field_dedup_list_sync/090_company_save_client_v6_field_dedup_list_sync_verify.log"
COMPANY_CLIENT_JS="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'COMPANY_FIELD_MAPPING_FIXED=YES' "$VERIFY_LOG"
grep -q 'DUPLICATE_CONFIRM_LOCK=YES' "$VERIFY_LOG"
grep -q 'SAVED_COMPANY_SELECTOR_SYNC=YES' "$VERIFY_LOG"
grep -q 'AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V6_FIELD_DEDUP_LIST_SYNC' "$COMPANY_CLIENT_JS"
grep -q 'company_v6_field_dedup_list_sync' "$INDEX_FILE"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'API_SAVE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "COMPANY_SAVE_CLIENT_V6_FIELD_DEDUP_LIST_SYNC: PASS"
echo "DB_WRITE: NOT_EXECUTED"
