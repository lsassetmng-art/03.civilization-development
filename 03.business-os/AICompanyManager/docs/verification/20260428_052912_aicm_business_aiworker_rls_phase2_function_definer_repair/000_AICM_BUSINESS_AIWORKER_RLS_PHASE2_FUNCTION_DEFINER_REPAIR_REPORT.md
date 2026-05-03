# AICompanyManager BusinessOS AIWorker RLS Phase2 Function Definer Repair Report

## Result
- RESULT: PASS
- PASS_COUNT: 18
- WARN_COUNT: 0
- FAIL_COUNT: 0
- FUNCTION_REVERT_EXECUTED: false

## Completed if RESULT=PASS
- auth/audit functions repaired to SECURITY DEFINER.
- auth/audit function search_path fixed.
- API client RLS remains enabled.
- Audit log RLS remains enabled.
- API client/audit no-public policies remain present.
- company_robot_entitlement RLS remains disabled.
- company_robot_placement RLS remains disabled.
- reference reads pass.
- selector read passes.
- valid token API passes.
- invalid token denial passes.
- combined rollback-smoke passes.
- no entitlement/placement/audit dry-run rows persisted.

## Important
This repair only changes auth/audit function security mode.
It does not modify API, UI, RLS policies, or company write-table RLS.

## Files
- APPLY_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/024_business_aiworker_rls_phase2_function_definer_repair.sql
- REVERT_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/024_business_aiworker_rls_phase2_function_definer_REVERT_IF_NEEDED.sql
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/docs/087_BUSINESS_AIWORKER_RLS_PHASE2_FUNCTION_DEFINER_REPAIR_CANON.md
- AICM_CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/117_AICM_BUSINESS_AIWORKER_RLS_PHASE2_FUNCTION_DEFINER_REPAIR_CANON.md
- REPORT_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/000_AICM_BUSINESS_AIWORKER_RLS_PHASE2_FUNCTION_DEFINER_REPAIR_REPORT.md

## Logs
- PREVIOUS_DIRS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/000_previous_dirs.txt
- PRE_REPAIR_FUNCTION_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/010_pre_repair_function_state.txt
- APPLY_FUNCTION_REPAIR_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/020_apply_function_repair_stdout.txt
- APPLY_FUNCTION_REPAIR_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/021_apply_function_repair_stderr.txt
- POST_REPAIR_FUNCTION_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/030_post_repair_function_state.txt
- RLS_POLICY_STATE_AFTER_REPAIR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/040_rls_policy_state_after_repair.txt
- REFERENCE_READ_AFTER_REPAIR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/050_reference_read_after_repair.txt
- API_AFTER_FUNCTION_REPAIR_LOG: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/060_api_after_function_repair.log
- API_AFTER_FUNCTION_REPAIR_PARSE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/065_api_after_function_repair_parse.txt
- NO_PERSIST_AFTER_FUNCTION_REPAIR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/070_no_persist_after_function_repair.txt
- REVERT_FUNCTIONS_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/090_revert_functions_stdout.txt
- REVERT_FUNCTIONS_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/091_revert_functions_stderr.txt
- STATE_AFTER_FUNCTION_REVERT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/092_state_after_function_revert.txt

## Safety
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used
- API/UI change: none
- Delete: none
- company entitlement/placement RLS: unchanged

## Next
If RESULT=PASS:
- run final Phase2 closeout verify once more, or proceed to final handoff/package.
If RESULT=FAIL:
- inspect logs and state after function revert.
