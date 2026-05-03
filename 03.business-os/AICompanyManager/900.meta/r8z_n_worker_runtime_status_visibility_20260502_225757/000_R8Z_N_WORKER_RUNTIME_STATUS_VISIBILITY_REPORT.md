# AICompanyManager R8Z-N Worker runtime status visibility + stack launcher

## Roadmap
1. R8Z-M confirmed Worker auto execution.
2. R8Z-N adds Worker runtime status visibility to task-ledger UI.
3. R8Z-N adds a stack launcher for AICompanyManager + AIWorkerOS runtime.

## Scope
- CORE_FILE_WRITE=YES
- SERVER_FILE_WRITE=NO
- DB_WRITE=NO
- API_POST=NO
- PERSISTENT_DB_WRITE=NO
- PHYSICAL_DELETE=NO

## Maintenance policy
- Do not add DB tables.
- Do not duplicate runtime logic.
- Use existing context key pmlw_worker_work_units.
- Show state only; do not execute from this panel.
- Stack launcher uses existing server.js/start behavior.

## Files
- node_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/010_node_check_before.log
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/110_patch_result.json
- node_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/120_node_check_after.log
- core_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/130_core_scan_after.log
- launcher_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/140_launcher_check.log
- launcher_run: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/150_launcher_run.log
- served_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/180_served_core_check.log
- context_summary: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/210_context_summary.log
- final_env: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/290_final_values.env

## Final judgement
SERVED_CORE_HAS_R8ZN=YES
WORKER_WORK_UNIT_COUNT=2
IN_PROGRESS_COUNT=2
AUTO_EXECUTION_COUNT=2
R8Z_I_COUNT=2
RUNTIME_OK_COUNT=2
FINAL_JUDGEMENT=R8Z_N_WORKER_STATUS_PANEL_READY
LAUNCHER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/ops/start-aicm-stack.sh
STOPPER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/ops/stop-aicm-stack.sh
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/000_R8Z_N_WORKER_RUNTIME_STATUS_VISIBILITY_REPORT.md
