# WorkerRentalCore DB Apply Summary

status: PASS
generated_at: 20260425_064419

core_name:
- WorkerRentalCore

target_app:
- CasualChatWorker
- 雑談ワーカー

## 1. Execution

DB apply executed: yes
DB env: PERSONA_DATABASE_URL
ERP DATABASE_URL used: no

## 2. Exit Codes

- apply_exit: 0
- verify_only_exit: 0
- post_assert_exit: 0

## 3. Targets

- apply_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh
- verify_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh
- migration: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql
- verify_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql
- final_gate: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/final-pre-apply-gate/20260425_064102_WORKER_RENTAL_CORE_FINAL_PRE_APPLY_GATE.md

## 4. Logs

- master_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply-results/20260425_064419_worker_rental_core_db_apply_master/000_master.log
- apply_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply-results/20260425_064419_worker_rental_core_db_apply_master/010_apply_stdout.log
- apply_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply-results/20260425_064419_worker_rental_core_db_apply_master/011_apply_stderr.log
- verify_only_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply-results/20260425_064419_worker_rental_core_db_apply_master/020_verify_only_stdout.log
- verify_only_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply-results/20260425_064419_worker_rental_core_db_apply_master/021_verify_only_stderr.log
- post_apply_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply-results/20260425_064419_worker_rental_core_db_apply_master/030_post_apply_assertions.sql
- post_apply_stdout: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply-results/20260425_064419_worker_rental_core_db_apply_master/031_post_apply_assertions_stdout.log
- post_apply_stderr: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply-results/20260425_064419_worker_rental_core_db_apply_master/032_post_apply_assertions_stderr.log

## 5. Confirmed Canon

WorkerRentalCore:
- generic rental core
- supports minute / hour / day / month / year
- generic max 2 years
- app-specific price via app_code / service_code
- app-specific min/max contract in service catalog
- monthly free ticket uses shortest_contract_duration

CasualChatWorker:
- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum contract: 30 minutes
- app maximum contract: 120 minutes
- price 30 minutes: 500 JPY
- price 60 minutes: 1,000 JPY
- price 90 minutes: 1,500 JPY
- price 120 minutes: 2,000 JPY
- monthly free tickets: 2
- one ticket: 30 minutes free
- total monthly free: 60 minutes

## 6. Next

If status is PASS:
- proceed to backend endpoint skeleton / API implementation
- run post_apply_payload_gap_check after endpoint implementation

If status is WARN:
- inspect verify/assert logs before moving forward

