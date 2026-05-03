============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 承認/差し戻し実行後の画面遷移

現在位置:
- 承認/差し戻しDB機能は成功済み
- approved=1 / returned=1 / pending=0
- しかし review wait view/context が returned を返しており、画面に差し戻し済が残る
- 課長へ送った件はDB上 manager/leader/worker 側に存在するが、レビュー一覧へ直接出るものではない
- 課長へ送る一括/複数件UIは次工程 V10L で扱う

今回:
1. server context の review wait rows を pending のみにする
2. core 側も defensive に pending のみへ絞る
3. 承認/差し戻し成功後の confirm/detail/metadata 残骸を消す
4. 成功後は review-list に戻し、上へスクロール
5. pending 0件なら空表示にする
6. server再起動と context GET確認
7. ブラウザ起動

禁止:
- DB write
- API POST
- 既存承認/差し戻しrouteの変更
- 課長送信機能への混在修正

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848
OWNER_ID=00000000-0000-4000-8000-000000000001
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=YES

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/aicm-production-core.before_v10gc4b.js
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/aicm-local-ui-api-server.before_v10gc4b.mjs

============================================================
4. patch core/server
============================================================
REMOVED_CORE_AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL=false
REMOVED_SERVER_AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_CONTEXT_FILTER=false

BEFORE_CORE_V10GC4B_COUNT=0
BEFORE_SERVER_V10GC4B_COUNT=0
BEFORE_SERVER_CONTEXT_CALL_COUNT=1
BEFORE_SERVER_REVIEW_VIEW_COUNT=1
BEFORE_CORE_V10GC3I_COUNT=2
SERVER_CONTEXT_CALL_EXACT_COUNT=1
CORE_REFRESH_PATCH_RESULT=true
CORE_REFRESH_PATCH_REASON=patched
AFTER_CORE_V10GC4B_COUNT=3
AFTER_SERVER_V10GC4B_COUNT=2
AFTER_SERVER_CONTEXT_FILTER_CALL_COUNT=1
AFTER_CORE_PENDING_FILTER_FUNC_COUNT=2
AFTER_CORE_SUCCESS_TRANSITION_CALL_COUNT=5
AFTER_CORE_EMPTY_TEXT_COUNT=4
PATCH_DECISION=PATCH_APPLIED

============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify marker/static
============================================================
CORE_V10GC4B_MARKER_COUNT=3
SERVER_V10GC4B_MARKER_COUNT=2
SERVER_CONTEXT_FILTER_CALL_COUNT=1
CORE_PENDING_FILTER_FUNC_COUNT=2
CORE_SUCCESS_TRANSITION_CALL_COUNT=4
CORE_REVIEW_EMPTY_TEXT_COUNT=4
V10GC3I_MARKER_COUNT=2
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=YES

============================================================
7. restart server
============================================================
CONTEXT_PARSE_OK=true
CONTEXT_REVIEW_ROW_COUNT=0
CONTEXT_REVIEW_STATUS_COUNTS=
CONTEXT_PENDING_COUNT=0
CONTEXT_APPROVED_COUNT=0
CONTEXT_RETURNED_COUNT=0

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
CONTEXT_HTTP=200
CORE_V10GC4B_MARKER_COUNT=3
SERVER_V10GC4B_MARKER_COUNT=2
SERVER_CONTEXT_FILTER_CALL_COUNT=1
CORE_PENDING_FILTER_FUNC_COUNT=2
CORE_SUCCESS_TRANSITION_CALL_COUNT=4
CORE_REVIEW_EMPTY_TEXT_COUNT=4
V10GC3I_MARKER_COUNT=2
SERVED_CORE_V10GC4B_COUNT=3
CONTEXT_PARSE_OK=true
CONTEXT_REVIEW_ROW_COUNT=0
CONTEXT_REVIEW_STATUS_COUNTS=
CONTEXT_PENDING_COUNT=0
CONTEXT_APPROVED_COUNT=0
CONTEXT_RETURNED_COUNT=0
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc4b_20260504_071848
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/000_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/aicm-production-core.before_v10gc4b.js
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/aicm-local-ui-api-server.before_v10gc4b.mjs
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/020_patch_analysis.txt
CONTEXT_JSON=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/050_context_after_patch.json
CONTEXT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/060_context_status_scan.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=YES

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 「レビュー・承認待ち: 0件」または「レビュー・承認待ちはありません」になること
3. 差し戻し済 / 承認済 が一覧に残らないこと
4. metadata_jsonb の詳細カードが残らないこと
5. ナビカードは維持されていること
6. OKなら git checkpoint
7. 次工程は V10L: 部門別タスク台帳の全件/複数件を課長へ送るUI

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/aicm-production-core.before_v10gc4b.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4b_review_pending_only_screen_control_20260504_071848/aicm-local-ui-api-server.before_v10gc4b.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
