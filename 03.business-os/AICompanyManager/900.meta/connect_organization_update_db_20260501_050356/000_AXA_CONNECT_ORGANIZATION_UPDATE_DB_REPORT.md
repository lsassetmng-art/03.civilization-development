# AICompanyManager Phase AXA connect organization update DB report

## Result
- FINAL_STATUS=ORGANIZATION_UPDATE_DB_ROUTE_CONNECTED_MANUAL_SAVE_TEST_REQUIRED
- PASS_COUNT=11
- WARN_COUNT=2
- FAIL_COUNT=0

## Scope
- DB write in script: NO
- API POST in script: NO
- index.html change: NO
- clean core change: NO
- server change: YES
- new DB helper: NO
- new Pool: NO
- wrapper/bridge/debug layer: NO

## Maintainability decision
- Added explicit POST /api/aicm/v2/organization/update route.
- The route delegates to existing updateSection(body).
- This preserves the current AICompanyManager responsibility where user-facing 組織変更 belongs to section/k課 style lower-organization editing.
- No hidden broad alias layer was added.
- If organization and section become separate DB responsibilities later, only this route should be split.

## Patch metrics
- CHANGED=true
- RETURN_TRUE_FIX_CANDIDATE_COUNT=0
- REMAINING_BARE_RETURN_COUNT=0
- ORGANIZATION_ROUTE_COUNT=1
- MARKER_COUNT=1
- CORE_ORG_ENDPOINT_COUNT=0
- CORE_SECTION_ENDPOINT_COUNT=1

## HTTP
- INDEX_HTTP_CODE=200
- CONTEXT_HTTP_CODE=500

## Open URL
- http://127.0.0.1:8794/?v=20260501_050356_organization_update_connected

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/aicm-local-ui-api-server.before_organization_update_connect.mjs
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/040_server.log
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/030_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/050_http_check.txt

## Manual DB save test
DB書込は画面操作でのみ実施すること。

1. Open URL.
2. 組織変更画面を開く。
3. 入力変更。
4. 変更を保存。
5. 確認画面の内容を確認。
6. 確定して保存。
7. 保存後、接続が落ちないことを確認。
8. 再読込後、変更が残ることを確認。

## If still not connected
If the UI does not call organization/update or section/update, inspect:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/030_scan.txt

Then patch clean core explicitly, but only after identifying the existing organization save function.
Do not add wrapper/bridge/debug code.

## Crash check
If connection drops:
tail -n 200 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/040_server.log"
pgrep -f "aicm-local-ui-api-server.mjs" || true
curl -sS -I "http://127.0.0.1:8794/" || true

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/connect_organization_update_db_20260501_050356/aicm-local-ui-api-server.before_organization_update_connect.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
