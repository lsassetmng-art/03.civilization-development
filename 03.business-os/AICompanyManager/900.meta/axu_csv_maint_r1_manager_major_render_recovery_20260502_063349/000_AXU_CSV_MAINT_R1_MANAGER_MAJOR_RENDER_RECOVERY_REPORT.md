# AICompanyManager AXU-CSV-MAINT-R1 manager major render recovery report

## Result
- FINAL_STATUS=AXU_CSV_MAINT_R1_MANAGER_MAJOR_RENDER_RECOVERY_FAILED_REVIEW_REQUIRED
- PASS_COUNT=23
- WARN_COUNT=0
- FAIL_COUNT=1

## Maintainability correction
Previous R10 patch helpers were phase-named and duplicated.
This recovery removes the patch-name helper and creates two domain-named canonical functions:
- aicmGetManagerMajorRowsForSelectedCompany
- aicmRenderManagerMajorRows

renderTaskLedgerPlaceholder now uses only this canonical path.

## Scope
- DB write: NO
- API POST in script: NO
- server change: NO
- core change: YES
- index change: NO

## Counts
- AFTER_LEGACY_HELPER_COUNT=0
- AFTER_ROWS_HELPER_COUNT=1
- AFTER_RENDER_HELPER_COUNT=0
- AFTER_PLACEHOLDER_COUNT=1
- SERVED_LEGACY_HELPER_COUNT=0
- SERVED_ROWS_HELPER_COUNT=1
- SERVED_RENDER_HELPER_COUNT=1

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_063349_maint_r1
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=7026

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/aicm-production-core.before_axu_csv_maint_r1.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/100_patch.out
- CHECK_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/010_node_check_before.txt
- CHECK_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/020_node_check_after.txt
- SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/030_scan_before.txt
- SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/040_scan_after.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/060_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/050_aicm_server.log

## Manual test
1. 部門別タスク台帳
2. 登録済み大項目に50件が表示される
3. 各rowに「課長へ送る」が表示される

## If still empty
Paste:
cat "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/060_http_check.txt"
echo "============================================================"
grep -nC 260 "aicmGetManagerMajorRowsForSelectedCompany" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/040_scan_after.txt"
echo "============================================================"
grep -nC 260 "renderTaskLedgerPlaceholder" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/040_scan_after.txt"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r1_manager_major_render_recovery_20260502_063349/aicm-production-core.before_axu_csv_maint_r1.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
