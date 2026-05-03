# AICompanyManager AXU-CSV-R10B recover/verify/restart report

## Result
- FINAL_STATUS=CSV_R10B_RECOVER_VERIFY_RESTART_FAILED_REVIEW_REQUIRED
- PASS_COUNT=19
- WARN_COUNT=0
- FAIL_COUNT=2

## Fix policy
Previous R10 failed in verification regex after partial mutation.
R10B verifies current state, patches only missing R10 helper/call-site, and restarts UI.

## Scope
- DB write: NO
- API POST in script: NO
- server change: NO
- core change: ONLY_IF_MISSING
- index change: NO

## Counts
- AFTER_MARKER_COUNT=2
- AFTER_HELPER_COUNT=2
- AFTER_TASK_PLACEHOLDER_COUNT=1
- AFTER_CALLSITE_COUNT=3
- SERVED_R10_MARKER_COUNT=2
- SERVED_CALLSITE_COUNT=3

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_061402_csv_r10b
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=29304

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/aicm-production-core.before_axu_csv_r10b.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/100_patch.out
- CHECK_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/010_node_check_before.txt
- CHECK_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/020_node_check_after.txt
- SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/030_scan_before.txt
- SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/040_scan_after.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/060_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/050_aicm_server.log

## Manual test
1. 部門別タスク台帳
2. 登録済み大項目に50件が表示される
3. 各rowに「課長へ送る」が表示される

## If still empty
Paste:
cat "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/060_http_check.txt"
echo "============================================================"
grep -nC 240 "renderTaskLedgerPlaceholder" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/040_scan_after.txt"
echo "============================================================"
grep -nC 240 "aicmAxuCsvR10RenderPmlwMajorRows" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10b_recover_verify_restart_20260502_061402/040_scan_after.txt"
