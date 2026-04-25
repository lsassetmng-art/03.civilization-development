# CasualChatWorker Backend Auth Session Policy

status: active
phase: Phase Q
app_name: CasualChatWorker
display_name: 雑談ワーカー

## 1. Purpose

Define minimum backend auth/session policy before real WorkerRentalCore endpoints are enabled.

## 2. Required Policy

Every backend request must have:

- authenticated actor
- actor user id
- app_code
- service_code
- user_id in request
- actor user id must match user_id, unless operator/admin scope exists
- request locale may be ja or en
- frontend must not send DB secrets

## 3. Forbidden

- anonymous confirm
- mismatched user_id confirm
- frontend DB env
- frontend psql
- ERP DATABASE_URL
- direct WorkerRentalCore DB calls from browser

## 4. Real Mode Gate

Frontend real mode may be enabled only after:

- auth policy implementation PASS
- quote endpoint PASS
- confirm transaction PASS
- entitlement endpoint PASS
- history endpoint PASS
- payload gap check PASS

