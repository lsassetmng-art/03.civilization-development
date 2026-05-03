# AICompanyManager Phase AXU-CSV-R5 due_date cast repair report

## Result
- FINAL_STATUS=CSV_DUE_DATE_CAST_REPAIR_FAILED_REVIEW_REQUIRED
- PASS_COUNT=15
- WARN_COUNT=2
- FAIL_COUNT=2

## Cause
CSV import reached server SQL execution, but due_date was text while target column is date.

## Fix
In manager-major/import-csv route INSERT SELECT:
- due_date
- NULLIF(due_date, '')::date

## Scope
- DB write: NO
- API POST in script: NO
- server change: YES
- core change: NO
- index change: NO
- 佐藤(DB担当)レビュー対象: due_date cast only

## Counts
- SERVER_CHANGED=false
- REPLACED_COUNT=0
- DUE_DATE_CAST_COUNT=0
- DANGER_UNCAST_COUNT=0
- DOUBLE_CAST_COUNT=0

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_052152_csv_r5
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=21256

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/aicm-local-ui-api-server.before_axu_csv_r5.mjs
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/020_node_check.txt
- SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/030_scan_before.txt
- SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/040_scan_after.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/050_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/060_http_check.txt

## Manual test
1. 部門別タスク台帳へ移動
2. CSVファイルを選択
3. CSV取り込み実行
4. 登録済み大項目にrowが出る
5. rowに「課長へ送る」が出る

## If still failing
Immediately paste:
tail -n 220 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/050_aicm_server.log"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5_due_date_cast_repair_20260502_052152/aicm-local-ui-api-server.before_axu_csv_r5.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
