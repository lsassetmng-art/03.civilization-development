============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 台帳表示: OK
- 課長へ送る: OK
- 削除確認カード: OK
- 削除確定: NG

今回:
1. core/server syntax確認
2. core backup
3. 削除確認カード内の実行ボタン action を広めに拾う click bridge を追加
4. 既存削除execute関数があればそれを呼ぶ
5. 既存execute関数名が揺れても fallback で manager-major/update へ archived 更新する
6. server再起動
7. 成功したら画面自動起動

禁止:
- patch実行中のDB write
- patch実行中のAPI POST
- server patch
- render関数全体置換
- レビュー待ち側の追加変更

注意:
- 画面で削除確定を押すと実POST/DB更新されます。

============================================================
1. ENV
============================================================
PHASE=R8Z-V9G5 restore delete confirm execute bridge only
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g5_restore_delete_confirm_execute_bridge_20260503_180001
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g5_restore_delete_confirm_execute_bridge_20260503_180001/aicm-production-core.before_r8z_v9g5.js

============================================================
4. patch delete execute bridge only
============================================================
PATCH_APPLIED: inserted before /* AICM_R8Z_V9F6_RESTORE_LEADER_HANDOFF_EXECUTE_ONLY

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V9G5_MARKER_COUNT=1
HAS_V9G5_BRIDGE=true
HAS_V9G5_EXECUTE_FUNCTION=true
V9G5_USES_DELETE_STATE=true
V9G5_USES_MANAGER_UPDATE_ENDPOINT=true
V9G5_HANDLES_TEXT_LABEL_FALLBACK=true
V9G5_HANDLES_CANCEL=true
SERVER_PATCH_EXPECTED=NO

============================================================
7. snippet
============================================================
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g5_restore_delete_confirm_execute_bridge_20260503_180001/030_core_v9g5_snip.txt

============================================================
8. restart server
============================================================
ROOT_HTTP=200

============================================================
9. served core verify
============================================================
SERVED_HTTP=200
DISK_SHA=aec15e697f3a860f3ad26ae94ddfbd2a3de8b600e21d2381f21f5b284b42af73
SERVED_SHA=aec15e697f3a860f3ad26ae94ddfbd2a3de8b600e21d2381f21f5b284b42af73
SERVED_V9G5_MARKER_COUNT=1

============================================================
10. final / browser open
============================================================
FINAL_JUDGEMENT=V9G5_DELETE_CONFIRM_EXECUTE_BRIDGE_READY_BROWSER_OPENED
V9G5_MARKER_COUNT=1
HAS_V9G5_BRIDGE=true
HAS_V9G5_EXECUTE_FUNCTION=true
V9G5_USES_DELETE_STATE=true
V9G5_USES_MANAGER_UPDATE_ENDPOINT=true
V9G5_HANDLES_TEXT_LABEL_FALLBACK=true
V9G5_HANDLES_CANCEL=true
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V9G5_MARKER_COUNT=1
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9g5_20260503_180001
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g5_restore_delete_confirm_execute_bridge_20260503_180001/000_R8Z_V9G5_RESTORE_DELETE_CONFIRM_EXECUTE_BRIDGE_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g5_restore_delete_confirm_execute_bridge_20260503_180001/aicm-production-core.before_r8z_v9g5.js
DB_WRITE=NO_DURING_PATCH
API_POST=NO_DURING_PATCH
USER_CLICK_DELETE_CONFIRM_POSTS_API=YES
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 削除確認カードを出す
3. 削除を確定する

期待:
- 実POSTされる
- 成功メッセージが出る
- 対象Manager大項目が台帳から1件消える

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g5_restore_delete_confirm_execute_bridge_20260503_180001/aicm-production-core.before_r8z_v9g5.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
