# AICompanyManager Phase AXT-R9-R2 runtime status panel filter report

## Result
- FINAL_STATUS=RUNTIME_STATUS_PANEL_FILTER_READY
- PASS_COUNT=26
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- core change: YES
- index change: NO

## What changed

Runtime Status Panel now filters display rows.

Include:
- app_surface_code=ai_company_manager
- source_app_ref=AICompanyManager

Exclude:
- smoke
- persistent smoke
- runtime execution http api fix

## Reuse target

This is a local implementation of a reusable Runtime Status Panel pattern.

Future AIOperationDesk reuse should keep:
- server-side AIWorkerOS token proxy
- app-specific filter rule
- read-only status panel
- no direct browser token

## HTTP
- AICM_PID=30011
- AIWORKER_BASE=http://127.0.0.1:8787
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200
- PIPELINE_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_104437_runtime_status_filter
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_status_panel_filter_20260501_104437/aicm-production-core.before_axt_r9_r2_filter.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_status_panel_filter_20260501_104437/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_status_panel_filter_20260501_104437/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_status_panel_filter_20260501_104437/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_status_panel_filter_20260501_104437/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_status_panel_filter_20260501_104437/050_http_check.txt
- REUSE_DOC=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/worker-runtime/050_RUNTIME_STATUS_PANEL_REUSE_NOTE.md

## Manual test

1. AI実行Workbenchを開く。
2. 実行状況を更新。
3. 過去実績などAICompanyManager由来のrequestが表示される。
4. Runtime Execution HTTP API Fix Smoke V1 / Persistent Smoke V1 が通常表示から消える。
5. 新規AI実行Workbench作成後も最新requestが表示される。

## Next

AXU:
- 部門別タスク台帳 / PMLW行から worker-runtime/request 自動生成
- そのrequestを同じRuntime Status Panelで追跡

## Rollback

cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_status_panel_filter_20260501_104437/aicm-production-core.before_axt_r9_r2_filter.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
