# CasualChatWorker Contract / Quote / Confirm Rollback Smoke Handoff

status: REVIEW_REQUIRED_CONTRACT_QUOTE_CONFIRM_SMOKE_FAILED
generated_at: 20260426_105505

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL

## 2. Result

- schema_status: PASS
- quote_status: PASS
- confirm_status: FAIL
- final_status: REVIEW_REQUIRED_CONTRACT_QUOTE_CONFIRM_SMOKE_FAILED

## 3. Summary

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/000_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_SUMMARY.md

## 4. Next

If PASS:

1. backend endpoint live acceptance
2. live payload gap check
3. Phase O real API switch with approved backend URL
4. screen verification

If FAIL:

1. inspect:
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/012_schema_stderr.log
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/022_quote_stderr.log
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/032_confirm_stderr.log
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/011_schema_stdout.log
2. repair schema/column mismatch
3. rerun this smoke

