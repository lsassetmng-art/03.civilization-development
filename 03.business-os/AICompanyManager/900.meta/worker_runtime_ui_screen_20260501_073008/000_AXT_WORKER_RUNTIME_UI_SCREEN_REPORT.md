# AICompanyManager Phase AXT worker runtime UI screen report

## Result
- FINAL_STATUS=WORKER_RUNTIME_UI_SCREEN_FAILED_REVIEW_REQUIRED
- PASS_COUNT=18
- WARN_COUNT=1
- FAIL_COUNT=1

## Scope
- DB write in script: NO
- API POST in script: NO
- server change: NO
- core change: YES
- index change: NO

## Added UI
- screen: worker-runtime-request
- input: Worker, task_domain_code, task_title, task_instruction_ja, source_request_ref
- confirmation screen: YES
- execute action: POST local /api/aicm/v2/worker-runtime/request only after confirmation

## Security
- PERSONA_AIWORKEROS_AUTH_TOKEN is not in clean core
- UI only posts to AICompanyManager local endpoint

## Metrics
- MARKER_COUNT=1
- SCREEN_BRANCH_COUNT=1
- RENDER_FUNCTION_COUNT=1
- CONFIRM_FUNCTION_COUNT=1
- EXECUTE_FUNCTION_COUNT=1
- ENDPOINT_REF_COUNT=1
- NAV_BUTTON_COUNT=0
- TOKEN_LEAK_COUNT=0

## HTTP
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_073008_worker_runtime_ui
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/aicm-production-core.before_axt_worker_runtime_ui.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/030_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/050_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/040_server.log

## Manual test
1. UIを開く。
2. Worker実行依頼へ移動。
3. 配置済みWorkerが候補に出ること。
4. 作業タイトルと作業指示を入力。
5. 確認へ進む。
6. 確認画面に内容が出ること。
7. 確定して実行はAIWorkerOSへPOSTするため、env確認後に押す。

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/aicm-production-core.before_axt_worker_runtime_ui.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
