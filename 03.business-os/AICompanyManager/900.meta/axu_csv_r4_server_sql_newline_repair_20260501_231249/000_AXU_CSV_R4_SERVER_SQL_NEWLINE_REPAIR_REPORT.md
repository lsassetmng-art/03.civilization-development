# AICompanyManager Phase AXU-CSV-R4 server SQL newline repair report

## Result
- FINAL_STATUS=CSV_SERVER_SQL_NEWLINE_REPAIR_FAILED_REVIEW_REQUIRED
- PASS_COUNT=15
- WARN_COUNT=2
- FAIL_COUNT=1

## Cause
CSV import server route generated SQL containing literal backslash-n:
- ,\n

Postgres read the backslash as SQL and returned:
- syntax error at or near "\"

## Fix
Only manager-major/import-csv route neighborhood was repaired:
- dangerous double-backslash-n join removed
- server route retained
- no DB write/API POST executed by this script

## Scope
- DB write: NO
- API POST in script: NO
- server change: YES
- core change: NO
- index change: NO

## Counts
- SERVER_CHANGED=false
- MARKER_COUNT=0
- REMAINING_DANGER_JOIN_COUNT=0
- ROUTE_ENDPOINT_COUNT=1

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_231249_csv_r4
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=7553

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4_server_sql_newline_repair_20260501_231249/aicm-local-ui-api-server.before_axu_csv_r4.mjs
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4_server_sql_newline_repair_20260501_231249/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4_server_sql_newline_repair_20260501_231249/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4_server_sql_newline_repair_20260501_231249/030_server_route_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4_server_sql_newline_repair_20260501_231249/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4_server_sql_newline_repair_20260501_231249/050_http_check.txt

## Manual test
1. 部門別タスク台帳へ移動
2. CSVファイルを選択
3. CSV取り込み実行
4. 成功メッセージ確認
5. 登録済み大項目にrowが出る
6. rowに「課長へ送る」が出る

## If still failing
Next diagnostic:
- tail -n 200 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4_server_sql_newline_repair_20260501_231249/040_aicm_server.log"
- context pmlw_major_items count check

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4_server_sql_newline_repair_20260501_231249/aicm-local-ui-api-server.before_axu_csv_r4.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
