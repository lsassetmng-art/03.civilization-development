#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_074356_phase_zza_zzd_r2_worker_update_rollback_smoke/199_worker_update_rollback_smoke_r2_verify.log"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'ROLLBACK_OK=YES' "$VERIFY_LOG"
grep -q 'DB_WRITE=ROLLBACK_ONLY' "$VERIFY_LOG"
grep -q 'API_WRITE=ROLLBACK_SMOKE_ONLY' "$VERIFY_LOG"
grep -q 'DIRECT_UPDATE_ENDPOINT_CALL=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'RLS_APPLY=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "WORKER_UPDATE_ROLLBACK_SMOKE_R2: PASS"
echo "DB_WRITE: ROLLBACK_ONLY"
echo "API_WRITE: ROLLBACK_SMOKE_ONLY"
echo "DIRECT_UPDATE_ENDPOINT_CALL: NOT_EXECUTED"
