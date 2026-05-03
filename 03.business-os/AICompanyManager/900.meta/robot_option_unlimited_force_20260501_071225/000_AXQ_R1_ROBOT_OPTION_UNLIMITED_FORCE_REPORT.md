# AICompanyManager Phase AXQ-R1 robot option unlimited force

## Result
- FINAL_STATUS=ROBOT_OPTION_UNLIMITED_FORCE_READY
- PASS_COUNT=17
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- index.html change: NO
- clean core change: YES

## Fix
- AICompanyManager robot selector candidates are treated as unlimited allocation.
- All candidates display 利用可能:無制限.
- All candidates remain selectable.
- Eligibility is still controlled by recommended_role_codes filtering.

## Metrics
- MARKER_COUNT=3
- UNLIMITED_LABEL_COUNT=1
- UNAVAILABLE_LABEL_COUNT=0
- ASYNC_ASYNC_COUNT=0

## HTTP
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_071225_unlimited_force
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_unlimited_force_20260501_071225/aicm-production-core.before_axq_r1_unlimited_force.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_unlimited_force_20260501_071225/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_unlimited_force_20260501_071225/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_unlimited_force_20260501_071225/030_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_unlimited_force_20260501_071225/050_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_unlimited_force_20260501_071225/040_server.log

## Manual test
1. 社長/部長/課長/従業員候補を開く。
2. 候補が role ごとに正しく絞り込まれていること。
3. 表示が 利用可能:無制限 になっていること。
4. 候補が選択できること。

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_unlimited_force_20260501_071225/aicm-production-core.before_axq_r1_unlimited_force.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
