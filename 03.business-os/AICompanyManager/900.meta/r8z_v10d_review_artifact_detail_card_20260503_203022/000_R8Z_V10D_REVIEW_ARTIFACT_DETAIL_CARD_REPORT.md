============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 台帳表示 OK
- 課長へ送る確認カード OK
- 課長へ送る確定 OK
- 削除確認カード OK
- 削除確定 OK
- レビュー・承認待ち一覧 2件表示 OK
- git checkpoint OK: cc5acef

今回:
1. core/server syntax確認
2. core backup
3. review-list rendererだけに成果物確認カードを追加
4. 各レビュー項目に「成果物を確認」ボタンを追加
5. 成果物確認カードで納品サマリー/変更点/AIレビュー/未解決事項/artifact_link/metadataを表示
6. 承認/差し戻しはまだDB更新しない
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 台帳/課長へ送る/削除への変更
- render関数全体置換

次工程:
- V10E 承認/差し戻し rollback smoke

============================================================
1. ENV
============================================================
PHASE=R8Z-V10D review artifact detail card
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d_review_artifact_detail_card_20260503_203022
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d_review_artifact_detail_card_20260503_203022/aicm-production-core.before_r8z_v10d.js

============================================================
4. patch review artifact detail card only
============================================================
PATCH_APPLIED: V10D inserted after V10C renderer

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V10D_MARKER_COUNT=2
HAS_V10D_RENDER_FUNCTION=true
V10D_OVERRIDES_V7_WINDOW_RENDERER=true
V10D_HAS_DETAIL_BUTTON=true
V10D_HAS_DETAIL_CARD=true
V10D_HAS_PREVIEW_APPROVE=true
V10D_HAS_PREVIEW_RETURN=true
V10D_HAS_CLICK_BRIDGE=true
V10D_HAS_NO_API_POST=true
V10C_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
SERVER_PATCH_EXPECTED=NO

============================================================
7. snippet
============================================================
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d_review_artifact_detail_card_20260503_203022/030_core_v10d_snip.txt

============================================================
8. restart server
============================================================
ROOT_HTTP=200

============================================================
9. served core / context verify
============================================================
SERVED_HTTP=200
DISK_SHA=988a6dac564d47ab1b8d7510d0e935c5bb2a09d2a41553d11f6aebb90ede4b19
SERVED_SHA=988a6dac564d47ab1b8d7510d0e935c5bb2a09d2a41553d11f6aebb90ede4b19
SERVED_V10D_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2

============================================================
10. final / browser open
============================================================
FINAL_JUDGEMENT=V10D_REVIEW_ARTIFACT_DETAIL_READY_BROWSER_OPENED
V10D_MARKER_COUNT=2
HAS_V10D_RENDER_FUNCTION=true
V10D_OVERRIDES_V7_WINDOW_RENDERER=true
V10D_HAS_DETAIL_BUTTON=true
V10D_HAS_DETAIL_CARD=true
V10D_HAS_PREVIEW_APPROVE=true
V10D_HAS_PREVIEW_RETURN=true
V10D_HAS_CLICK_BRIDGE=true
V10D_HAS_NO_API_POST=true
V10C_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10D_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10d_20260503_203022
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d_review_artifact_detail_card_20260503_203022/000_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d_review_artifact_detail_card_20260503_203022/aicm-production-core.before_r8z_v10d.js
DB_WRITE=NO
API_POST=NO
API_GET=YES
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 各レビュー項目の「成果物を確認」を押す
3. 期待表示:
   - 成果物確認カード
   - 納品サマリー
   - 主な変更点
   - AIレビュー結果
   - 未解決事項
   - 成果物リンク
   - metadata_jsonb
4. 「承認確認へ進む」「差し戻し確認へ進む」はプレビューだけです。DB更新しません。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d_review_artifact_detail_card_20260503_203022/aicm-production-core.before_r8z_v10d.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
