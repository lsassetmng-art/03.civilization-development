# AICompanyManager Company Identity / Entitlement-Placement RLS Review Canon

## Purpose
Define how AICompanyManager should safely handle company-scoped entitlement and placement RLS.

## AICompanyManager requirement
AICompanyManager must not rely on user-entered company_id alone.
company_id must be checked against trusted auth/API context.

## Still open
- final company identity source
- allowed-company mapping for API clients
- production user/company membership source
- whether local API uses DB session variables or controlled SECURITY DEFINER wrappers

## This review is read-only
No DB mutation is performed.
