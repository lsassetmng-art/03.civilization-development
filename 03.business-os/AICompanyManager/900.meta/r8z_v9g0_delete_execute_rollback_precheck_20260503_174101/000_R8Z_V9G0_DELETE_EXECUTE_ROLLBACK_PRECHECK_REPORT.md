============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 台帳表示: OK
- 課長へ送る: OK
- 削除確認カード: 既に表示OK

今回:
1. core/server syntax確認
2. 削除ボタン/削除実行関数/server routeを再確認
3. DB上で削除相当 update をROLLBACK内で実行
4. ROLLBACK後に永続変更が残っていないことを確認
5. 成功したらブラウザを開く

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
PHASE=R8Z-V9G0 delete execute rollback precheck
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g0_delete_execute_rollback_precheck_20260503_174101
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO
SUCCESS_BROWSER_OPEN=YES

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. core delete path scan
============================================================
grep: Unmatched ( or \(
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g0_delete_execute_rollback_precheck_20260503_174101/020_core_delete_execute_scan.txt
DELETE_OPEN_BUTTON_COUNT=1
DELETE_CONFIRM_STATE_REF_COUNT=7
HAS_DELETE_CONFIRM_CARD_FUNCTION=
HAS_DELETE_EXECUTE_LIKE_FUNCTION=2

============================================================
4. server route scan
============================================================
grep: Unmatched ( or \(
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g0_delete_execute_rollback_precheck_20260503_174101/030_server_delete_route_scan.txt
SERVER_HAS_MANAGER_UPDATE=1
SERVER_HAS_MANAGER_ARCHIVE=1
SERVER_HAS_ARCHIVE_FUNCTION=

============================================================
5. DB rollback delete precheck
============================================================
SQL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g0_delete_execute_rollback_precheck_20260503_174101/010_delete_rollback_precheck.out
SQL_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g0_delete_execute_rollback_precheck_20260503_174101/011_delete_rollback_precheck.err
---- SQL_OUT ----
Pager usage is off.
Output format is aligned.
BEGIN
          check_name          |       check_value        
------------------------------+--------------------------
 ROLLBACK_DELETE_UPDATE_COUNT | 1
 ROLLBACK_DELETE_TARGET_TITLE | Leader引き継ぎ方針の整備
(2 rows)

ROLLBACK
         check_name          | check_value 
-----------------------------+-------------
 PERSISTENT_PROBE_MARK_COUNT | 0
(1 row)

           check_name           | check_value 
--------------------------------+-------------
 VISIBLE_UNARCHIVED_MAJOR_COUNT | 37
(1 row)

ROLLBACK_UPDATE_COUNT=0
PERSISTENT_PROBE_MARK_COUNT=999
VISIBLE_UNARCHIVED_MAJOR_COUNT=0

============================================================
6. server reachability / served core
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server
ROOT_HTTP=000
SERVED_HTTP=000
DISK_SHA=a8a5d80088500b07cc1dcdb0e7e2c3cac104403f8cafd3aa5d308ff1632002e5
SERVED_SHA=
WARN: server may need restart
ROOT_HTTP_AFTER_RESTART=200
SERVED_HTTP_AFTER_RESTART=200
SERVED_SHA_AFTER_RESTART=a8a5d80088500b07cc1dcdb0e7e2c3cac104403f8cafd3aa5d308ff1632002e5

============================================================
7. final / browser open
============================================================
FINAL_JUDGEMENT=NO_DELETE_TARGET_FOUND_OR_ALREADY_ARCHIVED
ROLLBACK_UPDATE_COUNT=0
PERSISTENT_PROBE_MARK_COUNT=999
VISIBLE_UNARCHIVED_MAJOR_COUNT=0
DELETE_OPEN_BUTTON_COUNT=1
DELETE_CONFIRM_STATE_REF_COUNT=7
HAS_DELETE_CONFIRM_CARD_FUNCTION=
HAS_DELETE_EXECUTE_LIKE_FUNCTION=2
SERVER_HAS_MANAGER_UPDATE=1
SERVER_HAS_MANAGER_ARCHIVE=1
SERVER_HAS_ARCHIVE_FUNCTION=
ROOT_HTTP=200
SERVED_HTTP=200
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9g0_20260503_174101
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g0_delete_execute_rollback_precheck_20260503_174101/000_R8Z_V9G0_DELETE_EXECUTE_ROLLBACK_PRECHECK_REPORT.md
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 削除確認カードが出ることを確認
3. 削除確定ボタンを押す

期待:
- 実POSTされる
- 対象Manager大項目が archived 扱いになる
- 台帳から非表示になる
- エラーが出たらスクショか表示文言を貼る

注意:
- ここから先は実削除/実アーカイブです。
