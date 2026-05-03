============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DB/view上はレビュー待ち2件あり
- context APIも復旧すればreview_wait_items=2を返す
- 画面だけ0件のまま
- 台帳/課長へ送る/削除はOKなので触らない

今回:
1. core/server syntax確認
2. core backup
3. review-list routeが呼ぶ window.aicmR8zV7RenderReviewList を最後に1本だけ上書き
4. renderer内で state/context に無ければ context API を同期GETして即merge
5. 同一render内でreview_wait_itemsを再計算して2件表示
6. server再起動
7. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 台帳/課長へ送る/削除への変更
- render関数全体置換

注意:
- このパッチ中はDB更新しない
- 画面で承認/差し戻しを押す段階はまだ次工程

============================================================
1. ENV
============================================================
PHASE=R8Z-V10C review-list direct context renderer
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10c_review_list_direct_context_renderer_20260503_192304
DB_WRITE=NO
API_POST=NO
API_GET=YES
CORE_PATCH=YES
SERVER_PATCH=NO
SUCCESS_BROWSER_OPEN=YES

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10c_review_list_direct_context_renderer_20260503_192304/aicm-production-core.before_r8z_v10c.js

============================================================
4. patch review-list renderer only
============================================================
PATCH_APPLIED: inserted before // AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_END

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V10C_MARKER_COUNT=2
HAS_V10C_RENDER_FUNCTION=true
V10C_OVERRIDES_V7_WINDOW_RENDERER=true
V10C_USES_SYNC_XHR=true
V10C_USES_REVIEW_WAIT_ITEMS=true
V10C_HAS_APPROVE_BUTTON=true
V10C_HAS_RETURN_BUTTON=true
V9G8B_DELETE_MARKER_COUNT=3
SERVER_PATCH_EXPECTED=NO

============================================================
7. snippet
============================================================
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10c_review_list_direct_context_renderer_20260503_192304/030_core_v10c_snip.txt

============================================================
8. restart server
============================================================
ROOT_HTTP=200

============================================================
9. served core / context verify
============================================================
SERVED_HTTP=200
DISK_SHA=3558fc52fbd1c15f56b6804e40aad5fe0ee25091b5a9fd4a7067c3eddd0eb2ad
SERVED_SHA=3558fc52fbd1c15f56b6804e40aad5fe0ee25091b5a9fd4a7067c3eddd0eb2ad
SERVED_V10C_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2

============================================================
10. final / browser open
============================================================
FINAL_JUDGEMENT=V10C_REVIEW_LIST_DIRECT_RENDERER_READY_BROWSER_OPENED
V10C_MARKER_COUNT=2
HAS_V10C_RENDER_FUNCTION=true
V10C_OVERRIDES_V7_WINDOW_RENDERER=true
V10C_USES_SYNC_XHR=true
V10C_USES_REVIEW_WAIT_ITEMS=true
V10C_HAS_APPROVE_BUTTON=true
V10C_HAS_RETURN_BUTTON=true
V9G8B_DELETE_MARKER_COUNT=3
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10C_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10c_20260503_192304
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10c_review_list_direct_context_renderer_20260503_192304/000_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10c_review_list_direct_context_renderer_20260503_192304/aicm-production-core.before_r8z_v10c.js
DB_WRITE=NO
API_POST=NO
API_GET=YES
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 期待表示:
   - レビュー・承認待ち: 2件
   - 納品サマリー確認: AI企業業務開始導線の整備 作業
   - 納品サマリー確認: Manager大項目台帳運用の整備 作業
3. 表示されたら、承認/差し戻しはまだ押さず、スクショか結果だけ貼ってください。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10c_review_list_direct_context_renderer_20260503_192304/aicm-production-core.before_r8z_v10c.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
