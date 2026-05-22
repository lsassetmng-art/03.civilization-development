# WorkerRentalCore Ownership/RLS Precheck Handoff

## Status
- phase: ownership-rls-precheck
- DB_WRITE: NO
- RLS_APPLY: NO
- API_POST: NO
- PATCH: NO

## Report
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260520_170500_ownership_rls_precheck/000_OWNERSHIP_RLS_PRECHECK_REPORT.md

## Design
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/006_WORKER_RENTAL_OWNERSHIP_RLS_PRECHECK_DESIGN.md

## RLS draft
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/060_worker_rental_owner_civilization_rls_DRAFT_NOT_APPLIED.sql

## Next
If precheck passes:
1. verify API can set app.current_civilization_id consistently
2. create exact RLS APPLY script
3. run RLS apply only after explicit GO
