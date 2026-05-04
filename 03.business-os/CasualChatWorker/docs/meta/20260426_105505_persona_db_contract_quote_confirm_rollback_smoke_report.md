# CasualChatWorker Contract / Quote / Confirm Rollback Smoke Report

status: generated
generated_at: 20260426_105505
final_status: REVIEW_REQUIRED_CONTRACT_QUOTE_CONFIRM_SMOKE_FAILED

result:
- schema_status: PASS
- schema_exit: 0
- quote_status: PASS
- quote_exit: 0
- confirm_status: FAIL
- confirm_exit: 3

outputs:
- summary: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/000_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_SUMMARY.md
- handoff: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/handoff/20260426_105505_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_HANDOFF.md
- latest_handoff: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_HANDOFF.md
- schema_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/011_schema_stdout.log
- schema_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/012_schema_stderr.log
- quote_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/021_quote_stdout.log
- quote_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/022_quote_stderr.log
- confirm_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/031_confirm_stdout.log
- confirm_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/032_confirm_stderr.log

confirmed:
- DB target was Persona-side DB through PERSONA_DATABASE_URL.
- ERP DATABASE_URL was not used.
- real mode was not switched.
- contract/confirm write was rollback-only.

