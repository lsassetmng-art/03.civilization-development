# CasualChatWorker Real Mode PreApproval Bundle

status: PASS
generated_at: 20260425_080632

## 1. Current State

Frontend real mode remains disabled.

## 2. Created

- non-production DB rollback dry-run gated wrapper
- live payload gap checker
- real mode preflight checker
- real mode preapproval design
- final handoff refresh

## 3. Safe Commands

Preflight:

node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/runtime/real-mode-preflight-check.js

Local endpoint integration:

node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-worker-rental-local-endpoint-integration-tests.js

Non-production DB rollback dry-run:

CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh

Live payload gap check without confirm write:

CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1 \
CCW_API_BASE_URL="http://127.0.0.1:8787" \
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js

Live confirm test remains separately gated:

CCW_ALLOW_LIVE_CONFIRM_TEST=1

## 4. Do Not

- do not enable real frontend mode yet
- do not run live confirm against production
- do not put DB secrets in frontend
- do not use ERP DATABASE_URL

