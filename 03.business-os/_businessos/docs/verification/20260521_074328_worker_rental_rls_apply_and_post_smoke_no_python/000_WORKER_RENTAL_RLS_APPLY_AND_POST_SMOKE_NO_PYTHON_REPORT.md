# WorkerRentalCore RLS Apply and Post-Smoke Report

## Result
- RESULT: FAIL
- FINAL_STATUS: REVIEW_REQUIRED
- PASS_COUNT: 42
- WARN_COUNT: 0
- FAIL_COUNT: 5

## Executed
- DB_WRITE: YES
- RLS_APPLY: YES
- ALTER TABLE: YES
- CREATE POLICY: YES
- FORCE ROW LEVEL SECURITY: YES
- API_POST: YES
- persistent rows retained: YES

## Not executed
- DELETE: NO
- API patch: NO
- HTML patch: NO
- AICompanyManager: not touched
- ERP_DATABASE_URL: not used
- multilingual: wait for CivilizationOS canon
- git push: NO

## Applied
- APPLY_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_apply/070_worker_rental_owner_civilization_rls_APPLY_20260521_074328.sql
- Source SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/070_worker_rental_owner_civilization_rls_APPLY_NOT_EXECUTED.sql

## Verified
- RLS enabled count: 11
- FORCE RLS enabled count: 11
- policy count: 33
- SELECT policy count: 11
- INSERT policy count: 11
- UPDATE policy count: 11
- DELETE policy count: 0

## Post-RLS E2E
- ended rental_contract_id: 75fb4d51-fde9-404d-a716-92d8ee22cb9a
- canceled rental_contract_id: 0964e3f6-7a16-48f2-a82c-daff718baf58

## Cross-owner denial
- wrong owner API end attempt denied
- wrong owner API cancel attempt denied
- wrong owner SELECT visibility: 0
- wrong owner UPDATE count: 0

## Evidence
- API_CONTEXT_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/012_api_context_inventory.txt
- PRE_RLS_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/020_pre_rls_state.txt
- PRE_OWNERSHIP_CONSISTENCY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/030_pre_ownership_consistency.txt
- APPLY_SQL_STATIC_REVIEW: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/040_apply_sql_static_review.txt
- APPLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/050_apply_stdout.txt
- APPLY_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/051_apply_stderr.txt
- POST_RLS_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/060_post_rls_state.txt
- POST_POLICY_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/070_post_policy_inventory.txt
- POST_RLS_POLICY_COUNTS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/080_post_rls_policy_counts.txt
- API_HEALTH: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/101_health.json
- END_FLOW_QUOTE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/110a_quote_persist.json
- END_FLOW_CONFIRM: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/112a_contract_confirm.json
- END_FLOW_PAYMENT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/114a_payment_intent.json
- END_FLOW_START: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/116a_rental_start.json
- END_FLOW_END: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/118a_rental_end.json
- CANCEL_FLOW_QUOTE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/120b_quote_persist.json
- CANCEL_FLOW_CONFIRM: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/122b_contract_confirm.json
- CANCEL_FLOW_PAYMENT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/124b_payment_intent.json
- CANCEL_FLOW_CANCEL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/126b_rental_cancel.json
- CROSS_OWNER_END_ATTEMPT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/130_cross_owner_end_attempt.json
- CROSS_OWNER_CANCEL_ATTEMPT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/132_cross_owner_cancel_attempt.json
- DIRECT_RLS_VISIBILITY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/140_direct_rls_visibility.txt
- CROSS_OWNER_UPDATE_ATTEMPT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/150_cross_owner_update_attempt.txt
- POST_E2E_COUNTS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/160_post_e2e_counts.txt
- POST_E2E_CONTRACT_ROWS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/170_post_e2e_contract_rows.txt
- PARSE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python/180_parse.txt

## Generated
- CANON: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/010_WORKER_RENTAL_OWNER_CIVILIZATION_RLS_APPLY_RESULT.md
- HANDOFF: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/020_WORKER_RENTAL_RLS_APPLY_AND_POST_SMOKE_HANDOFF.md

## Next
1. Add final UI-centered check for RobotRentalStore screen after RLS.
2. Then commit only if explicitly requested.
3. Multilingual integration remains waiting for CivilizationOS canon.
