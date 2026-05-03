============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- pending 0件時の画面制御

現在位置:
- 承認/差し戻しDB機能は成功済み
- pending 0件表示は出ている
- ただし空状態カードが「レビュー待ちが取得できません」と赤枠で出ている
- これは取得失敗ではなく空状態なので、通常カードへ修正する

今回:
1. core/server syntax確認
2. DB read-onlyで pending 0件を確認
3. core backup
4. 「レビュー待ちが取得できません」を空状態文言へ修正
5. 赤枠/エラー調の表示を通常カード寄りへ修正
6. server再起動
7. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- 課長送信機能への混在修正

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4c_review_empty_state_fix_20260504_072054
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. DB readonly pending check
============================================================
pending_table_count	0
pending_view_count	0
review_table_status_counts	approved:1 | returned:1

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4c_review_empty_state_fix_20260504_072054/aicm-production-core.before_v10gc4c.js

============================================================
5. patch core empty-state source
============================================================
REMOVED_AICM_R8Z_V10GC4C_REVIEW_EMPTY_STATE_FIX=false

BEFORE_BAD_EMPTY_TEXT_COUNT=2
BEFORE_GOOD_EMPTY_TEXT_COUNT=4
BEFORE_V10GC4C_MARKER_COUNT=0
TARGET_FUNCTION_FOUND=true
TARGET_FUNCTION_HEADER=function renderReviewList(appState) {
AFTER_BAD_EMPTY_TEXT_COUNT=1
AFTER_GOOD_EMPTY_TEXT_COUNT=5
AFTER_V10GC4C_MARKER_COUNT=2
PATCH_CHANGED=true
PATCH_DECISION=PATCH_APPLIED

============================================================
6. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
7. verify
============================================================
BAD_EMPTY_TEXT_COUNT=1
GOOD_EMPTY_TEXT_COUNT=5
V10GC4C_MARKER_COUNT=2
V10GC4B_MARKER_COUNT=3
V10GC3I_MARKER_COUNT=2
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
8. restart server
============================================================

============================================================
9. final
============================================================
FINAL_JUDGEMENT=V10GC4C_VERIFY_INCOMPLETE_CHECK_REPORT
ROOT_HTTP=200
SERVED_HTTP=200
CONTEXT_HTTP=200
BAD_EMPTY_TEXT_COUNT=1
GOOD_EMPTY_TEXT_COUNT=5
V10GC4C_MARKER_COUNT=2
V10GC4B_MARKER_COUNT=3
V10GC3I_MARKER_COUNT=2
SERVED_BAD_EMPTY_TEXT_COUNT=1
SERVED_GOOD_EMPTY_TEXT_COUNT=5
SERVED_V10GC4C_MARKER_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc4c_20260504_072054
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4c_review_empty_state_fix_20260504_072054/000_R8Z_V10GC4C_REVIEW_EMPTY_STATE_FIX_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4c_review_empty_state_fix_20260504_072054/aicm-production-core.before_v10gc4c.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4c_review_empty_state_fix_20260504_072054/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. レビュー・承認待ち: 0件
3. 「レビュー待ちが取得できません」が出ないこと
4. 赤枠エラー調カードが出ないこと
5. 空状態として「レビュー・承認待ちはありません」系の表示になること
6. OKなら git checkpoint

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4c_review_empty_state_fix_20260504_072054/aicm-production-core.before_v10gc4c.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
