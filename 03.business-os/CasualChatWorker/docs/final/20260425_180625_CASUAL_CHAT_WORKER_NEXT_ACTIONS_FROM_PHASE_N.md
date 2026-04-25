# CasualChatWorker Next Actions From Phase N

status: active
generated_at: 20260425_180625

## 1. Current Recommendation

Do not enable frontend real mode yet.

## 2. Safe Next Actions

### Safe Action 1: Local endpoint integration only

No DB connection.

```bash
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-worker-rental-local-endpoint-integration-tests.js
```

### Safe Action 2: Real mode preflight only

No DB connection.

```bash
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/runtime/real-mode-preflight-check.js
```

### Safe Action 3: Cross-chat handoff

Use:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_PHASE_N_CROSS_CHAT_HANDOFF.md

## 3. DB-Connected Action

Only with explicit approval:

```bash
CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
```

## 4. Real Mode Action

Not yet.

