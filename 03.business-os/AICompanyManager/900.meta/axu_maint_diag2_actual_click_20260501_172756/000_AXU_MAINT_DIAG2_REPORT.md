# AICompanyManager AXU-MAINT-DIAG2 report

## Result
- FINAL_STATUS=AXU_MAINT_DIAG2_DONE_REVIEW_REQUIRED
- DIAGNOSIS=CLICK_OR_RENDER_RUNTIME_ERROR
- PASS_COUNT=12
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
INDEX_HTTP_CODE=200
CORE_HTTP_CODE=200
LOCAL_SHA=8e04319d535f443cc5db64ddd6bad798525025d06152392a4176b8939681bb5a
SERVED_SHA=8e04319d535f443cc5db64ddd6bad798525025d06152392a4176b8939681bb5a
SHA_MATCH=YES
LOCAL_TASK_BRANCH_COUNT=1
SERVED_TASK_BRANCH_COUNT=1
LOCAL_NAV_COUNT=1
SERVED_NAV_COUNT=1
VM_AFTER_HAS_TASK_LEDGER=true
VM_AFTER_HAS_MANAGER_MAJOR=false
VM_AFTER_HAS_LEADER_HANDOFF=false
VM_SYNC_ERROR_COUNT=1
VM_UNHANDLED_ERROR_COUNT=0
DIAGNOSIS=CLICK_OR_RENDER_RUNTIME_ERROR

## Interpretation

### SERVED_CORE_DIFFERS_FROM_LOCAL_CORE
The browser/server is not using the file we patched.

### SERVED_RENDER_ROUTE_MISSING
The route patch did not reach the served bundle.

### CLICK_OR_RENDER_RUNTIME_ERROR
The click is causing a JS runtime error. See VM_CLICK_OUT.

### VM_ROUTE_OK_REAL_BROWSER_OR_BUNDLE_CACHE_OR_OUTSIDE_ROOT
The served core works in a controlled click test.
The remaining issue is likely:
- browser cache / old tab
- opened a different URL/server
- actual visible button is outside #aicm-root
- click is blocked by overlay or another script

## Files
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_diag2_actual_click_20260501_172756/020_http_compare.txt
- LOCAL_ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_diag2_actual_click_20260501_172756/030_local_route_scan.txt
- SERVED_ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_diag2_actual_click_20260501_172756/031_served_route_scan.txt
- VM_CLICK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_diag2_actual_click_20260501_172756/041_vm_click_route_test.out
- SUMMARY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_diag2_actual_click_20260501_172756/060_summary.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_diag2_actual_click_20260501_172756/010_node_check.txt
