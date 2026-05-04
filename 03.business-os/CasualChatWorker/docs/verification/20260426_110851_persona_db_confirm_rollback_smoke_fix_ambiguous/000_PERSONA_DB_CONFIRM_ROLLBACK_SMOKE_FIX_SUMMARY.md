# CasualChatWorker Confirm Rollback Smoke Alias Fix Summary

status: REVIEW_REQUIRED_CONFIRM_ROLLBACK_SMOKE_FIX_FAILED
generated_at: 20260426_110851

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## 2. Previous Failure

Previous confirm rollback smoke failed because:

- column reference used_quantity was ambiguous
- update target table and usage_insert CTE both exposed used_quantity

## 3. Fix

Qualified update target columns:

- b.used_quantity
- b.remaining_quantity
- b.entitlement_unit_count

## 4. Result

- fix_status: FAIL
- fix_exit: 0
- final_status: REVIEW_REQUIRED_CONFIRM_ROLLBACK_SMOKE_FIX_FAILED

## 5. What Was Tested

Inside one transaction:

- entitlement grant insert
- entitlement balance insert
- rental contract insert
- contract line insert
- rental period insert
- payment intent insert
- entitlement usage insert
- entitlement balance update using qualified aliases
- status history insert
- final select confirmation
- rollback
- post-rollback residual check

## 6. Files

- fix_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_110851_persona_db_confirm_rollback_smoke_fix_ambiguous/010_confirm_transaction_rollback_smoke_fix_ambiguous.sql
- fix_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_110851_persona_db_confirm_rollback_smoke_fix_ambiguous/011_confirm_fix_stdout.log
- fix_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_110851_persona_db_confirm_rollback_smoke_fix_ambiguous/012_confirm_fix_stderr.log

## 7. Interpretation

If PASS_CONFIRM_ROLLBACK_SMOKE_ALIAS_FIX_CONFIRMED:

- Contract / quote / confirm core DB path works under rollback.
- Next step can be backend endpoint live acceptance / live payload gap / Phase O switch with approved backend URL.

If REVIEW_REQUIRED:

- inspect stderr and stdout before proceeding.

