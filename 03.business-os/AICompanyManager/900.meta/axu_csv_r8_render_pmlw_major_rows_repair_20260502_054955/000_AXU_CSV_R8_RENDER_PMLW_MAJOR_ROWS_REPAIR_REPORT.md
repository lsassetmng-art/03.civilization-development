# AICompanyManager AXU-CSV-R8 render pmlw major rows repair report

## Result
- FINAL_STATUS=CSV_R8_RENDER_PMLW_MAJOR_ROWS_REPAIR_FAILED_REVIEW_REQUIRED
- PASS_COUNT=17
- WARN_COUNT=3
- FAIL_COUNT=1

## Cause
R7 was present in local and served core.
DB/context had rows, but renderPmlwMajorRows still rendered empty.

## Fix
Only renderPmlwMajorRows was repaired:
- accepts rows argument
- falls back to selected company + pmlwMajorRowsForCompany
- renders pmlw_major_items-compatible fields
- preserves pmlw-major-leader-handoff action
- does not touch DB/server/import route

## Scope
- DB write: NO
- API POST in script: NO
- server change: NO
- core change: YES
- index change: NO

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_054955_csv_r8
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=16904

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/aicm-production-core.before_axu_csv_r8.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/020_node_check.txt
- SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/030_scan_before.txt
- SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/040_scan_after.txt
- VM_SMOKE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/051_vm_smoke.out
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/060_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/070_http_check.txt

## Manual test
1. 部門別タスク台帳へ移動
2. 登録済み大項目に50件が表示される
3. 各rowに「課長へ送る」が表示される
4. 1件で「課長へ送る」を押す

## If still failing
Paste:
cat "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/051_vm_smoke.out"
echo "============================================================"
cat "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/070_http_check.txt"
echo "============================================================"
tail -n 220 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/060_aicm_server.log"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8_render_pmlw_major_rows_repair_20260502_054955/aicm-production-core.before_axu_csv_r8.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
