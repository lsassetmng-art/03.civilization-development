============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 登録済み大項目
- 課長へ送る / 削除 の集約UI

現在位置:
- B1Hでは選択できない
- 仕様を修正:
  - 各大項目カード/行を選択可能にする
  - 上部に「課長へ送る」「削除」「全件選択」「解除」を集約
  - 全件選択は未送信分のみ選択
  - 課長へ送る/削除は選択済みだけ対象
  - 各カード内の個別「課長へ送る」「削除」は不要
  - 確認画面はタイトル一覧 + Yes/Noだけ

今回:
1. core/server syntax確認
2. core backup
3. 旧B1系ブロックを除去
4. B1Iを追加
5. 登録済み大項目の一番上に集約ボタンを表示
6. 各カード/行に選択UIを付与
7. カード内の個別送る/削除ボタンを非表示
8. 確認画面をタイトル一覧 + Yes/Noだけにする
9. Yesはこの工程ではDB更新/API POSTしない
10. server再起動
11. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- 実POST解放

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1i_selected_send_delete_unified_controls_20260504_111637
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1i_selected_send_delete_unified_controls_20260504_111637/aicm-production-core.before_v10l_b1i.js

============================================================
4. patch core
============================================================
REMOVED_AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS=false\nREMOVED_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY=false\nREMOVED_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER=false\nREMOVED_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR=false\nREMOVED_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL=false\nREMOVED_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS=false\nREMOVED_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP=false\nREMOVED_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS=false\nREMOVED_AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS=true\n
BEFORE_B1I_MARKER_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS_COUNT=2\nAFTER_B1I_MARKER_COUNT=2\nAFTER_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0\nAFTER_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0\nAFTER_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0\nAFTER_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0\nAFTER_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=0\nAFTER_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_COUNT=0\nAFTER_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS_COUNT=0\nAFTER_AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS_COUNT=0\nAFTER_B1I_MOUNT_COUNT=7\nAFTER_B1I_BUTTONS_COUNT=1\nAFTER_B1I_ROW_SELECTOR_COUNT=3\nAFTER_B1I_CHECKBOX_COUNT=3\nAFTER_B1I_SEND_ACTION_COUNT=2\nAFTER_B1I_DELETE_ACTION_COUNT=2\nAFTER_B1I_SELECT_ALL_ACTION_COUNT=2\nAFTER_B1I_CLEAR_ACTION_COUNT=2\nAFTER_B1I_YES_COUNT=1\nAFTER_B1I_NO_COUNT=1\nAFTER_NO_API_CALL_IN_B1I_BLOCK=true\nPATCH_CHANGED=true\nPATCH_DECISION=PATCH_APPLIED\n
============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10L_B1I_MARKER_COUNT=2
OLD_B1H_MARKER_COUNT=0
B1I_MOUNT_COUNT=7
B1I_BUTTONS_COUNT=1
B1I_ROW_SELECTOR_COUNT=3
B1I_CHECKBOX_COUNT=3
B1I_SEND_ACTION_COUNT=2
B1I_DELETE_ACTION_COUNT=2
B1I_SELECT_ALL_ACTION_COUNT=2
B1I_CLEAR_ACTION_COUNT=2
B1I_CONFIRM_YES_COUNT=2
B1I_CONFIRM_NO_COUNT=2
REQUEST_JSON_IN_B1I_BLOCK_COUNT=0
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
FINAL_JUDGEMENT=V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
V10L_B1I_MARKER_COUNT=2
OLD_B1H_MARKER_COUNT=0
B1I_MOUNT_COUNT=7
B1I_BUTTONS_COUNT=1
B1I_ROW_SELECTOR_COUNT=3
B1I_CHECKBOX_COUNT=3
B1I_SEND_ACTION_COUNT=2
B1I_DELETE_ACTION_COUNT=2
B1I_SELECT_ALL_ACTION_COUNT=2
B1I_CLEAR_ACTION_COUNT=2
B1I_CONFIRM_YES_COUNT=2
B1I_CONFIRM_NO_COUNT=2
REQUEST_JSON_IN_B1I_BLOCK_COUNT=0
SERVED_V10L_B1I_MARKER_COUNT=2
SERVED_OLD_B1H_MARKER_COUNT=0
SERVED_B1I_BUTTONS_COUNT=1
SERVED_B1I_CHECKBOX_COUNT=3
SERVED_B1I_SEND_ACTION_COUNT=2
SERVED_B1I_DELETE_ACTION_COUNT=2
SERVED_B1I_SELECT_ALL_ACTION_COUNT=2
SERVED_B1I_CLEAR_ACTION_COUNT=2
SERVED_B1I_CONFIRM_YES_COUNT=2
SERVED_B1I_CONFIRM_NO_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_b1i_20260504_111637
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1i_selected_send_delete_unified_controls_20260504_111637/000_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1i_selected_send_delete_unified_controls_20260504_111637/aicm-production-core.before_v10l_b1i.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1i_selected_send_delete_unified_controls_20260504_111637/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 登録済み大項目の一番上に「課長へ送る」「削除」「全件選択」「解除」が出る
3. 各カード/行に「選択」チェックが出る
4. カード内の個別「課長へ送る」「削除」が消える
5. カード自体をタップしても選択/解除できる
6. 全件選択は未送信分のみ選択される
7. 課長へ送る確認はタイトル一覧 + Yes/Noだけ
8. 削除確認もタイトル一覧 + Yes/Noだけ
9. Yesを押しても今回はDB更新/API POSTなし
10. OKなら次に実POST/削除のrollback smokeへ進む

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1i_selected_send_delete_unified_controls_20260504_111637/aicm-production-core.before_v10l_b1i.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
