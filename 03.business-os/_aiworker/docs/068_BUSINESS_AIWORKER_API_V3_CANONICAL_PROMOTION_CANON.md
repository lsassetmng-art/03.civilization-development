# BusinessOS AIWorker API v3 Canonical Promotion Canon

## Purpose
Promote API v3 as the canonical local API entry for AICompanyManager x BusinessOS AIWorker.

## Canonical API
API v3 is the canonical local API entry.

File:
- _aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js

Canonical launcher:
- _aiworker/scripts/run_aicm_business_aiworker_local_api.sh

Version-specific launcher:
- _aiworker/scripts/run_aicm_business_aiworker_local_api_v3_auth_audit.sh

## Compatibility
Older API files are not deleted.
v2 remains parallel until final acceptance and archive approval.

## Default local port
- 8801

## Auth modes
Auth off:
- AICM_AIWORKER_AUTH_REQUIRED=0

Auth on:
- AICM_AIWORKER_AUTH_REQUIRED=1
- Header:
  X-AICM-AIWORKER-TOKEN: local-aicm-aiworker-dev-token

## Audit
- AICM_AIWORKER_AUDIT_ENABLED=1
- AICM_AIWORKER_AUDIT_DRY_RUN=1 for smoke
- AICM_AIWORKER_AUDIT_DRY_RUN=0 for real audit recording

## Smoke mode
The canonical smoke-crud endpoint is currently read-only preflight:
- smoke_mode: readonly_preflight

Reason:
- API auth/audit smoke should not depend on write-style DB functions.
- Write endpoints remain available separately.
- Write rollback smoke should be reviewed in a separate bundle.

## Safety
- No deletion.
- Existing API v2 not modified.
- Existing main JS not modified.
- RLS enforcement not enabled in this bundle.
