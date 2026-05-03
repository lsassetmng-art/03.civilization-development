# AICompanyManager Phase AXU-CSV-R1 CSV file change handler report

## Result
- FINAL_STATUS=CSV_FILE_CHANGE_HANDLER_READY
- PASS_COUNT=32
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST in script: NO
- server change: NO
- core change: YES
- index change: NO

## Root cause
CSV UI and server import route existed, but the file change handler was missing/incomplete.
Therefore the selected CSV was not read into state before CSV取り込み実行.

## What changed
- Added CSV file open helper.
- Added CSV file read helper using file.text() and FileReader/readAsText fallback.
- Added CSV import helper that reads state.csvImportText and posts to existing /api/aicm/v2/manager-major/import-csv when the user clicks import.
- Wired:
  - task-ledger-csv-file-open
  - data-core-file="task-ledger-csv" change
  - task-ledger-csv-import

## Counts
- CORE_CHANGED=true
- MARKER_COUNT=1
- OPEN_HELPER_COUNT=1
- READ_HELPER_COUNT=1
- IMPORT_HELPER_COUNT=1
- FILE_TEXT_COUNT=2
- FILE_READER_COUNT=1
- READ_AS_TEXT_COUNT=1
- FILE_OPEN_BRANCH_COUNT=2
- CSV_IMPORT_BRANCH_COUNT=2
- DATA_CORE_FILE_CHANGE_COUNT=1
- CSV_STATE_TEXT_COUNT=9
- SERVER_IMPORT_ENDPOINT_COUNT=3

## HTTP
- AICM_PID=20355
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_222025_csv_r1
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r1_file_change_handler_20260501_222025/aicm-production-core.before_axu_csv_r1.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r1_file_change_handler_20260501_222025/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r1_file_change_handler_20260501_222025/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r1_file_change_handler_20260501_222025/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r1_file_change_handler_20260501_222025/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r1_file_change_handler_20260501_222025/050_http_check.txt

## Manual test
1. 部門別タスク台帳へ移動
2. CSVファイル読込を押す
3. ファイル選択が開く
4. CSVを選ぶ
5. ファイル名が未選択から選択ファイル名へ変わる
6. CSV取り込み実行を押す
7. 成功メッセージが出る
8. 登録済み大項目にrowが出る
9. rowに「課長へ送る」が出る

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r1_file_change_handler_20260501_222025/aicm-production-core.before_axu_csv_r1.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
