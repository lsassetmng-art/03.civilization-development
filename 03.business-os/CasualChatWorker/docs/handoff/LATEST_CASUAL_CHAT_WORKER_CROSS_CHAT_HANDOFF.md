# CasualChatWorker Cross-Chat Handoff

status: ready
generated_at: 20260425_164854

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Whole-App Roadmap Position

Current position:

- Phase A〜M completed
- Phase N current
- Phase O not started
- Phase P pending

Current phase:

- Phase N: Non-production validation / real mode preapproval

## 3. What Has Been Done

Completed:

- app canon
- Friend / Lover definition
- Lover safety boundary
- WorkerRentalCore generic rental design
- app-specific max 120 minutes
- app-specific price
- monthly free ticket shortest-contract-duration rule
- WorkerRentalCore DB apply
- frontend prototype
- AIWorker series/style UI
- LoVerS style 12 ビジネスヤンデレ strong notice
- API payload fixtures
- backend endpoint skeleton
- transaction service
- PostgreSQL repository skeleton
- HTTP router
- payload gap checker
- secure runtime config
- local endpoint integration test
- non-production rollback dry-run runner
- live payload gap runner
- real mode preflight

## 4. Current Canon

CasualChatWorker:

- minimum contract: 30 minutes
- maximum contract: 120 minutes
- allowed durations: 30 / 60 / 90 / 120
- price:
  - 30 minutes: 500 JPY
  - 60 minutes: 1,000 JPY
  - 90 minutes: 1,500 JPY
  - 120 minutes: 2,000 JPY
- monthly free tickets:
  - 2 tickets
  - 1 ticket = 30 minutes
  - total = 60 minutes
  - no carryover in v1

WorkerRentalCore:

- generic
- minute / hour / day / month / year
- generic max 2 years
- app-specific max and price
- app-specific monthly free ticket duration

AIWorker:

- HD series = medium / none / strict_policy
- LoVerS series = per_model / soft / strict_policy
- ビジネスヤンデレ = strong safety notice

## 5. Next Choices

### Choice A: Run non-production rollback dry-run

Use:

```bash
CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
```

### Choice B: Do not run DB check yet

Continue with final handoff / review only.

### Choice C: Live payload gap check

Use:

```bash
CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1 \
CCW_API_BASE_URL="http://127.0.0.1:8787" \
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js
```

## 6. Do Not

- do not enable frontend real mode yet
- do not run live confirm against production
- do not put DB secret in frontend
- do not use ERP DATABASE_URL
- do not weaken Lover safety boundary
- do not duplicate aiworker canon into business
- do not duplicate cx22073jw material into business

## 7. Key Files

Phase N decision:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_164854_CASUAL_CHAT_WORKER_PHASE_N_DECISION_BUNDLE.md

Latest handoff:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_CROSS_CHAT_HANDOFF.md

Implementation:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/index.html
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/domain/runtime-config.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/runtime/backend-runtime-config.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/server/local-in-memory-worker-rental-server.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/runtime/real-mode-preflight-check.js

