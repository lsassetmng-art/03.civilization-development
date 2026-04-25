# CasualChatWorker Monthly Shortest Contract Free Ticket Backend Design

status: active
phase: Phase Q
app_name: CasualChatWorker
display_name: 雑談ワーカー

## 1. Purpose

Define backend design for monthly free tickets.

## 2. Canon

Generic WorkerRentalCore rule:

- monthly free ticket makes the app's shortest contract duration free

CasualChatWorker:

- shortest contract duration: 30 minutes
- monthly free tickets: 2
- one ticket = 30 minutes free
- total monthly free: 60 minutes
- carryover: false in v1

## 3. Backend Issue Flow

At beginning of month or first access in month:

1. Read business.v_worker_rental_monthly_free_ticket_rule.
2. If no grant exists for user/app/service/grant_period, create grant.
3. If no balance exists for user/app/service/grant_period, create balance.
4. Do not create duplicate grant.
5. Do not carry over previous month in v1.

## 4. Tables

Future write targets:

- business.worker_rental_entitlement_grant
- business.worker_rental_entitlement_balance

## 5. Use In Quote

Quote endpoint reads entitlement balance and applies up to:

- requested_entitlement_count
- remaining_quantity
- duration / shortest_contract_duration
- app monthly max quantity

