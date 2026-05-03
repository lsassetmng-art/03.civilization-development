# AICompanyManager Phase AWP fix API fallthrough return true report

## Result
- FINAL_STATUS=API_FALLTHROUGH_RETURN_TRUE_FIX_READY_MANUAL_SAVE_TEST_REQUIRED
- PASS_COUNT=13
- WARN_COUNT=1
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- index.html change: NO
- clean core change: NO
- server change: YES
- headersSent masking guard: NO
- organization alias patch: NO

## Root cause
Some handleApi branches sent a JSON response and then used bare return;.
Because createServer checks "if (await handleApi(...))", bare return produced undefined, allowing the request to fall through to serveStatic().
The static response attempted to write headers again, causing ERR_HTTP_HEADERS_SENT.

## Fix
- replacementCount=11
- remainingBadCount=0
- converted API response branch termination from return; to return true;

## Organization / section note
- CORE_SECTION_REF_COUNT=1
- SERVER_SECTION_ROUTE_COUNT=1
- CORE_ORG_REF_COUNT=0
- SERVER_ORG_ROUTE_COUNT=0
- No organization/update alias was added in this phase.
- If 組織変更 is internally 課変更, section/update remains the canonical route.
- If UI truly calls organization/update, add a dedicated route only after confirming responsibility.

## HTTP
- INDEX_HTTP_CODE=200
- CONTEXT_HTTP_CODE=500

## Open URL
- http://127.0.0.1:8794/?v=20260501_045553_api_return_true

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_api_fallthrough_return_true_20260501_045553/aicm-local-ui-api-server.before_api_return_true_fix.mjs
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_api_fallthrough_return_true_20260501_045553/040_server.log
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_api_fallthrough_return_true_20260501_045553/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_api_fallthrough_return_true_20260501_045553/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_api_fallthrough_return_true_20260501_045553/030_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_api_fallthrough_return_true_20260501_045553/050_http_check.txt

## Manual test
1. Open URL.
2. Test 会社変更 save.
3. Test 部変更 save.
4. Test 課変更 save.
5. Test 組織変更 if present.
6. If connection drops, run:
   tail -n 180 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_api_fallthrough_return_true_20260501_045553/040_server.log"
   pgrep -f "aicm-local-ui-api-server.mjs" || true
   curl -sS -I "http://127.0.0.1:8794/" || true

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_api_fallthrough_return_true_20260501_045553/aicm-local-ui-api-server.before_api_return_true_fix.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
