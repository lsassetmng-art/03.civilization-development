# AICompanyManager R8Z-B core auto-call integration

## Scope
- core file write: YES
- server file write: NO
- api post execution in this script: NO
- db write in this script: NO
- persistent db write in this script: NO

## Purpose
Connect existing 課長へ送る確定 flow to the R8Z-A server route.

Route used by browser after user confirmation:
- POST /api/aicm/v2/leader-auto-decomposition/run

## Important
This script does not execute the route.
Actual DB write happens only later when the user confirms 課長へ送る in the UI.

## Checks
- node_check_before: PASS
- core_patch: PASS
- node_check_after: PASS
- ui_server_restart: PASS
- api_post_in_this_script: NO
- db_write_in_this_script: NO
- persistent_db_write_in_this_script: NO

## Outputs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_b_core_auto_call_integration_20260502_212835/aicm-production-core.before_r8z_b.js
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_b_core_auto_call_integration_20260502_212835/110_patch_result.json
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_b_core_auto_call_integration_20260502_212835/120_core_scan_after.log
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_b_core_auto_call_integration_20260502_212835/300_server_nohup.log

## Result
- final_status: R8Z_B_CORE_AUTO_CALL_INTEGRATION_DONE_REVIEW_REQUIRED

## Manual UI check
1. 部門別タスク台帳を開く
2. 未引き継ぎの大項目で 課長へ送る
3. 確認カードに Leader中項目/成果物要件/Worker作業単位の自動作成説明が出ること
4. 確定すると、manager-major/update の後に leader-auto-decomposition/run が呼ばれること
5. DB永続反映されるため、実行前にユーザー判断すること

## Next
R8Z-C:
- either manual UI check
- or one-shot controlled API test for one candidate after explicit approval
