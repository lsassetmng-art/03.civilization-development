# WorkerRentalCore RLS Bypass Classification Handoff

## Status
- FINAL_STATUS: WARN_RLS_APPLIED_BUT_DIRECT_TEST_USED_BYPASS_ROLE
- DB_WRITE: NO
- API_POST: NO
- PATCH: NO

## Classification
- ROLE_IS_BYPASS: YES_BYPASSRLS
- API_DENIAL: PASS
- DIRECT_DENIAL: FAIL_OR_BYPASS

## Interpretation
If ROLE_IS_BYPASS is YES, the previous direct psql cross-owner SELECT is not a valid RLS denial test.
Use a non-superuser / non-BYPASSRLS runtime role for direct RLS denial verification.

## Previous run
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_074328_worker_rental_rls_apply_and_post_smoke_no_python

## Report
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260521_113015_worker_rental_rls_bypass_classification_no_patch/000_WORKER_RENTAL_RLS_BYPASS_CLASSIFICATION_REPORT.md
