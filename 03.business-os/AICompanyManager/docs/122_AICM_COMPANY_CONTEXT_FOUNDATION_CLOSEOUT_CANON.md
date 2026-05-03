# AICompanyManager Company Context Foundation Closeout Canon

## Purpose
Confirm AICompanyManager can pass trusted company context into BusinessOS AIWorker API/database flow.

## Required API behavior
- POST /api/v1/business/aiworker/company-context/rollback-smoke returns context matched.
- POST /api/v1/business/aiworker/company-robot/combined-rollback-smoke returns combined_api_context_company_id.
- Invalid token is denied.
- No entitlement/placement rows persist during smoke.

## Remaining work
Company context enforcement inside grant/place/update/deactivate functions.
