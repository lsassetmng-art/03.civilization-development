# CasualChatWorker Persona DB Schema Boundary Handoff

status: ready
generated_at: 20260425_204912

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- current_phase: Phase N
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Fixed Decision

DB is Persona-side DB.

Use:

- PERSONA_DATABASE_URL

Do not use:

- DATABASE_URL
- ERP DB path

## 3. Schema Responsibilities

### business

Owns:

- contract
- pricing
- payment
- entitlement
- free ticket
- usage history
- rental/chat session facts
- contract status
- safety event as usage fact

### aiworker

Owns:

- AI worker entity
- model / series / individual
- personality
- LoVerS style
- ビジネスヤンデレ metadata
- conversation control
- safety boundary
- app eligibility

### cx22073jw

Owns:

- smalltalk material
- topic material
- safe topic expansion
- read-only conversation material

### app_common / CommonOS

Owns:

- UI presentation metadata
- shared component direction
- no business canon

## 4. Current Gate

- Phase N remains current.
- Phase O remains STOP.
- frontend real mode remains disabled.

## 5. Next Choices

A. non-production rollback dry-run on Persona-side DB  
B. handoff without DB dry-run  
C. live payload gap check against approved endpoint  
D. Phase O real mode switch remains STOP

