# Company Context Foundation Canon

## Purpose
Add the foundation needed before applying RLS to:
- business.company_robot_entitlement
- business.company_robot_placement

## Session variables
The API layer should set these inside a transaction:
- app.current_company_id
- app.current_api_client_id

## DB helpers
- business.fn_aicm_aiworker_current_company_id()
- business.fn_aicm_aiworker_current_api_client_id()
- business.fn_aicm_aiworker_company_context_check(p_company_id uuid)

## Rule
company_id in request body is not enough by itself.
Before company-scoped RLS can be applied, DB must be able to compare row.company_id to trusted session context.

## Current phase
This phase only creates foundation and smoke endpoints.
It does not enable RLS on entitlement/placement tables.
