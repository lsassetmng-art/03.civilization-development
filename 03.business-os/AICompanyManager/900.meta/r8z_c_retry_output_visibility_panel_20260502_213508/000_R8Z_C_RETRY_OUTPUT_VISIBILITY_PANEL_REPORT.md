# AICompanyManager R8Z-C retry output visibility panel

## Scope
- core file write: YES
- server file write: NO
- api post: NO
- db write: NO
- persistent db write: NO

## Fix
Previous R8Z-C patch stopped because verification expected wrapper variable to appear once.
Correct behavior is:
- one declaration
- one invocation

Therefore wrapper token count can be 2.
This retry verifies declaration and invocation separately.

## Output location
UI:
- 部門別タスク台帳
- Leader以降の出力
- 成果物要件 / Worker作業単位

DB:
- business.aicm_leader_deliverable_requirement
- business.aicm_worker_work_unit

## Checks
- node_check_before: PASS
- core_patch: PASS
- node_check_after: PASS
- ui_server_restart: PASS
- api_post: NO
- db_write: NO
- persistent_db_write: NO

## Outputs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c_retry_output_visibility_panel_20260502_213508/aicm-production-core.before_r8z_c_retry.js
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c_retry_output_visibility_panel_20260502_213508/110_patch_result.json
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c_retry_output_visibility_panel_20260502_213508/120_core_scan_after.log
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c_retry_output_visibility_panel_20260502_213508/300_server_nohup.log

## Result
- final_status: R8Z_C_RETRY_OUTPUT_VISIBILITY_PANEL_DONE_REVIEW_REQUIRED

## Where outputs appear
UI:
- 部門別タスク台帳
- Leader以降の出力
- 成果物要件 / Worker作業単位

DB:
- business.aicm_leader_deliverable_requirement
- business.aicm_worker_work_unit

## Next
R8Z-D:
- controlled manual UI execution
- press 課長へ送るを確定 on one pending Manager大項目
- verify generated Leader middle / deliverable requirement / Worker unit
