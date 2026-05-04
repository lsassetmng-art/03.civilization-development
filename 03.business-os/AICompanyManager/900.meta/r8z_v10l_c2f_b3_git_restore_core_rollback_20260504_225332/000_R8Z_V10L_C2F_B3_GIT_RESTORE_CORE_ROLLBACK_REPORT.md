# AICompanyManager C2F-B3 git restore core rollback report

## Result

FINAL_STATUS=V10L_C2F_B3_GIT_RESTORE_CORE_ROLLBACK_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_RESTORE=YES_FROM_ORIGIN_MAIN
- SERVER_PATCH=NO
- GIT_RESET_HARD=NO
- HTTP_CODE=200

## Why

C2F-B3 inserted the pre-post gate before the route/section/Leader selection UI could render.
This blocked the user from selecting 課 and Leader.

## Restore

Restored only:

- 03.business-os/AICompanyManager/assets/js/aicm-production-core.js

from:

- origin/main

## Verification

- core node --check passed
- server node --check passed
- C2F_B3_MARKER_COUNT=0
- C2F_B3_LOCK_TEXT_COUNT=0
- ROUTE_UI_LABEL_COUNT=3
- HTTP_CODE=200

## Next policy

C2F validation must move to the final execution/Yes/POST candidate path, not the first confirm renderer return path.

## Files

- STATUS_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/010_git_status_before.txt
- FETCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/020_git_fetch.txt
- RESTORE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/030_git_restore_core.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/040_core_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/041_server_node_check.txt
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/050_verify.txt
- STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/060_git_status_after.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/080_server_status_after.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_b3_git_restore_core_rollback_20260504_225332/100_http_check.html

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2f_b3_git_restore_20260504_225332
