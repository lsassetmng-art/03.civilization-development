============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 台帳表示: OK
- 課長へ送る確認カード: OK
- 確認して課長へ送る: NG
- 原因: aicmExecuteLeaderHandoffConfirmR8S が欠落
- 削除: 静的経路は存在。今回は触らない

今回:
1. core/server syntax確認
2. core backup
3. aicmExecuteLeaderHandoffConfirmR8S だけ復旧
4. 既存 confirmation state を使って /api/aicm/v2/manager-major/update へPOSTする関数を復旧
5. 成功後に context reload / task-ledger再描画
6. server再起動
7. 成功したら画面自動起動

禁止:
- patch実行中のDB write
- patch実行中のAPI POST
- server patch
- render関数全体置換
- レビュー待ち側の追加変更
- 削除系の追加変更

注意:
- パッチ後に画面で「確認して課長へ送る」を押すと実POST/DB更新されます。

============================================================
1. ENV
============================================================
PHASE=R8Z-V9F6 restore leader handoff execute function only
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f6_restore_leader_handoff_execute_20260503_172408
DB_WRITE=NO_DURING_PATCH
API_POST=NO_DURING_PATCH
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f6_restore_leader_handoff_execute_20260503_172408/aicm-production-core.before_r8z_v9f6.js

============================================================
4. patch execute function only
============================================================
PATCH_APPLIED: inserted before /* AICM_R8Z_V9F4B_CONFIRM_CARD_POST_RENDER_WRAPPER

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V9F6_MARKER_COUNT=1
HAS_EXECUTE_FUNCTION=true
EXECUTE_USES_CONFIRM_STATE=true
EXECUTE_USES_MANAGER_UPDATE_ENDPOINT=true
EXECUTE_USES_REQUEST_JSON_OR_FETCH=true
EXECUTE_CLEARS_CONFIRM_STATE=true
EXECUTE_RELOADS_CONTEXT=true
EXECUTE_RENDER_AFTER=true
BRIDGE_CALLS_EXECUTE_FUNCTION=true
HAS_V9F4B_EXECUTE_BUTTON=true
SERVER_PATCH_EXPECTED=NO

============================================================
7. snippet
============================================================
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f6_restore_leader_handoff_execute_20260503_172408/030_core_v9f6_snip.txt

============================================================
8. restart server
============================================================
ROOT_HTTP=200

============================================================
9. served core verify
============================================================
SERVED_HTTP=200
DISK_SHA=a8a5d80088500b07cc1dcdb0e7e2c3cac104403f8cafd3aa5d308ff1632002e5
SERVED_SHA=a8a5d80088500b07cc1dcdb0e7e2c3cac104403f8cafd3aa5d308ff1632002e5
SERVED_V9F6_MARKER_COUNT=1

============================================================
10. final / browser open
============================================================
FINAL_JUDGEMENT=V9F6_LEADER_EXECUTE_FUNCTION_RESTORED_BROWSER_OPENED
V9F6_MARKER_COUNT=1
HAS_EXECUTE_FUNCTION=true
EXECUTE_USES_CONFIRM_STATE=true
EXECUTE_USES_MANAGER_UPDATE_ENDPOINT=true
EXECUTE_USES_REQUEST_JSON_OR_FETCH=true
EXECUTE_CLEARS_CONFIRM_STATE=true
EXECUTE_RELOADS_CONTEXT=true
EXECUTE_RENDER_AFTER=true
BRIDGE_CALLS_EXECUTE_FUNCTION=true
HAS_V9F4B_EXECUTE_BUTTON=true
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V9F6_MARKER_COUNT=1
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9f6_20260503_172408
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f6_restore_leader_handoff_execute_20260503_172408/000_R8Z_V9F6_RESTORE_LEADER_HANDOFF_EXECUTE_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f6_restore_leader_handoff_execute_20260503_172408/aicm-production-core.before_r8z_v9f6.js
DB_WRITE=NO_DURING_PATCH
API_POST=NO_DURING_PATCH
USER_CLICK_AFTER_PATCH_POSTS_API=YES
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. Manager大項目の「課長へ送る」を押す
3. 確認カードで「確認して課長へ送る」を押す

期待:
- 実POSTされる
- 成功メッセージが出る
- 確認カードが閉じる
- 大項目状態が assigned_to_leader / handed_off へ進む
- Leader自動分解/Worker自動実行が既存関数でつながっていれば後続も動く

削除:
- 今回は触っていない
- 課長へ送る確定確認後、削除は runtime debug / rollback smoke へ進む

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f6_restore_leader_handoff_execute_20260503_172408/aicm-production-core.before_r8z_v9f6.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
