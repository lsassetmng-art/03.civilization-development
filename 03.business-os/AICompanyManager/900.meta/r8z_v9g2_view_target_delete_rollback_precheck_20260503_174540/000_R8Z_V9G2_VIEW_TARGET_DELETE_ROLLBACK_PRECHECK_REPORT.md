============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- UI/context上のManager大項目は38件
- UI削除対象pendingは34件
- 前回precheckはbase table直条件がズレて0件判定になった

今回:
1. core/server syntax確認
2. 削除実行関数とserver routeを再確認
3. UI/view基準で削除候補を1件選ぶ
4. そのIDを使ってbase tableをROLLBACK内でarchived更新
5. ROLLBACK後に永続変更が残っていないことを確認
6. 成功したらブラウザを開く

禁止:
- 永続DB write
- API POST
- PATCH

注意:
- このワンブロック自体は永続削除しない
- 画面で削除確定を押すと実POST/DB更新になる

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g2_view_target_delete_rollback_precheck_20260503_174540
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO
SUCCESS_BROWSER_OPEN=YES

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. static delete path scan
============================================================
grep: Unmatched ( or \(
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g2_view_target_delete_rollback_precheck_20260503_174540/020_core_delete_execute_scan.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g2_view_target_delete_rollback_precheck_20260503_174540/030_server_delete_route_scan.txt
DELETE_OPEN_BUTTON_COUNT=1
DELETE_CONFIRM_STATE_REF_COUNT=7
HAS_DELETE_CONFIRM_CARD_FUNCTION=
HAS_DELETE_EXECUTE_LIKE_FUNCTION=2
SERVER_HAS_MANAGER_UPDATE=1
SERVER_HAS_MANAGER_ARCHIVE=1

============================================================
4. DB rollback using UI/view target
============================================================
SQL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g2_view_target_delete_rollback_precheck_20260503_174540/010_view_target_delete_rollback.out
SQL_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g2_view_target_delete_rollback_precheck_20260503_174540/011_view_target_delete_rollback.err
---- SQL_OUT ----
Pager usage is off.
Output format is aligned.
BEGIN
          check_name          |             check_value              
------------------------------+--------------------------------------
 VIEW_TOTAL_COUNT             | 38
 VIEW_UI_PENDING_COUNT        | 34
 ROLLBACK_DELETE_UPDATE_COUNT | 1
 ROLLBACK_DELETE_TARGET_ID    | 436b26b8-ea94-47d3-847e-69ba7d8e646c
 ROLLBACK_DELETE_TARGET_TITLE | 開発案件全体ロードマップの整備
(5 rows)

ROLLBACK
         check_name          | check_value 
-----------------------------+-------------
 PERSISTENT_PROBE_MARK_COUNT | 0
(1 row)

              check_name              | check_value 
--------------------------------------+-------------
 VIEW_UI_PENDING_COUNT_AFTER_ROLLBACK | 34
(1 row)

VIEW_TOTAL_COUNT=34
VIEW_UI_PENDING_COUNT=1
ROLLBACK_UPDATE_COUNT=0
PERSISTENT_PROBE_MARK_COUNT=999
VIEW_UI_PENDING_AFTER=0

============================================================
5. server reachability
============================================================
ROOT_HTTP=200

============================================================
6. final / browser open
============================================================
FINAL_JUDGEMENT=VIEW_TARGET_FOUND_BUT_BASE_UPDATE_MISSED_CHECK_ID_MAPPING
VIEW_TOTAL_COUNT=34
VIEW_UI_PENDING_COUNT=1
ROLLBACK_UPDATE_COUNT=0
PERSISTENT_PROBE_MARK_COUNT=999
VIEW_UI_PENDING_AFTER=0
DELETE_OPEN_BUTTON_COUNT=1
HAS_DELETE_CONFIRM_CARD_FUNCTION=
HAS_DELETE_EXECUTE_LIKE_FUNCTION=2
SERVER_HAS_MANAGER_UPDATE=1
SERVER_HAS_MANAGER_ARCHIVE=1
ROOT_HTTP=200
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9g2_20260503_174540
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g2_view_target_delete_rollback_precheck_20260503_174540/000_R8Z_V9G2_VIEW_TARGET_DELETE_ROLLBACK_PRECHECK_REPORT.md
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 削除確認カードを出す
3. 削除確定ボタンを押す

期待:
- 実POSTされる
- 対象Manager大項目が archived 扱いになる
- 台帳から1件消える
- エラーが出たら表示文言を貼る
