# AICompanyManager R8Z-L AIWorkerOS runtime failure cause isolate

## Roadmap
1. R8Z-K confirmed worker-auto-execution route is ready.
2. Dry-run candidate_count=2.
3. Actual execution failed with partial_error.
4. R8Z-L isolates AIWorkerOS runtime connection/config/auth cause.

## Scope
- DB_WRITE=NO
- API_POST=NO
- PERSISTENT_DB_WRITE=NO
- PHYSICAL_DELETE=NO

## Files
- node_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/010_node_check.log
- latest_r8z_k_run_dir: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/020_latest_r8z_k_run_dir.txt
- r8z_k_actual_response: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/030_r8z_k_actual_response.txt
- r8z_k_actual_summary: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/040_r8z_k_actual_summary.txt
- failure_parse: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/060_failure_parse.log
- server_runtime_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/070_server_runtime_scan.log
- env_masked: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/080_env_masked.log
- process_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/090_process_scan.log
- aiworkeros_file_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/100_aiworkeros_file_scan.log
- aiworkeros_http_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/110_aiworkeros_http_check.log
- aicm_pipeline_get: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/120_aicm_pipeline_get.log
- db_status: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/130_db_status_no_write.log
- final_env: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_l_aiworkeros_runtime_failure_cause_20260502_224441/190_final_values.env

## Final judgement
FAILURE_CATEGORY=AIWORKEROS_SERVER_NOT_REACHABLE
AIWORKER_REACHABLE=NO
AICM_PROXY_GET=NO
FINAL_JUDGEMENT=START_OR_FIX_AIWORKEROS_RUNTIME_SERVER
