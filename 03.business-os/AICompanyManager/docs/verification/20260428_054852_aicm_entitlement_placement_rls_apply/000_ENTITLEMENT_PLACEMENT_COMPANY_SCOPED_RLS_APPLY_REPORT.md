# Entitlement / Placement Company-Scoped RLS Apply Report

## Result
- RESULT: PASS
- FINAL_STATUS: ENTITLEMENT_PLACEMENT_RLS_APPLIED
- PASS_COUNT: 17
- WARN_COUNT: 0
- FAIL_COUNT: 0
- AUTO_REVERT_EXECUTED: false

## Completed if RESULT=PASS
- business.company_robot_entitlement RLS enabled.
- business.company_robot_placement RLS enabled.
- company-scoped SELECT / INSERT / UPDATE policies created.
- DB ctx wrapper matched chain passed.
- DB mismatched context guard passed.
- API grant dry-run passed.
- API standalone place without entitlement failed safely.
- API combined rollback-smoke passed full chain.
- Invalid token denial passed.
- No entitlement / placement / audit dry-run rows persisted.

## Applied policy source
- app.current_company_id
- current_setting('app.current_company_id', true)

## Intentionally not applied
- DELETE policy
- FORCE ROW LEVEL SECURITY

## Files
- APPLY_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/028_entitlement_placement_company_scoped_rls_apply.sql
- REVERT_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/028_entitlement_placement_company_scoped_rls_REVERT_IF_NEEDED.sql
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/docs/096_ENTITLEMENT_PLACEMENT_COMPANY_SCOPED_RLS_CANON.md
- AICM_CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/126_AICM_ENTITLEMENT_PLACEMENT_COMPANY_SCOPED_RLS_CANON.md
- REPORT_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/000_ENTITLEMENT_PLACEMENT_COMPANY_SCOPED_RLS_APPLY_REPORT.md

## Logs
- PREREQUISITE_EVIDENCE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/000_latest_prerequisite_evidence_dirs.txt
- PRE_APPLY_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/010_pre_apply_inventory.txt
- APPLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/020_apply_stdout.txt
- APPLY_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/021_apply_stderr.txt
- POST_APPLY_RLS_POLICY_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/030_post_apply_rls_policy_inventory.txt
- DB_RLS_MATCHED_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/040_db_rls_matched_smoke.txt
- DB_RLS_MISMATCH_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/050_db_rls_mismatch_smoke.txt
- API_AFTER_RLS_LOG: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/060_api_after_rls_smoke.log
- API_PARSE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/066_api_parse.txt
- NO_PERSIST_CHECK: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/070_no_persist_check.txt
- REVERT_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/090_revert_stdout.txt
- REVERT_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/091_revert_stderr.txt
- STATE_AFTER_REVERT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/092_state_after_revert.txt

## Safety
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used
- Persistent smoke write: none, rollback/dry-run only
- Existing DB functions preserved
- ctx wrapper path used
- Delete: none

## Next
If RESULT=PASS:
- run final closeout package for AICompanyManager x BusinessOS AIWorker company-scoped RLS.
If RESULT=FAIL:
- inspect logs and reverted state.
