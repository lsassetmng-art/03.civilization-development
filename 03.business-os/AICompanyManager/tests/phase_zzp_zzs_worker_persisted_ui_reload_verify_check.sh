#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_074833_phase_zzp_zzs_worker_persisted_ui_reload_verify/090_worker_persisted_ui_reload_verify.log"
DB_WORKER_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_074833_phase_zzp_zzs_worker_persisted_ui_reload_verify/080_current_worker_row_after_update.log"
DB_ALL_PLACEMENTS_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_074833_phase_zzp_zzs_worker_persisted_ui_reload_verify/081_current_all_placements.log"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'Worker' "$DB_WORKER_LOG"
grep -q 'President' "$DB_ALL_PLACEMENTS_LOG"
grep -q 'Manager' "$DB_ALL_PLACEMENTS_LOG"
grep -q 'Leader' "$DB_ALL_PLACEMENTS_LOG"
grep -q 'Worker' "$DB_ALL_PLACEMENTS_LOG"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "WORKER_PERSISTED_UI_RELOAD_VERIFY: READY"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
