
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- server/context API は owner_civilization_id 正本paramで review_wait_items=2 を返す
- ブラウザ画面は rows=0 / hydrating=YES
- よって原因は browser/core側のV7 hydration完了処理、state merge、またはre-renderの疑い

今回の作業:
1. 最新E5 report/server logを採取
2. ブラウザV7が投げるexact URLをcurlで再現
3. exact URLで review_wait_items=2 が返るか確認
4. coreのV7 hydrate関数周辺を抜き出す
5. hydrating=true後に false / state merge / render があるか判定

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8F browser hydration log isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f_browser_hydration_log_isolate_20260503_102715
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: server exists
PASS: core exists

============================================================
2. syntax / server reachability
============================================================
PASS: server syntax PASS
PASS: core syntax PASS
ROOT_HTTP=200
PASS: AICM server reachable

============================================================
3. latest E5 report / server log
============================================================
LATEST_E5_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e5_restart_server_browser_gate_20260503_102501
---- latest E5 report final lines ----
ROOT_HTTP_AFTER=200
CONTEXT_HTTP=200
ROOT_HTTP_AFTER=200
CONTEXT_HTTP=200
REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8e5_20260503_102501
FINAL_JUDGEMENT=READY_FOR_BROWSER_RELOAD_REVIEW_LIST_CHECK
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e5_restart_server_browser_gate_20260503_102501/010_server.log
PASS: latest E5 report copied
LATEST_SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e5_restart_server_browser_gate_20260503_102501/010_server.log
---- latest server log tail ----
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794

============================================================
4. served core vs disk core
============================================================
SERVED_HTTP=200
DISK_SHA=95f3c3a42facd79574d98de816e8ed69a64e98ed03d15c7a5c56fa641f5d01cf
SERVED_SHA=95f3c3a42facd79574d98de816e8ed69a64e98ed03d15c7a5c56fa641f5d01cf
PASS: served core matches disk core

============================================================
5. exact V7 hydration URL
============================================================
EXACT_V7_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v7_20260503_102715
EXACT_CONTEXT_HTTP=200
PASS: exact V7 context URL returned 200
result=ok
owner_civilization_id=00000000-0000-4000-8000-000000000001
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
contains_req1=true
contains_req2=true
PASS: exact V7 context returns review_wait_items=2

============================================================
6. core V7 hydration snippet
============================================================
file:///data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f_browser_hydration_log_isolate_20260503_102715/extract_core_v7_snips.mjs:1
const fs = require('fs');
           ^

ReferenceError: require is not defined in ES module scope, you can use import instead
    at file:///data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f_browser_hydration_log_isolate_20260503_102715/extract_core_v7_snips.mjs:1:12
    at ModuleJob.run (node:internal/modules/esm/module_job:430:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:661:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.14.1
