# AICompanyManager Phase AXU-MAINT-R2 PMLW rows wrapper report

## Result
- FINAL_STATUS=PMLW_ROWS_WRAPPER_FIXED_READY
- PASS_COUNT=29
- WARN_COUNT=1
- FAIL_COUNT=0

## Root cause fixed
renderPmlwMajorRows wrapper called renderPmlwMajorRowsBaseAxuR1B() without rows.

This caused:
- TypeError: Cannot read properties of undefined (reading 'length')
- task-ledger navigation appeared to fail because render crashed.

## What changed
- renderPmlwMajorRows(rows) now passes safeRows to renderPmlwMajorRowsBaseAxuR1B(safeRows).
- No broad/text navigation was added.
- No DB/API POST was executed.

## Counts
- CORE_CHANGED=true
- MARKER_COUNT=1
- WRAPPER_SIGNATURE_COUNT=1
- BASE_CALL_WITH_ROWS_COUNT=1
- BASE_FUNCTION_COUNT=1
- TASK_LEDGER_ROUTE_COUNT=1
- CANONICAL_NAV_COUNT=1
- LEADER_HANDOFF_BUTTON_COUNT=3
- STANDALONE_PANEL_COUNT=1
- BROAD_CLICK_MARKER_COUNT=0
- TEXT_NAV_MARKER_COUNT=0
- BAD_LITERAL_COUNT=0

## HTTP
- AICM_PID=2034
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_173052_axu_maint_r2
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r2_pmlw_rows_wrapper_20260501_173052/aicm-production-core.before_axu_maint_r2.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r2_pmlw_rows_wrapper_20260501_173052/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r2_pmlw_rows_wrapper_20260501_173052/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r2_pmlw_rows_wrapper_20260501_173052/030_scan.txt
- VM_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r2_pmlw_rows_wrapper_20260501_173052/041_vm_click_route_test.out
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r2_pmlw_rows_wrapper_20260501_173052/050_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r2_pmlw_rows_wrapper_20260501_173052/060_http_check.txt

## Manual test
1. UIを開く。
2. 部門別タスク台帳ボタンを押す。
3. Manager大項目が表示される。
4. 「課長へ送る」が表示される。
5. 「課長へ送る」押下で確認画面へ進むか確認。

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r2_pmlw_rows_wrapper_20260501_173052/aicm-production-core.before_axu_maint_r2.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
