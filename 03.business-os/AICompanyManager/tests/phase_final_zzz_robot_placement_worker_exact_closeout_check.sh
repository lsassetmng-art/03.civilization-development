#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_105437_phase_final_zzz_robot_placement_worker_exact_closeout/090_final_robot_placement_closeout_verify.log"
DB_WORKER_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_105437_phase_final_zzz_robot_placement_worker_exact_closeout/020_final_worker_exact_row.log"
DB_PLACEMENTS_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_105437_phase_final_zzz_robot_placement_worker_exact_closeout/010_final_company_robot_placements.log"

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

echo "RESULT: PASS"
echo "FINAL_ROBOT_PLACEMENT_WORKER_EXACT_CLOSEOUT: PASS"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
