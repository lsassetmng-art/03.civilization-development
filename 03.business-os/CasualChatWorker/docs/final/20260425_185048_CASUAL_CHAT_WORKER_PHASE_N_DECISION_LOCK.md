# CasualChatWorker Phase N Decision Lock

status: locked-awaiting-decision
generated_at: 20260425_185048

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Whole-App Roadmap

### Phase A: App Rule and Canon Freeze
Status: completed

### Phase B: Design Skeleton
Status: completed

### Phase C: Pricing, Contract, and Free Ticket Design
Status: completed

### Phase D: WorkerRentalCore Generic DB Design
Status: completed

### Phase E: DB Apply and Verification
Status: completed / applied path exists

### Phase F: Frontend Prototype
Status: completed

### Phase G: AIWorker Latest Alignment
Status: completed

### Phase H: CX22073JW Read-Only Smalltalk Material
Status: completed as reference/mock

### Phase I: API Payload Alignment
Status: completed

### Phase J: Backend Endpoint Skeleton
Status: completed

### Phase K: Backend Transaction Preparation
Status: completed

### Phase L: PostgreSQL Repository and HTTP Wiring
Status: completed

### Phase M: Secure Runtime and Real Mode Preparation
Status: completed as preparation

### Phase N: Non-Production Validation / Real Mode Preapproval
Status: locked-awaiting-decision

### Phase O: Frontend Real Mode Switch
Status: STOP

### Phase P: Final Acceptance / Handoff
Status: pending

## 3. Current Canon

### CasualChatWorker

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum_contract_minutes: 30
- maximum_contract_minutes: 120
- allowed_minutes: 30 / 60 / 90 / 120
- price_30_minutes: 500 JPY
- price_60_minutes: 1000 JPY
- price_90_minutes: 1500 JPY
- price_120_minutes: 2000 JPY
- monthly_free_ticket_source_rule: shortest_contract_duration
- monthly_free_ticket_quantity: 2
- one_ticket_free_minutes: 30
- total_monthly_free_minutes: 60
- carryover: false in v1

### WorkerRentalCore

- generic worker rental core
- supports minute / hour / day / month / year
- generic max: 2 years
- app-specific min/max
- app-specific price
- app-specific monthly free ticket duration

### AIWorker

- HD series: initiative medium / user_influence none / action_restriction strict_policy
- LoVerS series: initiative per_model / user_influence soft / action_restriction strict_policy
- style 12: ビジネスヤンデレ
- ビジネスヤンデレ requires strong safety notice

### CX22073JW

- smalltalk material read-only
- topic material read-only
- no contract truth
- no payment truth
- no worker catalog truth

### CommonOS

- presentation only
- UI / tokens / component direction only
- no pricing canon
- no contract canon
- no DB secrets

## 4. Locked Decision

Phase N is locked at decision point.

Not executed in this lock:

- non-production DB rollback dry-run
- live payload gap check
- live confirm
- frontend real mode switch

## 5. Allowed Next Decisions

### A. Run non-production DB rollback dry-run

Only with explicit approval.

### B. Defer DB dry-run and hand off

Allowed immediately.

### C. Run live payload gap check

Only with approved backend endpoint.

### D. Start Phase O real mode switch

STOP. Not allowed yet.

## 6. Required Before Phase O

- Phase N validation PASS or explicit defer decision
- Boss approval
- approved backend endpoint
- payload gap PASS
- auth/session PASS
- no frontend DB secrets
- no frontend psql
- 150-minute quote rejected
- Lover safety boundary retained

