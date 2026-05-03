# AXU-CSV-MAINT-R8M context hydration report

FINAL_STATUS=AXU_CSV_MAINT_R8M_CONTEXT_HYDRATION_READY
PASS_COUNT=27
WARN_COUNT=0
FAIL_COUNT=0

## Diagnosis fixed
API raw context had pmlw_major_items, but browser state.context dropped it.
This patch centrally hydrates manager major arrays into state.context.

## Scope
DB_WRITE=NO
API_POST_IN_SCRIPT=NO
SERVER_CHANGE=NO
CORE_CHANGE=YES
INDEX_CHANGE=NO

## Expected after reload
Visible debug panel should show:
- contextCounts.pmlw_major_items >= 1
- contextSelectedMajorRowsLength >= 1
- rowsLength >= 1
Then 登録済み大項目 should show rows and 課長へ送る.

## UI
OPEN_URL=http://127.0.0.1:8794/?v=20260502_074809_r8m
TERMUX_OPEN_STATUS=OPENED
AICM_PID=4623

## Files
BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8m_context_hydration_20260502_074809/aicm-production-core.before_maint_r8m.js
PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8m_context_hydration_20260502_074809/100_patch.out
CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8m_context_hydration_20260502_074809/020_node_check.txt
SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8m_context_hydration_20260502_074809/030_scan_after.txt
HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8m_context_hydration_20260502_074809/050_http.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8m_context_hydration_20260502_074809/040_aicm_server.log

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8m_context_hydration_20260502_074809/aicm-production-core.before_maint_r8m.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
