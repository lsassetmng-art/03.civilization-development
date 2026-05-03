# AXU-CSV-MAINT-R4 manager major pending reload report

FINAL_STATUS=AXU_CSV_MAINT_R4_MANAGER_MAJOR_PENDING_RELOAD_FAILED_REVIEW_REQUIRED
PASS_COUNT=27
WARN_COUNT=0
FAIL_COUNT=2

## Correct behavior fixed
- 登録済み大項目は未実行/未引き継ぎのみ表示
- 未実行がなければ空表示
- CSV取り込み実行後にtask-ledger context再読込
- 登録済み大項目パネルにリロードボタン追加

## UI
OPEN_URL=http://127.0.0.1:8794/?v=20260502_065708_maint_r4
TERMUX_OPEN_STATUS=OPENED
AICM_PID=14266

## Files
BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r4_manager_major_pending_reload_20260502_065708/aicm-production-core.before_maint_r4.js
PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r4_manager_major_pending_reload_20260502_065708/100_patch.out
CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r4_manager_major_pending_reload_20260502_065708/020_node_check.txt
SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r4_manager_major_pending_reload_20260502_065708/030_scan_after.txt
HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r4_manager_major_pending_reload_20260502_065708/050_http.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r4_manager_major_pending_reload_20260502_065708/040_aicm_server.log

## Manual check
1. Open URL
2. 部門別タスク台帳
3. 登録済み大項目をリロード
4. 未実行大項目100件 + 課長へ送る が出る
5. CSV取り込み実行後も自動で再表示される

## Rollback
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r4_manager_major_pending_reload_20260502_065708/aicm-production-core.before_maint_r4.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
