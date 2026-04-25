# CasualChatWorker WorkerRentalCore Payload Alignment Report

status: generated
generated_at: 20260425_060230
final_status: FAIL

app_name: CasualChatWorker
display_name: 雑談ワーカー

purpose:
- Align CasualChatWorker implementation payloads with generic WorkerRentalCore.

created_or_updated:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/domain/worker-rental-mapping.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/worker-rental-payload-client.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/worker-rental-free-ticket-balance-response.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/worker-rental-quote-request-90-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/worker-rental-quote-response-90-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/worker-rental-confirm-request-90-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/worker-rental-confirm-response-90-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-worker-rental-payload-alignment-tests.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/verify_worker_rental_payload_alignment.sh

updated:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/index.html

canon:
- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum_contract: 30 minutes
- app_max_contract: 120 minutes
- supported_unit_v1: minute
- monthly_free_ticket_source_rule: shortest_contract_duration
- monthly_free_ticket_quantity: 2
- one_ticket_free_duration: 30 minutes
- prices_are_app_specific: true

verify:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260425_060230_worker_rental_payload_alignment_verify.txt
- exit_code: 1

notes:
- DB apply was not executed.
- WorkerRentalCore generic DDL remains separate under /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental.
- CasualChatWorker now speaks worker_rental payload naming at fixture/client boundary.

next_recommendation:
- run DB package static audit, then request explicit Boss approval before DB apply.

