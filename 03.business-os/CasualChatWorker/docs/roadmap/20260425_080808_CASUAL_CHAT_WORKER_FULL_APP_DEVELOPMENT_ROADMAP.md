# CasualChatWorker / 雑談ワーカー Full App Development Roadmap

status: active
app_name: CasualChatWorker
display_name: 雑談ワーカー
category: 03.business-app

## 0. App Canon

CasualChatWorker is a BusinessOS app for renting AI workers for casual chat.

Core app canon:

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- display_name: 雑談ワーカー
- category: 03.business-app
- design_root: ~/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: ~/03.civilization-development/03.business-os/CasualChatWorker
- generic_rental_core: WorkerRentalCore
- DB owner schema: business
- AI worker canon: aiworker
- smalltalk material canon: cx22073jw
- UI/common presentation: CommonOS / app_common
- supported worker types: Friend / Lover
- CasualChatWorker max contract: 120 minutes
- CasualChatWorker minimum contract: 30 minutes
- allowed durations: 30 / 60 / 90 / 120 minutes
- price:
  - 30 minutes: 500 JPY
  - 60 minutes: 1,000 JPY
  - 90 minutes: 1,500 JPY
  - 120 minutes: 2,000 JPY
- monthly free ticket rule:
  - monthly_free_ticket_source_rule: shortest_contract_duration
  - monthly_free_ticket_quantity: 2
  - one ticket for this app: 30 minutes free
  - total monthly free: 60 minutes
  - carryover: false in v1

## 1. Category Selection

- 01.civilization-app
- 02.persona-app
▶ 03.business-app
- 04.life-app
- 05.game-app
- 06.streaming-app

## 2. Whole-App Roadmap

### Phase A: App Rule and Canon Freeze

Goal:

- Fix app name, category, roots, ownership, v1 scope, and forbidden scope.

Main outputs:

- app design/development rule
- Friend definition
- Lover definition
- Lover safety boundary
- app category selection

Status:

- completed

### Phase B: Design Skeleton

Goal:

- Prepare design folders and canonical docs.

Main outputs:

- root INDEX
- root OVERVIEW
- integrated design
- model docs
- screen docs
- stateflow docs
- policy docs
- DB docs
- API docs

Status:

- completed / incrementally updated

### Phase C: Pricing, Contract, and Free Ticket Design

Goal:

- Fix contract duration, pricing, and monthly free ticket model.

Main outputs:

- 30 / 60 / 90 / 120 minute price rules
- monthly free ticket rule
- shortest-contract-duration entitlement design
- app-specific max contract design

Status:

- completed

### Phase D: WorkerRentalCore Generic DB Design

Goal:

- Replace chat-worker-specific tables with generic worker rental tables.

Main outputs:

- worker_rental_* generic DDL
- unit support: minute / hour / day / month / year
- generic max duration: 2 years
- app-specific max duration
- app-specific price catalog
- generic entitlement model

Status:

- completed

### Phase E: DB Apply and Verification

Goal:

- Apply WorkerRentalCore to business schema using PERSONA_DATABASE_URL.

Main outputs:

- DB apply package
- DB apply summary
- post-apply assertions
- read-only snapshot

Status:

- applied / verification path created

Notes:

- ERP DATABASE_URL is not used.
- Direct ERP integration is not v1.

### Phase F: Frontend Prototype

Goal:

- Create local HTML/CSS/JavaScript prototype.

Main outputs:

- worker list
- Friend / Lover filter
- AI worker detail
- duration selection
- quote display
- ticket application display
- confirm flow
- chat screen
- remaining timer
- history screen

Status:

- completed

### Phase G: AIWorker Latest Alignment

Goal:

- Reflect AIWorkerOS latest series tendency and individual style features.

Main outputs:

- series tendency reference
- LoVerS style selection cards
- HD series display
- LoVerS series display
- style 12 ビジネスヤンデレ strong safety notice
- UI card rendering

Status:

- completed

### Phase H: CX22073JW Read-Only Smalltalk Material

Goal:

- Keep smalltalk material as read-only reference from CX22073JW.

Main outputs:

- mock CX material
- Friend topic material
- Lover topic material
- safe redirect material

Status:

- completed as mock/reference

### Phase I: API Payload Alignment

Goal:

- Align frontend/mock payloads with WorkerRentalCore.

