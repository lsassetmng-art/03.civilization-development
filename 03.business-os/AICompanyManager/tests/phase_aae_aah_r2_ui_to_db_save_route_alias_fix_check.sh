#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_113231_phase_aae_aah_r2_ui_to_db_save_route_alias_fix/090_ui_to_db_save_route_alias_fix_verify.log"
ROLLBACK_SMOKE_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_113231_phase_aae_aah_r2_ui_to_db_save_route_alias_fix/060_write_api_rollback_smoke.log"
INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'ROLLBACK_RESULT=PASS' "$VERIFY_LOG"
grep -q 'UI_PERSISTENT_SAVE_ENABLED=YES' "$VERIFY_LOG"
grep -q 'aicm-robot-placement-persistent-save-client.js' "$INDEX_FILE"
grep -q '"ok": true' "$ROLLBACK_SMOKE_LOG"

echo "RESULT: PASS"
echo "UI_TO_DB_SAVE_ROUTE_ALIAS_FIX: PASS"
echo "ROLLBACK_SMOKE: PASS"
echo "DB_WRITE_IN_THIS_SCRIPT: ROLLBACK_ONLY"
