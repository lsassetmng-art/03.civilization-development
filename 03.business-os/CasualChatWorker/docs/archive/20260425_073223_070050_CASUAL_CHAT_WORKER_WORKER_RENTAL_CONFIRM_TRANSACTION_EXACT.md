# CasualChatWorker WorkerRentalCore Backend Transaction Exact

status: active
phase: Phase Q
app_name: CasualChatWorker
display_name: 雑談ワーカー

## 1. Purpose

This document defines the backend transaction shape for WorkerRentalCore confirm flow.

This phase does not execute DB writes.

## 2. Confirm Transaction Scope

Future confirm endpoint will write:

- business.worker_rental_contract
- business.worker_rental_contract_line
- business.worker_rental_period
- business.worker_rental_payment_intent
- business.worker_rental_entitlement_usage
- business.worker_rental_status_history

## 3. Required Transaction Rules

The transaction must:

- validate app_code = CasualChatWorker
- validate service_code = casual_chat_worker
- validate rental_unit_kind = minute
- validate rental_unit_count in 30 / 60 / 90 / 120
- reject rental_unit_count > 120
- verify price row from business.v_worker_rental_price_catalog_active
- verify monthly free ticket rule from business.v_worker_rental_monthly_free_ticket_rule
- lock entitlement balance row when applying free tickets
- prevent remaining_quantity from going negative
- insert contract
- insert period
- insert payment intent
- insert entitlement usage when tickets are used
- append status history
- return rental_contract_id and rental_period_id

## 4. CasualChatWorker Canon

- minimum contract: 30 minutes
- maximum contract: 120 minutes
- price 30 minutes: 500 JPY
- price 60 minutes: 1,000 JPY
- price 90 minutes: 1,500 JPY
- price 120 minutes: 2,000 JPY
- monthly free ticket quantity: 2
- one ticket = shortest contract duration = 30 minutes

## 5. Safety

The backend transaction does not handle AI conversation content.

AIWorkerOS remains read-only for:

- worker catalog
- series tendency
- LoVerS style feature
- safety control

CX22073JW remains read-only for:

- smalltalk material
- topic material

