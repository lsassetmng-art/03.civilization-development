============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 登録済み大項目
- 課長へ送る操作UI

現在位置:
- B1Gで「複数件送る / 全件送る」にしたが、意味が違った
- 正しい仕様:
  - 各カード/各行を選択可能にする
  - 上部に「課長へ送る」「全件選択」「解除」だけ置く
  - 課長へ送る = 選択したもののみ送る
  - 全件選択 = 未送信分のみ全件選択
  - 各カード内の個別「課長へ送る」は不要

今回:
1. core/server syntax確認
2. core backup
3. 旧B1B〜B1G系ブロックを除去
4. B1Hを追加
5. 登録済み大項目の一番上に操作ボタンを集約
6. 各一覧行/カードに選択チェックを付与
7. 個別の課長へ送るボタンを非表示
8. 確認カードは選択済みのみ対象
9. 実行ボタンはdisabled
10. DB更新/API POSTなし
11. server再起動
12. ブラウザ起動

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1h_selected_only_leader_send_controls_20260504_111051
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1h_selected_only_leader_send_controls_20260504_111051/aicm-production-core.before_v10l_b1h.js

============================================================
4. patch core
============================================================
REMOVED_AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS=false\nREMOVED_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY=false\nREMOVED_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER=false\nREMOVED_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR=false\nREMOVED_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL=false\nREMOVED_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS=false\nREMOVED_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP=true\nREMOVED_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS=false\n
BEFORE_B1H_MARKER_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_COUNT=2\nBEFORE_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS_COUNT=0\nAFTER_B1H_MARKER_COUNT=2\nAFTER_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0\nAFTER_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0\nAFTER_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0\nAFTER_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0\nAFTER_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=0\nAFTER_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_COUNT=0\nAFTER_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS_COUNT=0\nAFTER_B1H_MOUNT_COUNT=6\nAFTER_B1H_BUTTONS_COUNT=1\nAFTER_B1H_ROW_SELECTOR_COUNT=2\nAFTER_B1H_CHECKBOX_COUNT=3\nAFTER_B1H_SEND_SELECTED_ACTION_COUNT=2\nAFTER_B1H_SELECT_ALL_ACTION_COUNT=2\nAFTER_B1H_CLEAR_ACTION_COUNT=2\nAFTER_LABEL_KACHO_SEND_COUNT=37\nAFTER_LABEL_SELECT_ALL_COUNT=3\nAFTER_LABEL_CLEAR_COUNT=2\nAFTER_EXEC_DISABLED_COUNT=1\nAFTER_NO_API_CALL_IN_B1H_BLOCK=true\nPATCH_CHANGED=true\nPATCH_DECISION=PATCH_APPLIED\n
============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10L_B1H_MARKER_COUNT=2
OLD_B1G_MARKER_COUNT=0
B1H_MOUNT_COUNT=6
B1H_BUTTONS_COUNT=1
B1H_ROW_SELECTOR_COUNT=2
B1H_CHECKBOX_COUNT=3
B1H_SEND_SELECTED_ACTION_COUNT=2
B1H_SELECT_ALL_ACTION_COUNT=2
B1H_CLEAR_ACTION_COUNT=2
LABEL_SELECT_ALL_COUNT=3
LABEL_CLEAR_COUNT=2
LABEL_UNSENT_WORD_COUNT=0
LABEL_ALL_SEND_WORD_COUNT=0
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1H_BLOCK_COUNT=0
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
FINAL_JUDGEMENT=V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
V10L_B1H_MARKER_COUNT=2
OLD_B1G_MARKER_COUNT=0
B1H_MOUNT_COUNT=6
B1H_BUTTONS_COUNT=1
B1H_ROW_SELECTOR_COUNT=2
B1H_CHECKBOX_COUNT=3
B1H_SEND_SELECTED_ACTION_COUNT=2
B1H_SELECT_ALL_ACTION_COUNT=2
B1H_CLEAR_ACTION_COUNT=2
REQUEST_JSON_IN_B1H_BLOCK_COUNT=0
SERVED_V10L_B1H_MARKER_COUNT=2
SERVED_OLD_B1G_MARKER_COUNT=0
SERVED_B1H_BUTTONS_COUNT=1
SERVED_B1H_CHECKBOX_COUNT=3
SERVED_B1H_SEND_SELECTED_ACTION_COUNT=2
SERVED_B1H_SELECT_ALL_ACTION_COUNT=2
SERVED_B1H_CLEAR_ACTION_COUNT=2
SERVED_LABEL_SELECT_ALL_COUNT=3
SERVED_LABEL_CLEAR_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_b1h_20260504_111051
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1h_selected_only_leader_send_controls_20260504_111051/000_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1h_selected_only_leader_send_controls_20260504_111051/aicm-production-core.before_v10l_b1h.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1h_selected_only_leader_send_controls_20260504_111051/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 登録済み大項目の一番上に「課長へ送る / 全件選択 / 解除」が出る
3. 各大項目カード/行に「選択」チェックが出る
4. 各カード内の個別「課長へ送る」は出ない
5. 全件選択は未送信分のみ選択する
6. 課長へ送るは選択済みだけ確認カードに出す
7. 実行ボタンはdisabledのまま
8. OKならgit checkpoint

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1h_selected_only_leader_send_controls_20260504_111051/aicm-production-core.before_v10l_b1h.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
