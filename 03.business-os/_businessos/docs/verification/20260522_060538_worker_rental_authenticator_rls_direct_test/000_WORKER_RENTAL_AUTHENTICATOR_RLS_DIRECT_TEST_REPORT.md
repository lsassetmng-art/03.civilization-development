# WorkerRentalCore Authenticator RLS Direct Test Report

## Result
- RESULT: PASS
- FINAL_STATUS: WARN_AUTHENTICATOR_NOT_USABLE_FOR_DIRECT_RLS_TEST_GRANT_REVIEW_REQUIRED
- PASS_COUNT: 6
- WARN_COUNT: 1
- FAIL_COUNT: 0

## Test role
- TEST_ROLE: authenticator

## Executed
- DB_WRITE: NO
- API_POST: NO
- PATCH: NO
- RLS_CHANGE: NO
- DELETE: NO

## Evidence
- ROLE_FLAGS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_060538_worker_rental_authenticator_rls_direct_test/010_role_flags.txt
- RLS_POLICY_COUNTS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_060538_worker_rental_authenticator_rls_direct_test/020_rls_policy_counts.txt
- SET_ROLE_VISIBILITY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_060538_worker_rental_authenticator_rls_direct_test/030_set_role_authenticator_visibility.txt
- SET_ROLE_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_060538_worker_rental_authenticator_rls_direct_test/031_set_role_authenticator_visibility_stderr.txt
- SET_ROLE_STATUS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_060538_worker_rental_authenticator_rls_direct_test/032_set_role_status.txt

## Interpretation
- If FINAL_STATUS=PASS_AUTHENTICATOR_DIRECT_RLS_DENIAL_CONFIRMED:
  - direct non-BYPASSRLS RLS denial is confirmed.
- If FINAL_STATUS=WARN_AUTHENTICATOR_NOT_USABLE_FOR_DIRECT_RLS_TEST_GRANT_REVIEW_REQUIRED:
  - authenticator is non-BYPASSRLS, but lacks table privileges or cannot be used for this direct test.
  - Existing API_DENIAL=PASS remains useful, but direct DB role test needs a runtime role with grants.
