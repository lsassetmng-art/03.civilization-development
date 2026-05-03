# AXU-CSV-MAINT-R5D old render neighbor cleanup report

FINAL_STATUS=AXU_CSV_MAINT_R5D_OLD_RENDER_CLEANUP_READY
PASS_COUNT=32
WARN_COUNT=0
FAIL_COUNT=0

## Cleanup
Removed only the old duplicate render helper using exact neighbor anchors:
- start: function aicmRenderManagerMajorRows containing AICM_MANAGER_MAJOR_RENDER_CANONICAL_V1: render
- end: immediately before function aicmGetManagerMajorRowsForSelectedCompany
- kept: AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1 render path

## UI
OPEN_URL=http://127.0.0.1:8794/?v=20260502_072734_maint_r5d
TERMUX_OPEN_STATUS=OPENED
AICM_PID=26557

## Files
BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5d_old_render_neighbor_cleanup_20260502_072734/aicm-production-core.before_maint_r5d.js
PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5d_old_render_neighbor_cleanup_20260502_072734/100_patch.out
CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5d_old_render_neighbor_cleanup_20260502_072734/020_node_check.txt
SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5d_old_render_neighbor_cleanup_20260502_072734/030_scan_after.txt
HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5d_old_render_neighbor_cleanup_20260502_072734/050_http.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5d_old_render_neighbor_cleanup_20260502_072734/040_aicm_server.log

## Manual check
1. Open URL
2. 部門別タスク台帳
3. 登録済み大項目をリロード
4. 未実行大項目100件 + 課長へ送る

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5d_old_render_neighbor_cleanup_20260502_072734/aicm-production-core.before_maint_r5d.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
