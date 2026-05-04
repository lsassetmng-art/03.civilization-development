# BusinessOS AIWorker Auth / Audit Foundation Canon

## Purpose
Add production hardening foundation for AICompanyManager x BusinessOS AIWorker APIs.

## Scope
This phase creates:
- API client token catalog
- API audit log
- token hash helper
- auth check function
- audit write function
- recent audit view

## Not in this phase
This phase does not:
- modify existing local API servers
- enforce RLS
- block existing UI
- change selector functions
- change robot_pool
- delete anything

## DB objects
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log
- business.fn_aicm_aiworker_token_hash
- business.fn_aicm_aiworker_api_auth_check
- business.fn_aicm_aiworker_api_audit_write
- business.vw_aicm_aiworker_api_audit_recent

## Dev token
A local development client is seeded:
- client_code: local_aicm_aiworker_dev
- token: local-aicm-aiworker-dev-token

This is for local smoke testing only.
Production token rotation should replace this later.

## RLS policy
RLS enforcement is intentionally not enabled in this phase.
Reason:
- avoid breaking existing local flows
- first prove audit/auth functions
- then wire APIs
- then enable/enforce policies in a separate reviewed phase

## Reviewer
DB changes are Sato DB review target.
