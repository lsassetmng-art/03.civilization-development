# CasualChatWorker Real Mode Security Policy Append

status: active
phase: Phase T
app_name: CasualChatWorker
display_name: 雑談ワーカー

## 1. Security Decision

Real mode must be approved separately from DB apply.

## 2. Forbidden

- DB connection string in frontend
- psql in frontend
- ERP DATABASE_URL for WorkerRentalCore
- unauthenticated confirm
- mismatched user_id confirm
- AIWorkerOS mutation
- CX22073JW mutation

## 3. Required

- backend-only DB access
- authenticated context
- payload gap check
- rollback plan
