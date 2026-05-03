# AICompanyManager Phase AXQ robot option availability label

## Result
- FINAL_STATUS=ROBOT_OPTION_AVAILABILITY_LABEL_READY
- PASS_COUNT=19
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- index.html change: NO
- clean core change: YES

## Fix
- unlimited_assignment_flag=true displays 利用可能:無制限
- finite quantity displays 利用可能:<count>
- finite zero displays 利用不可 and option is disabled unless already selected

## HTTP
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_070936_availability_label
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/aicm-production-core.before_axq_availability_label.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/030_scan.txt
- DB_VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/040_db_view_availability_verify.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/060_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/050_server.log

## Manual test
1. UIを開く。
2. 社長/部長/課長/従業員の候補を開く。
3. unlimited対象が「利用可能:無制限」になること。
4. 「利用可能:0」が基本表示されないこと。
5. finite在庫0がある場合は「利用不可」で選択不能になること。

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/aicm-production-core.before_axq_availability_label.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
