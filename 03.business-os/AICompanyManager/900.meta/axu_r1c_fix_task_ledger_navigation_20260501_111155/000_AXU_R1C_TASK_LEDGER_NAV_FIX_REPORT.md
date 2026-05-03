# AICompanyManager Phase AXU-R1C task-ledger navigation fix report

## Result
- FINAL_STATUS=TASK_LEDGER_NAVIGATION_FIXED_READY
- PASS_COUNT=23
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- core change: YES
- index change: NO

## What changed
- Added fallback navigation for data-screen-only buttons.
- Strengthened go navigation target handling.
- Enriched exact task-ledger data-screen refs with data-core-action="go" where possible.

## Counts
- MARKER_COUNT=2
- SCREEN_ONLY_FALLBACK_COUNT=1
- ROBUST_GO_COUNT=1
- TASK_LEDGER_SCREEN_COUNT=20
- TASK_LEDGER_GO_COUNT=1
- HANDLE_ROOT_CLICK_COUNT=1
- BAD_LITERAL_COUNT=0

## HTTP
- AICM_PID=18073
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_111155_axu_r1c_nav_fix
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1c_fix_task_ledger_navigation_20260501_111155/aicm-production-core.before_axu_r1c_nav_fix.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1c_fix_task_ledger_navigation_20260501_111155/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1c_fix_task_ledger_navigation_20260501_111155/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1c_fix_task_ledger_navigation_20260501_111155/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1c_fix_task_ledger_navigation_20260501_111155/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1c_fix_task_ledger_navigation_20260501_111155/050_http_check.txt

## Manual test
1. UIを開く。
2. 部門別タスク台帳ボタンを押す。
3. 部門別タスク台帳画面へ遷移する。
4. Manager大項目周辺に「課長へ送る」が表示されるか確認する。

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1c_fix_task_ledger_navigation_20260501_111155/aicm-production-core.before_axu_r1c_nav_fix.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
