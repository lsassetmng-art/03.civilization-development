# AICompanyManager AXU-CSV-R7D still empty diagnostic

## Result
- FINAL_STATUS=AXU_CSV_R7D_STILL_EMPTY_DIAG_DONE_REVIEW_REQUIRED
- DIAGNOSIS=R7_PRESENT_BUT_RENDER_EMPTY_REVIEW_CORE_FUNCTION
- PASS_COUNT=12
- WARN_COUNT=0
- FAIL_COUNT=0

## Key counts
- LOCAL_R7_MARKER_COUNT=1
- SERVED_R7_MARKER_COUNT=1
- CONTEXT_PMLW_MAJOR_COUNT=50
- WOLF_MAJOR_COUNT=50

## Scope
- DB write: NO
- API POST: NO
- patch: NO

## Files
- LOCAL_MARKER_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7d_still_empty_diag_20260502_054522/010_local_core_marker.txt
- SERVED_MARKER_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7d_still_empty_diag_20260502_054522/021_served_core_marker.txt
- CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7d_still_empty_diag_20260502_054522/031_context_company_major_summary.txt
- DB_COMPANY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7d_still_empty_diag_20260502_054522/040_db_company_major_counts.tsv
- CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7d_still_empty_diag_20260502_054522/050_core_render_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r7d_still_empty_diag_20260502_054522/060_http_check.txt

## Next
- R7_PATCH_NOT_APPLIED_TO_LOCAL_CORE: rerun R7 or patch pmlwMajorRowsForCompany.
- SERVED_CORE_IS_STALE_OR_SERVER_NOT_RESTARTED: restart AICM server and reopen cache-busted URL.
- IMPORTED_ROWS_BELONG_TO_DIFFERENT_COMPANY_THAN_WOLF: fix selected company/import target mismatch.
- R7_PRESENT_BUT_RENDER_EMPTY_REVIEW_CORE_FUNCTION: patch renderPmlwMajorRows to read pmlw_major_items directly.
