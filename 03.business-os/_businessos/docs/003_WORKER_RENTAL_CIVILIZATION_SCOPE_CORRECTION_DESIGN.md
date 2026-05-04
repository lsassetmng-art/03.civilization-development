# WorkerRentalCore / RobotRentalStore civilization_id Scope Correction Design

## Status
- status: design-only
- apply_status: not_applied
- owner: Boss
- prepared_by: Zero
- review: 佐藤(DB担当)

## 1. Canonical correction
BusinessOS is primarily user-scoped.

Primary owner key:
- civilization_id

Do not use company_id as the primary owner boundary for BusinessOS rental data.

## 2. Meaning of IDs

### civilization_id
BusinessOS user / Civilization account owner.

Use for:
- rental contract owner
- ticket owner
- entitlement grant owner
- payment intent owner
- usage log owner
- safety event owner
- end summary owner
- quote owner
- RobotRentalStore user actions

### user_id
Legacy or auth-level user identifier.

Rule:
- keep for compatibility if already present
- add owner_civilization_id or civilization_id as canonical owner
- future RLS should use civilization_id first

### company_id
Optional target context.

Use only for:
- target_company_id
- erp_company_id
- target AI company object when needed
- ERP handoff target

Do not use company_id alone for BusinessOS rental ownership.

## 3. WorkerRentalCore table direction

Parent transactional tables should have:
- civilization_id or owner_civilization_id
- existing user_id may remain
- optional target_company_id if the rental is for a company target

Child tables should either:
- have owner_civilization_id duplicated for direct RLS, or
- enforce RLS through parent contract join

Preferred for this project:
- add owner_civilization_id to child/event/log tables too
- keep parent join consistency checks later

## 4. Tables requiring civilization owner

Must add owner_civilization_id:
- worker_rental_contract
- worker_rental_period
- worker_rental_usage_log
- worker_rental_end_summary
- worker_rental_safety_event
- worker_rental_payment_intent
- worker_rental_entitlement_grant
- worker_rental_entitlement_balance
- worker_rental_entitlement_usage

Child rows that currently have no owner:
- worker_rental_contract_line
- worker_rental_status_history

Recommended:
- add owner_civilization_id to these child rows too

Catalog/policy tables:
- worker_rental_unit_policy
- v_worker_rental_monthly_free_ticket_rule

These may remain global/catalog if they are not user-owned.

## 5. RLS direction
Use:
- current_setting('app.current_civilization_id', true)

Policy model:
- SELECT: owner_civilization_id = app.current_civilization_id
- INSERT: owner_civilization_id = app.current_civilization_id
- UPDATE: old and new owner_civilization_id must match app.current_civilization_id
- DELETE: avoid; use status transitions/cancel/deactivate

## 6. API context direction
RobotRentalStore / WorkerRentalCore API should set:
- app.current_civilization_id

Optional:
- app.current_company_id only when target company exists

Quote:
- may be dry-run without DB write
- if persisted, quote must have owner_civilization_id

Contract confirm:
- must require owner_civilization_id
- must not rely on company_id alone

## 7. AICompanyManager separation
AICompanyManager company-scoped objects are handled in the AICompanyManager chat.

This design is for:
- WorkerRentalCore
- RobotRentalStore
- CasualChatWorker rental tables
- BusinessOS user-owned rental flows
