# AICompanyManager V10L-C2F-D2B failed attempt recovery report

## Result

FINAL_STATUS=V10L_C2F_D2B_FAILED_ATTEMPT_RECOVERY_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_RESTORE=YES_FROM_HEAD
- SERVER_PATCH=NO
- ORIGIN_RESTORE=NO
- KEEP_D2_COMMIT=YES
- HTTP_CODE=200

## What was restored

Restored only:

- 03.business-os/AICompanyManager/assets/js/aicm-production-core.js

Source:

- HEAD

This keeps the successful C2F-D2 commit and removes failed uncommitted D2B/R2/R2A residue.

## Verify

- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_d2b_failed_attempt_recovery_20260505_050901/050_verify.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_d2b_failed_attempt_recovery_20260505_050901/040_core_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_d2b_failed_attempt_recovery_20260505_050901/041_server_node_check.txt
- STATUS_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_d2b_failed_attempt_recovery_20260505_050901/010_git_status_before.txt
- STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_d2b_failed_attempt_recovery_20260505_050901/020_git_status_after.txt
- RESTORE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_d2b_failed_attempt_recovery_20260505_050901/030_git_restore_core_from_head.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_d2b_failed_attempt_recovery_20260505_050901/070_server_status_after.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2f_d2b_failed_attempt_recovery_20260505_050901/080_http_check.html

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2f_d2b_recovery_20260505_050901
