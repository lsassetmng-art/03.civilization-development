============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- Manager大項目一覧
- 課長へ送るボタン

現在位置:
- V10L-B1Cでは表示されたが大きくて下すぎた
- V10L-B1Dでは出なくなった
- ユーザー要望:
  1. B1Dを戻す
  2. 一覧の1番上にボタンだけ出す
  3. 大きいカードは不要
  4. まだDB更新/API POSTはしない

今回:
1. 現在coreを退避
2. 最新B1Dのbeforeバックアップがあればそこへ戻す
3. 旧B1/B1B/B1C/B1Dブロックを除去
4. B1Eの最小ボタン列だけを追加
5. ボタンは一覧の上部へDOM挿入
6. 押したら確認カードだけ出す
7. 実行ボタンはdisabled
8. DB更新/API POSTなし
9. server再起動
10. ブラウザ起動

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1e_minimal_top_buttons_20260504_105917
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup current and rollback B1D if backup exists
============================================================
BACKUP_CURRENT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1e_minimal_top_buttons_20260504_105917/aicm-production-core.current_before_b1e.js
RESTORE_STATUS=RESTORED_FROM_B1D_BACKUP
RESTORE_FROM=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1d_compact_top_leader_send_panel_20260504_093353/aicm-production-core.before_v10l_b1d.js

============================================================
4. patch core minimal top buttons
============================================================
REMOVED_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS=false
REMOVED_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY=false
REMOVED_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER=true
REMOVED_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR=true
REMOVED_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL=false

BEFORE_B1E_MARKER_COUNT=0
BEFORE_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0
BEFORE_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=2
BEFORE_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=2
BEFORE_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0
AFTER_B1E_MARKER_COUNT=2
AFTER_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0
AFTER_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0
AFTER_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0
AFTER_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0
AFTER_B1E_MOUNT_COUNT=3
AFTER_B1E_BUTTONS_COUNT=1
AFTER_B1E_CONFIRM_COUNT=3
AFTER_B1E_UNSENT_ACTION_COUNT=2
AFTER_B1E_ALL_ACTION_COUNT=2
AFTER_EXEC_DISABLED_COUNT=1
AFTER_NO_API_CALL_IN_B1E_BLOCK=true
PATCH_CHANGED=true
PATCH_DECISION=PATCH_APPLIED

============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10L_B1E_MARKER_COUNT=2
OLD_B1B_MARKER_COUNT=0
OLD_B1C_MARKER_COUNT=0
OLD_B1D_MARKER_COUNT=0
B1E_MOUNT_COUNT=3
B1E_BUTTONS_COUNT=1
B1E_CONFIRM_COUNT=3
B1E_UNSENT_ACTION_COUNT=2
B1E_ALL_ACTION_COUNT=2
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1E_BLOCK_COUNT=0
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
FINAL_JUDGEMENT=V10L_B1E_MINIMAL_TOP_BUTTONS_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
V10L_B1E_MARKER_COUNT=2
OLD_B1B_MARKER_COUNT=0
OLD_B1C_MARKER_COUNT=0
OLD_B1D_MARKER_COUNT=0
B1E_MOUNT_COUNT=3
B1E_BUTTONS_COUNT=1
B1E_CONFIRM_COUNT=3
B1E_UNSENT_ACTION_COUNT=2
B1E_ALL_ACTION_COUNT=2
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1E_BLOCK_COUNT=0
SERVED_V10L_B1E_MARKER_COUNT=2
SERVED_OLD_B1B_MARKER_COUNT=0
SERVED_OLD_B1C_MARKER_COUNT=0
SERVED_OLD_B1D_MARKER_COUNT=0
SERVED_B1E_BUTTONS_COUNT=1
SERVED_B1E_UNSENT_ACTION_COUNT=2
SERVED_B1E_ALL_ACTION_COUNT=2
SERVED_EXEC_DISABLED_COUNT=1
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_b1e_20260504_105917
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1e_minimal_top_buttons_20260504_105917/000_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_REPORT.md
BACKUP_CURRENT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1e_minimal_top_buttons_20260504_105917/aicm-production-core.current_before_b1e.js
RESTORE_FROM_FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1e_minimal_top_buttons_20260504_105917/010_restore_source.txt
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1e_minimal_top_buttons_20260504_105917/030_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. Manager大項目一覧の1番上に小さい「課長へ送る」ボタン枠が出る
3. ボタンは「未送信を確認」「全件を確認」だけ
4. でかいカードは出ない
5. 確認を押すと確認カードだけ出る
6. 実行ボタンはdisabledのまま
7. OKならgit checkpoint

Rollback current:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1e_minimal_top_buttons_20260504_105917/aicm-production-core.current_before_b1e.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
