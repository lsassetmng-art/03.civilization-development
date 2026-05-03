# AICompanyManager Entitlement / Placement Company-Scoped RLS Canon

## Purpose
Ensure AICompanyManager robot entitlement and placement writes are company-scoped.

## Verification model
- individual grant dry-run passes
- standalone place without entitlement fails safely
- combined rollback-smoke passes full chain in one transaction
- invalid token is denied
- no rows persist during smoke

## Remaining future hardening
- production audit persistence
- production company/user membership source
- optional FORCE RLS review
