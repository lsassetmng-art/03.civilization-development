#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_075550_phase_zzt_zzw_r2_worker_exact_model_correction/090_worker_exact_model_correction_r2_verify.log"
AFTER_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_075550_phase_zzt_zzw_r2_worker_exact_model_correction/040_after_worker_row.log"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'DB_WRITE=EXECUTED' "$VERIFY_LOG"
grep -q 'API_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'RLS_APPLY=NOT_EXECUTED' "$VERIFY_LOG"
grep -Eq 'BYD1-003|BYD1-002|BYD1-001|HD-R3|MG-NORN-001|MG-NORN-002|MG-NORN-003' "$AFTER_LOG"

if grep -Eq 'LoVerS|Lover|LVS-' "$AFTER_LOG"; then
  echo "RESULT: FAIL"
  echo "REASON: LoVerS/Lover/LVS still appears in Worker placement"
  exit 1
fi

echo "RESULT: PASS"
echo "WORKER_EXACT_MODEL_CORRECTION_R2: EXECUTED"
echo "DB_WRITE: EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
