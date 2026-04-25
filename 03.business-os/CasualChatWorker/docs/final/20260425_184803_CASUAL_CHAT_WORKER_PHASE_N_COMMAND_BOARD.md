# CasualChatWorker Phase N Command Board

status: active
generated_at: 20260425_184803

## 1. Safe No-DB Commands

### Local endpoint integration

```bash
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-worker-rental-local-endpoint-integration-tests.js
```

### Real mode preflight

```bash
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/runtime/real-mode-preflight-check.js
```

### Payload gap checker unit test

```bash
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-worker-rental-payload-gap-checker-tests.js
```

### HTTP router in-memory test

```bash
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-worker-rental-http-router-tests.js
```

## 2. DB-Connected Rollback-Only Command

Requires explicit approval.

```bash
CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
```

## 3. Live Payload Gap Check Command

Requires approved endpoint.

```bash
CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1 \
CCW_API_BASE_URL="http://127.0.0.1:8787" \
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js
```

## 4. Live Confirm Extra Gate

Do not set unless explicitly approved.

```bash
CCW_ALLOW_LIVE_CONFIRM_TEST=1
```

## 5. Forbidden

Do not run:

```bash
CCW_BACKEND_MODE=real_backend
```

until Phase O is approved.

