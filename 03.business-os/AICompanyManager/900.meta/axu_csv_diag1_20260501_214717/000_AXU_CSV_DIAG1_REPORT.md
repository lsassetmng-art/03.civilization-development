# AICompanyManager Phase AXU-CSV-DIAG1 CSV import diagnostic

## Result
- FINAL_STATUS=AXU_CSV_DIAG1_DONE_REVIEW_REQUIRED
- DIAGNOSIS=CSV_FILE_CHANGE_HANDLER_MISSING_OR_INCOMPLETE
- PASS_COUNT=18
- WARN_COUNT=2
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO
- index change: NO

## Summary
CSV_FILE_OPEN_BUTTON_COUNT=2
CSV_IMPORT_BUTTON_COUNT=2
CSV_FILE_INPUT_COUNT=2
CSV_DATA_CORE_FILE_COUNT=1
PARSE_CSV_COUNT=1
HANDLE_CSV_COUNT=0
FILE_READER_COUNT=0
READ_AS_TEXT_COUNT=0
SERVER_IMPORT_ROUTE_COUNT=1
POST_IMPORT_ROUTE_COUNT=1
INDEX_HTTP_CODE=200
CORE_HTTP_CODE=200
DIAGNOSIS=CSV_FILE_CHANGE_HANDLER_MISSING_OR_INCOMPLETE

## Files
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag1_20260501_214717/010_node_check.txt
- CORE_CSV_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag1_20260501_214717/020_core_csv_scan.txt
- CORE_CLICK_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag1_20260501_214717/030_core_click_scan.txt
- CORE_CHANGE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag1_20260501_214717/040_core_change_scan.txt
- SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag1_20260501_214717/050_server_csv_route_scan.txt
- DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag1_20260501_214717/060_db_readonly_check.tsv
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag1_20260501_214717/070_http_check.txt
- SUMMARY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_diag1_20260501_214717/080_summary.txt

## Next
Paste REPORT, SUMMARY_OUT, and the relevant scan based on DIAGNOSIS.

If DIAGNOSIS is STATIC_ROUTE_EXISTS_NEED_RUNTIME_ERROR_OR_CSV_FORMAT_CHECK:
- Next step should test actual browser action or provide exact error message shown after CSV取り込み実行.
