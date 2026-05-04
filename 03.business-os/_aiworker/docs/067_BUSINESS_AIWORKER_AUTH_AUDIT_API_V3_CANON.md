# BusinessOS AIWorker Auth/Audit API v3 Canon

## Purpose
Add optional auth/audit local API v3 for AICompanyManager x BusinessOS AIWorker.

## DB foundation
This bundle assumes auth/audit DB foundation already exists.

Required DB objects:
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log
- business.fn_aicm_aiworker_token_hash
- business.fn_aicm_aiworker_api_auth_check
- business.fn_aicm_aiworker_api_audit_write
- business.vw_aicm_aiworker_api_audit_recent

## Compatibility modes
Auth off:
- AICM_AIWORKER_AUTH_REQUIRED=0
- Token not required

Auth on:
- AICM_AIWORKER_AUTH_REQUIRED=1
- Header required:
  X-AICM-AIWORKER-TOKEN: local-aicm-aiworker-dev-token

## Audit
- AICM_AIWORKER_AUDIT_ENABLED=1 enables auth/audit calls
- AICM_AIWORKER_AUDIT_DRY_RUN=1 wraps audit function calls in rollback during smoke

## Safety
- Existing API v2 is not modified.
- RLS enforcement is not enabled.
- Existing main JS is not modified.
