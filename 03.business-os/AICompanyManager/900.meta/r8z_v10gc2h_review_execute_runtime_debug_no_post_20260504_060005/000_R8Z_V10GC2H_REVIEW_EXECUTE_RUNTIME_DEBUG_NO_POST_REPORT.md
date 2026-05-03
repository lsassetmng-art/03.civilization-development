============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し実行ボタン

現在位置:
- V10GC2G 静的解析結果:
  - approveHumanReviewItem / returnHumanReviewItem は存在
  - server側body keys:
    - aicm_human_review_item_id
    - human_review_note
    - human_reviewer_label
    - owner_civilization_id
  - V10GC2B/V10GC2Fは存在
  - V10GC2C/Dは撤去済み
  - 静的にはほぼOKだが、実行できない
- 次はruntime click時の値を赤枠表示する

今回:
1. core/server syntax確認
2. core backup
3. 承認/差し戻し実行クリックを捕捉
4. 実POSTは止める
5. 赤枠debugカードに以下を表示
   - clicked action
   - route
   - review item id
   - owner_civilization_id
   - human_reviewer_label
   - note
   - payload keys
   - missing required keys
   - button disabled / data-core-action
6. server再起動
7. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- 承認/差し戻しの実更新

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2h_review_execute_runtime_debug_no_post_20260504_060005
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES_DEBUG_ONLY
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. marker precheck
============================================================
V10GC2B_CORE_MARKER_COUNT=2
V10GC2F_MARKER_COUNT=2
V10GC2H_MARKER_COUNT_BEFORE=0
V10GC_SERVER_MARKER_COUNT=0

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2h_review_execute_runtime_debug_no_post_20260504_060005/aicm-production-core.before_v10gc2h.js

============================================================
5. patch core debug only
============================================================
PATCH_APPLIED: V10GC2H runtime debug no-post appended\n
============================================================
6. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
7. verify
============================================================
V10GC2H_MARKER_COUNT=2
V10GC2H_DEBUG_CARD_COUNT=2
V10GC2H_NO_POST_TEXT_COUNT=1
V10GC2H_PREVENT_COUNT=15
V10GC2B_CORE_MARKER_COUNT=2
V10GC2F_MARKER_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO

============================================================
8. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=da01ff548abe5519e672f68f8e6cf4750cee141ff37b560607dae456cfbae800
SERVED_SHA=da01ff548abe5519e672f68f8e6cf4750cee141ff37b560607dae456cfbae800
SERVED_V10GC2H_COUNT=2

============================================================
9. final
============================================================
FINAL_JUDGEMENT=V10GC2H_RUNTIME_DEBUG_NO_POST_READY_BROWSER_OPENED
V10GC2H_MARKER_COUNT=2
V10GC2H_DEBUG_CARD_COUNT=2
V10GC2H_NO_POST_TEXT_COUNT=1
V10GC2B_CORE_MARKER_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10GC2H_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc2h_20260504_060005
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2h_review_execute_runtime_debug_no_post_20260504_060005/000_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2h_review_execute_runtime_debug_no_post_20260504_060005/aicm-production-core.before_v10gc2h.js
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES_DEBUG_ONLY
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 承認確認へ進む
4. 「承認を実行する」を押す
5. 赤枠 V10GC2H debug が出る
6. DB更新は起きません
7. 赤枠の以下を貼ってください:
   - clicked_action
   - kind
   - route
   - aicm_human_review_item_id
   - owner_civilization_id
   - human_reviewer_label
   - missing_required_keys
   - button_disabled
   - button_data_core_action

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2h_review_execute_runtime_debug_no_post_20260504_060005/aicm-production-core.before_v10gc2h.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
