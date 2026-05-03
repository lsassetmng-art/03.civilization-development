============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 直前のV9G8ワンブロック末尾だけが壊れて終了した可能性あり
- まずV9G8 patchが適用済みか確認する
- 未適用ならこのブロックでは触らない
- 適用済みならserver確認して画面を開く

禁止:
- DB write
- API POST
- PATCH

============================================================
1. syntax
============================================================
PASS: syntax OK

============================================================
2. current V9G8 marker / function verify
============================================================
grep: Unmatched ( or \(
grep: Unmatched ( or \(
V9G8_MARKER_COUNT=0
HAS_V9G5_EXECUTE_FUNCTION=
V9G5_FUNCTION_HAS_MANAGER_UPDATE=2
V9G5_FUNCTION_HAS_LEGACY_SKIP_MARKER=0
V9G5_FUNCTION_CALLS_OLD1=1
V9G5_FUNCTION_CALLS_OLD2=1
OLD_EXECUTE_1_STILL_EXISTS=

============================================================
3. latest V9G8 report if exists
============================================================
LATEST_V9G8_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8_delete_execute_fallback_primary_20260503_180612
LATEST_V9G8_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8_delete_execute_fallback_primary_20260503_180612/000_R8Z_V9G8_DELETE_EXECUTE_FALLBACK_PRIMARY_REPORT.md
---- latest V9G8 report summary ----
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8_delete_execute_fallback_primary_20260503_180612/aicm-production-core.before_r8z_v9g8.js
FINAL_JUDGEMENT=CORE_PATCH_SYNTAX_FAILED_ROLLED_BACK

============================================================
4. server reachability
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=aec15e697f3a860f3ad26ae94ddfbd2a3de8b600e21d2381f21f5b284b42af73
SERVED_SHA=aec15e697f3a860f3ad26ae94ddfbd2a3de8b600e21d2381f21f5b284b42af73
SERVED_V9G8_MARKER_COUNT=0

============================================================
5. final
============================================================
FINAL_JUDGEMENT=V9G8_NOT_READY_RERUN_PATCH_REQUIRED
V9G8_MARKER_COUNT=0
HAS_V9G5_EXECUTE_FUNCTION=
V9G5_FUNCTION_HAS_MANAGER_UPDATE=2
V9G5_FUNCTION_HAS_LEGACY_SKIP_MARKER=0
V9G5_FUNCTION_CALLS_OLD1=1
V9G5_FUNCTION_CALLS_OLD2=1
OLD_EXECUTE_1_STILL_EXISTS=
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V9G8_MARKER_COUNT=0
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9g8_salvage_20260503_180737
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8_status_salvage_20260503_180737/000_R8Z_V9G8_STATUS_SALVAGE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- V9G8_ALREADY_APPLIED_BROWSER_OPENED:
  画面で削除確認カードを出して、削除を確定してください。

- V9G8_NOT_READY_RERUN_PATCH_REQUIRED:
  V9G8 patch本体を再実行してください。今回の壊れた末尾だけではpatch未完了です。
