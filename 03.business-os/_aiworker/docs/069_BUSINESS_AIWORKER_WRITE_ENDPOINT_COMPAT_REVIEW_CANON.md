# BusinessOS AIWorker Write Endpoint Compatibility Review Canon

## Purpose
Review write endpoint compatibility for AICompanyManager x BusinessOS AIWorker.

## Scope
This review checks whether the DB write functions and API write endpoints are compatible enough for the next hardening phase.

## DB rollback chain
The DB rollback smoke verifies:
- business.fn_company_robot_grant_entitlement
- business.fn_company_robot_place
- business.fn_company_robot_placement_update
- business.fn_company_robot_placement_deactivate

The chain is executed inside BEGIN / ROLLBACK.

## API dry-run smoke
The API smoke verifies:
- POST /api/v1/business/aiworker/company-entitlement/grant
- POST /api/v1/business/aiworker/company-robot/place

Auth modes:
- auth off
- auth on valid token
- auth on invalid token denial

## Why API update/deactivate are not called separately
The API place endpoint is dry-run by default and rolls back before the next HTTP request.
Therefore, update/deactivate cannot safely reference the returned placement_id across separate HTTP calls without either:
- adding a combined rollback endpoint, or
- allowing temporary persistent test rows.

This bundle avoids persistent writes.

## Result interpretation
PASS means:
- DB write function chain works in rollback.
- API grant/place dry-run endpoints work.
- invalid-token write is denied.
- audit dry-run smoke rows did not persist.

PASS does not mean:
- production RLS is complete
- persistent write operations are approved
- update/deactivate API HTTP smoke is complete
