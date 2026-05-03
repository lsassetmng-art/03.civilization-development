# AICompanyManager AXU-CSV-R10C helper canonicalize report

## Result
- FINAL_STATUS=CSV_R10C_HELPER_CANONICALIZE_FAILED_REVIEW_REQUIRED
- PASS_COUNT=21
- WARN_COUNT=0
- FAIL_COUNT=3

## Fix
- Deduplicated R10 helper.
- Reinserted one canonical helper before renderTaskLedgerPlaceholder.
- renderTaskLedgerPlaceholder uses R10 helper.
- R10 helper has direct state.context.pmlw_major_items fallback.
- server/DB/import route unchanged.

## Counts
- AFTER_HELPER_COUNT=1
- AFTER_MARKER_COUNT=3
- TASK_PLACEHOLDER_COUNT=1
- TASK_CALLSITE_COUNT=1
- TASK_OLD_CALLSITE_COUNT=0
- DIRECT_CONTEXT_REF_COUNT=3
- SERVED_R10_MARKER_COUNT=3
- SERVED_HELPER_COUNT=3
- SERVED_CALLSITE_COUNT=4

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_061621_csv_r10c
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=31264

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/aicm-production-core.before_axu_csv_r10c.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/100_patch.out
- CHECK_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/010_node_check_before.txt
- CHECK_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/020_node_check_after.txt
- SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/030_scan_before.txt
- SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/040_scan_after.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/060_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/050_aicm_server.log

## Manual test
1. 部門別タスク台帳
2. 登録済み大項目に50件が表示される
3. 各rowに「課長へ送る」が表示される

## If still empty
Paste:
cat "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/060_http_check.txt"
echo "============================================================"
grep -nC 260 "aicmAxuCsvR10RenderPmlwMajorRows" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/040_scan_after.txt"
echo "============================================================"
grep -nC 260 "renderTaskLedgerPlaceholder" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/040_scan_after.txt"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10c_helper_canonicalize_20260502_061621/aicm-production-core.before_axu_csv_r10c.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
