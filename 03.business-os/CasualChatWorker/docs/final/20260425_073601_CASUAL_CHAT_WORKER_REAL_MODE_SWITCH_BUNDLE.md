# CasualChatWorker Real Mode Switch Bundle

status: FAIL
generated_at: 20260425_073601

## 1. Current State

Real mode remains disabled.

## 2. Created

- secure backend runtime config
- local in-memory endpoint server
- endpoint integration test
- non-production DB dry-run rollback runner
- real mode switch documentation

## 3. Required Before Real Mode

- this bundle PASS
- non-production DB dry-run PASS
- payload gap check PASS
- auth/session policy PASS
- Boss approval

## 4. Commands

Local endpoint integration:

node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-worker-rental-local-endpoint-integration-tests.js

Runtime config test:

node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-worker-rental-backend-runtime-config-tests.js

Non-production DB dry-run rollback test:

CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/nonprod-db-dry-run-rollback-test.js

## 5. Do Not

- do not enable frontend real mode yet
- do not put DB secret in frontend
- do not use ERP DB path
- do not skip payload gap check

