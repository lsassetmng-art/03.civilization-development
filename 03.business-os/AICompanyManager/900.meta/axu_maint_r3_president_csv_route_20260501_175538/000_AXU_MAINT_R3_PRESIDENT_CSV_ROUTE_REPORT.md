# AICompanyManager Phase AXU-MAINT-R3 President/CSV route UI report

## Result
- FINAL_STATUS=PRESIDENT_CSV_ROUTE_UI_READY
- PASS_COUNT=34
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- core change: YES
- index change: NO

## Canonical flow reflected

### President route
Dashboard:
- AI企業業務開始
- President sends business/work policy.
- Manager/部長 decomposes into major items.
- Major items appear in 部門別タスク台帳.
- Major item rows can be handed off to 課長.

### CSV route
Task ledger:
- CSV is a substitute for Manager/部長 decomposition.
- CSV imports decomposed major items.
- Imported major item rows can be handed off to 課長.

## Explicitly not implemented
- No "Managerに大項目作成依頼" button.
- No DB/API POST in this phase.
- No broad/text navigation hack.
- No direct Worker execution from empty major item state.

## Counts
- CORE_CHANGED=true
- MARKER_COUNT=1
- BUSINESS_START_SCREEN_COUNT=1
- BUSINESS_START_CARD_COUNT=1
- BUSINESS_START_ROUTE_COUNT=1
- BUSINESS_START_BUTTON_COUNT=3
- COMPANY_OVERVIEW_BASE_COUNT=1
- COMPANY_OVERVIEW_WRAPPER_COUNT=1
- CSV_SUBSTITUTE_TEXT_COUNT=2
- PRESIDENT_ROUTE_TEXT_COUNT=3
- WRONG_MANAGER_REQUEST_TEXT_COUNT=0
- TASK_LEDGER_ROUTE_COUNT=1
- LEADER_HANDOFF_BUTTON_COUNT=3

## HTTP
- AICM_PID=13994
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_175538_axu_maint_r3
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r3_president_csv_route_20260501_175538/aicm-production-core.before_axu_maint_r3.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r3_president_csv_route_20260501_175538/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r3_president_csv_route_20260501_175538/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r3_president_csv_route_20260501_175538/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r3_president_csv_route_20260501_175538/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r3_president_csv_route_20260501_175538/050_http_check.txt

## Manual test
1. ダッシュボードに「AI企業業務開始」が出る。
2. 押すと「President起点で業務を開始」画面へ遷移する。
3. 部門別タスク台帳のCSV説明が「部長/Manager分解済み」ルートになっている。
4. 大項目0件時に「Managerに依頼」系の文言がない。
5. 大項目rowがある時だけ「課長へ送る」が出る。

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_r3_president_csv_route_20260501_175538/aicm-production-core.before_axu_maint_r3.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
