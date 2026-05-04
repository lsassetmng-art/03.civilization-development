# Company Context Enforcement Wrapper Canon

## Purpose
Add company-context-enforced wrapper functions before enabling RLS on:
- business.company_robot_entitlement
- business.company_robot_placement

## Why wrapper first
Existing functions are preserved.
The API can move to context-enforced wrappers without destructive replacement.

## Added guard
- business.fn_aicm_aiworker_require_company_context(uuid, text)

## Added wrappers
- business.fn_company_robot_grant_entitlement_ctx(...)
- business.fn_company_robot_place_ctx(...)
- business.fn_company_robot_placement_update_ctx(...)
- business.fn_company_robot_placement_deactivate_ctx(...)

## Rule
The wrapper checks:
- app.current_company_id exists
- app.current_company_id matches target company_id

For update/deactivate, company_id is resolved from company_robot_placement first.

## Still not applied
- business.company_robot_entitlement RLS
- business.company_robot_placement RLS
