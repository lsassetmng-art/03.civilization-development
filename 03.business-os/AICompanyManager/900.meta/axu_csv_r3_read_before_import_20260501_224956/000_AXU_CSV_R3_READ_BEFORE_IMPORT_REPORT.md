# AICompanyManager Phase AXU-CSV-R3 read-before-import report

## Result
- FINAL_STATUS=CSV_READ_BEFORE_IMPORT_READY
- PASS_COUNT=30
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST in script: NO
- server change: NO
- core change: YES
- index change: NO

## Maintainability policy
- renderCsvImportCard was not replaced.
- CSV paste fallback was not added.
- Existing file-open/change behavior was not removed.
- Import action now performs read-before-import fallback.

## What changed
- Added aicmCsvReadCurrentFileTextForImport.
- Added aicmCsvImportLoadedReadBeforeImport.
- CSV取り込み実行 now reads current selected file if state.csvImportText is empty.
- Existing server route is reused.

## Manual test
1. 部門別タスク台帳へ移動
2. CSVファイル読込からCSVを選ぶ
3. ファイル名が表示される
4. CSV取り込み実行を押す
5. 成功メッセージが出る
6. 登録済み大項目にrowが出る
7. rowに「課長へ送る」が出る

## Counts
- CORE_CHANGED=true
- MARKER_COUNT=1
- READ_BEFORE_HELPER_COUNT=1
- READ_BEFORE_IMPORT_COUNT=1
- READ_BEFORE_IMPORT_CALL_COUNT=1
- FILE_TEXT_COUNT=4
- FILE_READER_COUNT=3
- READ_AS_TEXT_COUNT=3
- IMPORT_ENDPOINT_COUNT=7
- RENDER_CSV_IMPORT_CARD_COUNT=1
- PASTE_FALLBACK_COUNT=0

## HTTP
- AICM_PID=27531
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_224956_csv_r3
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_read_before_import_20260501_224956/aicm-production-core.before_axu_csv_r3.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_read_before_import_20260501_224956/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_read_before_import_20260501_224956/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_read_before_import_20260501_224956/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_read_before_import_20260501_224956/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_read_before_import_20260501_224956/050_http_check.txt

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_read_before_import_20260501_224956/aicm-production-core.before_axu_csv_r3.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
