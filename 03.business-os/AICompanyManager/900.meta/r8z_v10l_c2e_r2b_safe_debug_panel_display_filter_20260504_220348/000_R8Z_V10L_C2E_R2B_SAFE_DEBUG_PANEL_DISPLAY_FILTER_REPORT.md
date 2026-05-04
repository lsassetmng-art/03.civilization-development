# AICompanyManager V10L-C2E-R2B safe debug panel display filter report

## Result

FINAL_STATUS=V10L_C2E_R2B_SAFE_DEBUG_PANEL_DISPLAY_FILTER_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_PATCH=YES
- SERVER_PATCH=NO
- SERVER_RUNNING_CHECK=YES
- IF_SERVER_DOWN_START=YES
- HTTP_CHECK=YES
- BROWSER_OPEN=YES

## R2A finding

Debug visible labels are grouped in:

- function h

## What changed

This patch does not remove lines from function h body.

Instead, it wraps function h after its declaration and filters only returned HTML blocks containing:

- C2D5R2A 課を適用 debug
- C2D7 handler entry debug

The formal route UI remains:

- 一括引き渡し先
- 部門
- 課
- Leader
- 対象大項目
- payload preview

## Safety

- No DB write
- No API POST
- No server route change
- No fetch added
- No XMLHttpRequest added
- No broad source regex deletion
- If node --check failed, backup would restore immediately

## Files

- BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2e_r2b_safe_debug_panel_display_filter_20260504_220348/aicm-production-core.before_v10l_c2e_r2b.js
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2e_r2b_safe_debug_panel_display_filter_20260504_220348/010_verify.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2e_r2b_safe_debug_panel_display_filter_20260504_220348/020_core_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2e_r2b_safe_debug_panel_display_filter_20260504_220348/021_server_node_check.txt
- EXTRACT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2e_r2b_safe_debug_panel_display_filter_20260504_220348/030_wrapper_extract.txt
- SERVER_STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2e_r2b_safe_debug_panel_display_filter_20260504_220348/050_server_status_after.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c2e_r2b_safe_debug_panel_display_filter_20260504_220348/070_http_check.html

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c2e_r2b_20260504_220348
