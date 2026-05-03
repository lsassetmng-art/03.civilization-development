# AICompanyManager Phase AXU-CSV-R5H due_date helper repair report

## Result
- FINAL_STATUS=CSV_DUE_DATE_HELPER_REPAIR_READY
- PASS_COUNT=20
- WARN_COUNT=0
- FAIL_COUNT=0

## Maintainability decision
R5M/R5M2 function rewrite was rejected by actual source structure.
The existing import function already has a dedicated date SQL helper:
- aicmPmlwOptionalDateSql(row.due_date)

Therefore the maintainable fix is to repair the helper only.

## What changed
- aicmPmlwOptionalDateSql now returns:
  - NULL::date for empty due_date
  - 'YYYY-MM-DD'::date for valid due_date
  - explicit error for invalid due_date

## Scope
- DB write: NO
- API POST in script: NO
- server change: YES
- core change: NO
- index change: NO
- 佐藤(DB担当)レビュー対象: aicmPmlwOptionalDateSql only

## Counts
- SERVER_CHANGED=true
- MARKER_COUNT=1
- HELPER_COUNT=1
- NULL_DATE_COUNT=1
- DATE_CAST_COUNT=2
- HELPER_USAGE_COUNT=1

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_053746_csv_r5h
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=4879

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/aicm-local-ui-api-server.before_axu_csv_r5h.mjs
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/020_node_check.txt
- SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/030_scan_before.txt
- SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/040_scan_after.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/050_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/060_http_check.txt

## Manual test
1. 部門別タスク台帳へ移動
2. CSVファイルを選択
3. CSV取り込み実行
4. 登録済み大項目にrowが出る
5. rowに「課長へ送る」が出る

## If still failing
Immediately paste:
tail -n 240 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/050_aicm_server.log"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r5h_due_date_helper_repair_20260502_053746/aicm-local-ui-api-server.before_axu_csv_r5h.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
