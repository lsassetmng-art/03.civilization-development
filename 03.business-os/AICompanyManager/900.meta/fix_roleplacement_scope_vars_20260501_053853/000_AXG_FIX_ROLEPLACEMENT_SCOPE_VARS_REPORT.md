# AICompanyManager Phase AXG fix rolePlacement scope vars report

## Result
- FINAL_STATUS=ROLEPLACEMENT_SCOPE_FIX_FAILED_REVIEW_REQUIRED
- PASS_COUNT=12
- WARN_COUNT=0
- FAIL_COUNT=3

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- index.html change: NO
- clean core change: YES

## Root cause candidate
AXC-R2 inserted rolePlacements builder calls using variables that may not exist inside save functions:
- company
- department
- section

This can break 社長/部長/課長/従業員 save buttons before the confirmation screen.

## Fix
rolePlacements builders now receive minimal objects built from the existing body payload IDs.

## Metrics
- CORE_CHANGED=true
- MARKER_COUNT=3
- COMPANY_OLD_SCOPE_COUNT=1
- DEPARTMENT_OLD_SCOPE_COUNT=1
- SECTION_OLD_SCOPE_COUNT=1
- ROLE_PLACEMENTS_COUNT=3

## HTTP
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## Open URL
- http://127.0.0.1:8794/?v=20260501_053853_scope_fix

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_roleplacement_scope_vars_20260501_053853/aicm-production-core.before_axg_scope_fix.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_roleplacement_scope_vars_20260501_053853/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_roleplacement_scope_vars_20260501_053853/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_roleplacement_scope_vars_20260501_053853/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_roleplacement_scope_vars_20260501_053853/040_server.log

## Manual test order
1. AI企業変更:
   - 社長ロボットを変更
   - 変更を保存
   - 確認画面が出ること
2. 部門変更:
   - 変更ボタンで編集画面へ入れること
   - 部長ロボットを変更
   - 変更を保存
   - 確認画面が出ること
3. 課変更:
   - 変更ボタンで編集画面へ入れること
   - 課長/従業員を変更
   - 変更を保存
   - 確認画面が出ること

## If still not working
Paste:
tail -n +1 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_roleplacement_scope_vars_20260501_053853/030_scan.txt"
tail -n 260 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_roleplacement_scope_vars_20260501_053853/040_server.log"

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_roleplacement_scope_vars_20260501_053853/aicm-production-core.before_axg_scope_fix.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
