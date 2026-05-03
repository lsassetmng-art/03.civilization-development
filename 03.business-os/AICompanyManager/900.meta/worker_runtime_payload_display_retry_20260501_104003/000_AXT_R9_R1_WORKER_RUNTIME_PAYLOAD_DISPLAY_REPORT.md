# AICompanyManager Phase AXT-R9-R1 runtime status panel report

## Result
- FINAL_STATUS=RUNTIME_STATUS_PANEL_READY
- PASS_COUNT=29
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write in script: NO
- API POST in script: NO
- server change: YES
- core change: YES
- index change: NO

## Reuse note
This is a reusable Runtime Workbench / Runtime Status Panel pattern.
AIOperationDesk can reuse the same concept later:
- server-side AIWorkerOS GET proxy
- browser receives no token
- runtime request / pipeline / app-read-payload displayed as read-only status
- app-specific routing and labels remain per app

## Added
- GET /api/aicm/v2/worker-runtime/pipeline-board
- GET /api/aicm/v2/worker-runtime/app-read-payload?request_id=...
- AI実行Workbench status panel
- 実行状況を更新 button

## Security
- AIWorkerOS token is kept server-side only.
- Browser uses local app server GET endpoints only.
- No token string was added to clean core.

## HTTP
- AICM_PID=28478
- AIWORKER_BASE=http://127.0.0.1:8787
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200
- PIPELINE_HTTP_CODE=200
- LATEST_REQUEST_ID=1d627b8f-6f41-4bc0-9330-9dc5e4a8d5ef
- APPREAD_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_104003_runtime_payload_display
- TERMUX_OPEN_STATUS=OPENED

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/aicm-local-ui-api-server.before_axt_r9_r1_payload_display.mjs
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/aicm-production-core.before_axt_r9_r1_payload_display.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/050_http_check.txt

## Manual test
1. AI実行Workbenchを開く。
2. 下部に「AIWorkerOS 実行状況」パネルが表示される。
3. 「実行状況を更新」を押す。
4. request_id / model_code / request_status / review / human GO が見える。
5. 既存の実行依頼作成も壊れていないことを確認する。

## Next
- AXU: 部門別タスク台帳 / PMLW行から worker-runtime/request を自動生成
- その後: review gate をレビュー・承認待ち一覧へ接続

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/aicm-local-ui-api-server.before_axt_r9_r1_payload_display.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/aicm-production-core.before_axt_r9_r1_payload_display.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
