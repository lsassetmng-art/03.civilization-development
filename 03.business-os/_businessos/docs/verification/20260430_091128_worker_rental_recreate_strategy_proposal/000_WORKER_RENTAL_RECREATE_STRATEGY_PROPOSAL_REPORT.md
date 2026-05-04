# WorkerRentalCore Recreate Strategy Proposal Report

## Result
- RESULT: PASS
- FINAL_STATUS: WORKER_RENTAL_RECREATE_PROPOSAL_READY
- PASS_COUNT: 22
- WARN_COUNT: 0
- FAIL_COUNT: 0

## Decision
Because all worker_rental transactional tables are empty, recreate is preferred over ALTER.

## Generated
- RECREATE_DESIGN: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/WorkerRentalCore/060.migration/050_WORKER_RENTAL_RECREATE_STRATEGY_DESIGN.md
- CORE_DB_CANON: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/WorkerRentalCore/040.db/050_WORKER_RENTAL_CORE_RECREATED_DB_CANON.md
- ROBOT_RENTAL_CANON: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/RobotRentalStore/040.db/050_ROBOT_RENTAL_STORE_WORKER_RENTAL_CORE_RECREATE_USAGE_CANON.md
- RECREATE_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/050_worker_rental_core_RECREATE_PROPOSAL_NOT_APPLIED.sql

## Evidence
- EMPTY_TABLE_VERIFICATION: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_091128_worker_rental_recreate_strategy_proposal/010_empty_table_verification.txt
- DEPENDENCY_SNAPSHOT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_091128_worker_rental_recreate_strategy_proposal/020_current_dependency_snapshot.txt

## Safety
- DB apply: none
- DROP executed: none
- CREATE executed: none
- COMMIT: none
- RLS change: none
- API change: none
- AICompanyManager change: none
- ERP DATABASE_URL: not used

## Next
After 佐藤(DB担当) review:
1. create APPLY version from proposal by replacing final ROLLBACK with COMMIT
2. run recreate apply
3. verify tables/views/indexes
4. smoke RobotRentalStore catalog/quote
5. then implement persistent quote
6. then RLS later
