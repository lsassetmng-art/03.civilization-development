# AICompanyManager V10L-C2D5R3 route action dispatcher apply fix report

## Result

FINAL_STATUS=V10L_C2D5R3_ROUTE_ACTION_DISPATCHER_APPLY_FIX_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_PATCH=YES
- SERVER_PATCH=NO
- SERVER_RUNNING_CHECK=YES
- IF_SERVER_DOWN_START=YES
- HTTP_CHECK=YES
- BROWSER_OPEN=YES

## Root cause

C2D5R2A debug panel showed:

- 「課を適用」branch is not recorded

This means the click did not reach aicmR8zMgrMajorCardHandleAction route branch.

## What changed

One existing dispatcher function was patched:

- normalize event/target/action
- closest("[data-core-action]")
- if action starts with r8z-mgr-major-card-route-
- call existing aicmR8zMgrMajorCardHandleAction(event, target, action)
- return

## Safety

- No DB write
- No API POST
- No new fetch
- No XMLHttpRequest
- No new helper
- No bridge
- No DOM afterpatch
- No setInterval / MutationObserver

## Files

- BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/aicm-production-core.before_v10l_c2d5r3.js
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/010_verify.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/020_core_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/021_server_node_check.txt
- EXTRACT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/030_patched_dispatcher_extract.txt
- CANDIDATES_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/040_dispatcher_candidates.txt
- SERVER_STATUS_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/050_server_status_before.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/060_server_status_after.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/070_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/080_http_check.html
- GIT_STATUS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d5r3_route_action_dispatcher_apply_fix_20260504_205630/090_git_status.txt

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2d5r3_20260504_205630
