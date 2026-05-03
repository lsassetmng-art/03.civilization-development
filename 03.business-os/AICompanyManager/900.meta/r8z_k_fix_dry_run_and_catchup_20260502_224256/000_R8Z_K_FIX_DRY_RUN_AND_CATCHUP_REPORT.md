# AICompanyManager R8Z-K fix dry_run variable + catch-up retry

## Roadmap
1. R8Z-I route/core hook installed.
2. R8Z-J confirmed served core has R8Z-I.
3. R8Z-J confirmed worker-auto-execution route is called.
4. Failure cause: server-side ReferenceError: dry_run is not defined.
5. R8Z-K fixes only the return object variable name and retries catch-up.

## Scope
- server file write: YES
- core file write: NO
- API_POST: YES_LOCAL_ROUTE
- DB_WRITE: YES_IF_RUNTIME_REQUEST_OK
- PERSISTENT_DB_WRITE: YES_IF_RUNTIME_REQUEST_OK
- PHYSICAL_DELETE: NO

## Expected
- dry-run result ok
- candidate_count >= 1
- actual result ok if AIWorkerOS runtime is reachable
- Worker作業単位 becomes in_progress when runtime request succeeds

## Files
- node_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/010_node_check_before.log
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/110_patch_result.json
- node_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/120_node_check_after.log
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/130_server_scan_after.log
- db_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/210_db_before.log
- dry_response: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/230_dryrun_response.json
- dry_summary: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/240_dryrun_summary.log
- actual_response: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/260_actual_response.json
- actual_summary: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/270_actual_summary.log
- db_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/280_db_after.log
- final_env: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_k_fix_dry_run_and_catchup_20260502_224256/290_final_values.env

## Final judgement
```
DRY_RESULT=ok
DRY_CANDIDATE_COUNT=2
DRY_FAILED_COUNT=0
RUN_ACTUAL=YES
ACTUAL_RESULT=partial_error
ACTUAL_EXECUTED_COUNT=0
ACTUAL_FAILED_COUNT=2
AUTO_EXEC_COUNT=0
R8Z_I_COUNT=0
RUNTIME_OK_COUNT=0
IN_PROGRESS_COUNT=0
TODO_COUNT=2
FINAL_JUDGEMENT=AUTO_ROUTE_READY_BUT_RUNTIME_FAILED
```
