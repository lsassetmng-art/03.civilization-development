
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- context API は review_wait_items=2
- V8G/V8H core patch は node --check PASS
- served core with query は前回一致確認済み
- しかしブラウザ画面は R8Z-V7 / rows=0 / hydrating=YES のまま

今回の確認:
1. server/core syntax確認
2. root HTMLがどのscript srcを読んでいるか確認
3. ブラウザが通常読む core URL(no query) に V8G/V8H marker が入っているか確認
4. query付きcoreには V8G/V8H marker が入っているか確認
5. root HTML / server がJSにcache bustを付けているか確認
6. 次が「HTML script cache-bust修正」か「V8H実行位置修正」か判定

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8I browser asset cache isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8i_browser_asset_cache_isolate_20260503_103806
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: core exists
PASS: server exists

============================================================
2. syntax / server reachability
============================================================
PASS: core syntax PASS
PASS: server syntax PASS
ROOT_HTTP=200
PASS: root reachable

============================================================
3. root headers / script src
============================================================
---- root headers ----
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
cache-control: no-store
Date: Sun, 03 May 2026 01:38:07 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

---- script src list ----
./assets/js/aicm-production-core.js?v=r8u_manager_major_summary_20260502_204621
PASS: root HTML references aicm-production-core.js
PASS: core script src has query cache-bust

============================================================
4. disk core marker check
============================================================
DISK_SHA=d076c424338b312491ec24e6dfb572bad21697b15b37e670926f9b4e2fe8989d
DISK_V8G_COUNT=3
DISK_V8H_COUNT=1
PASS: disk core contains V8G/V8H markers

============================================================
5. served core no-query check
============================================================
CORE_NO_QUERY_HTTP=200
NO_QUERY_SHA=d076c424338b312491ec24e6dfb572bad21697b15b37e670926f9b4e2fe8989d
NO_QUERY_V8G_COUNT=3
NO_QUERY_V8H_COUNT=1
---- core no-query headers ----
HTTP/1.1 200 OK
content-type: text/javascript; charset=utf-8
cache-control: no-store
Date: Sun, 03 May 2026 01:38:07 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

PASS: served no-query core matches disk
PASS: served no-query core contains V8G/V8H markers

============================================================
6. served core query check
============================================================
CORE_WITH_QUERY_HTTP=200
WITH_QUERY_SHA=d076c424338b312491ec24e6dfb572bad21697b15b37e670926f9b4e2fe8989d
WITH_QUERY_V8G_COUNT=3
WITH_QUERY_V8H_COUNT=1
---- core with-query headers ----
HTTP/1.1 200 OK
content-type: text/javascript; charset=utf-8
cache-control: no-store
Date: Sun, 03 May 2026 01:38:07 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

PASS: served query core matches disk
PASS: served query core contains V8G/V8H markers

============================================================
7. HTML/server reference scan
============================================================
---- HTML/core script references under app root ----
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html:11:  <script src="./assets/js/aicm-production-core.js?v=r8u_manager_major_summary_20260502_204621"></script>
---- server static/cache/header references ----
28:  res.writeHead(statusCode, {
33:    "cache-control": "no-store"
39:  res.writeHead(statusCode, {
41:    "cache-control": "no-store"
2273:  fs.readFile(filePath, (error, data) => {

============================================================
8. FINAL JUDGEMENT
============================================================
CORE_SCRIPT_HAS_QUERY=YES
NO_QUERY_HAS_MARKERS=YES
WITH_QUERY_HAS_MARKERS=YES
DISK_V8G_COUNT=3
DISK_V8H_COUNT=1
PASS_COUNT=12
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=BROWSER_CORE_SHOULD_BE_LATEST_NEXT_CHECK_V8H_EXECUTION_POSITION
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8i_browser_asset_cache_isolate_20260503_103806/000_R8Z_V8I_BROWSER_ASSET_CACHE_ISOLATE_REPORT.md
SCRIPT_LIST=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8i_browser_asset_cache_isolate_20260503_103806/020_script_src_list.txt
HTML_REF_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8i_browser_asset_cache_isolate_20260503_103806/040_html_ref_scan.txt
SERVER_REF_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8i_browser_asset_cache_isolate_20260503_103806/041_server_static_scan.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- BROWSER_MAY_USE_CACHED_CORE_PREPARE_HTML_SCRIPT_CACHEBUST_FIX:
  HTML側の aicm-production-core.js 参照に固定version queryを付ける最小修正へ進む。

- NO_QUERY_CORE_STALE_PREPARE_ASSET_CACHEBUST_FIX:
  server/static assetのcache-controlまたはscript srcを修正。

- BROWSER_CORE_SHOULD_BE_LATEST_NEXT_CHECK_V8H_EXECUTION_POSITION:
  cacheではない。次はV8H marker実行位置を実際のV7 fetch then内へ移す。

- STOP_CORE_OR_SERVER_NOT_READY:
  先にserver/coreを復旧。
