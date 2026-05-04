============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 登録済み大項目一覧
- 課長へ送るボタン

現在位置:
- V10L-B1Eでボタンは出た
- ただし場所がアプリ全体の最上部になっていた
- 正しい要望は「登録済み大項目」の一番上

今回:
1. core/server syntax確認
2. core backup
3. 旧B1B/B1C/B1D/B1E表示ブロックを除去
4. B1Fを追加
5. task-ledger画面以外ではボタンを消す
6. 「登録済み大項目」見出しの直下にだけボタンを挿入
7. ボタンは「未送信を確認」「全件を確認」のみ
8. 確認カードはボタン直下に出す
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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1f_buttons_at_registered_major_top_20260504_110225
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1f_buttons_at_registered_major_top_20260504_110225/aicm-production-core.before_v10l_b1f.js

============================================================
4. patch core
============================================================
REMOVED_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP=false\nREMOVED_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY=false\nREMOVED_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER=false\nREMOVED_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR=false\nREMOVED_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL=false\nREMOVED_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS=true\n
BEFORE_B1F_MARKER_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0\nBEFORE_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=2\nAFTER_B1F_MARKER_COUNT=2\nAFTER_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0\nAFTER_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0\nAFTER_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0\nAFTER_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0\nAFTER_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=0\nAFTER_B1F_MOUNT_COUNT=4\nAFTER_B1F_BUTTONS_COUNT=1\nAFTER_B1F_CONFIRM_COUNT=4\nAFTER_B1F_UNSENT_ACTION_COUNT=2\nAFTER_B1F_ALL_ACTION_COUNT=2\nAFTER_EXEC_DISABLED_COUNT=1\nAFTER_NO_API_CALL_IN_B1F_BLOCK=true\nPATCH_CHANGED=true\nPATCH_DECISION=PATCH_APPLIED\n
============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10L_B1F_MARKER_COUNT=2
OLD_B1B_MARKER_COUNT=0
OLD_B1C_MARKER_COUNT=0
OLD_B1D_MARKER_COUNT=0
OLD_B1E_MARKER_COUNT=0
B1F_MOUNT_COUNT=4
B1F_BUTTONS_COUNT=1
B1F_CONFIRM_COUNT=4
B1F_UNSENT_ACTION_COUNT=2
B1F_ALL_ACTION_COUNT=2
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1F_BLOCK_COUNT=0
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
FINAL_JUDGEMENT=V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
V10L_B1F_MARKER_COUNT=2
OLD_B1B_MARKER_COUNT=0
OLD_B1C_MARKER_COUNT=0
OLD_B1D_MARKER_COUNT=0
OLD_B1E_MARKER_COUNT=0
B1F_MOUNT_COUNT=4
B1F_BUTTONS_COUNT=1
B1F_CONFIRM_COUNT=4
B1F_UNSENT_ACTION_COUNT=2
B1F_ALL_ACTION_COUNT=2
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1F_BLOCK_COUNT=0
SERVED_V10L_B1F_MARKER_COUNT=2
SERVED_OLD_B1E_MARKER_COUNT=0
SERVED_B1F_BUTTONS_COUNT=1
SERVED_B1F_UNSENT_ACTION_COUNT=2
SERVED_B1F_ALL_ACTION_COUNT=2
SERVED_EXEC_DISABLED_COUNT=1
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_b1f_20260504_110225
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1f_buttons_at_registered_major_top_20260504_110225/000_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1f_buttons_at_registered_major_top_20260504_110225/aicm-production-core.before_v10l_b1f.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1f_buttons_at_registered_major_top_20260504_110225/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. ダッシュボード最上部に「課長へ送る」が出ないこと
2. 部門別タスク台帳を開く
3. 「登録済み大項目」の見出し直下に小さいボタン枠が出ること
4. ボタンは「未送信を確認」「全件を確認」だけ
5. 確認を押すと、その直下に確認カードが出ること
6. 実行ボタンはdisabledのまま
7. OKならgit checkpoint

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1f_buttons_at_registered_major_top_20260504_110225/aicm-production-core.before_v10l_b1f.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
