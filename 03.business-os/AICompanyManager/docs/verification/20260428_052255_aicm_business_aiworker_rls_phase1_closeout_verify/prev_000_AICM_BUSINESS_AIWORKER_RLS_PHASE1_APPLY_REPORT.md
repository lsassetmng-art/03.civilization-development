# AICompanyManager BusinessOS AIWorker RLS Phase1 Apply Report

## Result
- RESULT: FAIL
- PASS_COUNT: 21
- WARN_COUNT: 0
- FAIL_COUNT: 5

## Applied
RLS Phase1 was applied to read/catalog/reference tables only.

Applied tables:
- business.robot_placement_role_catalog
- business.robot_pool
- aiworker.robot_series_behavior_profile
- aiworker.robot_model_personality_profile
- aiworker.robot_model_public_profile

Policies:
- active rows readable by SELECT policy
- status_code = 'active'

## Not touched
Still no RLS applied:
- business.company_robot_entitlement
- business.company_robot_placement
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log

## Verification
- Post-RLS catalog/reference reads passed.
- CX reference view reads passed.
- selector read passed.
- write function rollback chain passed.
- API combined rollback-smoke passed.
- no entitlement/placement/audit smoke rows persisted.

## Files
- APPLY_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/021_business_aiworker_rls_phase1_apply.sql
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/docs/082_BUSINESS_AIWORKER_RLS_PHASE1_APPLY_CANON.md
- AICM_CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/112_AICM_BUSINESS_AIWORKER_RLS_PHASE1_APPLY_CANON.md
- REPORT_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/000_AICM_BUSINESS_AIWORKER_RLS_PHASE1_APPLY_REPORT.md

## Logs
- PRE_RLS_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/010_pre_rls_state.txt
- APPLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/020_rls_phase1_apply_stdout.txt
- APPLY_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/021_rls_phase1_apply_stderr.txt
- POST_RLS_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/030_post_rls_state.txt
- POST_POLICY_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/040_post_policy_inventory.txt
- POST_REFERENCE_READ_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/050_post_reference_read_smoke.txt
- POST_WRITE_ROLLBACK_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/060_post_write_rollback_smoke.txt
- API_COMBINED_JSON: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/071_api_combined_after_rls_phase1.json
- API_COMBINED_PARSE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/072_api_combined_after_rls_phase1_parse.txt
- NO_PERSIST_CHECK: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/080_no_persist_check.txt

## Safety
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used
- Delete: none
- Data update: none
- Company write tables excluded from RLS Phase1
- API client/audit lock-down deferred

## Next
- Phase2 review for API client / audit log lock-down.
- Do not apply company_robot_entitlement / company_robot_placement RLS until company identity strategy is fixed.
