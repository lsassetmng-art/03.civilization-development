# AICompanyManager BusinessOS AIWorker RLS Phase2 Strategy A Apply Canon

## Purpose
Protect API client token data and audit logs while keeping AICompanyManager API usable.

## Expected to keep working
- auth-on valid token
- invalid token denial
- reference APIs
- combined rollback-smoke endpoint
- audit dry-run no-persist

## Not included
- company entitlement/placement RLS
- production company identity enforcement
