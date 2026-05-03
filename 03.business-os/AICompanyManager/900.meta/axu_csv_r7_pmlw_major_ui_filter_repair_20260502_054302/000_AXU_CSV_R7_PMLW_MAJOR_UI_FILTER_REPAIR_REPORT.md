# AICompanyManager Phase AXU-CSV-R7 pmlw major UI filter repair report

## Result
- FINAL_STATUS=CSV_R7_PMLW_MAJOR_UI_FILTER_REPAIR_READY
- PASS_COUNT=20
- WARN_COUNT=3
- FAIL_COUNT=0

## Cause
CSV import and context return are OK.
UI was filtering/rendering pmlw_major_items incorrectly.

## Fix
Only pmlwMajorRowsForCompany was repaired:
- reads context.pmlw_major_items
- also supports manager_major_items / major_items fallback
- filters by aicm_user_company_id when present
- does not hide rows whose company id is absent
- preserves renderPmlwMajorRows and 課長へ送る action

## Scope
- DB write: NO
- API POST in script: NO
- server change: NO
- core change: YES
- index change: NO

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_054302_csv_r7
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=11852

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/aicm-production-core.before_axu_csv_r7.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/020_node_check.txt
- SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/030_scan_before.txt
- SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/040_scan_after.txt
- VM_SMOKE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/051_vm_smoke.out
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/060_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/070_http_check.txt

## Manual test
1. 部門別タスク台帳へ移動
2. 登録済み大項目に25件が表示される
3. 各rowに「課長へ送る」が表示される
4. 1件で「課長へ送る」を押す

## If still failing
Paste:
cat "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/051_vm_smoke.out"
echo "============================================================"
tail -n 220 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/060_aicm_server.log"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7_pmlw_major_ui_filter_repair_20260502_054302/aicm-production-core.before_axu_csv_r7.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
