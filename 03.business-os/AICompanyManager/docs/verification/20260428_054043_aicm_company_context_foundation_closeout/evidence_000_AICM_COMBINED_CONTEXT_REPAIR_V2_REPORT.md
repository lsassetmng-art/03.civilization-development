# AICM Combined Context Repair V2 Report

## Result
- RESULT: PASS
- PASS_COUNT: 8
- WARN_COUNT: 0
- FAIL_COUNT: 0

## Fixed
- Rebuilt combinedRollbackSmoke(body, auth) without patch-script backtick nesting.
- Combined rollback-smoke now sets app.current_company_id.
- Combined rollback-smoke now returns:
  - combined_api_context_company_id
  - combined_api_context_api_client_id
  - combined_api_context_matched
- Combined route now calls combinedRollbackSmoke(body, auth).

## Verified
- health valid token
- company-context rollback-smoke
- combined rollback-smoke with company context
- invalid token denial
- no entitlement rows persisted
- no placement rows persisted
- audit dry-run no-persist

## Files
- API_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/docs/091_COMBINED_CONTEXT_REPAIR_CANON.md
- AICM_CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/121_AICM_COMBINED_CONTEXT_REPAIR_CANON.md
- REPORT_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/000_AICM_COMBINED_CONTEXT_REPAIR_V2_REPORT.md

## Logs
- PREVIOUS_DIRS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/000_previous_dirs.txt
- PATCH_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/010_patch_inventory.txt
- NODE_CHECK_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/021_node_check_stderr.txt
- API_LOG: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/030_api_smoke.log
- API_CONTEXT_VALID: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/032_api_context_valid.json
- API_COMBINED_VALID: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/033_api_combined_valid.json
- API_PARSE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/035_api_parse.txt
- NO_PERSIST_CHECK: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/040_no_persist_check.txt

## Safety
- DB schema change: none
- DB persistent write: none
- API/UI change: API additive/repair only
- entitlement/placement RLS: unchanged
- ERP DATABASE_URL: not used

## Next
- Re-run company context foundation closeout.
- Then patch grant/place/update/deactivate functions to enforce company context.
