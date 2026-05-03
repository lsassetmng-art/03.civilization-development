# AICompanyManager Phase AXC-R2 role settings DB connection retry report

## Result
- FINAL_STATUS=ROLE_SETTINGS_DB_CONNECTED_RETRY2_READY_MANUAL_CONFIRM_SAVE_REQUIRED
- PASS_COUNT=17
- WARN_COUNT=1
- FAIL_COUNT=0

## Scope
- DB write in script: NO
- API POST in script: NO
- server change: YES
- clean core change: YES
- index.html change: NO
- new DB table: NO
- new Pool/helper: NO

## Patch metrics
- SERVER_CHANGED=true
- CORE_CHANGED=true
- SERVER_MARKER_COUNT=1
- CORE_MARKER_COUNT=1
- SYNC_ROUTE_COUNT=1
- CORE_SYNC_CALL_COUNT=1
- ROLE_PLACEMENTS_PAYLOAD_COUNT=3
- EXECUTE_SYNC_MARKER_COUNT=1

## HTTP
- INDEX_HTTP_CODE=200
- CONTEXT_HTTP_CODE=500

## Open URL
- http://127.0.0.1:8794/?v=20260501_052729_role_settings_db_retry2

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/aicm-local-ui-api-server.before_axc_r2.mjs
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/aicm-production-core.before_axc_r2.js
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/040_server.log
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/030_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/050_http_check.txt

## Manual save test
DB writes happen only through UI confirmation.

1. Open URL.
2. AI企業変更:
   - 社長ロボットを変更
   - 変更を保存
   - 確認画面
   - 確定して保存
3. 部門変更:
   - 部長ロボットを変更
   - 確認画面
   - 確定して保存
4. 課変更:
   - 課長ロボットを変更
   - 従業員を複数設定
   - 確認画面
   - 確定して保存

## If connection drops
tail -n 260 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/040_server.log"
pgrep -f "aicm-local-ui-api-server.mjs" || true
curl -sS -I "http://127.0.0.1:8794/" || true

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/aicm-local-ui-api-server.before_axc_r2.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_role_settings_db_retry2_20260501_052729/aicm-production-core.before_axc_r2.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
