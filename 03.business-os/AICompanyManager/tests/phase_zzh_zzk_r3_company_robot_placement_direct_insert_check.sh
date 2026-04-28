#!/data/data/com.termux/files/usr/bin/bash
set -eu

VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_074156_phase_zzh_zzk_r3_company_robot_placement_direct_insert/090_company_robot_placement_direct_insert_r3_verify.log"
ROWS_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_074156_phase_zzh_zzk_r3_company_robot_placement_direct_insert/040_inserted_rows_summary.log"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'DB_WRITE=EXECUTED' "$VERIFY_LOG"
grep -q 'API_WRITE=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'RLS_APPLY=NOT_EXECUTED' "$VERIFY_LOG"
grep -q 'President' "$ROWS_LOG"
grep -q 'Manager' "$ROWS_LOG"
grep -q 'Leader' "$ROWS_LOG"
grep -q 'Worker' "$ROWS_LOG"

echo "RESULT: PASS"
echo "COMPANY_ROBOT_PLACEMENT_DIRECT_INSERT_R3: EXECUTED"
echo "PRESIDENT_MANAGER_LEADER_WORKER: SAVED"
echo "DB_WRITE: EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
