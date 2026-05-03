============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 削除確認カード: OK
- 削除確定: NG
- V9G8は構文失敗でrollback済み
- 現状はV9G5内で旧executeを先に呼び、fallback更新に到達しない疑い

今回:
1. core/server syntax確認
2. core backup
3. V9G5 execute関数内だけを対象にする
4. 旧execute呼び出し条件だけを false && に変更
5. 旧execute関数本体は削除しない
6. V9G5 fallback の /api/aicm/v2/manager-major/update を正本実行にする
7. server再起動
8. 成功したら画面自動起動

禁止:
- patch実行中のDB write
- patch実行中のAPI POST
- server patch
- 旧execute関数削除
- render関数全体置換
- レビュー待ち側の追加変更

注意:
- 画面で削除確定を押すと実POST/DB更新されます。

============================================================
1. ENV
============================================================
PHASE=R8Z-V9G8B delete execute legacy guard disable
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8b_delete_execute_legacy_guard_disable_20260503_180921
DB_WRITE=NO_DURING_PATCH
API_POST=NO_DURING_PATCH
USER_CLICK_DELETE_CONFIRM_POSTS_API=YES
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8b_delete_execute_legacy_guard_disable_20260503_180921/aicm-production-core.before_r8z_v9g8b.js

============================================================
4. patch V9G5 legacy guards only
============================================================
PATCH_APPLIED: V9G5 legacy guards disabled only
OLD1_GUARD_FOUND=true
OLD2_GUARD_FOUND=true

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V9G8B_MARKER_COUNT=3
HAS_V9G5_EXECUTE_SEGMENT=true
V9G5_SEGMENT_HAS_MANAGER_UPDATE=true
V9G5_OLD1_DISABLED_GUARD=true
V9G5_OLD2_DISABLED_GUARD=true
V9G5_OLD1_ACTIVE_GUARD=false
V9G5_OLD2_ACTIVE_GUARD=false
OLD_EXECUTE_1_STILL_EXISTS=true
OLD_EXECUTE_2_STILL_EXISTS=false
SERVER_PATCH_EXPECTED=NO

============================================================
7. snippet
============================================================
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8b_delete_execute_legacy_guard_disable_20260503_180921/030_core_v9g8b_snip.txt

============================================================
8. restart server
============================================================
ROOT_HTTP=200

============================================================
9. served core verify
============================================================
SERVED_HTTP=200
DISK_SHA=a77bdc410d97023f3b4c16d2c8ea736336f8fda09582f2d0e27967625b56e11f
SERVED_SHA=a77bdc410d97023f3b4c16d2c8ea736336f8fda09582f2d0e27967625b56e11f
SERVED_V9G8B_MARKER_COUNT=3

============================================================
10. final / browser open
============================================================
FINAL_JUDGEMENT=V9G8B_LEGACY_GUARDS_DISABLED_BROWSER_OPENED
V9G8B_MARKER_COUNT=3
HAS_V9G5_EXECUTE_SEGMENT=true
V9G5_SEGMENT_HAS_MANAGER_UPDATE=true
V9G5_OLD1_DISABLED_GUARD=true
V9G5_OLD2_DISABLED_GUARD=true
V9G5_OLD1_ACTIVE_GUARD=false
V9G5_OLD2_ACTIVE_GUARD=false
OLD_EXECUTE_1_STILL_EXISTS=true
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V9G8B_MARKER_COUNT=3
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9g8b_20260503_180921
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8b_delete_execute_legacy_guard_disable_20260503_180921/000_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8b_delete_execute_legacy_guard_disable_20260503_180921/aicm-production-core.before_r8z_v9g8b.js
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
- 旧executeは条件 false でスキップされる
- V9G5 fallback の /api/aicm/v2/manager-major/update が実行される
- 成功メッセージが出る
- 台帳から1件消える

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8b_delete_execute_legacy_guard_disable_20260503_180921/aicm-production-core.before_r8z_v9g8b.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
