# AXU-CSV-MAINT-R8L browser state/context rows log report

FINAL_STATUS=AXU_CSV_MAINT_R8L_BROWSER_STATE_ROWS_LOG_FAILED_REVIEW_REQUIRED
PASS_COUNT=18
WARN_COUNT=0
FAIL_COUNT=3

## What this does
Adds a temporary visible debug panel inside 部門別タスク台帳:
- state.screen
- state.selectedCompanyId
- selected company id/name
- state.context keys/counts
- state.context pmlw_major_items count
- context selected-company major rows count
- rows type/isArray/length
- rows first item
- display scope
- error/notice message

## Scope
DB_WRITE=NO
API_POST_IN_SCRIPT=NO
SERVER_CHANGE=NO
CORE_CHANGE=YES_DIAGNOSTIC_ONLY
INDEX_CHANGE=NO

## UI
OPEN_URL=http://127.0.0.1:8794/?v=20260502_074430_r8l
TERMUX_OPEN_STATUS=OPENED
AICM_PID=31872

## Files
BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/aicm-production-core.before_maint_r8l.js
PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/100_patch.out
CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/020_node_check.txt
SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/030_scan_after.txt
HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/050_http.txt
CONTEXT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/060_context_summary.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/040_aicm_server.log

## Manual check
Open 部門別タスク台帳 and paste/screenshot the visible DEBUG panel.

## Rollback after diagnostic
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/aicm-production-core.before_maint_r8l.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
