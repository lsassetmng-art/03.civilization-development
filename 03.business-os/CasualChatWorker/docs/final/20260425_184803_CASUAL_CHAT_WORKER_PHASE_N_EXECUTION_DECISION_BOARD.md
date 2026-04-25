# CasualChatWorker Phase N Execution Decision Board

status: decision-required
generated_at: 20260425_184803

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Whole-App Roadmap Position

Current:

- Phase A-M: completed / prepared
- Phase N: current
- Phase O: not started
- Phase P: pending

Phase N purpose:

- validate WorkerRentalCore backend path before frontend real mode
- keep frontend real mode disabled
- keep live confirm separately gated
- confirm no frontend DB secrets
- confirm 150-minute rejection path

## 3. Current Canon

### CasualChatWorker

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum contract: 30 minutes
- maximum contract: 120 minutes
- allowed durations:
  - 30 minutes
  - 60 minutes
  - 90 minutes
  - 120 minutes
- price:
  - 30 minutes: 500 JPY
  - 60 minutes: 1,000 JPY
  - 90 minutes: 1,500 JPY
  - 120 minutes: 2,000 JPY
- monthly free ticket:
  - rule: shortest_contract_duration
  - quantity: 2
  - one ticket: 30 minutes free
  - total monthly free: 60 minutes
  - carryover: false in v1

### WorkerRentalCore

- generic worker rental core
- supports minute / hour / day / month / year
- generic max: 2 years
- app-specific min/max
- app-specific price catalog
- app-specific monthly free ticket duration

### AIWorker

- HD series: initiative medium / user_influence none / action_restriction strict_policy
- LoVerS series: initiative per_model / user_influence soft / action_restriction strict_policy
- style 12: ビジネスヤンデレ
- ビジネスヤンデレ requires strong safety notice

### Safety

Lover must remain:

- pseudo-romantic entertainment
- rental boyfriend/girlfriend style AI worker
- not a real relationship
- no monitoring
- no threats
- no dependency induction
- no sexual service conversion

## 4. Phase N Execution Options

### Option A: Run non-production DB rollback dry-run

Status:
- available, approval required

Risk:
- DB connection is used
- transaction must rollback
- must not commit

Allowed only when:

- Boss explicitly approves dry-run
- PERSONA_DATABASE_URL is set
- DATABASE_URL is unset
- rollback confirmation is required
- no frontend real mode switch

Command:

```bash
CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
```

Expected:

- ROLLBACK DONE
- quote 90 minutes with two tickets = 500 JPY
- no COMMIT
- no frontend real mode change

### Option B: Defer DB dry-run and hand off

Status:
- safe

Use when:

- backend runtime is not ready
- DB dry-run approval is not granted
- another chat will continue Phase N

Output to use:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_PHASE_N_EXECUTION_READY_HANDOFF.md

### Option C: Run live payload gap check

Status:
- available, approval required

Allowed only when:

- approved backend endpoint exists
- CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1
- CCW_API_BASE_URL is set
- live confirm remains disabled unless separately approved

Command without confirm write:

```bash
CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1 \
CCW_API_BASE_URL="http://127.0.0.1:8787" \
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js
```

Live confirm extra gate:

```bash
CCW_ALLOW_LIVE_CONFIRM_TEST=1
```

### Option D: Frontend real mode switch

Status:
- STOP

Reason:

- Phase N is not fully passed yet
- real mode requires Boss approval after dry-run/live checks

## 5. Recommended Order

1. Keep frontend real mode disabled.
2. Run local validation if needed.
3. Decide Option A or B.
4. If Option A passes, run Option C against approved endpoint.
5. If Option C passes, create Phase O real mode switch package.
6. Only then consider frontend real mode.

