# BusinessOS WorkerRentalCore App Limit Free Ticket Package Report

status: generated
generated_at: 20260425_052921

core_name:
- WorkerRentalCore

important:
- This run generated SQL and scripts only.
- DB apply was not executed.
- WorkerRentalCore remains generic and supports minute/hour/day/month/year.
- Generic max is up to 2 years.
- CasualChatWorker app max is 120 minutes.
- Prices are app-specific through app_code / service_code.
- Monthly free ticket means each app's shortest contract duration is free.
- Reviewer: 佐藤（DB担当）レビュー対象
- DB env: PERSONA_DATABASE_URL

generated:
- migration_file: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql
- apply_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh
- verify_sql: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql
- verify_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh
- casual_mapping_note: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/090.db/20260425_052921_CASUAL_CHAT_WORKER_WORKER_RENTAL_CORE_MAPPING.md

generic_rule:
- unit_support: minute / hour / day / month / year
- generic_max_duration: 2 years

CasualChatWorker_mapping:
- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum_contract: 30 minutes
- app_max_contract: 120 minutes
- supported_unit_v1: minute
- price_30_minutes: 500 JPY
- price_60_minutes: 1,000 JPY
- price_90_minutes: 1,500 JPY
- price_120_minutes: 2,000 JPY
- monthly_free_ticket_quantity: 2
- monthly_free_ticket_rule: shortest_contract_duration
- one_ticket_free_duration: 30 minutes
- total_monthly_free_duration: 60 minutes

manual_apply_command:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

manual_verify_command:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

