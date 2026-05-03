
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DB/context本体は正しい owner_civilization_id で review_wait_items=2 を返す確認済み
- 直前は AICM server が停止していて curl 接続失敗
- 今回はserverを起動し直して、ブラウザ確認へ進める状態に戻す

今回の作業:
1. server/core syntax確認
2. 8794 root到達確認
3. 未起動ならserver起動
4. 正しい owner_civilization_id でcontext API確認
5. review_wait_items=2ならブラウザ確認URLを出す

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8E5 restart server and browser check gate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e5_restart_server_browser_gate_20260503_102501
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: server exists
PASS: core exists

============================================================
2. syntax check
============================================================
PASS: server syntax PASS
PASS: core syntax PASS

============================================================
3. server reachability / start if needed
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
ROOT_HTTP_BEFORE=000
WARN: AICM server not reachable; starting server
ROOT_HTTP_AFTER=200
PASS: AICM server reachable

============================================================
4. correct context API verify
============================================================
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&v=r8z_v8e5_20260503_102501
CONTEXT_HTTP=200
PASS: context API 200 with owner_civilization_id
result=ok
owner_civilization_id=00000000-0000-4000-8000-000000000001
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
contains_req1=true
contains_req2=true
PASS: context exposes review_wait_items=2

============================================================
5. FINAL JUDGEMENT
============================================================
ROOT_HTTP_BEFORE=000
ROOT_HTTP_AFTER=200
CONTEXT_HTTP=200
REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8e5_20260503_102501
PASS_COUNT=7
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=READY_FOR_BROWSER_RELOAD_REVIEW_LIST_CHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e5_restart_server_browser_gate_20260503_102501/000_R8Z_V8E5_RESTART_SERVER_BROWSER_GATE_REPORT.md
CONTEXT_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e5_restart_server_browser_gate_20260503_102501/021_context_correct_owner_parse.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e5_restart_server_browser_gate_20260503_102501/010_server.log
DB_WRITE=NO
API_POST=NO
PATCH=NO

BROWSER_CHECK:
1. ブラウザで以下を開く:
   http://127.0.0.1:8794/?v=r8z_v8e5_20260503_102501

2. AI企業で「ウルフ」を選択:
   company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa

3. 「レビュー・承認待ち一覧」を開く

期待表示:
- レビュー・承認待ち: 2件
- 納品サマリー確認: AI企業業務開始導線の整備 作業
- 納品サマリー確認: Manager大項目台帳運用の整備 作業
- 承認ボタン
- 差し戻しボタン

分岐:
- 2件表示されたら、次は承認/差し戻し rollback smoke。
- まだ rows=0 / hydrating=YES なら、server/contextは正常なので core のV7 hydrate完了後re-renderだけ確認。
