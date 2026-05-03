# AICompanyManager Phase AWM restart after change crash report

## Result
- FINAL_STATUS=RESTART_READY_CHANGE_CRASH_CAPTURE_ENABLED
- PASS_COUNT=11
- WARN_COUNT=1
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- index.html change: NO
- clean core change: NO
- server file change: NO

## Server
- SERVER_PID=7508
- PORT=8794
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_090600_restart

## HTTP
- INDEX_HTTP_CODE=200
- CONTEXT_HTTP_CODE=500

## Route counts
- COMPANY_ROUTE_COUNT=1
- DEPARTMENT_ROUTE_COUNT=1
- SECTION_ROUTE_COUNT=1
- ORG_ROUTE_COUNT=1

## Files
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_after_change_crash_20260501_090600/040_server.log
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_after_change_crash_20260501_090600/010_route_scan.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_after_change_crash_20260501_090600/020_node_check.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_after_change_crash_20260501_090600/030_http_check.txt

## Next manual check
1. Open OPEN_URL.
2. Execute company/department/section change from UI.
3. If connection drops again, immediately run:

```bash
tail -n 120 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_after_change_crash_20260501_090600/040_server.log"
pgrep -f "aicm-local-ui-api-server.mjs" || true
curl -sS -I "http://127.0.0.1:8794/" || true
```

## Organization note
- If UI uses 組織変更 endpoint name, organization/update route is required.
- If UI uses 課変更 endpoint name, section/update is the current canonical route.
- Current ORG_ROUTE_COUNT=1
