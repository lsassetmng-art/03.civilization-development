# AICompanyManager AXU-CSV-R3-FIX1 literal newline repair report

## Result
- FINAL_STATUS=CSV_R3_LITERAL_NEWLINE_REPAIR_FAILED_REVIEW_REQUIRED
- PASS_COUNT=17
- WARN_COUNT=0
- FAIL_COUNT=1

## Cause
R3 inserted literal backslash-n into executable JS:
if (action === "task-ledger-csv-import") {\n ...

## Fix
Only the broken task-ledger-csv-import branch was replaced with real newlines.

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- core change: YES
- index change: NO

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_225458_csv_r3_fix1
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=29033

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_fix_literal_newline_20260501_225458/aicm-production-core.before_axu_csv_r3_fix1.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_fix_literal_newline_20260501_225458/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_fix_literal_newline_20260501_225458/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_fix_literal_newline_20260501_225458/030_scan.txt
- VM_SMOKE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_fix_literal_newline_20260501_225458/041_vm_smoke.out
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_fix_literal_newline_20260501_225458/050_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_fix_literal_newline_20260501_225458/060_http_check.txt

## Manual test
1. 白画面が解消しているか
2. 部門別タスク台帳へ移動できるか
3. CSV選択 -> ファイル名表示
4. CSV取り込み実行
5. 登録済み大項目にrowが出るか
6. rowに「課長へ送る」が出るか

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_fix_literal_newline_20260501_225458/aicm-production-core.before_axu_csv_r3_fix1.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
