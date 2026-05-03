# Company Context Foundation Report

## Result
- RESULT: FAIL
- PASS_COUNT: 13
- WARN_COUNT: 0
- FAIL_COUNT: 1

## Completed
- Created DB context helper functions.
- Added API company-context rollback-smoke endpoint.
- Patched combined rollback-smoke to set app.current_company_id.
- Verified DB session context smoke.
- Verified API valid-token context smoke.
- Verified API invalid-token denial.
- Verified combined rollback-smoke carries company context.
- Verified no entitlement/placement/audit dry-run rows persisted.
- Verified entitlement/placement RLS remains disabled.

## Added DB helpers
- business.fn_aicm_aiworker_current_company_id()
- business.fn_aicm_aiworker_current_api_client_id()
- business.fn_aicm_aiworker_company_context_check(uuid)

## Added API endpoint
- POST /api/v1/business/aiworker/company-context/rollback-smoke

## Patched API behavior
- combined rollback-smoke now sets:
  - app.current_company_id
  - app.current_api_client_id

## Still intentionally not applied
- business.company_robot_entitlement RLS
- business.company_robot_placement RLS

## Files
- APPLY_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/026_company_context_foundation.sql
- REVERT_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/026_company_context_foundation_REVERT_IF_NEEDED.sql
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/docs/090_COMPANY_CONTEXT_FOUNDATION_CANON.md
- AICM_CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/120_AICM_COMPANY_CONTEXT_FOUNDATION_CANON.md
- REPORT_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/000_COMPANY_CONTEXT_FOUNDATION_REPORT.md

## Logs
- DB_APPLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/010_db_apply_stdout.txt
- DB_CONTEXT_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/020_db_context_smoke.txt
- API_PATCH_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/030_api_patch_inventory.txt
- API_NODE_CHECK_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/041_api_node_check_stderr.txt
- API_CONTEXT_PARSE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/055_api_context_parse.txt
- NO_PERSIST_CHECK: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/060_no_persist_check.txt
- RLS_STATE_CHECK: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/070_rls_state_check.txt

## Next
- Patch grant/place/update/deactivate function chain to enforce company context.
- Then apply entitlement/placement RLS in a later phase.

## Safety
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used
- API/UI change: API only, additive endpoint/behavior
- Delete: none
- entitlement/placement RLS: unchanged
