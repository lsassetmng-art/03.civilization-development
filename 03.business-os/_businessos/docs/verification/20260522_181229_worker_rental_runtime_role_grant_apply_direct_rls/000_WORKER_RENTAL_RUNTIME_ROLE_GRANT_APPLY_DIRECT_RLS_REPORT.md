# WorkerRentalCore Runtime Role Grant Apply Direct RLS Report

## Result
- RESULT: FAIL
- FINAL_STATUS: REVIEW_REQUIRED
- PASS_COUNT: 20
- WARN_COUNT: 0
- FAIL_COUNT: 7

## Executed
- DB_WRITE: YES
- GRANT_APPLY: YES
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

## Target role
- aiemp_role__app_worker

## Privileges
- PRE_MISSING_PRIVILEGE_COUNT: 34
- POST_MISSING_PRIVILEGE_COUNT: 0

## Applied
- APPLY_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_apply/080_worker_rental_runtime_role_grants_APPLY_20260522_181229.sql
- Source SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/080_worker_rental_runtime_role_grants_NOT_APPLIED.sql

## Direct RLS verification
- same-owner ended visible: expected 1
- same-owner canceled visible: expected 1
- cross-owner ended visible: expected 0
- cross-owner canceled visible: expected 0
- cross-owner update count: expected 0

## Evidence
- PRE_ROLE_FLAGS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/010_pre_role_flags.txt
- PRE_PRIVILEGES: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/020_pre_privileges.txt
- APPLY_SQL_STATIC_REVIEW: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/030_apply_sql_static_review.txt
- GRANT_APPLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/040_grant_apply_stdout.txt
- GRANT_APPLY_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/041_grant_apply_stderr.txt
- POST_PRIVILEGES: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/050_post_privileges.txt
- RLS_POLICY_COUNTS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/060_rls_policy_counts.txt
- SET_ROLE_DIRECT_RLS_VISIBILITY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/070_set_role_direct_rls_visibility.txt
- SET_ROLE_STATUS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/072_set_role_status.txt

## Generated
- CANON: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/011_WORKER_RENTAL_RUNTIME_ROLE_GRANT_APPLY_RESULT.md
- HANDOFF: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/024_WORKER_RENTAL_RUNTIME_ROLE_GRANT_APPLY_DIRECT_RLS_HANDOFF.md

## Next
1. Run UI-centered RobotRentalStore screen check after RLS.
2. Then commit only if explicitly requested.
