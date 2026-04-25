# CasualChatWorker / 雑談ワーカー Phase N Cross-Chat Handoff

status: ready
generated_at: 20260425_180625

## 0. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 1. Whole-App Development Roadmap

### Phase A: App Rule and Canon Freeze
Status: completed

- CasualChatWorker / 雑談ワーカー fixed
- category fixed to 03.business-app
- Friend / Lover fixed
- Lover safety boundary fixed
- v1 scope fixed

### Phase B: Design Skeleton
Status: completed / incrementally updated

- design folders
- root roadmap
- API / DB / policy / integration / safety docs
- integrated design regenerated

### Phase C: Pricing, Contract, and Free Ticket Design
Status: completed

- 30 / 60 / 90 / 120 minutes
- 30 minutes = 500 JPY
- monthly free ticket = app shortest contract duration
- CasualChatWorker: 1 ticket = 30 minutes
- monthly quantity = 2

### Phase D: WorkerRentalCore Generic DB Design
Status: completed

- worker_rental_* generic model
- minute / hour / day / month / year support
- generic max 2 years
- app-specific max duration
- app-specific price catalog
- app-specific shortest-contract free ticket

### Phase E: DB Apply and Verification
Status: applied / verify path created

- WorkerRentalCore DB apply was approved earlier
- apply target: PERSONA_DATABASE_URL
- ERP DATABASE_URL is not used
- post-apply read-only snapshot path exists

### Phase F: Frontend Prototype
Status: completed

- HTML / CSS / JavaScript prototype
- worker selection
- Friend / Lover filter
- quote display
- free ticket application
- chat
- timer
- history

### Phase G: AIWorker Latest Alignment
Status: completed

- HD series tendency reflected
- LoVerS series tendency reflected
- individual style features reflected
- style 12 ビジネスヤンデレ strong safety notice reflected

### Phase H: CX22073JW Read-Only Smalltalk Material
Status: completed as mock/reference

- Friend topic materials
- Lover topic materials
- safe redirect materials
- no CX data copied as business truth

### Phase I: API Payload Alignment
Status: completed

- worker_rental payload naming
- quote request/response fixtures
- confirm request/response fixtures
- entitlement balance fixtures

### Phase J: Backend Endpoint Skeleton
Status: completed

- service catalog endpoint skeleton
- entitlement balance endpoint skeleton
- quote endpoint skeleton
- confirm endpoint skeleton
- SQL templates

### Phase K: Backend Transaction Preparation
Status: completed

- auth/session policy
- in-memory repository
- confirm transaction service
- monthly ticket issue flow
- transaction template
- in-memory transaction tests

### Phase L: PostgreSQL Repository and HTTP Wiring
Status: completed

- PostgreSQL repository skeleton
- HTTP router candidate
- payload gap checker
- mock pool tests
- local HTTP tests

### Phase M: Secure Runtime and Real Mode Preparation
Status: completed as preparation

- secure backend runtime config
- local in-memory endpoint server
- non-production rollback dry-run runner
- live payload gap runner
- real mode preflight checker

### Phase N: Non-Production Validation / Real Mode Preapproval
Status: current

Prepared but not executed in this handoff:

- non-production DB rollback dry-run
- live payload gap check
- live confirm test
- frontend real mode switch

### Phase O: Frontend Real Mode Switch
Status: not started

Required before start:

- Phase N PASS
- Boss approval
- no frontend DB secrets
- payload gap PASS
- auth/session PASS
- 150-minute quote rejected

### Phase P: Final Acceptance / Handoff
Status: pending

Required:

- final acceptance package
- final verification
- final handoff
- known risk list
- rollback path

## 2. Current Canon

### CasualChatWorker

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum contract: 30 minutes
- maximum contract: 120 minutes
- allowed durations: 30 / 60 / 90 / 120 minutes
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
- generic maximum: 2 years
- app-specific min/max duration
- app-specific price
- app-specific monthly free ticket duration

### AIWorker

- HD series:
  - initiative: medium
  - user_influence: none
  - action_restriction: strict_policy
- LoVerS series:
  - initiative: per_model
  - user_influence: soft
  - action_restriction: strict_policy
- LoVerS style 12:
  - ビジネスヤンデレ
  - strong safety notice required

### CX22073JW

- smalltalk material read-only
- topic material read-only
- no contract truth
- no payment truth
- no worker catalog truth

### CommonOS

- UI presentation only
- shared component candidates
- no business canon
- no pricing canon
- no secrets

## 3. Current State

- current_phase: Phase N
- frontend_real_mode: disabled
- DB_operation_in_this_handoff: none
- nonprod_db_dryrun_executed_here: no
- live_payload_gap_check_executed_here: no
- live_confirm_executed_here: no

## 4. Key Files

### Design

- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/00_CASUAL_CHAT_WORKER_INTEGRATED_DESIGN.md
- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/000_CASUAL_CHAT_WORKER_FULL_APP_DEVELOPMENT_ROADMAP_CURRENT.md
- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/000_CASUAL_CHAT_WORKER_CURRENT_STATUS_LEDGER.md

### Implementation

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/index.html
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/domain/runtime-config.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/worker-rental-payload-client.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/runtime/backend-runtime-config.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/runtime/real-mode-preflight-check.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/server/local-in-memory-worker-rental-server.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/repositories/postgres-worker-rental-repository.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/server/worker-rental-http-router.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh

## 5. Next Choices

### Choice A: Run non-production DB rollback dry-run

Use only with explicit approval:

```bash
CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
```

Requirements:

- PERSONA_DATABASE_URL set
- DATABASE_URL unset
- rollback confirmation required
- no COMMIT

### Choice B: Defer DB dry-run

Use this handoff to continue design/review in another chat.

### Choice C: Run live payload gap check

Use only against approved local/nonprod backend endpoint:

```bash
CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1 \
CCW_API_BASE_URL="http://127.0.0.1:8787" \
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js
```

Live confirm remains separately gated:

```bash
CCW_ALLOW_LIVE_CONFIRM_TEST=1
```

### Choice D: Real mode switch

Not allowed yet.

Required before Phase O:

- Phase N PASS
- Boss approval
- payload gap PASS
- auth/session PASS
- no frontend secrets
- 150-minute rejection PASS

## 6. STOP Conditions

Stop if any are true:

- DATABASE_URL is used for WorkerRentalCore
- frontend contains DB secret
- frontend contains psql
- 150-minute quote succeeds
- monthly free ticket rule differs from shortest_contract_duration
- CasualChatWorker max exceeds 120 minutes
- live confirm runs against production without approval
- Lover safety boundary is weakened
- AIWorkerOS canon is duplicated into business
- CX22073JW materials are copied as business truth

## 7. Next Recommended Step

Recommended next safe step:

- Run local endpoint integration and real-mode preflight only, or hand off to another chat.

DB-connected dry-run should only be run after explicit approval.

