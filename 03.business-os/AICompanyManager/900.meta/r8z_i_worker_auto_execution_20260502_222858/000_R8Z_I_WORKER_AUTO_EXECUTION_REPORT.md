# AICompanyManager R8Z-I Worker auto execution

## Roadmap
1. R8Z-F: Leader以降の出力表示 1/1/1 完了。
2. R8Z-G: Worker作業単位 -> runtime payload候補 PASS。
3. R8Z-I: Worker実行も自動化する。

## Scope
- server file write: YES
- core file write: YES
- api post during patch: NO
- db write during patch: NO
- persistent db write during patch: NO

## Trigger rule
Do not POST on render.
Do not POST on page open.
Only POST after the user confirms Manager大項目 handoff by pressing 課長へ送るを確定.

## Runtime flow
Manager大項目 handoff confirmed
-> leader-auto-decomposition/run
-> worker-auto-execution/run
-> createWorkerRuntimeRequest

## Checks
- node_check_before: PASS
- precheck_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_i_worker_auto_execution_20260502_222858/020_precheck_scan.log
- server_patch_result: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_i_worker_auto_execution_20260502_222858/120_patch_server_result.json
- core_patch_result: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_i_worker_auto_execution_20260502_222858/130_patch_core_result.json
- node_check_after: PASS
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_i_worker_auto_execution_20260502_222858/150_scan_after.log
- ui_server_restart: PASS

## Result
- final_status: R8Z_I_WORKER_AUTO_EXECUTION_DONE_REVIEW_REQUIRED

## Manual test
For new not_started/draft Manager大項目:
1. Open 部門別タスク台帳
2. Press 課長へ送る
3. Confirm 課長へ送る
4. Expected:
   - Leader auto decomposition runs
   - Worker auto execution request runs automatically
   - Worker作業単位 becomes in_progress
   - Message shows Worker自動実行request count

## Important
This patch itself did not execute runtime POST.
Runtime POST happens only after user handoff confirmation.
