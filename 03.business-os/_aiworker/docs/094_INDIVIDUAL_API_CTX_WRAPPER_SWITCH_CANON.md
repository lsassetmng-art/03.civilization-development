# Individual API ctx-wrapper switch canon

## Purpose
Switch individual write endpoints to company-context-enforced ctx wrappers.

## Individual endpoints
- POST /api/v1/business/aiworker/company-entitlement/grant
- POST /api/v1/business/aiworker/company-robot/place
- POST /api/v1/business/aiworker/company-robot/update
- POST /api/v1/business/aiworker/company-robot/deactivate

Compatibility aliases:
- POST /api/v1/business/aiworker/company-robot/placement/update
- POST /api/v1/business/aiworker/company-robot/placement/deactivate

## DB wrappers used
- business.fn_company_robot_grant_entitlement_ctx
- business.fn_company_robot_place_ctx
- business.fn_company_robot_placement_update_ctx
- business.fn_company_robot_placement_deactivate_ctx

## Rule
Each individual endpoint must:
1. authenticate request
2. set app.current_company_id
3. set app.current_api_client_id
4. call ctx wrapper
5. support dry_run rollback
6. keep entitlement/placement RLS unchanged until final RLS phase
