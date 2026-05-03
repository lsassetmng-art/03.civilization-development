# AICompanyManager Phase AXU-CSV-DIAG2 import failure diagnostic

## Result
- FINAL_STATUS=AXU_CSV_DIAG2_DONE_REVIEW_REQUIRED
- DIAGNOSIS=SERVER_OR_DB_IMPORT_FAILED_OR_CONTEXT_NOT_RETURNING_ROWS
- PASS_COUNT=20
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO
- index change: NO

## Summary
DIAGNOSIS=SERVER_OR_DB_IMPORT_FAILED_OR_CONTEXT_NOT_RETURNING_ROWS
CSV_FILE=/sdcard/Download/manager_major_items_ui.csv
CSV_FOUND=1
CSV_PARSE_OK=1
CSV_HEADERS_OK=1
CSV_ROWS_OK=1
CORE_IMPORT_OK=1
SERVER_ROUTE_OK=1
SERVER_LOG_IMPORT_HINT=1
CONTEXT_MAJOR_COUNT=0
INDEX_HTTP_CODE=200
CORE_HTTP_CODE=200
CONTEXT_HTTP_CODE=200

## Files
- CSV_FIND_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/010_csv_find.txt
- CSV_PARSE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/021_csv_parse_check.out
- CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/030_core_csv_import_scan.txt
- SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/040_server_import_route_scan.txt
- SERVER_LOG_TAIL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/050_server_log_tail.txt
- DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/060_db_readonly_major_probe.tsv
- CONTEXT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/070_context_probe.json
- CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/071_context_summary.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/080_http_check.txt
- SUMMARY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag2_import_failure_20260501_225809/090_summary.txt

## Interpretation
- CSV_HEADER_MISMATCH: CSVカラム名がserver想定と違う。
- CLICK_DID_NOT_REACH_SERVER_IMPORT_ROUTE: UIクリック/JS handler問題。
- SERVER_OR_DB_IMPORT_FAILED_OR_CONTEXT_NOT_RETURNING_ROWS: server routeまたはDB保存/context返却問題。
- ROWS_EXIST_CONTEXT_OK_UI_RENDER_FILTER_OR_SELECTION_ISSUE: DB/contextにはあるがUI表示条件で落ちている。

## Next
Paste SUMMARY_OUT, CSV_PARSE_OUT, SERVER_LOG_TAIL, CONTEXT_SUMMARY.
