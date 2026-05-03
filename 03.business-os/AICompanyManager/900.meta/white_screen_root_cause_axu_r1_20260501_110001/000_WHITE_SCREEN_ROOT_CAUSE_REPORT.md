# AICompanyManager AXU-R1 white screen root-cause report

## Result
- FINAL_STATUS=WHITE_SCREEN_DIAG_FAILED_REVIEW_REQUIRED
- DIAGNOSIS=STATIC_OR_SECURITY_CHECK_FAILED
- PASS_COUNT=21
- WARN_COUNT=1
- FAIL_COUNT=1

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO
- index change: NO

## Key counts
- AXU_R1_MARKER_COUNT=2
- LEADER_HANDOFF_ACTION_COUNT=2
- OLD_DIRECT_ACTION_COUNT=0
- OPERATION_HEADER_COUNT=1
- RENDER_PMLW_COUNT=1
- CONFIRM_RENDER_COUNT=1
- TOKEN_LEAK_COUNT=0
- ASYNC_ASYNC_COUNT=0
- SMOKE_ERROR_COUNT=1
- SMOKE_ROOT_HTML_LENGTH=0

## HTTP
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- SERVED_CORE_SIZE=197616
- SERVED_AXU_R1_MARKER_COUNT=2
- LOCAL_AXU_R1_MARKER_COUNT=2
- SERVER_STARTED_BY_DIAG=NO

## Interpretation guide
- CORE_RUNTIME_BOOT_OR_RENDER_ERROR:
  Check BROWSER_SMOKE_OUT first.
- STALE_SERVER_OR_WRONG_CORE_SERVED:
  Restart local server and open URL with cache-busting query.
- OLD_DIRECT_RUNTIME_ACTION_MAY_BE_MIXED:
  Remove old Manager->Worker direct runtime action before continuing.
- NO_STATIC_BOOT_ERROR_FOUND_NEED_BROWSER_ACTION_TRACE:
  The white screen likely happens after button click or browser-only API; next step is action-specific trace.

## Files
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/010_node_check.txt
- CORE_AXU_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/020_core_axu_r1_scan.txt
- CORE_RENDER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/030_core_render_scan.txt
- CORE_ACTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/040_core_action_scan.txt
- SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/050_server_scan.txt
- BROWSER_SMOKE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/061_browser_smoke.out
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/070_http_check.txt
- SERVER_LOG_TAIL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/080_server_log_tail.txt
- RECENT_META_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_axu_r1_20260501_110001/090_recent_meta_dirs.txt

## Next
Paste:
1. this report
2. browser smoke output
3. AXU scan
4. render scan if needed
