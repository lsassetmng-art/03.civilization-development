============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち2件表示 OK
- 「成果物を確認」ボタン表示 OK
- ただし詳細カードが押した位置に見えない
- 原因候補: 詳細カードが一覧上部に出るためスマホ画面では見えない/クリック後スクロール位置が変わらない

今回:
1. core/server syntax確認
2. core backup
3. V10D rendererだけを追加上書き
4. 成果物詳細カードを選択行の直下にインライン表示
5. ボタン押下後に該当カードへscrollIntoView
6. 承認/差し戻しはプレビューのみ。DB更新しない
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 台帳/課長へ送る/削除への変更

============================================================
1. ENV
============================================================
PHASE=R8Z-V10D2 inline artifact detail under selected review row
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d2_inline_artifact_detail_20260503_203311
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d2_inline_artifact_detail_20260503_203311/aicm-production-core.before_r8z_v10d2.js

============================================================
4. patch V10D2 inline detail override
============================================================
PATCH_APPLIED: V10D2 inserted after V10D renderer

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V10D2_MARKER_COUNT=2
HAS_V10D2_RENDER_FUNCTION=true
V10D2_OVERRIDES_V7_WINDOW_RENDERER=true
V10D2_HAS_OPEN_BUTTON=true
V10D2_HAS_INLINE_DETAIL_ID=true
V10D2_HAS_SCROLL_INTO_VIEW=true
V10D2_HAS_PREVIEW_APPROVE=true
V10D2_HAS_PREVIEW_RETURN=true
V10D2_HAS_CLICK_BRIDGE=true
V10D2_HAS_NO_API_POST=true
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
DISK_SHA=acd4f6a782dfaabe77c50ca8c07d91d0018363b666e2fd3a9431a1c005be134b
SERVED_SHA=acd4f6a782dfaabe77c50ca8c07d91d0018363b666e2fd3a9431a1c005be134b
SERVED_V10D2_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2

============================================================
9. final / browser open
============================================================
FINAL_JUDGEMENT=V10D2_INLINE_ARTIFACT_DETAIL_READY_BROWSER_OPENED
V10D2_MARKER_COUNT=2
HAS_V10D2_RENDER_FUNCTION=true
V10D2_OVERRIDES_V7_WINDOW_RENDERER=true
V10D2_HAS_OPEN_BUTTON=true
V10D2_HAS_INLINE_DETAIL_ID=true
V10D2_HAS_SCROLL_INTO_VIEW=true
V10D2_HAS_PREVIEW_APPROVE=true
V10D2_HAS_PREVIEW_RETURN=true
V10D2_HAS_CLICK_BRIDGE=true
V10D2_HAS_NO_API_POST=true
V10D_MARKER_COUNT=2
V10C_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10D2_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10d2_20260503_203311
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d2_inline_artifact_detail_20260503_203311/000_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d2_inline_artifact_detail_20260503_203311/aicm-production-core.before_r8z_v10d2.js
DB_WRITE=NO
API_POST=NO
API_GET=YES
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 「成果物を確認」を押す
3. 押したレビュー項目の直下に「成果物確認 / 選択中」が出ること
4. 自動で詳細カードへスクロールすること
5. 承認確認/差し戻し確認はまだプレビューのみ。DB更新なし。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d2_inline_artifact_detail_20260503_203311/aicm-production-core.before_r8z_v10d2.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
