# AICompanyManager Phase AXU-CSV-R2M maintainable CSV input report

## Result
- FINAL_STATUS=CSV_MAINTAINABLE_INPUT_READY
- PASS_COUNT=31
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST in script: NO
- server change: NO
- core change: YES
- index change: NO

## Maintainability policy
- renderCsvImportCard was not fully replaced.
- CSV paste fallback was not added.
- Existing R1 helpers are reused if present.
- Canonical wrappers normalize action/change handlers.
- Existing server route is reused.

## What changed
- Existing CSV input class changed from hidden to native visible input.
- Added canonical wrappers:
  - aicmCsvOpenFileInput
  - aicmCsvReadSelectedFile
  - aicmCsvImportLoaded
- Wired existing actions:
  - task-ledger-csv-file-open
  - task-ledger-csv-import
  - data-core-file="task-ledger-csv"

## Counts
- CORE_CHANGED=true
- MARKER_COUNT=1
- NATIVE_INPUT_CLASS_COUNT=1
- CANONICAL_OPEN_COUNT=1
- CANONICAL_READ_COUNT=1
- CANONICAL_IMPORT_COUNT=1
- FILE_READER_COUNT=2
- READ_AS_TEXT_COUNT=2
- FILE_OPEN_BRANCH_COUNT=2
- CSV_IMPORT_BRANCH_COUNT=2
- FILE_CHANGE_BRANCH_COUNT=1
- IMPORT_ENDPOINT_COUNT=5
- PASTE_FALLBACK_COUNT=0

## HTTP
- AICM_PID=25188
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_224432_csv_r2m
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r2m_maintainable_input_20260501_224432/aicm-production-core.before_axu_csv_r2m.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r2m_maintainable_input_20260501_224432/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r2m_maintainable_input_20260501_224432/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r2m_maintainable_input_20260501_224432/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r2m_maintainable_input_20260501_224432/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r2m_maintainable_input_20260501_224432/050_http_check.txt

## Manual test
1. 部門別タスク台帳へ移動
2. CSVファイル入力が画面に出ているか確認
3. CSVファイル入力を直接タップしてCSV選択
4. ファイル名が「未選択」から変わるか確認
5. CSV取り込み実行
6. 登録済み大項目にrowが出るか確認
7. rowに「課長へ送る」が出るか確認

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r2m_maintainable_input_20260501_224432/aicm-production-core.before_axu_csv_r2m.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
