#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_080224_phase_zzx_zzz_worker_exact_model_ui_reload_closeout/090_worker_exact_model_ui_reload_closeout_verify.log"
DB_WORKER_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_080224_phase_zzx_zzz_worker_exact_model_ui_reload_closeout/080_current_worker_exact_model.log"
DB_PLACEMENTS_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_080224_phase_zzx_zzz_worker_exact_model_ui_reload_closeout/081_current_all_placements_after_worker_correction.log"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -Eq 'BYD1-003|BYD1-002|BYD1-001|HD-R3|MG-NORN-001|MG-NORN-002|MG-NORN-003' "$DB_WORKER_LOG"

if grep -Eq 'LoVerS|Lover|LVS-' "$DB_WORKER_LOG"; then
  echo "RESULT: FAIL"
  echo "REASON: LoVerS/Lover/LVS remains in Worker row"
  exit 1
fi

grep -q 'President' "$DB_PLACEMENTS_LOG"
grep -q 'Manager' "$DB_PLACEMENTS_LOG"
grep -q 'Leader' "$DB_PLACEMENTS_LOG"
grep -q 'Worker' "$DB_PLACEMENTS_LOG"
grep -q 'DB_WRITE=NOT_EXECUTED' "$VERIFY_LOG"

echo "RESULT: PASS"
echo "WORKER_EXACT_MODEL_UI_RELOAD_CLOSEOUT: READY"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
