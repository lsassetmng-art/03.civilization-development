============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 課長へ送る確認カードは表示OK
- 「確認して課長へ送る」が効かない
- 削除も確認/実行経路を同時に確認する

今回:
1. core/server syntax確認
2. served core一致確認
3. 課長へ送る確定ボタンの経路確認
4. 削除ボタン/削除確認/削除実行の経路確認
5. server側 route確認
6. 次の最小修正方針を判定

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
PHASE=R8Z-V9F5B leader handoff execute and delete path isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f5b_execute_and_delete_path_isolate_20260503_112818
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. served core
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=83b28f9d40f23e52b424850642ba603bf6b53d34cfb14c74bb62ef6ee7c3d78e
SERVED_SHA=83b28f9d40f23e52b424850642ba603bf6b53d34cfb14c74bb62ef6ee7c3d78e
PASS: served core matches disk

============================================================
4. extract execute/delete path
============================================================
EXTRACT_TXT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f5b_execute_and_delete_path_isolate_20260503_112818/020_execute_delete_path_extract.txt
SERVER_ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f5b_execute_and_delete_path_isolate_20260503_112818/040_server_route_scan.txt

============================================================
5. classification
============================================================
HAS_LEADER_EXECUTE_FUNCTION=false
LEADER_EXECUTE_USES_CONFIRM_STATE=false
LEADER_EXECUTE_USES_MANAGER_UPDATE_ENDPOINT=false
HAS_V9F4B_LEADER_EXECUTE_BUTTON=true
BRIDGE_HANDLES_V9F4B_LEADER_EXECUTE=true
BRIDGE_CALLS_LEADER_EXECUTE_FUNCTION=true
SERVER_HAS_MANAGER_MAJOR_UPDATE_ROUTE=true
LEADER_SUGGESTED_NEXT=
RESTORE_LEADER_EXECUTE_FUNCTION_ONLY

DELETE_OPEN_BUTTON_COUNT=1
DELETE_CONFIRM_STATE_REF_COUNT=7
HAS_DELETE_CONFIRM_CARD_FUNCTION=true
HAS_DELETE_OPEN_LIKE_FUNCTION=true
HAS_DELETE_EXECUTE_LIKE_FUNCTION=true
SERVER_HAS_MANAGER_MAJOR_ARCHIVE_OR_UPDATE_ROUTE=true
DELETE_SUGGESTED_NEXT=
DELETE_STATIC_PATH_EXISTS_NEXT_RUNTIME_DEBUG_OR_ROLLBACK_SMOKE

EXTRACT_TXT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f5b_execute_and_delete_path_isolate_20260503_112818/020_execute_delete_path_extract.txt
SERVER_ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f5b_execute_and_delete_path_isolate_20260503_112818/040_server_route_scan.txt

============================================================
DONE
============================================================
HAS_LEADER_EXECUTE_FUNCTION=false
LEADER_EXECUTE_USES_CONFIRM_STATE=false
LEADER_EXECUTE_USES_MANAGER_UPDATE_ENDPOINT=false
HAS_V9F4B_LEADER_EXECUTE_BUTTON=true
BRIDGE_HANDLES_V9F4B_LEADER_EXECUTE=true
BRIDGE_CALLS_LEADER_EXECUTE_FUNCTION=true
SERVER_HAS_MANAGER_MAJOR_UPDATE_ROUTE=true
LEADER_SUGGESTED_NEXT=
RESTORE_LEADER_EXECUTE_FUNCTION_ONLY

DELETE_OPEN_BUTTON_COUNT=1
DELETE_CONFIRM_STATE_REF_COUNT=7
HAS_DELETE_CONFIRM_CARD_FUNCTION=true
HAS_DELETE_OPEN_LIKE_FUNCTION=true
HAS_DELETE_EXECUTE_LIKE_FUNCTION=true
SERVER_HAS_MANAGER_MAJOR_ARCHIVE_OR_UPDATE_ROUTE=true
DELETE_SUGGESTED_NEXT=
DELETE_STATIC_PATH_EXISTS_NEXT_RUNTIME_DEBUG_OR_ROLLBACK_SMOKE

EXTRACT_TXT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f5b_execute_and_delete_path_isolate_20260503_112818/020_execute_delete_path_extract.txt
SERVER_ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f5b_execute_and_delete_path_isolate_20260503_112818/040_server_route_scan.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f5b_execute_and_delete_path_isolate_20260503_112818/000_R8Z_V9F5B_EXECUTE_AND_DELETE_PATH_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
