# CasualChatWorker Real Mode Switch Bundle

status: generated

## Current State

Real mode remains disabled.

## Local Test

Run:

node tests/run-worker-rental-local-endpoint-integration-tests.js

## Non-Production DB Dry-Run

This is rollback-only and blocked by flags.

Required env:

- CCW_BACKEND_MODE=nonprod_db_dry_run
- CCW_ENABLE_NONPROD_DB_DRY_RUN=1
- CCW_CONFIRM_ROLLBACK_TEST=1
- PERSONA_DATABASE_URL must be available on backend runtime

Run:

node backend/worker-rental-api/integration/nonprod-db-dry-run-rollback-test.js

## Real Switch

Do not enable real frontend mode until all gates pass and Boss approves.
