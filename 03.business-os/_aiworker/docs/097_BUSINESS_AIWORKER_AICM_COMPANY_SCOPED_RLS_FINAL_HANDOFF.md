# BusinessOS AIWorker x AICompanyManager Company-Scoped RLS Final Handoff

## Status
- FINAL_STATUS: AICM_BUSINESS_AIWORKER_COMPANY_SCOPED_RLS_COMPLETE
- RESULT: PASS
- generated_at: 20260428_055720
- owner: Boss
- prepared_by: Zero
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## Completed scope
- BusinessOS AIWorker robot pool / role catalog connection.
- CX22073JW reference views and API references.
- API client / audit log RLS.
- Reference/catalog RLS.
- Company context foundation.
- Context-enforced wrapper functions.
- Individual API ctx wrapper switch.
- Entitlement / placement company-scoped RLS.
- Final no-persist verification.

## Final RLS state
RLS enabled:
- business.robot_placement_role_catalog
- business.robot_pool
- aiworker.robot_series_behavior_profile
- aiworker.robot_model_personality_profile
- aiworker.robot_model_public_profile
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log
- business.company_robot_entitlement
- business.company_robot_placement

FORCE RLS:
- not applied yet

DELETE policies:
- not created for entitlement / placement

## Company context
Session variables:
- app.current_company_id
- app.current_api_client_id

DB helpers:
- business.fn_aicm_aiworker_current_company_id()
- business.fn_aicm_aiworker_current_api_client_id()
- business.fn_aicm_aiworker_company_context_check(uuid)
- business.fn_aicm_aiworker_require_company_context(uuid, text)

Ctx wrappers:
- business.fn_company_robot_grant_entitlement_ctx(...)
- business.fn_company_robot_place_ctx(...)
- business.fn_company_robot_placement_update_ctx(...)
- business.fn_company_robot_placement_deactivate_ctx(...)

## API
Primary API:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js

Important endpoints:
- GET /health
- GET /api/v1/business/aiworker/reference/model-full
- POST /api/v1/business/aiworker/company-context/rollback-smoke
- POST /api/v1/business/aiworker/company-entitlement/grant
- POST /api/v1/business/aiworker/company-robot/place
- POST /api/v1/business/aiworker/company-robot/update
- POST /api/v1/business/aiworker/company-robot/deactivate
- POST /api/v1/business/aiworker/company-robot/combined-rollback-smoke

## Verification model
- individual grant dry-run verifies grant endpoint.
- standalone place without entitlement should fail safely.
- combined rollback-smoke verifies full grant/place/update/deactivate chain.
- no-persist checks must remain 0 for smoke company_id.

## Remaining future work
- Production audit persistence.
- Production API client/company binding.
- Production user/company membership source.
- Optional FORCE RLS review.
- Optional delete policy decision, likely keep no delete and use deactivate.
- Deployment packaging.
