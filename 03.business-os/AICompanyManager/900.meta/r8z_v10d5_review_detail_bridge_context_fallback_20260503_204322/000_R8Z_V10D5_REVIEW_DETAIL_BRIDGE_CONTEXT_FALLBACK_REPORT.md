============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち2件表示 OK
- 成果物を確認 click debug 表示 OK
- click debug: clicked but row not found / rows=0
- つまりクリックは届いているが、V10D4 bridge側がレビュー行配列を見失っている

今回:
1. core/server syntax確認
2. core backup
3. V10D4 bridge内の rowsFromState に context API fallback を追加
4. bridge側でも review_wait_items=2 をGETして押下IDの行を探す
5. 押した行の直下へ成果物詳細カードを挿入
6. server再起動
7. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 台帳/課長へ送る/削除への変更
- 承認/差し戻しDB更新

保守性:
- 既存OKのrenderer本体は触らない
- V10D4 bridgeの行取得だけを補強する

============================================================
1. ENV
============================================================
PHASE=R8Z-V10D5 review detail bridge context fallback
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d5_review_detail_bridge_context_fallback_20260503_204322
DB_WRITE=NO
API_POST=NO
API_GET=YES
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d5_review_detail_bridge_context_fallback_20260503_204322/aicm-production-core.before_r8z_v10d5.js

============================================================
4. patch V10D4 rowsFromState context fallback
============================================================
PATCH_APPLIED: V10D5 replaced V10D4 rowsFromState with context fallback

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V10D5_MARKER_COUNT=2
V10D5_HAS_FETCH_ROWS=true
V10D5_HAS_SYNC_XHR=true
V10D5_USES_CONTEXT_ENDPOINT=true
V10D5_USES_WINDOW_CACHE=true
V10D5_SETS_STATE_REVIEW_ITEMS=true
V10D4_MARKER_COUNT=2
V10D2_MARKER_COUNT=2
V10D_MARKER_COUNT=2
V10C_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
V10D5_HAS_NO_API_POST=true

============================================================
7. restart server
============================================================

============================================================
8. served core / context verify
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=360a2b65678d64ae83f32f4572bac94adebefb2722205ff61b0d15dcf7859026
SERVED_SHA=360a2b65678d64ae83f32f4572bac94adebefb2722205ff61b0d15dcf7859026
SERVED_V10D5_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2

============================================================
9. final / browser open
============================================================
FINAL_JUDGEMENT=V10D5_CONTEXT_FALLBACK_READY_BROWSER_OPENED
V10D5_MARKER_COUNT=2
V10D5_HAS_FETCH_ROWS=true
V10D5_HAS_SYNC_XHR=true
V10D5_USES_CONTEXT_ENDPOINT=true
V10D5_USES_WINDOW_CACHE=true
V10D5_SETS_STATE_REVIEW_ITEMS=true
V10D4_MARKER_COUNT=2
V10D2_MARKER_COUNT=2
V10D_MARKER_COUNT=2
V10C_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
V10D5_HAS_NO_API_POST=true
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10D5_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10d5_20260503_204322
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d5_review_detail_bridge_context_fallback_20260503_204322/000_R8Z_V10D5_REVIEW_DETAIL_BRIDGE_CONTEXT_FALLBACK_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d5_review_detail_bridge_context_fallback_20260503_204322/aicm-production-core.before_r8z_v10d5.js
DB_WRITE=NO
API_POST=NO
API_GET=YES
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 「成果物を確認」を押す
3. 期待:
   - V10D4 click debug が inserted=true になる
   - 押した行の直下に「成果物確認 / V10D4」が出る
4. まだ出ない場合:
   - V10D4 click debug の文面をそのまま貼ってください

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d5_review_detail_bridge_context_fallback_20260503_204322/aicm-production-core.before_r8z_v10d5.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
