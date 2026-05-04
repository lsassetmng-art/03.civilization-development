# WorkerRentalCore civilization_id Scope Design Report

## Result
- RESULT: PASS
- FINAL_STATUS: WORKER_RENTAL_CIVILIZATION_SCOPE_DESIGN_READY
- PASS_COUNT: 12
- WARN_COUNT: 0
- FAIL_COUNT: 0

## Generated
- SCOPE_DESIGN: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/003_WORKER_RENTAL_CIVILIZATION_SCOPE_CORRECTION_DESIGN.md
- ROBOT_RENTAL_DB_DESIGN: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/RobotRentalStore/040.db/020_ROBOT_RENTAL_STORE_CIVILIZATION_SCOPE_DB_DESIGN.md
- CORE_DB_DESIGN: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/WorkerRentalCore/040.db/020_WORKER_RENTAL_CORE_CIVILIZATION_SCOPE_DB_DESIGN.md
- CORE_RLS_DESIGN: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/WorkerRentalCore/050.rls/020_WORKER_RENTAL_CORE_CIVILIZATION_SCOPE_RLS_DESIGN.md
- DDL_PROPOSAL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/020_worker_rental_civilization_scope_PROPOSAL_NOT_APPLIED.sql
- RLS_PROPOSAL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/021_worker_rental_civilization_rls_PROPOSAL_NOT_APPLIED.sql

## Current inventory
- CURRENT_COLUMNS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_085142_worker_rental_civilization_scope_design/010_current_worker_rental_columns.txt
- SCOPE_CLASSIFICATION: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_085142_worker_rental_civilization_scope_design/020_current_worker_rental_scope_classification.txt

## Important
No DB changes were applied.
DDL/RLS files are proposals only and contain ROLLBACK guards.

## Required review before apply
- confirm user_id -> civilization_id mapping
- decide whether owner_civilization_id should be NOT NULL after backfill
- decide target_company_id / erp_company_id usage
- define API context app.current_civilization_id source
- 佐藤(DB担当) review

## Next
After review:
1. create backfill-safe migration with BEGIN/COMMIT only after approval
2. add app.current_civilization_id to RobotRentalStore API context
3. update read-only catalog if quote persistence is introduced
4. apply RLS only after owner_civilization_id is fully populated
