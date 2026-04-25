# WorkerRentalCore DB Apply Decision Bundle Report

status: generated
generated_at: 20260425_063821

core_name:
- WorkerRentalCore

target_app:
- CasualChatWorker

result:
- static_status: FAIL
- PASS_COUNT: 48
- FAIL_COUNT: 1
- WARN_COUNT: 1

outputs:
- static_audit: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_STATIC_AUDIT.md
- sato_review_checklist: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_SATO_REVIEW_CHECKLIST.md
- apply_decision_bundle: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_DECISION_BUNDLE.md
- apply_runbook: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_RUNBOOK.md
- stop_conditions: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_STOP_CONDITIONS.md

targets:
- migration_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql
- apply_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh
- verify_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql
- verify_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

confirmed:
- DB apply was not executed.
- PERSONA_DATABASE_URL is the required apply env.
- DATABASE_URL / ERP env is not used.
- 佐藤（DB担当）review is required.
- Boss explicit approval is required before apply.

