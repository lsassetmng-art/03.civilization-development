# WorkerRentalCore DB Static Audit

status: FAIL
generated_at: 20260425_063821

core_name: WorkerRentalCore
target_app: CasualChatWorker
display_name: 雑談ワーカー

## 1. Audit Target

migration_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql

apply_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

verify_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql

verify_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

## 2. Counts

- PASS_COUNT: 48
- FAIL_COUNT: 1
- WARN_COUNT: 1

## 3. PASS Log

PASS: migration SQL exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql
PASS: apply script exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh
PASS: verify SQL exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql
PASS: verify script exists: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh
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
PASS: migration contains: 'minute',
PASS: migration contains: 30
PASS: migration contains: 120
PASS: migration contains: 500
PASS: migration contains: 1000
PASS: migration contains: 1500
PASS: migration contains: 2000
PASS: apply script contains: PERSONA_DATABASE_URL
PASS: apply script contains: psql "$PERSONA_DATABASE_URL"
PASS: apply script contains: 佐藤
PASS: verify script contains: PERSONA_DATABASE_URL
PASS: migration forbidden term absent: DROP TABLE
PASS: migration forbidden term absent: TRUNCATE TABLE
PASS: migration forbidden term absent: DELETE FROM
PASS: migration forbidden term absent: service_role
PASS: migration uses create table if not exists
PASS: migration uses create or replace view
PASS: migration uses idempotent on conflict inserts

## 4. WARN Log

WARN: migration contains drop trigger if exists. This is acceptable only for replacing same trigger definition, but 佐藤 review required.

## 5. FAIL Log

FAIL: migration forbidden term found: DATABASE_URL

## 6. Static Audit Conclusion

- static_status: FAIL
- DB apply executed: no
- This audit only checks files and text patterns.
- Actual DB compatibility still requires 佐藤（DB担当）review and manual verify after apply.

