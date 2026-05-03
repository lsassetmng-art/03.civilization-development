# AICompanyManager Phase AXM confirm-save UUID cast fix report

## Result
- FINAL_STATUS=CONFIRM_SAVE_UUID_CAST_FIXED_READY
- PASS_COUNT=21
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB persistent write: NO
- API POST in script: NO
- server code change: YES
- clean core change: YES, minimal error visibility
- index.html change: NO

## Root cause
Latest server log showed:
column "aicm_user_company_department_id" is of type uuid but expression is of type text.

## Fix
- In syncRoleSettings INSERT SELECT:
  - i.aicm_user_company_department_id::uuid
  - i.aicm_user_company_section_id::uuid
  - i.robot_pool_id::uuid

## Metrics
- SERVER_CHANGED=true
- CORE_CHANGED=true
- SERVER_MARKER_COUNT=1
- CORE_MARKER_COUNT=1
- DEPT_UUID_CAST_COUNT=1
- SECTION_UUID_CAST_COUNT=1
- ROBOT_POOL_UUID_CAST_COUNT=1
- ERROR_MESSAGE_THROW_COUNT=1
- ASYNC_ASYNC_COUNT=0

## DB rollback smoke
- ROLLBACK_SMOKE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/050_rollback_smoke.txt

## HTTP
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_063612_uuid_cast_fixed
- TERMUX_OPEN_STATUS=OPENED

## Files
- SERVER_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/aicm-local-ui-api-server.before_axm_uuid_cast.mjs
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/aicm-production-core.before_axm_error_visibility.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/030_scan.txt
- DB_LOOKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/040_db_lookup.txt
- ROLLBACK_SMOKE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/050_rollback_smoke.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/070_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/060_server.log

## Manual test
1. UIを開く。
2. AI企業変更。
3. 社長ロボット選択。
4. 変更を保存。
5. 確認画面。
6. 確定して保存。
7. 保存後にエラーが出ないこと。
8. 次に部長・課長・従業員へ広げる。

## If still failing
tail -n 260 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/060_server.log"
tail -n +1 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/030_scan.txt"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/aicm-local-ui-api-server.before_axm_uuid_cast.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_confirm_save_uuid_cast_20260501_063612/aicm-production-core.before_axm_error_visibility.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
