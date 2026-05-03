# AICompanyManager Phase AXU-CSV-R6 import visibility diagnostic

## Result
- FINAL_STATUS=AXU_CSV_R6_IMPORT_VISIBILITY_DIAG_DONE_REVIEW_REQUIRED
- DIAGNOSIS=CONTEXT_HAS_ROWS_UI_FILTER_OR_RENDER_ISSUE
- PASS_COUNT=16
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO
- index change: NO
- 佐藤(DB担当): read-only visibility diagnostic

## Current issue
UI shows:
- CSV取り込み完了: 25件
- 登録済み大項目はまだありません

This means import likely succeeded but visibility path may be broken.

## Counts
- DB_TOTAL_COUNT=26
- CONTEXT_PMLW_COUNT=25
- CONTEXT_MANAGER_COUNT=-1
- CONTEXT_MAJOR_COUNT=-1

## Files
- DB_TABLES_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/010_db_tables_probe.tsv
- DB_ROWS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/020_db_major_rows_probe.tsv
- DB_COMPANY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/030_db_company_counts.tsv
- CONTEXT_JSON=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/040_context.json
- CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/041_context_summary.txt
- SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/050_server_context_scan.txt
- CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/060_core_major_display_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/070_http_check.txt
- SUMMARY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r6_import_visibility_diag_20260502_054024/080_summary.txt

## Next likely fix
- If DB_HAS_ROWS_CONTEXT_MISSING_PMLW_MAJOR_ITEMS:
  patch server context builder to include business.aicm_manager_major_work_item as pmlw_major_items.
- If CONTEXT_HAS_ROWS_UI_FILTER_OR_RENDER_ISSUE:
  patch core pmlwMajorRowsForCompany / renderPmlwMajorRows filter.
- If DB_ROWS_NOT_FOUND_FOR_OWNER_CHECK_COMPANY_OR_OWNER:
  inspect inserted owner/company and selected company mismatch.
