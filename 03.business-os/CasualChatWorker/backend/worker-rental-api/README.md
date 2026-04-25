# CasualChatWorker WorkerRental Backend API Skeleton

status: generated

## Purpose

Backend endpoint skeleton for connecting CasualChatWorker to WorkerRentalCore.

## Scope

Included:

- service catalog response mapper
- quote validator
- quote response builder
- route skeleton
- SQL templates
- post-apply read-only snapshot

Not included yet:

- real DB connection code
- auth/session policy
- transaction implementation for confirm
- production server wiring

## Safety

Frontend must never contain DB env variables.

Backend DB env:

- PERSONA_DATABASE_URL

Forbidden:

- DATABASE_URL for ERP
- service_role in frontend
- psql in frontend
