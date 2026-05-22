# WorkerRentalCore RLS Bypass Classification Report

## Result
- RESULT: PASS
- FINAL_STATUS: WARN_RLS_APPLIED_BUT_DIRECT_TEST_USED_BYPASS_ROLE
- PASS_COUNT: 21
- WARN_COUNT: 2
- FAIL_COUNT: 0

## Executed
- current DB role classification
- RLS state verification
- policy count verification
- previous cross-owner API result classification
- previous direct visibility classification

## Not executed
- DB_WRITE: NO
- API_POST: NO
- PATCH: NO
- DELETE: NO
- RLS_CHANGE: NO
- AICompanyManager: not touched
- ERP_DATABASE_URL: not used

## Diagnosis
- ROLE_IS_BYPASS: YES_BYPASSRLS
- API_DENIAL: PASS
- DIRECT_DENIAL: FAIL_OR_BYPASS

## Evidence
- ROLE_CLASSIFICATION: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_113015_worker_rental_rls_bypass_classification_no_patch/010_current_role_classification.txt
- RLS_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_113015_worker_rental_rls_bypass_classification_no_patch/020_current_rls_state.txt
- POLICY_COUNTS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_113015_worker_rental_rls_bypass_classification_no_patch/030_current_policy_counts.txt
- PREVIOUS_CROSS_OWNER_CLASSIFICATION: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_113015_worker_rental_rls_bypass_classification_no_patch/040_previous_cross_owner_classification.txt
- BYPASS_AWARE_VISIBILITY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_113015_worker_rental_rls_bypass_classification_no_patch/050_bypass_aware_visibility.txt

## Next
1. If ROLE_IS_BYPASS=YES, do not judge RLS by direct psql SELECT using this role.
2. Prepare a non-BYPASSRLS runtime role verification, or rely on API-level denial plus role-bound test.
3. After verification is clean, run UI-centered RobotRentalStore screen check.
