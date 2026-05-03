# Individual API ctx-wrapper switch report

## Result
- RESULT: FAIL
- FINAL_STATUS: REVIEW_REQUIRED
- PASS_COUNT: 23
- WARN_COUNT: 0
- FAIL_COUNT: 1

## Completed if RESULT=PASS
- Individual grant endpoint uses ctx wrapper.
- Individual place endpoint uses ctx wrapper.
- Individual update endpoint helper/route uses ctx wrapper.
- Individual deactivate endpoint helper/route uses ctx wrapper.
- Combined rollback-smoke remains ctx-wrapper based.
- Valid token grant dry-run passed.
- Valid token place dry-run passed.
- Combined rollback-smoke passed.
- Invalid token denial passed.
- No entitlement/placement rows persisted.
- Audit dry-run no-persist confirmed.
- entitlement/placement RLS remains disabled.

## Patched endpoints
- POST /api/v1/business/aiworker/company-entitlement/grant
- POST /api/v1/business/aiworker/company-robot/place
- POST /api/v1/business/aiworker/company-robot/update
- POST /api/v1/business/aiworker/company-robot/placement/update
- POST /api/v1/business/aiworker/company-robot/deactivate
- POST /api/v1/business/aiworker/company-robot/placement/deactivate

## Files
- API_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/docs/094_INDIVIDUAL_API_CTX_WRAPPER_SWITCH_CANON.md
- AICM_CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/124_AICM_INDIVIDUAL_API_CTX_WRAPPER_SWITCH_CANON.md
- REPORT_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/000_INDIVIDUAL_API_CTX_WRAPPER_SWITCH_REPORT.md

## Logs
- DB_CTX_WRAPPER_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/010_db_ctx_wrapper_inventory.txt
- API_PATCH_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/020_api_patch_inventory.txt
- NODE_CHECK_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/031_node_check_stderr.txt
- API_LOG: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/040_api_individual_ctx_smoke.log
- API_PARSE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/046_api_parse.txt
- NO_PERSIST_CHECK: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/050_no_persist_check.txt
- RLS_UNCHANGED_CHECK: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/060_rls_unchanged_check.txt

## Safety
- DB schema change: none
- DB persistent write: none
- Existing DB functions preserved
- API additive/route override only
- entitlement/placement RLS: unchanged
- ERP DATABASE_URL: not used

## Next
Prepare entitlement/placement RLS review/apply using app.current_company_id context and ctx-wrapper API path.
