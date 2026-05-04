# AICompanyManager V10L-C2C3 combobox apply fix report

## Result

FINAL_STATUS=V10L_C2C3_COMBOBOX_APPLY_FIX_DONE_REVIEW_REQUIRED

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

- Fixed section candidate filter.
- Removed fake fallback section candidates such as plain 「課」.
- Kept section combobox as the canonical route selection UI.
- Added local route-picker based select value lookup.
- Added explicit copy: assignment department is the selected section's parent department.
- Did not add fetch/API POST/DB write.

## Expected UI

- Section combobox should show only real section candidates.
- For current data, expected section candidate is 遠吠え課？.
- Assignment department should be the parent department, expected 遠吠え部？.
- 課を適用 should update 一括引き渡し先.

## Files

- BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/aicm-production-core.before_v10l_c2c3.js
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/010_verify.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/020_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/021_server_node_check.txt
- EXTRACT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/030_c2c3_extract.txt
- SERVER_STATUS_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/035_server_status_before.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/045_server_status_after.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/036_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2c3_combobox_apply_fix_20260504_185735/040_http_check.html
- CANON_DOC=/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager/900.meta/V10L_C2C3_COMBOBOX_APPLY_FIX_CANON.md

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2c3_20260504_185735
