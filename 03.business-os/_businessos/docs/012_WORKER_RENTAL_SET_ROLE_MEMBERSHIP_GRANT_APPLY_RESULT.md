# WorkerRentalCore SET ROLE Membership Grant Apply Result

## Status
- FINAL_STATUS: PASS_SET_ROLE_MEMBERSHIP_GRANTED_DIRECT_RLS_DENIAL_CONFIRMED
- TARGET_ROLE: aiemp_role__app_worker
- SESSION_ROLE: postgres

## Applied
- GRANT aiemp_role__app_worker TO postgres

## Verified
- postgres can SET ROLE aiemp_role__app_worker
- aiemp_role__app_worker is non-superuser and non-BYPASSRLS
- same-owner SELECT visible
- cross-owner SELECT hidden
- cross-owner UPDATE denied
- RLS remains enabled on 11 tables
- FORCE RLS remains enabled on 11 tables
- policy count remains 33
- DELETE policy count remains 0

## Report
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260522_230023_worker_rental_set_role_membership_grant_apply_direct_rls/000_WORKER_RENTAL_SET_ROLE_MEMBERSHIP_GRANT_APPLY_DIRECT_RLS_REPORT.md
