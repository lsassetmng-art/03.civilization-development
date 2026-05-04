# BusinessOS AIWorker API Place Endpoint Repair Canon

## Purpose
Repair API v3 place endpoint compatibility.

## Known state
- DB rollback write chain can grant/place/update/deactivate successfully.
- API grant endpoint can run in dry-run.
- API place endpoint failed before this repair.

## Repair policy
Patch API v3 placeRobot() to use the same grant -> place CTE style as the passing DB rollback chain.

## Safety
- Persistent write: none
- API place smoke: dry-run rollback
- Existing API v2: not modified
- Delete: none
