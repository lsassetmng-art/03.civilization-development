============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- Manager大項目
- 課長/Leaderへ送るUI

現在位置:
- V10L-B0 audit PASS
- V10L-B1 は renderTaskLedger exact match 前提で停止
- 実レンダラー候補:
  - aicmRenderTaskLedgerSafeR8V4
  - renderTaskLedgerPlaceholder
- 今回は実レンダラー候補にhookして、課長送信の確認UIだけ追加する

今回:
1. core/server syntax確認
2. DB read-onlyで件数再確認
3. core backup
4. aicmRenderTaskLedgerSafeR8V4 を優先してhook
5. 部門別タスク台帳画面に課長送信パネルを追加
6. Manager大項目ごとにチェックボックスを出す
7. 選択/未送信推定/全件 の確認カードを出す
8. この工程では実POSTしない
9. server再起動
10. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- runLeaderAutoDecomposition API変更
- 既存レビュー機能への変更
- 確認画面を飛ばす実行ボタン

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1b_ledger_multi_send_actual_renderer_20260504_075945
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. DB readonly counts
============================================================
manager_major_count	38
leader_middle_count	4
worker_work_unit_count	4
major_with_existing_middle	4
middle_duplicate_groups	0
worker_duplicate_groups	0

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1b_ledger_multi_send_actual_renderer_20260504_075945/aicm-production-core.before_v10l_b1b.js

============================================================
5. patch core actual renderer hook
============================================================
REMOVED_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER=false

BEFORE_MARKER_COUNT=0
BEFORE_OLD_B1_MARKER_COUNT=0
HAS_aicmRenderTaskLedgerSafeR8V4=true
HAS_renderTaskLedgerPlaceholder=true
HAS_aicmOpenTaskLedgerScreenR8V3Clean=true
LEADER_AUTO_ROUTE_COUNT=1
AFTER_MARKER_COUNT=2
AFTER_CONFIRM_ONLY_TEXT_COUNT=1
AFTER_EXEC_DISABLED_COUNT=1
AFTER_CHECKBOX_COUNT=2
AFTER_PANEL_COUNT=3
AFTER_NO_POST_ROUTE_CALL_IN_BLOCK=true
PATCH_CHANGED=true
PATCH_DECISION=PATCH_APPLIED

============================================================
6. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
7. verify
============================================================
V10L_B1B_MARKER_COUNT=2
CONFIRM_ONLY_TEXT_COUNT=1
EXEC_DISABLED_COUNT=1
CHECKBOX_MARKER_COUNT=2
PANEL_MARKER_COUNT=3
LEADER_AUTO_ROUTE_COUNT=2
REQUEST_JSON_IN_V10L_BLOCK_COUNT=0
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
8. restart server
============================================================

============================================================
9. final
============================================================
FINAL_JUDGEMENT=V10L_B1B_LEDGER_MULTI_SEND_CONFIRM_ONLY_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
V10L_B1B_MARKER_COUNT=2
CONFIRM_ONLY_TEXT_COUNT=1
EXEC_DISABLED_COUNT=1
CHECKBOX_MARKER_COUNT=2
PANEL_MARKER_COUNT=3
LEADER_AUTO_ROUTE_COUNT=2
REQUEST_JSON_IN_V10L_BLOCK_COUNT=0
SERVED_V10L_B1B_MARKER_COUNT=2
SERVED_CONFIRM_ONLY_TEXT_COUNT=1
SERVED_EXEC_DISABLED_COUNT=1
SERVED_PANEL_MARKER_COUNT=3
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_b1b_20260504_075945
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1b_ledger_multi_send_actual_renderer_20260504_075945/000_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1b_ledger_multi_send_actual_renderer_20260504_075945/aicm-production-core.before_v10l_b1b.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1b_ledger_multi_send_actual_renderer_20260504_075945/020_patch_analysis.txt
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1b_ledger_multi_send_actual_renderer_20260504_075945/070_db_readonly_counts.tsv
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 「Manager大項目を課長へ送る」カードが出る
3. Manager大項目 / 課長送信済み推定 / 未送信推定 / Leader中項目 / Worker作業単位 が出る
4. Manager大項目のチェックボックスが出る
5. 「未送信推定をまとめて課長へ送る確認」を押す
6. DB更新前確認カードが出る
7. 「課長へ送る実行（次工程）」は disabled であること
8. API POSTされないこと
9. OKなら git checkpoint
10. 次工程 V10L-B2 で rollback smoke 後に実POST解放

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1b_ledger_multi_send_actual_renderer_20260504_075945/aicm-production-core.before_v10l_b1b.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
