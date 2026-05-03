============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V10F確認カード OK / git checkpoint OK: 9f4f9b3
- 課新規追加で他課の従業員が表示される
- V10F2F:
  - HAS_GO_HANDLER=true
  - SECTION_NEW_BUTTON_HAS_DATA_SCREEN=true
  - GO_HANDLER_SETS_SCREEN=true
  - GO_HANDLER_CLEARS_SELECTED_SECTION=false
  - FINAL_JUDGEMENT=FIX_SECTION_NEW_GO_HANDLER_CLEAR_SELECTED_SECTION_STATE

今回:
1. core/server syntax確認
2. core backup
3. section-new entry専用のstate hygiene helperを追加
4. go handlerの state.screen = ... 直後に helper(state.screen) を追加
5. go handler候補が一意に取れない場合は render() の section-new branch 直前に helper("section-new") を追加
6. section-new以外は既存挙動維持
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- HTML後置換
- renderSectionNew wrap
- selectedSectionId退避/復元
- 台帳/レビュー/課長へ送る/削除への変更

保守性方針:
- 原因は「新規課入口の既存課state残留」
- 入口で既存課stateだけを消す
- selectedCompany / selectedDepartment は消さない

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2g_section_new_entry_state_hygiene_20260503_222049
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. guard against abandoned low-maint patches
============================================================
LOW_MAINT_V10F2_COUNT=0
PARTIAL_V10F2B_COUNT=0
PARTIAL_V10F2D_COUNT=0
V10F2G_EXISTING_COUNT=0

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2g_section_new_entry_state_hygiene_20260503_222049/aicm-production-core.before_r8z_v10f2g.js

============================================================
5. patch section-new entry state hygiene
============================================================
PATCH_APPLIED: section-new entry state hygiene
PATCH_MODE=RENDER_BRANCH
HELPER_INSERTED=true
HELPER_ANCHOR=render
HELPER_INSERT_LINE=8318
GO_ASSIGNMENT_CANDIDATE_COUNT=0
PATCH_DECISION=RENDER_BRANCH_CALL_INSERTED
RENDER_BRANCH_CALL_LINE=8376

============================================================
6. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
7. static verify
============================================================
V10F2G_MARKER_COUNT=3
V10F2G_HAS_HELPER=true
V10F2G_CLEARS_SELECTED_SECTION=true
V10F2G_CLEARS_PLACEMENT_DRAFTS=true
V10F2G_HAS_GO_OR_RENDER_CALL=true
V10F2G_HAS_NO_HTML_POST_REPLACE=true
V10F2G_HAS_NO_RENDER_SECTION_NEW_WRAP=true
V10F2G_HAS_NO_SELECTED_SECTION_BACKUP=true
V10F2G_HAS_NO_API_POST=true
PATCH_DECISION=RENDER_BRANCH_CALL_INSERTED
GO_ASSIGNMENT_CANDIDATE_COUNT=0
V10F_MARKER_COUNT=2
V10D5_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3

============================================================
8. restart server
============================================================

============================================================
9. served core verify
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=6020460f5b2306dc529e2b5e639d74d71477b2894642bda25a629dae0150cc97
SERVED_SHA=6020460f5b2306dc529e2b5e639d74d71477b2894642bda25a629dae0150cc97
SERVED_V10F2G_MARKER_COUNT=3

============================================================
10. final / browser open
============================================================
FINAL_JUDGEMENT=V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE_READY_BROWSER_OPENED
V10F2G_MARKER_COUNT=3
V10F2G_HAS_HELPER=true
V10F2G_CLEARS_SELECTED_SECTION=true
V10F2G_CLEARS_PLACEMENT_DRAFTS=true
V10F2G_HAS_GO_OR_RENDER_CALL=true
V10F2G_HAS_NO_HTML_POST_REPLACE=true
V10F2G_HAS_NO_RENDER_SECTION_NEW_WRAP=true
V10F2G_HAS_NO_SELECTED_SECTION_BACKUP=true
V10F2G_HAS_NO_API_POST=true
PATCH_DECISION=RENDER_BRANCH_CALL_INSERTED
GO_ASSIGNMENT_CANDIDATE_COUNT=0
V10F_MARKER_COUNT=2
V10D5_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10F2G_MARKER_COUNT=3
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10f2g_20260503_222049
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2g_section_new_entry_state_hygiene_20260503_222049/000_R8Z_V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2g_section_new_entry_state_hygiene_20260503_222049/aicm-production-core.before_r8z_v10f2g.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2g_section_new_entry_state_hygiene_20260503_222049/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. 課の新規追加を開く
2. 期待:
   - 他課の従業員ロボット 1/2/3 が表示されない
   - 新規課として空の状態になる
3. 課詳細/課変更では既存従業員設定が残ること
4. レビュー待ち/成果物確認/承認確認カードが壊れていないこと

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2g_section_new_entry_state_hygiene_20260503_222049/aicm-production-core.before_r8z_v10f2g.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
