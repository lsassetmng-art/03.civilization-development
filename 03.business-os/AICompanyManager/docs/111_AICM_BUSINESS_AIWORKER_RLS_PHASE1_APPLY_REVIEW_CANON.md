# AICompanyManager BusinessOS AIWorker RLS Phase1 Apply Review Canon

## Purpose
Prepare AICompanyManager for first RLS hardening phase without breaking current local API.

## Phase1 UI/API impact
Expected:
- robot selector read should keep working
- CX reference reads should keep working
- help panel should keep working

Not covered:
- production user/company identity enforcement
- company-scoped entitlement/placement RLS
- persistent write approval

## Actual apply
Actual RLS apply must be a separate GO step.
