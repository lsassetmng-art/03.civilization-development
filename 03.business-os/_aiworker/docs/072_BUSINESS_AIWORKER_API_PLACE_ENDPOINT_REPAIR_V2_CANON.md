# BusinessOS AIWorker API Place Endpoint Repair V2 Canon

## Purpose
Repair API v3 place endpoint.

## Problem
DB rollback chain succeeds, but HTTP API place dry-run returns ok:false.

## Likely cause
The API place endpoint used grant_result and place_result in one SQL statement.
Depending on function side effects and visibility, fn_company_robot_place may not see entitlement created by fn_company_robot_grant_entitlement in the previous CTE.

## Repair
Use sequential SQL statements inside one transaction:
1. BEGIN
2. CREATE TEMP TABLE tmp_aicm_grant_result AS SELECT fn_company_robot_grant_entitlement(...)
3. CREATE TEMP TABLE tmp_aicm_place_result AS SELECT fn_company_robot_place(...)
4. SELECT final JSON from temp tables
5. ROLLBACK for dry_run, COMMIT for real

## Safety
- Smoke uses dry-run rollback.
- No persistent write in verification.
- Existing API v2 is not modified.
- No delete.
