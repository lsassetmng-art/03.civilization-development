============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- Manager大項目を課長へ送るUI

現在位置:
- V10L-B1Cで表示は出た
- ただし場所が下すぎる
- パネルが大きすぎる
- データ読込前に0件表示が固定されている可能性がある

今回:
1. core/server syntax確認
2. core backup
3. 旧B1B/B1C表示ブロックを除去
4. B1D compact top panelを追加
5. 部門別タスク台帳の一番上に表示
6. countsを再描画ごとに更新
7. 詳細リストはdetailsで折りたたみ
8. 実行ボタンはまだdisabled
9. API POSTなし
10. server再起動
11. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- 実POST解放
- runLeaderAutoDecomposition API変更

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1d_compact_top_leader_send_panel_20260504_093353
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1d_compact_top_leader_send_panel_20260504_093353/aicm-production-core.before_v10l_b1d.js

============================================================
4. patch core
============================================================
REMOVED_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL=false
REMOVED_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY=false
REMOVED_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER=true
REMOVED_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR=true

BEFORE_B1D_MARKER_COUNT=0
BEFORE_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0
BEFORE_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=2
BEFORE_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=2
AFTER_B1D_MARKER_COUNT=2
AFTER_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0
AFTER_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0
AFTER_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0
AFTER_B1D_PANEL_COUNT=1
AFTER_B1D_MOUNT_COUNT=3
AFTER_B1D_CONFIRM_COUNT=3
AFTER_EXEC_DISABLED_COUNT=1
AFTER_NO_POST_IN_B1D_BLOCK=true
PATCH_CHANGED=true
PATCH_DECISION=PATCH_APPLIED

============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10L_B1D_MARKER_COUNT=2
OLD_B1B_MARKER_COUNT=0
OLD_B1C_MARKER_COUNT=0
B1D_PANEL_COUNT=1
B1D_MOUNT_COUNT=3
B1D_CONFIRM_COUNT=3
B1D_ACTION_UNSENT_COUNT=2
B1D_ACTION_ALL_COUNT=2
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1D_BLOCK_COUNT=0
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
7. restart server
============================================================

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
V10L_B1D_MARKER_COUNT=2
OLD_B1B_MARKER_COUNT=0
OLD_B1C_MARKER_COUNT=0
B1D_PANEL_COUNT=1
B1D_MOUNT_COUNT=3
B1D_CONFIRM_COUNT=3
B1D_ACTION_UNSENT_COUNT=2
B1D_ACTION_ALL_COUNT=2
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1D_BLOCK_COUNT=0
SERVED_V10L_B1D_MARKER_COUNT=2
SERVED_OLD_B1B_MARKER_COUNT=0
SERVED_OLD_B1C_MARKER_COUNT=0
SERVED_B1D_PANEL_COUNT=1
SERVED_B1D_ACTION_UNSENT_COUNT=2
SERVED_B1D_ACTION_ALL_COUNT=2
SERVED_EXEC_DISABLED_COUNT=1
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_b1d_20260504_093353
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1d_compact_top_leader_send_panel_20260504_093353/000_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1d_compact_top_leader_send_panel_20260504_093353/aicm-production-core.before_v10l_b1d.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1d_compact_top_leader_send_panel_20260504_093353/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 一番上にコンパクトな「課長へ送る」カードが出る
3. 大項目/未送信/送信済/中項目/作業単位/選択 が横並びで出る
4. ボタンは「未送信を選択」「解除」「選択を確認」「未送信を確認」「全件を確認」
5. 詳細リストは折りたたみ
6. 確認カードの実行ボタンは disabled のまま
7. OKなら git checkpoint

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1d_compact_top_leader_send_panel_20260504_093353/aicm-production-core.before_v10l_b1d.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
