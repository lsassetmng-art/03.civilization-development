============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー一覧に戻るナビは出た
- 要望は「戻る」1個だけで、押したらダッシュボードへ戻る
- 課追加の従業員表示はまだ出る
- V10F2I debugでは state 側の section/placement は空
- よって次は DOM/描画側の実体を、debug自身を除外して確認する

今回:
1. core/server syntax確認
2. core backup
3. レビュー一覧ナビを「戻る」1ボタンに簡素化
4. 戻るボタンは必ず dashboard へ遷移
5. debug自身を除外したDOM調査カードを追加
6. 実際の見出し / ボタン / ラベル / select選択値 / 従業員UIの近傍テキストを表示
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 課追加バグの本修正
- HTML後置換による本修正

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3c_back_simple_v10f2j_dom_source_debug_20260503_223732
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3c_back_simple_v10f2j_dom_source_debug_20260503_223732/aicm-production-core.before_v10f3c_v10f2j.js

============================================================
4. patch
============================================================
PATCH_APPLIED: V10F3C simple review-list back to dashboard installed
PATCH_APPLIED: V10F2J DOM source debug installed

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. verify
============================================================
V10F3C_MARKER_COUNT=2
V10F3C_DOM_ID_COUNT=4
V10F3C_ACTION_COUNT=2
V10F3C_SINGLE_LABEL_COUNT=15
V10F2J_MARKER_COUNT=2
V10F2J_DOM_ID_COUNT=3
V10F2J_NO_DEBUG_COUNT_LABEL=1
V10F2J_NO_DB_WRITE=true
V10F2J_NO_API_POST=true

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=ebbbf0ec5b2facca2c26925880105c0a37ec9c0dcc9b07abecd3dd9887c3e8c5
SERVED_SHA=ebbbf0ec5b2facca2c26925880105c0a37ec9c0dcc9b07abecd3dd9887c3e8c5
SERVED_V10F3C_COUNT=2
SERVED_V10F2J_COUNT=2

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10F3C_BACK_SIMPLE_AND_V10F2J_DOM_SOURCE_DEBUG_READY_BROWSER_OPENED
V10F3C_MARKER_COUNT=2
V10F3C_DOM_ID_COUNT=4
V10F3C_ACTION_COUNT=2
V10F3C_SINGLE_LABEL_COUNT=15
V10F2J_MARKER_COUNT=2
V10F2J_DOM_ID_COUNT=3
V10F2J_NO_DEBUG_COUNT_LABEL=1
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10F3C_COUNT=2
SERVED_V10F2J_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10f3c_v10f2j_20260503_223732
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3c_back_simple_v10f2j_dom_source_debug_20260503_223732/000_R8Z_V10F3C_BACK_SIMPLE_V10F2J_DOM_SOURCE_DEBUG_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3c_back_simple_v10f2j_dom_source_debug_20260503_223732/aicm-production-core.before_v10f3c_v10f2j.js
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

BROWSER_CHECK:
A. レビュー一覧
- 上部ボタンが「戻る」1個になること
- 押すとダッシュボードへ戻ること

B. 課新規追加
- 紫枠「V10F2J / DOM SOURCE DEBUG」を確認
- 貼ってほしい値:
  DOM no-debug 従業員設定
  DOM no-debug 従業員設定ロボット
  DOM no-debug 従業員行を追加
  headings
  buttons
  labels/dt
  selects
  worker neighborhood

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3c_back_simple_v10f2j_dom_source_debug_20260503_223732/aicm-production-core.before_v10f3c_v10f2j.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
