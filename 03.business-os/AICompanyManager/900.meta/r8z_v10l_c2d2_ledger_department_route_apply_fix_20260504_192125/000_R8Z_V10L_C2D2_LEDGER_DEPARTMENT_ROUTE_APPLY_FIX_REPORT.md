# AICompanyManager V10L-C2D2 ledger department route apply fix report

## Result

FINAL_STATUS=V10L_C2D2_LEDGER_DEPARTMENT_ROUTE_APPLY_FIX_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_PATCH=YES
- SERVER_PATCH=NO
- SERVER_RUNNING_CHECK=YES
- IF_SERVER_DOWN_START=YES
- HTTP_CHECK=YES
- BROWSER_OPEN=YES

## What changed

- Department is derived from selected Manager major ledger rows.
- Route apply action names are unified under existing manager-major-card prefix.
- Old C2C/C2C3/C2C4/C2D section apply action branches are removed from handleAction.
- Route picker uses card-prefixed action names.
- Payload preview includes department_id when available.
- Validation blocks if selected rows have no department or multiple departments.
- No fetch/API POST/DB write was added.

## Expected UI

1. 登録済み大項目を選択
2. 課長へ送る
3. 部門ヒントに「部門は選択済み台帳行から取得」が表示される
4. 課コンボボックスから遠吠え課を選択
5. 課を適用
6. 一括引き渡し先の部門が台帳行の部門になる
7. 一括引き渡し先の課が選択した課になる

## Files

- BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/aicm-production-core.before_v10l_c2d2.js
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/010_verify.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/020_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/021_server_node_check.txt
- EXTRACT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/030_c2d2_extract.txt
- SERVER_STATUS_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/035_server_status_before.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/045_server_status_after.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/036_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2d2_ledger_department_route_apply_fix_20260504_192125/040_http_check.html
- CANON_DOC=/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager/900.meta/V10L_C2D2_LEDGER_DEPARTMENT_ROUTE_APPLY_FIX_CANON.md

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2d2_20260504_192125
