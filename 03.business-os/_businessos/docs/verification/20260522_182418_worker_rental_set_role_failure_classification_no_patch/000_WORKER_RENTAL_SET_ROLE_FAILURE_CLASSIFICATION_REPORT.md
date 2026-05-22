# WorkerRentalCore SET ROLE Failure Classification Report

## Result
- RESULT: PASS
- FINAL_STATUS: WARN_GRANTS_APPLIED_BUT_SET_ROLE_MEMBERSHIP_MISSING
- PASS_COUNT: 13
- WARN_COUNT: 1
- FAIL_COUNT: 0

## Diagnosis
- DIAGNOSIS: SET_ROLE_MEMBERSHIP_MISSING
- TARGET_ROLE: aiemp_role__app_worker
- PREV_SET_ROLE_STATUS: 3
- SET_ROLE_ONLY_STATUS: 3

## Executed
- previous failure artifact dump
- current role/membership classification
- SET ROLE only smoke
- privilege/RLS state confirmation

## Not executed
- DB_WRITE: NO
- API_POST: NO
- PATCH: NO
- RLS_CHANGE: NO
- DELETE: NO
- AICompanyManager: not touched
- ERP_DATABASE_URL: not used

## Evidence
- PREV_SET_ROLE_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_182418_worker_rental_set_role_failure_classification_no_patch/prev_071_set_role_direct_rls_visibility_stderr.txt
- ROLE_MEMBERSHIP: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_182418_worker_rental_set_role_failure_classification_no_patch/010_role_membership_classification.txt
- SET_ROLE_ONLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_182418_worker_rental_set_role_failure_classification_no_patch/020_set_role_only_stdout.txt
- SET_ROLE_ONLY_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_182418_worker_rental_set_role_failure_classification_no_patch/021_set_role_only_stderr.txt
- SET_ROLE_ONLY_STATUS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_182418_worker_rental_set_role_failure_classification_no_patch/022_set_role_only_status.txt
- PRIVILEGES_AND_RLS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_182418_worker_rental_set_role_failure_classification_no_patch/030_current_privileges_and_rls.txt

## Next
If DIAGNOSIS=SET_ROLE_MEMBERSHIP_MISSING:
1. Generate membership GRANT proposal:
   GRANT aiemp_role__app_worker TO <current/session runtime role>;
2. Apply only after explicit GO.
3. Retry direct RLS test.
