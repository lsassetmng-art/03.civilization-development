# WorkerRentalCore SET ROLE Membership Grant Apply Direct RLS Report

## Result
- RESULT: PASS
- FINAL_STATUS: PASS_SET_ROLE_MEMBERSHIP_GRANTED_DIRECT_RLS_DENIAL_CONFIRMED
- PASS_COUNT: 33
- WARN_COUNT: 0
- FAIL_COUNT: 0

## Executed
- DB_WRITE: YES
- MEMBERSHIP_GRANT_APPLY: YES
- SET ROLE direct RLS test: YES

## Not executed
- RLS_CHANGE: NO
- API_POST: NO
- PATCH: NO
- DELETE: NO
- AICompanyManager: not touched
- ERP_DATABASE_URL: not used
- multilingual: wait for CivilizationOS canon
- git push: NO

## Applied
- APPLY_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_apply/081_worker_rental_set_role_membership_grant_APPLY_20260522_230023.sql
- Source SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/081_worker_rental_set_role_membership_grant_NOT_APPLIED.sql

## Membership
- TARGET_ROLE: aiemp_role__app_worker
- SESSION_ROLE: postgres
- grant: GRANT aiemp_role__app_worker TO postgres

## Direct RLS verification
- same-owner ended visible: expected 1
- same-owner canceled visible: expected 1
- cross-owner ended visible: expected 0
- cross-owner canceled visible: expected 0
- cross-owner update count: expected 0

## Evidence
- PRE_MEMBERSHIP_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/010_pre_membership_state.txt
- PRE_PRIVILEGES_AND_RLS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/020_pre_privileges_and_rls.txt
- APPLY_SQL_STATIC_REVIEW: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/030_apply_sql_static_review.txt
- MEMBERSHIP_GRANT_APPLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/040_membership_grant_apply_stdout.txt
- MEMBERSHIP_GRANT_APPLY_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/041_membership_grant_apply_stderr.txt
- POST_MEMBERSHIP_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/050_post_membership_state.txt
- SET_ROLE_ONLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/060_set_role_only_stdout.txt
- SET_ROLE_ONLY_STATUS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/062_set_role_only_status.txt
- DIRECT_RLS_VISIBILITY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/070_set_role_direct_rls_visibility.txt
- DIRECT_RLS_STATUS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/072_direct_rls_status.txt
- RLS_POLICY_STATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/080_rls_policy_state.txt

## Generated
- CANON: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/012_WORKER_RENTAL_SET_ROLE_MEMBERSHIP_GRANT_APPLY_RESULT.md
- HANDOFF: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/027_WORKER_RENTAL_SET_ROLE_MEMBERSHIP_GRANT_APPLY_DIRECT_RLS_HANDOFF.md

## Next
1. Run UI-centered RobotRentalStore screen check after RLS.
2. Then commit only if explicitly requested.
