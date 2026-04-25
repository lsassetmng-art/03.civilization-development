# CasualChatWorker Persona DB Schema Boundary Status

status: active
generated_at: 20260425_204912

## 1. Current Position

- current_phase: Phase N
- frontend_real_mode: disabled
- DB target for future dry-run/verify: Persona-side DB
- DB env: PERSONA_DATABASE_URL

## 2. Fixed Boundary

| Schema / Area | Responsibility |
|---|---|
| business | contracts, pricing, payment, entitlement, free tickets, usage, sessions |
| aiworker | AI worker entity, model, series, personality, style, conversation control, safety |
| cx22073jw | read-only smalltalk and topic material |
| app_common / CommonOS | UI and presentation metadata |

## 3. Confirmation

- business is not ERP DB here.
- business is the Persona-side business schema for this app context.
- ERP DATABASE_URL is not used.
- WorkerRentalCore facts live in business.
- AIWorker entity truth lives in aiworker.

