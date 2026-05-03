# AICompanyManager AXU-CSV-R3 white screen diagnostic

## Result
- FINAL_STATUS=WHITE_SCREEN_DIAG_DONE_REVIEW_REQUIRED
- WHITE_SCREEN_CAUSE=CORE_SYNTAX_ERROR_NODE_CHECK_FAILED
- PASS_COUNT=14
- WARN_COUNT=1
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO
- index change: NO

## Summary
WHITE_SCREEN_CAUSE=CORE_SYNTAX_ERROR_NODE_CHECK_FAILED
NODE_CHECK_FAILED=1
BAD_LITERAL_HITS=1
VM_ERROR_COUNT=1
INDEX_HTTP_CODE=200
CORE_HTTP_CODE=200
LOCAL_SHA=5d996d23d33e0f6d614219cbb2355199e66fba7c2fab66e08bc7df0c82f11938
SERVED_SHA=5d996d23d33e0f6d614219cbb2355199e66fba7c2fab66e08bc7df0c82f11938

## Interpretation guide
- CORE_SYNTAX_ERROR_NODE_CHECK_FAILED:
  core JS has syntax error. Fix only the exact syntax location from node --check.
- LIKELY_LITERAL_BACKSLASH_N_INJECTION:
  patcher likely inserted literal \n into JS code. Replace only that broken branch with real newlines.
- CORE_RUNTIME_ERROR_VM_SMOKE_FAILED:
  syntax is OK but boot/render throws. Use VM smoke stack trace.
- LOCAL_SERVER_OR_CORE_HTTP_NOT_READY:
  server/core is not being served.
- SERVED_CORE_MISMATCH_CACHE_OR_OLD_SERVER:
  browser/server is serving a different core than local file. Restart server/cache-bust.
- NO_STATIC_ERROR_FOUND_CHECK_BROWSER_CONSOLE_OR_ROUTE_STATE:
  static checks pass; next inspect browser console or route state.

## Files
- NODE_CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/010_node_check.txt
- BAD_LITERAL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/020_bad_literal_scan.txt
- CSV_R3_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/030_csv_r3_scan.txt
- CLICK_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/040_handle_click_scan.txt
- RENDER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/050_render_scan.txt
- VM_SMOKE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/061_browser_smoke.out
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/070_http_check.txt
- SERVER_LOG_TAIL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/080_server_log_tail.txt
- RECENT_META_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/090_recent_meta_dirs.txt
- SUMMARY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r3_white_screen_diag_20260501_225235/100_summary.txt

## Next
Paste:
1. SUMMARY_OUT
2. NODE_CHECK_OUT
3. VM_SMOKE_OUT
4. BAD_LITERAL_OUT
