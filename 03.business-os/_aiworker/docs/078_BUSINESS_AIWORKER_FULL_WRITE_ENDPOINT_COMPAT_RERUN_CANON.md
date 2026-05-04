# BusinessOS AIWorker Full Write Endpoint Compatibility Rerun Canon

## Purpose
Re-run full write endpoint compatibility after API place endpoint repair v3.

## Scope
DB rollback chain:
- grant entitlement
- place robot
- update placement
- deactivate placement

API dry-run:
- grant endpoint
- place endpoint
- invalid token denial

## Boundary
API update/deactivate are not called as separate HTTP requests because API place dry-run rolls back before a later HTTP request can reference placement_id.
Update/deactivate are verified in DB rollback chain.

## Safety
- Persistent write: none
- API dry-run only
- DB rollback only
- No delete
- No RLS change
