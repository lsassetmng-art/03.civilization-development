# BusinessOS AIWorker Combined API Rollback-Smoke Endpoint Canon

## Purpose
Add one API endpoint that verifies the complete write function chain in a single HTTP request.

## Endpoint
POST /api/v1/business/aiworker/company-robot/combined-rollback-smoke

## Chain
The endpoint executes:
1. business.fn_company_robot_grant_entitlement
2. business.fn_company_robot_place
3. business.fn_company_robot_placement_update
4. business.fn_company_robot_placement_deactivate

## Transaction rule
This endpoint is smoke-only and always rolls back.

Even if a request sends dry_run=false, this endpoint still uses ROLLBACK.

## Why
Separate HTTP dry-run calls cannot reuse placement_id because the place endpoint rolls back before update/deactivate.
This endpoint validates the full chain inside one database transaction and returns all generated IDs before rollback.

## Safety
- Persistent write: none
- API smoke: rollback only
- DB write: rollback only
- No delete
- No RLS change
- Existing API v2 not modified
