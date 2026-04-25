# CasualChatWorker Phase N Decision Bundle

status: decision-required
generated_at: 20260425_164854

## 1. App

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Whole-App Development Roadmap

### Phase A: App Rule and Canon Freeze
Status: completed

- CasualChatWorker / 雑談ワーカー fixed
- category fixed to 03.business-app
- Friend / Lover fixed
- Lover safety boundary fixed

### Phase B: Design Skeleton
Status: completed / incrementally updated

- root design
- API / DB / policy / screen / stateflow docs

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
- minute / hour / day / month / year
- generic max 2 years
- app-specific max
- app-specific price

### Phase E: DB Apply and Verification
Status: applied / verify path created

- WorkerRentalCore DB apply was previously approved
- PERSONA_DATABASE_URL used
- ERP DATABASE_URL not used

### Phase F: Frontend Prototype
Status: completed

- HTML / CSS / JavaScript local prototype
- worker selection
- quote
- ticket use
- chat
- history

### Phase G: AIWorker Latest Alignment
Status: completed

- HD series tendency
- LoVerS series tendency
- individual style feature
- ビジネスヤンデレ strong safety notice

### Phase H: CX22073JW Read-Only Material
Status: completed as mock/reference

- Friend smalltalk material
- Lover smalltalk material
- safe redirect material

### Phase I: API Payload Alignment
Status: completed

- worker_rental payload naming
- fixtures
- quote / confirm / entitlement

### Phase J: Backend Endpoint Skeleton
Status: completed

- service catalog
- entitlement balance
- quote
- confirm
- SQL templates

### Phase K: Backend Transaction Preparation
Status: completed

- auth/session policy
- in-memory repository
- confirm transaction service
- monthly ticket issue flow

### Phase L: PostgreSQL Repository and HTTP Wiring
Status: completed

- postgres repository skeleton
- HTTP router
- payload gap checker
- mock pool tests

### Phase M: Secure Runtime and Real Mode Preparation
Status: completed as preparation

- backend runtime config
- local in-memory endpoint server
- non-production rollback dry-run runner
- live payload gap checker
- real mode preflight

### Phase N: Non-Production Validation
Status: current / decision-required

Choices:

A. Run non-production DB rollback dry-run  
B. Do not run DB dry-run yet; hand off to another chat  
C. Run live payload gap check against approved local/nonprod endpoint  
D. Prepare real mode switch only after A/C pass

### Phase O: Real Mode Switch
Status: not started

Required before start:

- Phase N PASS
- Boss approval
- no frontend DB secrets
- payload gap PASS
- auth/session PASS

### Phase P: Final Acceptance
Status: pending

Required outputs:

- final acceptance package
- final verification
- final handoff
- risk list
- next app integration instructions

## 3. Current Canon

### WorkerRentalCore

- generic rental core
- supports minute / hour / day / month / year
- generic max: 2 years
- app-specific price
- app-specific min/max
- monthly ticket = app shortest contract duration

### CasualChatWorker

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- min contract: 30 minutes
- max contract: 120 minutes
- allowed durations: 30 / 60 / 90 / 120 minutes
- price:
  - 30 minutes: 500 JPY
  - 60 minutes: 1,000 JPY
  - 90 minutes: 1,500 JPY
  - 120 minutes: 2,000 JPY
- monthly free tickets:
  - quantity: 2
  - one ticket: 30 minutes free
  - total: 60 minutes free
  - carryover: false in v1

### AIWorker

- HD series:
  - initiative: medium
  - user_influence: none
  - action_restriction: strict_policy
- LoVerS series:
  - initiative: per_model
  - user_influence: soft
  - action_restriction: strict_policy
- style 12:
  - ビジネスヤンデレ
  - strong safety notice required

### Safety

Lover type remains:

- pseudo-romantic entertainment
- rental boyfriend/girlfriend style AI worker
- not a real relationship
- no monitoring
- no threats
- no dependency induction
- no sexual service conversion
- no personal data demand

## 4. Phase N Decision

DB / live checks are not executed by this bundle.

### Option A: Run non-production rollback dry-run

Required command:

```bash
CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
```

Required:

- PERSONA_DATABASE_URL set
- DATABASE_URL not set
- rollback confirmation appears
- no COMMIT

### Option B: Cross-chat handoff

Use:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_CROSS_CHAT_HANDOFF.md

### Option C: Live payload gap check

Required command:

```bash
CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1 \
CCW_API_BASE_URL="http://127.0.0.1:8787" \
node /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js
```

Live confirm remains separately gated:

```bash
CCW_ALLOW_LIVE_CONFIRM_TEST=1
```

## 5. STOP Conditions

Stop if any are true:

- DATABASE_URL is used
- frontend contains DB secret
- frontend contains psql
- 150-minute quote succeeds
- monthly free ticket rule differs from shortest_contract_duration
- CasualChatWorker max exceeds 120 minutes
- Lover safety boundary is weakened
- live confirm is run against production without approval
- rollback confirmation is missing

