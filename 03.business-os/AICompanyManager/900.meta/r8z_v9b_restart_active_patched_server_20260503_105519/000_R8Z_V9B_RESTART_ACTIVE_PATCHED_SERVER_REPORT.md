
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V9 patchはdisk上では入っている
- context通常APIは review_wait_items=2
- ただし context-script が 404
- 画面が開かない原因は V9成功条件未達
- 推定原因:
  古い8794 server processが残っていて、patched serverではなく旧serverが応答している

今回の作業:
1. core/server syntax確認
2. disk server/coreにV9 markerがあるか確認
3. 現在8794で動くprocessを記録
4. 8794/processを強制停止
5. patched serverを起動
6. context API 200 / review_wait_items=2確認
7. context-script API 200確認
8. served core一致確認
9. 成功したらブラウザ画面を自動起動

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V9B restart active patched server and open
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9b_restart_active_patched_server_20260503_105519
DB_WRITE=NO
API_POST=NO
PATCH=NO
SUCCESS_BROWSER_OPEN=YES
PASS: core exists
PASS: server exists

============================================================
2. syntax and marker check
============================================================
PASS: core syntax PASS
PASS: server syntax PASS
CORE_V9_MARKER_COUNT=2
SERVER_V9_MARKER_COUNT=2
PASS: core V9 marker exists
PASS: server V9 marker exists

============================================================
3. capture old port state
============================================================
---- ps node/server before ----
u0_a402   4634     1  0  1970 pts/24   00:00:00 node /data/data/com.termux/files/usr/bin/node /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs

---- ss before ----

---- lsof before ----

============================================================
4. stop old server robustly
============================================================
PASS: no lsof pid on port
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
ROOT_AFTER_KILL=000
PASS: old server stopped

============================================================
5. start patched server
============================================================
SERVER_PID=7213
ROOT_HTTP=200
PASS: patched server reachable
---- ps node/server after ----
u0_a402   7213     1 18  1970 pts/24   00:00:00 node /data/data/com.termux/files/usr/bin/node /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs

---- ss after ----

---- lsof after ----

---- server log head/tail ----
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794

============================================================
6. context API verify
============================================================
CONTEXT_HTTP=200
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v9b_20260503_105519
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
PASS: context review_wait_items=2

============================================================
7. context-script verify
============================================================
CONTEXT_SCRIPT_HTTP=200
CONTEXT_SCRIPT_URL=http://127.0.0.1:8794/api/aicm/v2/context-script?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&callback=__aicmR8zV9ReviewContextCallback&v=r8z_v9b_20260503_105519
---- context-script head ----
/* AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE */
try {
__aicmR8zV9ReviewContextCallback({"result":"ok","sections":[{"purpose":"","created_at":"2026-04-30T02:26:42.671938+00:00","updated_at":"2026-04-30T02:26:42.671938+00:00","section_name":"課","display_order":100,"metadata_jsonb":{},"section_status":"active","parent_section_id":null,"aicm_user_company_id":"5bb29236-1f03-44c3-8e57-f1301cadfdec","leader_robot_pool_id":null,"owner_civilization_id":"00000000-0000-4000-8000-000000000001","leader_internal_nickname":"","leader_aiworker_model_code":"","aicm_user_company_section_id":"793243ed-3915-44db-ad77-3415be330498","aicm_user_company_department_id":"f8331d5d-aa4d-4524-b946-b3128c6abbdd"},{"purpose":"ウワオーン？","created_at":"2026-04-30T10:57:52.711213+00:00","updated_at":"2026-04-30T21:56:48.261126+00:00","section_name":"遠吠え課？","display_order":100,"metadata_jsonb":{},"section_status":"active","parent_section_id":null,"aicm_user_company_id":"8b9be487-7b74-4517-9b59-6c84a82ae6aa","leader_robot_pool_id":null,"owner_civilization_id":"00000000-0000-4000-8000-000000000001","leader_internal_nickname":"","leader_aiworker_model_code":"","aicm_user_company_section_id":"22e61c25-2778-4
PASS: context-script returns callback JS with review_wait_items

============================================================
8. served core verify
============================================================
SERVED_HTTP=200
DISK_SHA=dfeb18ed91a9ef9229ff241be33ea949b1d003abe193e1a35237b395042dac1d
SERVED_SHA=dfeb18ed91a9ef9229ff241be33ea949b1d003abe193e1a35237b395042dac1d
SERVED_CORE_V9_MARKER_COUNT=2
PASS: served core matches disk
PASS: served core contains V9 marker

============================================================
9. final and browser open
============================================================
REVIEW_COUNT=2
CONTEXT_SCRIPT_HTTP=200
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9b_20260503_105519
PASS_COUNT=13
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=V9B_ACTIVE_PATCHED_SERVER_READY_BROWSER_OPENED
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9b_restart_active_patched_server_20260503_105519/000_R8Z_V9B_RESTART_ACTIVE_PATCHED_SERVER_REPORT.md
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9b_restart_active_patched_server_20260503_105519/010_server.log
PORT_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9b_restart_active_patched_server_20260503_105519/060_port_before.txt
PORT_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9b_restart_active_patched_server_20260503_105519/061_port_after.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO
SUCCESS_BROWSER_OPEN=YES
BROWSER_OPEN=termux-open-url

BROWSER_CHECK:
期待:
- v8k=v9-script-start から v9-script-merged へ変わる
- payload=2 / merged=2 / stRows=2 / ctxRows=2
- レビュー・承認待ち: 2件

まだ開かない場合:
- BROWSER_URLを手動で開く:
  http://127.0.0.1:8794/?v=r8z_v9b_20260503_105519

まだcontext-script 404の場合:
- active serverがまだ旧server。
- PORT_BEFORE / PORT_AFTER / SERVER_LOG を確認。
