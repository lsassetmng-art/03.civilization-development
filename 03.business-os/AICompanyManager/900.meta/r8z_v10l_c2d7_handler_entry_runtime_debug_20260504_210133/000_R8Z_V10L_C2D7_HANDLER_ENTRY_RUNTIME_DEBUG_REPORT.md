# AICompanyManager V10L-C2D7 handler entry runtime debug report

## Result

FINAL_STATUS=V10L_C2D7_HANDLER_ENTRY_RUNTIME_DEBUG_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_PATCH=YES_DIAGNOSTIC_ONLY
- SERVER_PATCH=NO
- SERVER_RUNNING_CHECK=YES
- IF_SERVER_DOWN_START=YES
- HTTP_CHECK=YES
- BROWSER_OPEN=YES

## Purpose

C2D6 showed static button/dispatcher looked OK, but C2D5R2A branch debug was not recorded.
C2D7 adds temporary entry debug to aicmR8zMgrMajorCardHandleAction to determine:

- whether handler is called at all
- whether action argument is correct
- whether argument order is mismatched
- whether target/action is hidden inside event.target.closest("[data-core-action]")

## Safety

- No DB write
- No API POST
- No fetch added
- No XMLHttpRequest added
- Diagnostic only

## Files

- BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d7_handler_entry_runtime_debug_20260504_210133/aicm-production-core.before_v10l_c2d7.js
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d7_handler_entry_runtime_debug_20260504_210133/010_verify.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d7_handler_entry_runtime_debug_20260504_210133/020_core_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d7_handler_entry_runtime_debug_20260504_210133/021_server_node_check.txt
- EXTRACT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d7_handler_entry_runtime_debug_20260504_210133/030_handler_entry_debug_extract.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d7_handler_entry_runtime_debug_20260504_210133/050_server_status_after.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d7_handler_entry_runtime_debug_20260504_210133/070_http_check.html

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2d7_20260504_210133
