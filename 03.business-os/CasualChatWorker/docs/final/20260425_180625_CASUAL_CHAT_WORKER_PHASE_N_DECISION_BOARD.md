# CasualChatWorker Phase N Decision Board

status: decision-required
generated_at: 20260425_180625

## 1. Current Position

- current_phase: Phase N
- frontend_real_mode: disabled
- non-production rollback dry-run: prepared, not run here
- live payload gap check: prepared, not run here
- live confirm: separately gated
- Phase O real mode switch: not started

## 2. Decision Options

### Option A: Run Non-Production DB Rollback Dry-Run

Risk:
- touches DB connection, but must rollback

Allowed only if:
- Boss explicitly approves
- PERSONA_DATABASE_URL is set
- DATABASE_URL is not set
- rollback confirmation is required

Command:

```bash
CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
```

### Option B: Defer DB Dry-Run

Risk:
- none

Use:
- continue review
- handoff to another chat
- wait for backend endpoint environment

### Option C: Run Live Payload Gap Check

Risk:
- no confirm write unless CCW_ALLOW_LIVE_CONFIRM_TEST=1

Command:

```bash
CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1 \
CCW_API_BASE_URL="http://127.0.0.1:8787" \
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js
```

### Option D: Real Mode Switch

Current decision:
- STOP

Reason:
- Phase N has not passed yet.

## 3. Recommended

Recommended now:

1. Keep frontend real mode disabled.
2. Run local endpoint integration if needed.
3. Decide whether to run non-production rollback dry-run.
4. Only after Phase N PASS, prepare Phase O real mode switch.

