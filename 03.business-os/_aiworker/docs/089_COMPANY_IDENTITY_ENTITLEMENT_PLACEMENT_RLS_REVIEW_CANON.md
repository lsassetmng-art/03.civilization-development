# Company Identity / Entitlement-Placement RLS Review Canon

## Purpose
Prepare the next hardening phase for company-scoped AICompanyManager robot entitlement and placement data.

## Target tables
- business.company_robot_entitlement
- business.company_robot_placement

## Current rule
Do not enable RLS on these two tables until company identity strategy is fixed.

## Why
These tables are company-scoped write tables.
If RLS is enabled without a trusted company context, grant/place/update/deactivate can break or become unsafe.

## Recommended strategy
Use controlled API execution with explicit company context.

### Required future foundation
A trusted company context source is needed.

Candidate options:
1. API client is bound to allowed company_id / scope.
2. Auth token resolves to api_client_id and allowed company set.
3. API sets DB session variables:
   - app.current_company_id
   - app.current_api_client_id
4. RLS policies read current_setting('app.current_company_id', true).
5. Write functions validate company_id against trusted context.

## Policy direction
For entitlement and placement:
- SELECT: only rows for current company
- INSERT: only rows for current company
- UPDATE: only rows for current company
- DELETE: probably not allowed; use status/deactivate function instead

## Do not apply yet
This review produces draft SQL only.
Actual apply must wait until:
- API execution role strategy is fixed
- company context propagation is implemented
- write functions are updated or wrapped
- rollback smoke proves compatibility
