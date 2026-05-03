# AICompanyManager Phase AXT-R7 runtime code normalize report

## Result
- FINAL_STATUS=WORKBENCH_RUNTIME_CODE_NORMALIZED_READY
- PASS_COUNT=24
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write in script: NO
- API POST in script: NO
- server change: YES
- core change: YES
- index change: NO

## Fixed
- Workbench app_surface_code is normalized to ai_company_manager.
- Server normalizes model_no/model_code to AIWorkerOS canonical model_code via aiworker.vw_app_aiworker_robot_selection_card_v1.
- Example:
  - MG-NORN-001 -> mg_norn_001_urd
  - BYD1-003 -> byd1_003_asic_workers3

## Why no DB registration
Existing Runtime Control Profile already has:
- app_surface_code=ai_company_manager
- model_code=mg_norn_001_urd

The problem was request-code mismatch, not missing canonical profile data.

## HTTP
- AICM_PID=24552
- AIWORKER_BASE=http://127.0.0.1:8787
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_103132_runtime_code_normalize
- TERMUX_OPEN_STATUS=OPENED

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/aicm-local-ui-api-server.before_axt_r7_normalize.mjs
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/aicm-production-core.before_axt_r7_normalize.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/050_http_check.txt

## Manual test
1. AI実行Workbenchを開く。
2. MG-NORN-001 / ウルズを選ぶ。
3. 確認へ進む。
4. 確定して実行。
5. Runtime control profile not found が消えること。

## If still fails
- tail -n 240 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/040_aicm_server.log"
- AIWorkerOS runtime server logも確認する。

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/aicm-local-ui-api-server.before_axt_r7_normalize.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/aicm-production-core.before_axt_r7_normalize.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
