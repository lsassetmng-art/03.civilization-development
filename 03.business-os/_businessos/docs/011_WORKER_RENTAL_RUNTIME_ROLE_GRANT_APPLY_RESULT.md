# WorkerRentalCore Runtime Role Grant Apply Result

## Status
- FINAL_STATUS: REVIEW_REQUIRED
- TARGET_ROLE: aiemp_role__app_worker

## Applied
- GRANT USAGE ON SCHEMA business
- GRANT SELECT, INSERT, UPDATE on 11 worker_rental tables
- DELETE grant: none

## Verified
- target role is not superuser
- target role does not have BYPASSRLS
- RLS remains enabled on 11 tables
- FORCE RLS remains enabled on 11 tables
- policy count remains 33
- same-owner SELECT visible
- cross-owner SELECT hidden
- cross-owner UPDATE denied

## Report
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_181229_worker_rental_runtime_role_grant_apply_direct_rls/000_WORKER_RENTAL_RUNTIME_ROLE_GRANT_APPLY_DIRECT_RLS_REPORT.md
