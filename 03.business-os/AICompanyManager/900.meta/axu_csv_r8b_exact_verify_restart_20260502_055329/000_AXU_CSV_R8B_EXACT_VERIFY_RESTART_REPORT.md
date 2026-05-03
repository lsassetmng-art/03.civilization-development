# AICompanyManager AXU-CSV-R8B exact verify / restart report

## Result
- FINAL_STATUS=CSV_R8B_EXACT_VERIFY_RESTART_READY
- PASS_COUNT=20
- WARN_COUNT=0
- FAIL_COUNT=0

## Interpretation
R8 previous FAIL may have counted renderPmlwMajorRowsBase as renderPmlwMajorRows.
This step uses exact function matching.

## Key counts
- R8_MARKER_COUNT=1
- EXACT_RENDER_FUNC_COUNT=1
- BASE_RENDER_FUNC_COUNT=1
- PMLW_FOR_COMPANY_EXACT_COUNT=1
- WOLF_MAJOR_COUNT=50
- SERVED_R8_MARKER_COUNT=1
- CONTEXT_PMLW_MAJOR_COUNT=50
- CONTEXT_WOLF_MAJOR_COUNT=50

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260502_055329_csv_r8b
- TERMUX_OPEN_STATUS=OPENED
- AICM_PID=18622

## Files
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/010_node_check.txt
- CORE_VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/020_core_exact_verify.txt
- DB_COMPANY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/030_db_company_major_counts.tsv
- CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/041_context_summary.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/060_http_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/070_core_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/050_aicm_server.log

## Manual check
1. opened URL
2. 部門別タスク台帳
3. 登録済み大項目に50件が出るか確認
4. 課長へ送るボタンが出るか確認

## If still empty
Paste:
cat "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/020_core_exact_verify.txt"
echo "============================================================"
cat "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/041_context_summary.txt"
echo "============================================================"
grep -nC 160 "renderTaskLedgerPlaceholder" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r8b_exact_verify_restart_20260502_055329/070_core_scan.txt"
