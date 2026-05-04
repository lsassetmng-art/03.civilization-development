# BusinessOS AIWorker Write Endpoint Compatibility Review V2 Canon

## Purpose
Review write endpoint compatibility without persistent writes.

## V2 fix
The smoke company UUID must be valid.
Do not derive UUID suffix from RUN_TS containing "_".

## Smoke target
- model: HD-R3
- role: Worker
- target_level: section

## Scope
DB rollback smoke:
- grant entitlement
- place robot
- update placement
- deactivate placement

API dry-run smoke:
- grant endpoint
- place endpoint
- invalid token denial

## Boundary
API update/deactivate are not called as separate HTTP requests because API place dry-run rolls back before a later HTTP request can reference placement_id.
