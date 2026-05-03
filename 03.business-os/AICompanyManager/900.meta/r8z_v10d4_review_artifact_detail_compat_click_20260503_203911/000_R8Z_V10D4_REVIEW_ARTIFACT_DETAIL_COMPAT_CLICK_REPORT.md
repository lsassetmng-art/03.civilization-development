============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち2件表示 OK
- V10C/V10D/V10D2 static/served OK
- 成果物を確認ボタンはある
- ただし詳細カードが表示されない
- V10D3判定: STATIC_OK_NEED_VISIBLE_RUNTIME_DEBUG_OR_COMPAT_ACTION_PATCH

今回:
1. core/server syntax確認
2. core backup
3. review-list専用の互換クリックbridgeを追加
4. review-v10d-open-detail / review-v10d2-open-detail の両方を拾う
5. click / pointerup / touchend のどれでも拾う
6. 押下後に state へ selectedReviewId を入れて render
7. 画面上に V10D4 clicked/action/id を表示
8. 詳細カードを押した行の直下へ表示
9. server再起動
10. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 台帳/課長へ送る/削除への変更
- 承認/差し戻しDB更新

保守性方針:
- 既存V10D2 renderer本体は壊さず、review-list専用の薄い互換層だけ追加
- 既存OKの削除/課長へ送る系actionには触れない

============================================================
1. ENV
============================================================
PHASE=R8Z-V10D4 review artifact detail compat click bridge
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d4_review_artifact_detail_compat_click_20260503_203911
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d4_review_artifact_detail_compat_click_20260503_203911/aicm-production-core.before_r8z_v10d4.js

============================================================
4. patch V10D4 compat bridge
============================================================
PATCH_APPLIED: V10D4 compat click bridge inserted after V10D2

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V10D4_MARKER_COUNT=2
V10D4_HAS_COMPAT_BRIDGE=true
V10D4_HANDLES_V10D_ACTION=true
V10D4_HANDLES_V10D2_ACTION=true
V10D4_HAS_POINTERUP=true
V10D4_HAS_TOUCHEND=true
V10D4_HAS_VISIBLE_DEBUG=true
V10D4_HAS_INSERT_DETAIL_AFTER_BUTTON=true
V10D4_HAS_STOP_IMMEDIATE=true
V10D4_HAS_NO_API_POST=true
V10D2_MARKER_COUNT=2
V10D_MARKER_COUNT=2
V10C_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3

============================================================
7. restart server
============================================================

============================================================
8. served core / context verify
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=274828a6dd8071bda12ca96bfafc60f35579f7abc5b0a6d75bd904ad8ba83470
SERVED_SHA=274828a6dd8071bda12ca96bfafc60f35579f7abc5b0a6d75bd904ad8ba83470
SERVED_V10D4_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2

============================================================
9. final / browser open
============================================================
FINAL_JUDGEMENT=V10D4_COMPAT_CLICK_BRIDGE_READY_BROWSER_OPENED
V10D4_MARKER_COUNT=2
V10D4_HAS_COMPAT_BRIDGE=true
V10D4_HANDLES_V10D_ACTION=true
V10D4_HANDLES_V10D2_ACTION=true
V10D4_HAS_POINTERUP=true
V10D4_HAS_TOUCHEND=true
V10D4_HAS_VISIBLE_DEBUG=true
V10D4_HAS_INSERT_DETAIL_AFTER_BUTTON=true
V10D4_HAS_STOP_IMMEDIATE=true
V10D4_HAS_NO_API_POST=true
V10D2_MARKER_COUNT=2
V10D_MARKER_COUNT=2
V10C_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10D4_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10d4_20260503_203911
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d4_review_artifact_detail_compat_click_20260503_203911/000_R8Z_V10D4_REVIEW_ARTIFACT_DETAIL_COMPAT_CLICK_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d4_review_artifact_detail_compat_click_20260503_203911/aicm-production-core.before_r8z_v10d4.js
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
   - 画面上に「V10D4 click debug」が出る
   - 押した行の直下に「成果物確認 / V10D4」が出る
4. 出ない場合:
   - V10D4 click debug が出たかどうかだけ教えてください
   - debugが出て inserted=false ならDOM挿入先問題
   - debug自体が出ないならクリックイベント未到達問題

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d4_review_artifact_detail_compat_click_20260503_203911/aicm-production-core.before_r8z_v10d4.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
