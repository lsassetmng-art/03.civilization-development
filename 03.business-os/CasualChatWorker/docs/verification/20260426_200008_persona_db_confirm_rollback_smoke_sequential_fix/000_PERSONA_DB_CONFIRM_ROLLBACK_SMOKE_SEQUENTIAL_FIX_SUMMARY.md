# CasualChatWorker Confirm Rollback Smoke Sequential Fix Summary

status: PASS_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_CONFIRMED
generated_at: 20260426_200008

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## 2. Previous Failure

Previous smoke returned 0 rows because a single large data-modifying CTE attempted to update a row inserted by a sibling CTE.

## 3. Fix

The smoke now uses sequential SQL statements inside one transaction:

1. create temp context
2. insert entitlement grant
3. insert entitlement balance
4. insert contract
5. insert contract lines
6. insert period
7. insert payment intent
8. insert entitlement usage
9. update entitlement balance
10. insert status history
11. final select
12. rollback
13. post-rollback residual check

## 4. Result

- seq_status: PASS
- seq_exit: 0
- final_status: PASS_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_CONFIRMED

## 5. Files

- seq_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix/010_confirm_transaction_rollback_smoke_sequential_fix.sql
- seq_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix/011_confirm_seq_stdout.log
- seq_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix/012_confirm_seq_stderr.log

## 6. Interpretation

If PASS_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_CONFIRMED:

- Contract / quote / confirm core DB path works under rollback.
- Next step can be backend endpoint live acceptance / live payload gap / Phase O switch with approved backend URL.

If REVIEW_REQUIRED:

- inspect stderr and stdout before proceeding.

