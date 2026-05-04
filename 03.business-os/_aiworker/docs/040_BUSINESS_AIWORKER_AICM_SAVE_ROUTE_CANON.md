# BusinessOS AIWorker AICompanyManager Save Route Canon

## Purpose
Connect AICompanyManager robot setting payloads to BusinessOS _aiworker save routes.

## Boundary
Browser UI must not connect directly to DB.

AICompanyManager:
- builds robot setting draft
- displays robot selector
- calls save API

BusinessOS _aiworker:
- owns local API route
- validates payload
- calls BusinessOS DB functions
- persists entitlement and placement

DB:
- Persona-side DB
- PERSONA_DATABASE_URL
- ERP DATABASE_URL is not used

## Save flow
1. AICompanyManager bridge builds draft.
2. Save client calls:
   - POST /api/v1/business/aiworker/company-entitlement/grant
   - POST /api/v1/business/aiworker/company-robot/place
3. API server calls:
   - business.fn_company_robot_grant_entitlement
   - business.fn_company_robot_place
4. UI displays:
   - internal_nickname@role_code

## Safety
- API server supports dry-run mode.
- Smoke tests must run with dry-run enabled.
- Browser save route can persist only when API server is started without dry-run.
- Existing AICompanyManager main JS is not modified.
- index.html is script-append only.

## Canonical display label
internal_nickname@role_code

## Canonical no-free-text rule
Robot model code must be selected from BusinessOS _aiworker selector options.
Free-text model assignment is not canonical.
