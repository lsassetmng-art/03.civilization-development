# Company Context Foundation Closeout Canon

## Purpose
Close out the company context foundation needed before entitlement/placement RLS.

## Confirmed foundation
- app.current_company_id can be set and read.
- app.current_api_client_id can be set and read.
- business.fn_aicm_aiworker_current_company_id() exists.
- business.fn_aicm_aiworker_current_api_client_id() exists.
- business.fn_aicm_aiworker_company_context_check(uuid) exists.
- API company-context rollback-smoke endpoint exists.
- combined rollback-smoke carries company context.

## Still not applied
- business.company_robot_entitlement RLS
- business.company_robot_placement RLS

## Next phase
Patch grant/place/update/deactivate functions to enforce company context.
