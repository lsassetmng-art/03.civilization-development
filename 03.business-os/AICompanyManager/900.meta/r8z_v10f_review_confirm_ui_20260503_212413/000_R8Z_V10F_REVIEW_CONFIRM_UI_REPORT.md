============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち2件表示 OK
- 成果物確認カード表示 OK
- V10E rollback smoke PASS
  - approve status = approved
  - return status = returned
  - rollback後 pending 2件維持

今回:
1. core/server syntax確認
2. core backup
3. 成果物詳細カード内の「承認確認へ進む」「差し戻し確認へ進む」を本確認カード表示へ接続
4. 確認カードには対象レビュー、操作予定、status遷移予定、注意文を表示
5. 「まだ実行しない」状態を明示
6. DB更新なし / API POSTなし
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 承認/差し戻し本実行
- 台帳/課長へ送る/削除への変更

次工程:
- V10G: 承認/差し戻し API rollback smoke
- V10H: 承認/差し戻し本実行

============================================================
1. ENV
============================================================
PHASE=R8Z-V10F approve/return confirmation UI
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/aicm-production-core.before_r8z_v10f.js

============================================================
4. patch V10F confirmation UI
============================================================
PATCH_APPLIED: V10F confirmation UI inserted after V10D5

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V10F_MARKER_COUNT=2
V10F_HAS_BRIDGE=true
V10F_HANDLES_APPROVE=true
V10F_HANDLES_RETURN=true
V10F_HAS_CONFIRM_CARD=true
V10F_HAS_STATUS_APPROVED=true
V10F_HAS_STATUS_RETURNED=true
V10F_EXECUTE_DISABLED=true
V10F_HAS_NO_API_POST=true
V10D5_MARKER_COUNT=2
V10D4_MARKER_COUNT=2
V10D2_MARKER_COUNT=2
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
DISK_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
SERVED_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
SERVED_V10F_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2

============================================================
9. final / browser open
============================================================
FINAL_JUDGEMENT=V10F_CONFIRM_UI_READY_BROWSER_OPENED
V10F_MARKER_COUNT=2
V10F_HAS_BRIDGE=true
V10F_HANDLES_APPROVE=true
V10F_HANDLES_RETURN=true
V10F_HAS_CONFIRM_CARD=true
V10F_HAS_STATUS_APPROVED=true
V10F_HAS_STATUS_RETURNED=true
V10F_EXECUTE_DISABLED=true
V10F_HAS_NO_API_POST=true
V10D5_MARKER_COUNT=2
V10D4_MARKER_COUNT=2
V10D2_MARKER_COUNT=2
V10C_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10F_MARKER_COUNT=2
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10f_20260503_212413
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/000_R8Z_V10F_REVIEW_CONFIRM_UI_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/aicm-production-core.before_r8z_v10f.js
DB_WRITE=NO
API_POST=NO
API_GET=YES
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 「承認確認へ進む」を押す
   - 期待: 承認前の最終確認カードが出る
   - 実行ボタンはdisabled
4. 「差し戻し確認へ進む」を押す
   - 期待: 差し戻し前の最終確認カードが出る
   - 実行ボタンはdisabled

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/aicm-production-core.before_r8z_v10f.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
