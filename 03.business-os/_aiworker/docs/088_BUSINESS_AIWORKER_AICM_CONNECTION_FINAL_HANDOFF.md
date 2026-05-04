# BusinessOS AIWorker x AICompanyManager Final Handoff

## Status
- FINAL_STATUS: COMPLETED
- RESULT: PASS
- generated_at: 20260428_053039
- owner: Boss
- prepared_by: Zero
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## Scope completed
BusinessOS AIWorker side for AICompanyManager connection.

Completed areas:
- Business-side robot pool model
- placement role catalog
- model-to-role slots
- robot selector functions
- company entitlement / placement functions
- API v3 auth/audit/write/reference endpoints
- combined rollback-smoke endpoint
- CX22073JW read-only reference views
- public profile table and reference views
- RLS Phase1 read/catalog/reference hardening
- RLS Phase2 API client/audit lock-down
- AICompanyManager reference client/help panel

## Final RLS state
Enabled:
- business.robot_placement_role_catalog
- business.robot_pool
- aiworker.robot_series_behavior_profile
- aiworker.robot_model_personality_profile
- aiworker.robot_model_public_profile
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log

Still intentionally disabled:
- business.company_robot_entitlement
- business.company_robot_placement

Reason:
- company identity / ownership strategy is not fixed yet.

## Final API
Primary local API:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js

Important endpoints:
- GET /health
- GET /api/v1/business/aiworker/reference/roles
- GET /api/v1/business/aiworker/reference/personalities
- GET /api/v1/business/aiworker/reference/public-profiles
- GET /api/v1/business/aiworker/reference/model-full
- POST /api/v1/business/aiworker/company-entitlement/grant
- POST /api/v1/business/aiworker/company-robot/place
- POST /api/v1/business/aiworker/company-robot/combined-rollback-smoke

## Security
- auth/audit functions should be SECURITY DEFINER with fixed search_path.
- API client token table is RLS-protected.
- Audit log is RLS-protected.
- Combined smoke endpoint always rolls back.
- Audit dry-run was verified no-persist.

## Robot role model
Role catalog includes:
- President
- ExecutiveManager
- Manager
- Leader
- Worker
- Helper
- Friend
- Lover
- Specialist
- Advisor
- Butler
- Battler
- Security

## Robot pool model
Business side uses robot_pool rows as model/offer/quantity pools, not one row per physical unit.
Placements are unlimited allocation records and do not consume finite row-per-body units.

## Canonical boundary
- BusinessOS owns business robot pool, role catalog, entitlement, placement, API.
- AIWorkerOS owns personality/public profile canon.
- CX22073JW owns read-only reference/search/explanation views only.
- AICompanyManager consumes BusinessOS AIWorker through API and UI reference client.

## Remaining future work
1. Company identity / ownership strategy.
2. RLS for:
   - business.company_robot_entitlement
   - business.company_robot_placement
3. Production execution-role strategy.
4. Persistent write approval flow.
5. Production audit persistence.
6. Deployment packaging.

## Evidence
- FINAL_REPORT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053039_aicm_business_aiworker_final_handoff_package/000_AICM_BUSINESS_AIWORKER_FINAL_HANDOFF_PACKAGE_REPORT.md
- RUN_DIR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053039_aicm_business_aiworker_final_handoff_package
