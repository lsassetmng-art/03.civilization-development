============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し最終確認カード

現在位置:
- V10GC2G 静的解析はOK
- V10GC2H click debug は赤枠が出なかった
- 理由候補:
  - 「承認を実行する」ボタンが disabled なので click event が発火しない
  - そのため click debug では原因を拾えない

今回:
1. core/server syntax確認
2. core backup
3. 確認画面が表示された時点で自動debugカードを出す
4. click不要で以下を表示
   - 確認画面判定
   - 実行ボタン数
   - 各ボタンの label / disabled / data-core-action / class / style
   - review id
   - owner_civilization_id
   - human_reviewer_label
   - missing keys
   - state screen
5. server再起動
6. ブラウザ起動

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2i_confirm_screen_auto_debug_no_click_20260504_060330
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES_DEBUG_ONLY
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2i_confirm_screen_auto_debug_no_click_20260504_060330/aicm-production-core.before_v10gc2i.js

============================================================
4. patch core auto debug
============================================================
PATCH_APPLIED: V10GC2I confirm screen auto debug appended\n
============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10GC2I_MARKER_COUNT=2
V10GC2I_DEBUG_CARD_COUNT=2
V10GC2I_NO_POST_COUNT=2
V10GC2B_CORE_MARKER_COUNT=2
V10GC2F_MARKER_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=78a2c8e688fb43e450f646c875a41d7c5d8ecc566bd3c1720b5ee232926cab32
SERVED_SHA=78a2c8e688fb43e450f646c875a41d7c5d8ecc566bd3c1720b5ee232926cab32
SERVED_V10GC2I_COUNT=2

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_READY_BROWSER_OPENED
V10GC2I_MARKER_COUNT=2
V10GC2I_DEBUG_CARD_COUNT=2
V10GC2I_NO_POST_COUNT=2
V10GC2B_CORE_MARKER_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10GC2I_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc2i_20260504_060330
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2i_confirm_screen_auto_debug_no_click_20260504_060330/000_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2i_confirm_screen_auto_debug_no_click_20260504_060330/aicm-production-core.before_v10gc2i.js
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES_DEBUG_ONLY
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 承認確認へ進む
4. 赤枠 V10GC2I debug が自動で出ること
5. ボタンは押さなくてOK
6. 赤枠の以下を貼ってください:
   - decision_button_count
   - aicm_human_review_item_id
   - owner_civilization_id
   - human_reviewer_label
   - missing_required_keys
   - button label
   - button disabled
   - button data-core-action
   - button data-review-item-id

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2i_confirm_screen_auto_debug_no_click_20260504_060330/aicm-production-core.before_v10gc2i.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
