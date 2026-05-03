============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち一覧は2件表示 OK
- ただしレビュー待ち一覧画面自体に「前の画面へ戻る」ボタンがない
- V10F3は承認確認カード側の戻りで、要望箇所とズレていた
- 課新規追加の従業員漏れは未解決
- V10F2H debugが表示されないため、section-new限定debugでは不足

今回:
1. core/server syntax確認
2. core backup
3. レビュー・承認待ち一覧の上部に「前の画面へ戻る」ボタンを追加
4. review-list back button handlerを追加
5. 従業員設定が画面に出ている場合、screenに関係なく必ずdebugを出す
6. section-new / section-edit / placement-new / 従業員設定DOM検出でdebug表示
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 課追加バグの本修正
- HTML後置換による本修正
- renderSectionNew wrapによる本修正

補足:
- 今回のsection debugは原因特定用。修正ではない。
- debugにより、実際のscreen/state/DOM状態を確認する。

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3b_review_list_back_and_v10f2i_worker_debug_20260503_223248
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3b_review_list_back_and_v10f2i_worker_debug_20260503_223248/aicm-production-core.before_v10f3b_v10f2i.js

============================================================
4. patch review-list back + worker leak debug
============================================================
PATCH_APPLIED: V10F3B review-list top back button installed
PATCH_APPLIED: V10F2I always-visible worker leak debug installed

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. verify
============================================================
V10F3B_MARKER_COUNT=2
V10F3B_BACK_DOM_ID_COUNT=3
V10F3B_ACTION_COUNT=2
V10F2I_MARKER_COUNT=2
V10F2I_DEBUG_DOM_ID_COUNT=2
V10F2I_SHOWS_WORKER_DOM_COUNTS=1
V10F2I_NO_DB_WRITE=true
V10F2I_NO_API_POST=true
V10F3_MARKER_COUNT=1
V10F2H_MARKER_COUNT=2
V10F2G_MARKER_COUNT=3

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=611266895fb95298c99490506cb00fc04f2b1907e4b19b786adf62183c432be5
SERVED_SHA=611266895fb95298c99490506cb00fc04f2b1907e4b19b786adf62183c432be5
SERVED_V10F3B_COUNT=2
SERVED_V10F2I_COUNT=2

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10F3B_REVIEW_LIST_BACK_AND_V10F2I_WORKER_DEBUG_READY_BROWSER_OPENED
V10F3B_MARKER_COUNT=2
V10F3B_BACK_DOM_ID_COUNT=3
V10F3B_ACTION_COUNT=2
V10F2I_MARKER_COUNT=2
V10F2I_DEBUG_DOM_ID_COUNT=2
V10F2I_SHOWS_WORKER_DOM_COUNTS=1
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10F3B_COUNT=2
SERVED_V10F2I_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10f3b_v10f2i_20260503_223248
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3b_review_list_back_and_v10f2i_worker_debug_20260503_223248/000_R8Z_V10F3B_REVIEW_LIST_BACK_AND_V10F2I_WORKER_DEBUG_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3b_review_list_back_and_v10f2i_worker_debug_20260503_223248/aicm-production-core.before_v10f3b_v10f2i.js
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

BROWSER_CHECK:
A. レビュー・承認待ち一覧
- 画像の画面上部に「前の画面へ戻る」が出ること

B. 課新規追加
- 従業員がまだ出る場合、赤枠「V10F2I / 従業員漏れ runtime debug」が出ること
- 貼ってほしい値:
  screen
  selectedSectionId
  selectedSection
  currentSection
  editingSectionId
  sectionEditId
  context.placements
  state.placements
  placementRows resolved
  matching placements for selectedSectionId
  sectionPlacementDraft
  workerPlacementDraft
  sectionNewDraft.workerPlacements
  DOM 従業員設定
  DOM 従業員設定ロボット
  DOM 従業員行を追加
  V10F2G cleared

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3b_review_list_back_and_v10f2i_worker_debug_20260503_223248/aicm-production-core.before_v10f3b_v10f2i.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
