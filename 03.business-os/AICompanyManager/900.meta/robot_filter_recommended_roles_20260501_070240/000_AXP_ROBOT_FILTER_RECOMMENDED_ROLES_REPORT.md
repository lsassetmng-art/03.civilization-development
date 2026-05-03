# AICompanyManager Phase AXP robot filter recommended role codes

## Result
- FINAL_STATUS=ROBOT_FILTER_RECOMMENDED_ROLE_CODES_READY
- PASS_COUNT=19
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- index.html change: NO
- clean core change: YES

## View source
- business.vw_ai_company_manager_system_robot_selector_options
- recommended_role_codes is canonical selector role source

## Fix
- Replaced aicmRobotMatchesInlineRole with recommended_role_codes based filtering.
- Removed display/model substring inference from this function.

## Expected UI candidates
- 社長: recommended_role_codes contains President
- 部長: recommended_role_codes contains Manager
- 課長: recommended_role_codes contains Leader
- 従業員: recommended_role_codes contains Worker

## Metrics
- MARKER_COUNT=1
- MATCH_FUNCTION_COUNT=1
- RECOMMENDED_ROLE_CODES_COUNT=3
- FUNCTION_USES_TEXT_INDEXOF=false
- FUNCTION_USES_RCODE_FALLBACK=false
- ASYNC_ASYNC_COUNT=0

## HTTP
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_070240_robot_filter
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/aicm-production-core.before_axp_robot_filter.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/030_scan.txt
- DB_VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/040_db_view_verify.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/060_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/050_server.log

## Manual test
1. UIを開く。
2. 社長候補: HD-R5P / BYD2-003 など President 許可のみ。
3. 部長候補: HD-R5 / BYD2-002 / BYD2-003 など Manager 許可のみ。HD-R5P は出ない。
4. 課長候補: HD-R4 / BYD2-001 / BYD2-002 など Leader 許可のみ。General / Origin は出ない。
5. 従業員候補: HD-R3 / BYD1系 / NORN系など Worker 許可のみ。BYD2-003 は出ない。

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/aicm-production-core.before_axp_robot_filter.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