Main outputs:

- worker-rental-payload-client
- fixtures
- quote request/response
- confirm request/response
- entitlement balance response

Status:

- completed

### Phase J: Backend Endpoint Skeleton

Goal:

- Prepare backend API shape without switching real mode.

Main outputs:

- backend route skeleton
- service catalog endpoint skeleton
- entitlement endpoint skeleton
- quote endpoint skeleton
- confirm endpoint skeleton
- SQL templates

Status:

- completed

### Phase K: Backend Transaction Preparation

Goal:

- Prepare confirm transaction and monthly ticket issue logic.

Main outputs:

- auth/session policy
- in-memory repository
- confirm transaction service
- monthly free ticket issue flow
- SQL transaction template
- in-memory transaction tests

Status:

- completed

### Phase L: PostgreSQL Repository and HTTP Wiring

Goal:

- Prepare PostgreSQL repository skeleton and HTTP handler.

Main outputs:

- postgres-worker-rental-repository
- HTTP router
- payload gap checker
- mock pool tests
- local HTTP tests

Status:

- completed

### Phase M: Secure Runtime and Real Mode Preparation

Goal:

- Prepare secure backend runtime and real mode switch gate.

Main outputs:

- backend runtime config
- local in-memory endpoint server
- local endpoint integration test
- non-production DB rollback dry-run runner
- live payload gap checker
- real mode preflight checker

Status:

- completed as preparation

### Phase N: Non-Production Validation

Goal:

- Validate backend against non-production DB in rollback-only mode.

Main outputs:

- gated dry-run execution
- rollback confirmation
- live payload gap check against approved endpoint
- 150-minute rejection verification
- auth/session verification

Status:

- next decision / not automatically executed

### Phase O: Real Mode Switch

Goal:

- Enable frontend real API mode only after all gates pass.

Main outputs:

- approved apiBaseUrl
- apiMode = real
- allowRealApi = true
- rollback plan
- monitoring logs
- switch report

Status:

- not started

### Phase P: Final Acceptance

Goal:

- Complete final app acceptance and cross-chat handoff.

Main outputs:

- final acceptance package
- final verification report
- latest handoff
- remaining risk list
- next app/OS integration instructions

Status:

- pending final real-mode decision

## 3. Current Position

Current position:

- Phase M completed as preparation.
- Phase N is next.
- Frontend real mode remains disabled.
- Non-production rollback dry-run is prepared but not executed automatically.
- Live payload gap checker is prepared but not executed automatically.
- Real mode switch is not approved yet.

## 4. Remaining Work

Remaining before real mode:

1. Decide whether to run non-production rollback dry-run.
2. Run rollback dry-run with explicit flags if approved.
3. Run live payload gap check against approved backend endpoint.
4. Verify auth/session behavior.
5. Verify no frontend secrets.
6. Confirm 150-minute quote rejection.
7. Boss approval for real mode switch.
8. Switch frontend runtime config to real mode.
9. Run end-to-end test.
10. Create final acceptance package.

## 5. Gates

### DB / Backend Safety Gate

Required:

- PERSONA_DATABASE_URL only
- no DATABASE_URL
- no frontend DB secret
- no frontend psql
- rollback-only dry-run before live write tests
- 佐藤（DB担当）review for DB-sensitive changes

### Lover Safety Gate

Required:

- Lover remains pseudo-romantic entertainment
- not a real relationship
- no monitoring
- no threats
- no dependency induction
- no sexual service conversion
- contract-time boundary remains clear

### WorkerRentalCore Gate

Required:

- generic core remains app-independent
- CasualChatWorker-specific max remains 120 minutes
- prices remain app-specific
- monthly free ticket remains shortest-contract-duration rule

## 6. Next Recommended Action

Next safe action:

- Generate or execute only the approved non-production rollback dry-run path.

If Boss wants no DB dry-run yet:

- create final cross-chat handoff.

If Boss approves dry-run:

- run:
  - CCW_APPROVE_NONPROD_DB_DRY_RUN=1
  - CCW_BACKEND_MODE=nonprod_db_dry_run
  - CCW_ENABLE_NONPROD_DB_DRY_RUN=1
  - CCW_CONFIRM_ROLLBACK_TEST=1
  - run-nonprod-db-dry-run-gated.sh

