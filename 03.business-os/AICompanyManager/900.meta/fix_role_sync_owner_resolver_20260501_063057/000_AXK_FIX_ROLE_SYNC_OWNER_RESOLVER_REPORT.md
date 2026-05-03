# AICompanyManager Phase AXK role sync owner resolver fix report

## Result
- FINAL_STATUS=ROLE_SYNC_OWNER_RESOLVER_FIXED_READY
- PASS_COUNT=16
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- server code change: NO
- index.html change: NO
- clean core change: YES

## Root cause
Rollback smoke passed, so DB/server SQL path is valid.
Client sync path used undefined ownerId(), causing robot-selected saves to fail before/inside placement sync.

## Fix
- Replaced ownerId() with existing owner resolver:
  - aicmAvdOwnerId()
  - fallback state.ownerCivilizationId

## Metrics
- CORE_CHANGED=true
- MARKER_COUNT=1
- OWNER_ID_CALL_COUNT=0
- AICM_AVD_OWNER_ID_COUNT=6
- SYNC_FUNCTION_COUNT=1
- SYNC_ENDPOINT_COUNT=1

## HTTP
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_063057_owner_resolver_fixed
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/aicm-production-core.before_axk_owner_resolver.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/030_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/050_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/040_server.log

## Manual test
1. UIを開く。
2. AI企業変更。
3. 社長ロボットを選択。
4. 変更を保存。
5. 確認画面。
6. 確定して保存。
7. 保存後に落ちないこと。
8. 必要なら部長/課長/従業員も同じ順で確認。

## If still failing
tail -n +1 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/030_scan.txt"
tail -n 260 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/040_server.log"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_role_sync_owner_resolver_20260501_063057/aicm-production-core.before_axk_owner_resolver.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
