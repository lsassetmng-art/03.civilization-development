# CasualChatWorker Live Payload Gap Check Exact

status: active
phase: Phase T
app_name: CasualChatWorker
display_name: 雑談ワーカー

## 1. Purpose

Define live payload gap check before frontend real mode switch.

## 2. Required Checks

Live endpoint response must match frontend/backend payload contract for:

- service catalog
- entitlement balance
- quote
- confirm

## 3. Confirm Check Gate

Confirm endpoint may write DB state.

Therefore live confirm test must not run unless:

- CCW_ALLOW_LIVE_CONFIRM_TEST=1
- target is non-production or rollback-controlled
- Boss approves

## 4. Required Canon

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- max contract: 120 minutes
- shortest contract: 30 minutes
- free ticket rule: shortest_contract_duration
- monthly tickets: 2
- one ticket: 30 minutes

## 5. STOP

Do not enable real mode if:

- any required field is missing
- 150 minute quote succeeds
- service catalog does not show max 120 minutes
- free ticket rule differs
- confirm response lacks rental_contract_id / rental_period_id
