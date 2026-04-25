# CasualChatWorker API Payload Fixture and Contract Test Report

status: generated
generated_at: 20260425_051637
final_status: PASS

app_name: CasualChatWorker
display_name: 雑談ワーカー

implementation_root:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker

fixture_dir:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures

created_fixtures:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/free-ticket-balance-response.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-quote-request-30-friend-one-ticket.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-quote-response-30-friend-one-ticket.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-quote-request-60-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-quote-response-60-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-quote-request-90-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-quote-response-90-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-quote-request-120-friend-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-quote-response-120-friend-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-confirm-request-90-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/contract-confirm-response-90-lover-two-tickets.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/session-message-request-safe.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/session-message-response-safe.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/session-message-request-unsafe.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/session-message-response-unsafe-redirect.json
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures/usage-history-response.json

created_tests:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-contract-session-domain-tests.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-api-payload-fixture-tests.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/verify_api_payload_fixtures.sh

verify:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260425_051637_api_payload_fixture_and_contract_test_verify.txt
- exit_code: 0

canonical_points:
- 30 minutes: 500 JPY
- 60 minutes with 2 tickets: 0 JPY
- 90 minutes with 2 tickets: 500 JPY
- 120 minutes with 2 tickets: 1,000 JPY
- monthly free tickets: 2
- minutes per ticket: 30
- Lover unsafe request returns soft_redirect
- no DB apply
- no ERP direct linkage
- no secrets

next_recommendation:
- create DB DDL apply package only after Boss approves moving from mock/client phase to DB phase

