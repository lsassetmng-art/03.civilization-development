
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- R8Z-V8B: DBには既知request_id/titleあり
- R8Z-V8C2: serverはcustom HTTP route形式
- R8Z-V8D: helper挿入位置が危険でsyntax失敗、rollback済み

今回の作業:
1. server/core syntax確認
2. server backup
3. helperをtop-level安全位置へ挿入
4. context route branch内にはinterceptor install 1行だけ挿入
5. server node --check
6. 失敗時rollback
7. server再起動
8. context APIに review_wait_items / 既知request_id/title が出るか確認

禁止:
- DB write
- API POST
- core patch
- window override追加
- render関数置換

佐藤(DB担当):
- DBはREAD ONLY。server context露出のみ。

============================================================
1. ENV
============================================================
PHASE=R8Z-V8E safe custom HTTP context response exposure fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=NO
PASS: server exists
PASS: core exists

============================================================
2. precheck syntax
============================================================
PASS: precheck server syntax PASS
PASS: precheck core syntax PASS

============================================================
3. backup
============================================================
PASS: server backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/aicm-local-ui-api-server.before_r8z_v8e.mjs

============================================================
4. patch server safely
============================================================
PATCH_APPLIED: helper inserted at safe top-level position
PATCH_APPLIED: route install line inserted
HELPER_INSERT_POS=94576
CONTEXT_LITERAL=/api/aicm/v2/context
ROUTE_INSTALL_MODE=after_open_brace
REQ_NAME=req
RES_NAME=res
PASS: safe custom HTTP context route patched

============================================================
5. post-patch syntax and rollback gate
============================================================
PASS: post-patch server syntax PASS
PASS: core unchanged syntax PASS

============================================================
6. restart AICM server
============================================================
PASS: no existing process found on port 8794
GET / => HTTP 200
PASS: AICM server reachable after restart

============================================================
7. context API verify
============================================================
GET http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP_CONTEXT=500
WARN: context API did not return 200
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794
top_keys=result,api_identifier,error_message
review_wait_items_hits=0
review_wait_items_counts=
review_wait_items_max=-1
contains_req1=false
contains_req2=false
contains_nouhin=false
contains_ai_company_start=false
contains_manager_major=false
r8z_v8e_count=
r8z_v8e_source=

============================================================
8. FINAL JUDGEMENT
============================================================
REVIEW_WAIT_MAX=-1
CONTAINS_KNOWN=NO
PASS_COUNT=10
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=SERVER_PATCH_APPLIED_BUT_CONTEXT_API_NOT_200
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/000_R8Z_V8E_SAFE_CUSTOM_HTTP_CONTEXT_RESPONSE_EXPOSURE_FIX_REPORT.md
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/aicm-local-ui-api-server.before_r8z_v8e.mjs
PATCH_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/010_patch.log
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/030_server.log
CONTEXT_JSON=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/040_context_after_patch.json
CONTEXT_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/041_context_after_patch_parse.txt
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=NO

NEXT:
- CONTEXT_EXPOSES_TARGET_AFTER_V8E_READY_FOR_BROWSER_CHECK:
  ブラウザを再読み込みして「レビュー・承認待ち一覧」を開く。
  2件表示されれば R8Z-V8E 完了。

- まだ画面 rows=0 の場合:
  server contextは出たので、次は core の review-list 遷移前 hydrate/merge だけを最小修正。

- V8E_PATCH_ACTIVE_BUT_REVIEW_WAIT_ITEMS_STILL_EMPTY:
  interceptorは動いているがDB loader filterが合っていない。
  次はsource relation/detailを1点確認してfilterのみ緩和。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/aicm-local-ui-api-server.before_r8z_v8e.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
