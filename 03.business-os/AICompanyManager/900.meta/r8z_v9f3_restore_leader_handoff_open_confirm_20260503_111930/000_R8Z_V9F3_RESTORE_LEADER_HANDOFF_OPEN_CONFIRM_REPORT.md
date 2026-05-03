============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 課長へ送るボタン/action/major_id は存在
- 確認カード関連の文字列/state参照も存在
- ただし open confirm 入口関数が欠落
- レビュー待ち修正はいったん停止中

今回:
1. core/server syntax確認
2. core backup
3. aicmOpenLeaderHandoffConfirmR8S だけを復旧
4. 既存state managerMajorLeaderHandoffConfirm へ対象rowを入れる
5. task-ledgerだけを再描画
6. server再起動
7. 成功したら画面自動起動

禁止:
- DB write
- API POST
- server patch
- 確認カードrendererの新規作成
- render関数全体置換
- レビュー待ち側の追加変更

============================================================
1. ENV
============================================================
PHASE=R8Z-V9F3 restore leader handoff open-confirm function only
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f3_restore_leader_handoff_open_confirm_20260503_111930
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f3_restore_leader_handoff_open_confirm_20260503_111930/aicm-production-core.before_r8z_v9f3.js

============================================================
4. patch open-confirm function only
============================================================
PATCH_APPLIED: inserted before // AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_START

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V9F3_MARKER_COUNT=1
HAS_OPEN_CONFIRM_FUNCTION=true
OPEN_CONFIRM_ASSIGNS_STATE=true
OPEN_CONFIRM_SETS_TASK_LEDGER=true
OPEN_CONFIRM_LOCAL_TASK_LEDGER_RENDER=true
OPEN_CONFIRM_FALLBACK_RENDER=true
BUTTON_ACTION_COUNT=5

============================================================
7. snippet
============================================================
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f3_restore_leader_handoff_open_confirm_20260503_111930/030_core_v9f3_snip.txt

============================================================
8. restart server
============================================================
ROOT_HTTP=200

============================================================
9. served core verify
============================================================
SERVED_HTTP=200
DISK_SHA=7678d9aec8199aecc066cab3ae464288b57a9c956e01b3343c5cf6fc947d4bb7
SERVED_SHA=7678d9aec8199aecc066cab3ae464288b57a9c956e01b3343c5cf6fc947d4bb7
SERVED_V9F3_MARKER_COUNT=1

============================================================
10. final / browser open
============================================================
FINAL_JUDGEMENT=V9F3_OPEN_CONFIRM_FUNCTION_RESTORED_BROWSER_OPENED
V9F3_MARKER_COUNT=1
HAS_OPEN_CONFIRM_FUNCTION=true
OPEN_CONFIRM_ASSIGNS_STATE=true
BUTTON_ACTION_COUNT=5
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V9F3_MARKER_COUNT=1
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9f3_20260503_111930
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f3_restore_leader_handoff_open_confirm_20260503_111930/000_R8Z_V9F3_RESTORE_LEADER_HANDOFF_OPEN_CONFIRM_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f3_restore_leader_handoff_open_confirm_20260503_111930/aicm-production-core.before_r8z_v9f3.js
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. Manager大項目の「課長へ送る」を押す
期待:
- 「課長へ送る確認」カードが出る
- まだDB更新はしない
- 出なければ次はdispatchが aicmOpenLeaderHandoffConfirmR8S を呼んでいるかだけを見る

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f3_restore_leader_handoff_open_confirm_20260503_111930/aicm-production-core.before_r8z_v9f3.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
