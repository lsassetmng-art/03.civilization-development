# AICompanyManager BusinessOS AIWorker RLS Phase1 Apply Canon

## Purpose
Apply safe read/catalog/reference RLS while keeping AICompanyManager local API usable.

## Expected to continue working
- robot selector reads
- CX reference reads
- reference help panel
- combined rollback-smoke endpoint

## Explicitly not hardened yet
- company-specific entitlement/placement RLS
- API client token table lock-down
- audit table lock-down
