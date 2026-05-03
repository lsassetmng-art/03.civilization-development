
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- R8Z-V8E は server syntax PASS
- しかし context API が非200
- つまり構文ではなく、context route実行時のruntime error / response interceptor不整合

今回の作業:
1. 最新R8Z-V8Eのreport/backup/server logを特定
2. 現在の壊れた可能性があるserverを証跡コピー
3. context APIの非200 body/headerとserver logを採取
4. V8E前backupへrollback
5. server/core syntax確認
6. AICM server再起動
7. context APIが200へ戻るか確認
8. 次のV8Fでは、interceptor方式ではなく「context payload生成箇所へ1点merge」方式へ切替判断

禁止:
- DB write
- API POST
- core patch
- 新規server patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8E2 runtime error isolate and safe rollback
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932
DB_WRITE=NO
API_POST=NO
SERVER_ROLLBACK=YES
CORE_PATCH=NO
PASS: server exists
PASS: core exists

============================================================
2. locate latest V8E report and backup
============================================================
PASS: latest V8E dir found: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527
PASS: latest V8E report found
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/aicm-local-ui-api-server.before_r8z_v8e.mjs
V8E_SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/030_server.log
PASS: backup server exists

============================================================
3. capture current broken server and logs
============================================================
PASS: current server copied for evidence: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/020_server.broken_v8e_runtime.mjs
---- V8E marker lines ----
2165:if (route === "/api/aicm/v2/context" && req.method === "GET") {  // AICM_R8Z_V8E_SAFE_CUSTOM_HTTP_CONTEXT_REVIEW_WAIT_ITEMS_EXPOSURE: install\n  aicmR8zV8eInstallContextResponseInterceptor(req, res);\n
2286:// AICM_R8Z_V8E_SAFE_CUSTOM_HTTP_CONTEXT_REVIEW_WAIT_ITEMS_EXPOSURE: helper begin
2582:  payload.r8z_v8e_review_wait_items_count = list.length;
2583:  payload.r8z_v8e_review_wait_items_source = 'safe_custom_http_context_response_interceptor';
2601:function aicmR8zV8eInstallContextResponseInterceptor(req, res) {
2666:// AICM_R8Z_V8E_SAFE_CUSTOM_HTTP_CONTEXT_REVIEW_WAIT_ITEMS_EXPOSURE: helper end

---- nearby context route lines ----
2145-      const body = await readBody(req);
2146-      sendJson(res, 200, updateDepartment(body));
2147-      return true;
2148-    }
2149-
2150-    // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
2151-    // UI label "組織変更" is connected to the current section/k課 update responsibility.
2152-    // Keep this as an explicit compatibility route so future split can be handled here.
2153-    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
2154-      const body = await readBody(req);
2155-      sendJson(res, 200, updateSection(body));
2156-      return true;
2157-    }
2158-
2159-    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
2160-      const body = await readBody(req);
2161-      sendJson(res, 200, updateSection(body));
2162-      return true;
2163-    }
2164-
2165:if (route === "/api/aicm/v2/context" && req.method === "GET") {  // AICM_R8Z_V8E_SAFE_CUSTOM_HTTP_CONTEXT_REVIEW_WAIT_ITEMS_EXPOSURE: install\n  aicmR8zV8eInstallContextResponseInterceptor(req, res);\n
2166-      sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
2167-      return true;
2168-    }
2169-
2170-    if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
2171-      sendJson(res, 200, createCompany(await readBody(req)));
2172-      return true;
2173-    }
2174-
2175-    if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
2176-      const payload = createDepartment(await readBody(req));
2177-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2178-      return true;
2179-    }
2180-
2181-    if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
2182-      const payload = createSection(await readBody(req));
2183-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2184-      return true;
2185-    }
---- tail latest V8E server log ----
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794

============================================================
4. before-rollback HTTP evidence
============================================================
ROOT_HTTP_BEFORE=200
CONTEXT_HTTP_BEFORE=500
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa
---- context headers before rollback ----
HTTP/1.1 500 Internal Server Error
content-type: application/json; charset=utf-8
access-control-allow-origin: *
access-control-allow-methods: GET,POST,OPTIONS
access-control-allow-headers: content-type
cache-control: no-store
Date: Sat, 02 May 2026 22:59:32 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

---- context body before rollback head ----
{
  "result": "error",
  "api_identifier": "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1",
  "error_message": "owner_civilization_id must be UUID"
}
PASS: captured non-200 context API before rollback

============================================================
5. rollback V8E server
============================================================
PASS: server restored from V8E backup

============================================================
6. syntax after rollback
============================================================
PASS: server syntax PASS after rollback
PASS: core syntax PASS

============================================================
7. restart AICM server after rollback
============================================================
PASS: no existing process found on port 8794

============================================================
8. after-rollback HTTP verify
============================================================
ROOT_HTTP_AFTER=200
CONTEXT_HTTP_AFTER=500
---- context headers after rollback ----
HTTP/1.1 500 Internal Server Error
content-type: application/json; charset=utf-8
access-control-allow-origin: *
access-control-allow-methods: GET,POST,OPTIONS
access-control-allow-headers: content-type
cache-control: no-store
Date: Sat, 02 May 2026 22:59:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

---- context body after rollback head ----
{
  "result": "error",
  "api_identifier": "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1",
  "error_message": "owner_civilization_id must be UUID"
}
PASS: root reachable after rollback
WARN: context API still not 200 after rollback; inspect /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/060_server_after_rollback.log
node:events:486
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use 127.0.0.1:8794
    at Server.setupListenHandle [as _listen2] (node:net:1948:16)
    at listenInCluster (node:net:2005:12)
    at node:net:2214:7
    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1984:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
  code: 'EADDRINUSE',
  errno: -98,
  syscall: 'listen',
  address: '127.0.0.1',
  port: 8794
}

Node.js v24.14.1

============================================================
9. final judgement
============================================================
ROOT_HTTP_BEFORE=200
CONTEXT_HTTP_BEFORE=500
ROOT_HTTP_AFTER=200
CONTEXT_HTTP_AFTER=500
PASS_COUNT=12
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=V8E_ROLLED_BACK_BUT_CONTEXT_API_STILL_NOT_200_CHECK_SERVER_LOG
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/000_R8Z_V8E2_RUNTIME_ERROR_ISOLATE_AND_SAFE_ROLLBACK_REPORT.md
LATEST_V8E_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/000_R8Z_V8E_SAFE_CUSTOM_HTTP_CONTEXT_RESPONSE_EXPOSURE_FIX_REPORT.md
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/aicm-local-ui-api-server.before_r8z_v8e.mjs
BROKEN_SERVER_COPY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/020_server.broken_v8e_runtime.mjs
PATCH_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/021_v8e_patch_snippet.txt
SERVER_LOG_SNAPSHOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/022_v8e_server_log_snapshot.txt
RESTART_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/060_server_after_rollback.log
DB_WRITE=NO
API_POST=NO
SERVER_ROLLBACK=YES
CORE_PATCH=NO

NEXT:
- V8E_ROLLED_BACK_CONTEXT_API_RESTORED_PREPARE_V8F_PAYLOAD_MERGE_PATCH:
  次は interceptor方式をやめる。
  custom HTTP routeのpayload変数/JSON.stringify直前を特定し、そこへ review_wait_items merge を1点追加する。
  res.end monkey patch は使わない。

- V8E_ROLLED_BACK_BUT_CONTEXT_API_STILL_NOT_200_CHECK_SERVER_LOG:
  V8E以外のserver状態異常。/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/060_server_after_rollback.log を確認する。
