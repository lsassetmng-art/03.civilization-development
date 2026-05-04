# CasualChatWorker Persona DB Contract / Quote / Confirm Rollback Smoke Summary

status: REVIEW_REQUIRED_CONTRACT_QUOTE_CONFIRM_SMOKE_FAILED
generated_at: 20260426_105505

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## 2. Result

- schema_status: PASS
- schema_exit: 0
- quote_status: PASS
- quote_exit: 0
- confirm_status: FAIL
- confirm_exit: 3

## 3. What Was Tested

### Schema column check

- contract table columns
- contract line table columns
- period table columns
- payment intent columns
- status history columns
- entitlement grant/balance/usage columns

### Quote read smoke

- 90 minutes base 1,500 JPY
- two tickets apply as 60 free minutes
- final price 500 JPY
- 150-minute request is rejected by app_max_contract_minutes

### Confirm rollback smoke

Inside one transaction:

- entitlement grant insert
- entitlement balance insert
- rental contract insert
- contract line insert
- rental period insert
- payment intent insert
- entitlement usage insert
- entitlement balance update
- status history insert
- final select confirmation
- rollback

## 4. Files

- schema_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/010_schema_contract_columns.sql
- schema_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/011_schema_stdout.log
- schema_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/012_schema_stderr.log
- quote_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/020_quote_read_smoke.sql
- quote_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/021_quote_stdout.log
- quote_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/022_quote_stderr.log
- confirm_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/030_confirm_transaction_rollback_smoke.sql
- confirm_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/031_confirm_stdout.log
- confirm_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/032_confirm_stderr.log

## 5. Interpretation

If status is PASS_CONTRACT_QUOTE_CONFIRM_ROLLBACK_CONFIRMED:

- Persona-side DB can execute the core contract/confirm path under rollback.
- WorkerRentalCore schema is effective enough for quote/confirm.
- Next step can be backend endpoint live acceptance or Phase O real API switch against approved backend.

If status is REVIEW_REQUIRED_CONTRACT_QUOTE_CONFIRM_SMOKE_FAILED:

- inspect stderr and schema column output.
- fix column/table mismatch before proceeding.

