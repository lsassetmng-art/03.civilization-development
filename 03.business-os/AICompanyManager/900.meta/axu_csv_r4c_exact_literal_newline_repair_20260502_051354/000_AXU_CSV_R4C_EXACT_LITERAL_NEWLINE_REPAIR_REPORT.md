# AICompanyManager Phase AXU-CSV-R4C exact literal newline repair report

## Result
- FINAL_STATUS=CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_FAILED_REVIEW_REQUIRED
- PASS_COUNT=16
- WARN_COUNT=0
- FAIL_COUNT=1

## Scope
- DB write: NO
- API POST in script: NO
- server change: YES
- core change: NO
- index change: NO

## What this did
- Searched current server source for literal backslash-n near CSV import / major import code.
- Replaced only matching local candidates with real newline escape.
- Restarted AICM server and opened UI.

## Counts
- SERVER_CHANGED=true
- REPLACED_COUNT=1
- DANGER_BEFORE=18
- DANGER_AFTER=18
- ENDPOINT_COUNT=1

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_051354_csv_r4c
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=14968

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/aicm-local-ui-api-server.before_axu_csv_r4c.mjs
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/020_node_check.txt
- SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/030_scan_before.txt
- SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/040_scan_after.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/050_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/060_http_check.txt

## Manual test
1. 部門別タスク台帳へ移動
2. CSVファイルを選択
3. CSV取り込み実行
4. 登録済み大項目にrowが出る
5. rowに「課長へ送る」が出る

## If still failing
Immediately paste:
tail -n 200 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/050_aicm_server.log"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r4c_exact_literal_newline_repair_20260502_051354/aicm-local-ui-api-server.before_axu_csv_r4c.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
