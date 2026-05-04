# AICompanyManager V10L-C2D3 section apply root-cause audit report

## Result

FINAL_STATUS=V10L_C2D3_SECTION_APPLY_ROOT_CAUSE_AUDIT_DONE_REVIEW_REQUIRED

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

「課を適用」を押しても一括引き渡し先の課/部門が変わらない原因を、配信JS・button action・handleAction・click dispatch・state保存の順で切り分ける。

## Files

- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/010_verify.txt
- DECISION_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/020_decision.txt
- LOCAL_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/030_local_extract.txt
- SERVED_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/040_served_extract.txt
- ACTION_CONTEXT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/050_action_dispatch_context.txt
- ROOT_HTML=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/060_root.html
- SERVED_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/070_served_aicm_production_core.js
- HASH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/080_hash_compare.txt
- CORE_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/090_core_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/100_server_node_check.txt
- SERVER_STATUS_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/110_server_status_before.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/120_server_status_after.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/130_server.log
- GIT_STATUS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d3_section_apply_root_cause_audit_20260504_192904/140_git_status.txt

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2d3_audit_20260504_192904
