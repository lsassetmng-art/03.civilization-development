# AICompanyManager R8Z-E hydrate child outputs

## Roadmap
1. R8Z-D confirmed DB/API success
2. Cause check confirmed context API returns child outputs
3. This phase fixes core-side hydration so UI panel reads child outputs

## Scope
- core file write: YES
- server file write: NO
- api post: NO
- db write: NO
- persistent db write: NO

## Expected
UI panel should show:
- Leader中項目: 1
- 成果物要件: 1
- Worker作業単位: 1

## Checks
- node_check_before: PASS
- hydrate_patch: PASS
- node_check_after: PASS
- ui_server_restart: PASS
- api_post: NO
- db_write: NO
- persistent_db_write: NO

## Result
- final_status: R8Z_E_HYDRATE_CHILD_OUTPUTS_DONE_REVIEW_REQUIRED

## Outputs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_e_hydrate_child_outputs_20260502_220456/aicm-production-core.before_r8z_e.js
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_e_hydrate_child_outputs_20260502_220456/110_patch_result.json
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_e_hydrate_child_outputs_20260502_220456/120_core_scan_after.log
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_e_hydrate_child_outputs_20260502_220456/300_server_nohup.log

## Manual UI check
Open:
- 部門別タスク台帳
- Leader以降の出力

Expected:
- Leader中項目: 1
- 成果物要件: 1
- Worker作業単位: 1
