============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- Manager大項目を課長へ送るUI

現在位置:
- V10L-B0 audit PASS
- V10L-B1B patch は成功
- ただし画面に「全件」「未送信推定」「選択送信」パネルが出ていない
- 原因はhookしたrendererが実表示経路に乗っていない可能性が高い

今回:
1. core/server syntax確認
2. core backup
3. B1Bの確認UIロジックは残す
4. DOM後挿入で task-ledger 画面に課長送信パネルを強制表示
5. 「未送信推定」「選択」「全件」確認ボタンを表示
6. 実行ボタンは disabled のまま
7. API POSTなし
8. server再起動
9. ブラウザ起動

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1c_ledger_multi_send_dom_injector_20260504_080229
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1c_ledger_multi_send_dom_injector_20260504_080229/aicm-production-core.before_v10l_b1c.js

============================================================
4. patch core DOM injector
============================================================
REMOVED_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR=false

BEFORE_B1C_MARKER_COUNT=0
BEFORE_B1B_MARKER_COUNT=2
BEFORE_B1B_PANEL_COUNT=3
BEFORE_B1B_CHECKBOX_COUNT=2
BEFORE_REQUEST_JSON_B1B_BLOCK_COUNT=9
AFTER_B1C_MARKER_COUNT=2
AFTER_DOM_INJECTOR_COUNT=1
AFTER_B1C_MOUNT_COUNT=1
AFTER_B1B_PANEL_COUNT=5
AFTER_B1B_ACTION_UNSENT_COUNT=3
AFTER_B1B_ACTION_ALL_COUNT=3
AFTER_EXEC_DISABLED_COUNT=1
AFTER_NO_POST_IN_B1C_BLOCK=true
PATCH_CHANGED=true
PATCH_DECISION=PATCH_APPLIED

============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10L_B1C_MARKER_COUNT=2
B1C_INJECT_FN_COUNT=1
B1C_MOUNT_COUNT=1
B1B_PANEL_COUNT=5
B1B_CONFIRM_UNSENT_COUNT=3
B1B_CONFIRM_ALL_COUNT=3
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1C_BLOCK_COUNT=0
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
FINAL_JUDGEMENT=V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
V10L_B1C_MARKER_COUNT=2
B1C_INJECT_FN_COUNT=1
B1C_MOUNT_COUNT=1
B1B_PANEL_COUNT=5
B1B_CONFIRM_UNSENT_COUNT=3
B1B_CONFIRM_ALL_COUNT=3
EXEC_DISABLED_COUNT=1
REQUEST_JSON_IN_B1C_BLOCK_COUNT=0
SERVED_V10L_B1C_MARKER_COUNT=2
SERVED_B1C_INJECT_FN_COUNT=1
SERVED_B1B_CONFIRM_UNSENT_COUNT=3
SERVED_B1B_CONFIRM_ALL_COUNT=3
SERVED_EXEC_DISABLED_COUNT=1
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_b1c_20260504_080229
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1c_ledger_multi_send_dom_injector_20260504_080229/000_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1c_ledger_multi_send_dom_injector_20260504_080229/aicm-production-core.before_v10l_b1c.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1c_ledger_multi_send_dom_injector_20260504_080229/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 下の方に「Manager大項目を課長へ送る」カードが出る
3. 「未送信推定をまとめて課長へ送る確認」が出る
4. 「全件を課長へ送る確認」が出る
5. Manager大項目のチェックボックスが出る
6. 確認ボタンを押すとDB更新前確認カードが出る
7. 「課長へ送る実行（次工程）」は disabled のまま
8. OKなら git checkpoint
9. 次工程 V10L-B2 で rollback smoke 後に実POST解放

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1c_ledger_multi_send_dom_injector_20260504_080229/aicm-production-core.before_v10l_b1c.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
