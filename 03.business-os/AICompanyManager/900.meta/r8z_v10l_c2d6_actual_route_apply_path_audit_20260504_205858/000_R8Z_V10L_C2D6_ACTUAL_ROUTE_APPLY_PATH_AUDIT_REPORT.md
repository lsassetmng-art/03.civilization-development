# AICompanyManager V10L-C2D6 actual route apply path audit report

## Result

FINAL_STATUS=V10L_C2D6_ACTUAL_ROUTE_APPLY_PATH_AUDIT_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_PATCH=NO
- SERVER_PATCH=NO
- SERVER_RUNNING_CHECK=YES
- IF_SERVER_DOWN_START=YES
- HTTP_CHECK=YES
- BROWSER_OPEN=YES

## Purpose

C2D5R2A debug panel stayed at "branch not recorded".
This audit identifies the actual visible button render/action and actual dispatcher/listener path before any more patches.

## Files

- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d6_actual_route_apply_path_audit_20260504_205858/010_verify.txt
- DECISION_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d6_actual_route_apply_path_audit_20260504_205858/020_decision.txt
- BUTTON_RENDER_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d6_actual_route_apply_path_audit_20260504_205858/030_button_render_extract.txt
- ACTION_DISPATCH_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d6_actual_route_apply_path_audit_20260504_205858/040_action_dispatch_extract.txt
- MARKER_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d6_actual_route_apply_path_audit_20260504_205858/050_marker_counts.txt
- HASH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d6_actual_route_apply_path_audit_20260504_205858/120_hash_compare.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d6_actual_route_apply_path_audit_20260504_205858/080_server_status_after.txt
- GIT_STATUS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d6_actual_route_apply_path_audit_20260504_205858/130_git_status.txt

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2d6_audit_20260504_205858
