# WorkerRentalCore Final Pre-Apply Gate

status: READY_FOR_REVIEW
generated_at: 20260425_064102

core_name:
- WorkerRentalCore

target_app:
- CasualChatWorker
- 雑談ワーカー

## 1. Purpose

This is the final pre-apply gate for WorkerRentalCore before any DB apply is allowed.

This file does not apply DB changes.

## 2. Latest Package Targets

migration_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql

apply_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

verify_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql

verify_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

decision_bundle:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_DECISION_BUNDLE.md

static_audit:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_STATIC_AUDIT.md

sato_checklist:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_SATO_REVIEW_CHECKLIST.md

stop_conditions:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_STOP_CONDITIONS.md

runbook:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_RUNBOOK.md

CasualChatWorker_final_package:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_063657_CASUAL_CHAT_WORKER_FINAL_ACCEPTANCE_PACKAGE.md

CasualChatWorker_handoff:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_FINAL_HANDOFF.md

## 3. Gate Counts

- PASS_COUNT: 58
- FAIL_COUNT: 0
- WARN_COUNT: 1

## 4. Gate Result

- final_gate_status: READY_FOR_REVIEW
- DB apply executed: no
- DB apply allowed now: no
- Required next: Boss explicit approval + 佐藤（DB担当）GO

## 5. PASS Log

PASS: latest_migration exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql
PASS: latest_apply_script exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh
PASS: latest_verify_sql exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql
PASS: latest_verify_script exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh
PASS: latest_decision_bundle exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_DECISION_BUNDLE.md
PASS: latest_static_audit exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_STATIC_AUDIT.md
PASS: latest_sato_checklist exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_SATO_REVIEW_CHECKLIST.md
PASS: latest_stop_conditions exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_STOP_CONDITIONS.md
PASS: latest_runbook exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_RUNBOOK.md
PASS: latest_casual_chat_worker_handoff exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_FINAL_HANDOFF.md
PASS: latest_casual_chat_worker_final_package exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_063657_CASUAL_CHAT_WORKER_FINAL_ACCEPTANCE_PACKAGE.md
PASS: migration contains: worker_rental_service_catalog
PASS: migration contains: worker_rental_price_catalog
PASS: migration contains: worker_rental_contract
PASS: migration contains: worker_rental_entitlement_grant
PASS: migration contains: worker_rental_entitlement_balance
PASS: migration contains: worker_rental_entitlement_usage
PASS: migration contains: worker_rental_unit_to_minutes
PASS: migration contains: enforce_worker_rental_contract_service_limits
PASS: migration contains: CasualChatWorker
PASS: migration contains: casual_chat_worker
PASS: migration contains: minimum_contract_unit_kind
PASS: migration contains: minimum_contract_unit_count
PASS: migration contains: app_max_contract_unit_kind
PASS: migration contains: app_max_contract_unit_count
PASS: migration contains: monthly_free_ticket_source_rule
PASS: migration contains: shortest_contract_duration
PASS: migration contains: monthly_free_ticket_unit_count
PASS: migration contains: 'minute'
PASS: migration contains: 'hour'
PASS: migration contains: 'day'
PASS: migration contains: 'month'
PASS: migration contains: 'year'
PASS: migration contains: 1051200
PASS: migration contains: 17520
PASS: migration contains: 730
PASS: migration contains: 24
PASS: migration contains: 500
PASS: migration contains: 1000
PASS: migration contains: 1500
PASS: migration contains: 2000
PASS: migration forbidden term absent: DROP TABLE
PASS: migration forbidden term absent: TRUNCATE TABLE
PASS: migration forbidden term absent: DELETE FROM
PASS: migration forbidden term absent: service_role
PASS: migration forbidden term absent: supabase_key
PASS: apply_script contains: PERSONA_DATABASE_URL
PASS: apply_script contains: psql "$PERSONA_DATABASE_URL"
PASS: apply_script contains: 佐藤
PASS: apply_script forbidden term absent: psql "$DATABASE_URL"
PASS: verify_script contains: PERSONA_DATABASE_URL
PASS: verify_script contains: psql "$PERSONA_DATABASE_URL"
PASS: verify_script forbidden term absent: psql "$DATABASE_URL"
PASS: CasualChatWorker final package contains: final_status: PASS
PASS: CasualChatWorker final package contains: minimum contract: 30 minutes
PASS: CasualChatWorker final package contains: app maximum contract: 120 minutes
PASS: CasualChatWorker final package contains: shortest_contract_duration
PASS: CasualChatWorker final package contains: ビジネスヤンデレ

## 6. WARN Log

WARN: migration contains drop trigger if exists; acceptable only for same-trigger replacement after 佐藤 review

## 7. FAIL Log



## 8. Canon Confirmed

WorkerRentalCore:

- supports minute / hour / day / month / year
- generic max is 2 years
- app-specific price via app_code / service_code
- app-specific min and max contract in service catalog
- monthly free ticket uses shortest_contract_duration

CasualChatWorker:

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum contract: 30 minutes
- maximum contract: 120 minutes
- price: 30min 500 / 60min 1000 / 90min 1500 / 120min 2000
- monthly ticket quantity: 2
- one ticket: 30 minutes free
- total monthly free: 60 minutes

## 9. Decision

If final_gate_status is READY_FOR_REVIEW:

- Send SATO_DB_REVIEW_PACKET_LATEST to 佐藤（DB担当）
- Ask for GO / STOP
- Only after GO, Boss may explicitly approve DB apply

If final_gate_status is STOP_BEFORE_REVIEW:

- Do not send to apply
- Fix FAIL items only
- Re-run this final pre-apply gate

