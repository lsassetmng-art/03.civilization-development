# AICompanyManager AXU maintainability precheck report

## Result
- FINAL_STATUS=AXU_MAINT_PRE_CAPTURED_REVIEW_REQUIRED
- PASS_COUNT=13
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO
- index change: NO

## Maintainability rule

Do not fix navigation by:
- matching visible text
- broad click target catching
- fallback panels
- wrapper stacking
- duplicated render functions

Correct fix should be:
- identify the exact render function for the 部門別タスク台帳 button
- add/repair only:
  data-core-action="go"
  data-screen="task-ledger"
- keep handleRootClick simple
- remove broad/text fallback markers if already applied

## Counts
TASK_LEDGER_LABEL_COUNT=12
TASK_LEDGER_SCREEN_COUNT=20
GO_ATTR_TASK_LEDGER_COUNT=1
HANDLE_ROOT_CLICK_COUNT=1
GO_FUNCTION_COUNT=1
R1B_COUNT=2
R1C_COUNT=2
R1D_COUNT=0
BROAD_CLICK_COUNT=0
TEXT_NAV_COUNT=0
STANDALONE_PANEL_COUNT=2
BAD_LITERAL_COUNT=0

## Files
- NODE_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_pre_task_ledger_nav_20260501_111523/010_node_check.txt
- TASK_LEDGER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_pre_task_ledger_nav_20260501_111523/020_task_ledger_render_scan.txt
- NAV_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_pre_task_ledger_nav_20260501_111523/030_navigation_handler_scan.txt
- PATCH_MARKER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_pre_task_ledger_nav_20260501_111523/040_patch_marker_scan.txt
- DUPLICATE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_pre_task_ledger_nav_20260501_111523/050_duplicate_function_scan.txt
- SUMMARY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_maint_pre_task_ledger_nav_20260501_111523/060_summary.txt

## Next
Paste:
1. REPORT
2. SUMMARY_OUT
3. TASK_LEDGER_SCAN
4. NAV_SCAN

Then apply a targeted cleanup/fix only.
