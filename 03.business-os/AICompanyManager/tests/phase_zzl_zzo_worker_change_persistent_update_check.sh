#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_074708_phase_zzl_zzo_worker_change_persistent_update/090_worker_change_persistent_update_verify.log"
AFTER_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_074708_phase_zzl_zzo_worker_change_persistent_update/030_after_worker_row.log"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'DB_WRITE=EXECUTED' "$VERIFY_LOG"
grep -q 'API_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'RLS_APPLY=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'Worker' "$AFTER_LOG"

echo "RESULT: PASS"
echo "WORKER_CHANGE_PERSISTENT_UPDATE: EXECUTED"
echo "DB_WRITE: EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
