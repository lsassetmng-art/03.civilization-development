# AICompanyManager Phase AXU-R-PRE manager to leader precheck

## Result
- FINAL_STATUS=AXU_R_PRE_MANAGER_TO_LEADER_CAPTURED_REVIEW_REQUIRED
- PASS_COUNT=20
- WARN_COUNT=6
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO
- index change: NO
- 佐藤(DB担当)レビュー: read-only

## Correction

Previous direct flow is rejected:

Manager大項目 -> Worker Runtime request

Correct flow:

Manager大項目 -> 課長/Leader -> 中項目 -> Worker作業単位 -> Runtime request

## Counts

- SERVER_LEADER_ROUTE_COUNT=0
- SERVER_WORK_UNIT_ROUTE_COUNT=3
- CORE_LEADER_UI_COUNT=43
- CORE_WORK_UNIT_UI_COUNT=0
- DB_LEADER_OBJECT_COUNT=9
- DB_WORK_UNIT_OBJECT_COUNT=5
- TOKEN_LEAK_COUNT=0

## Files

- DB_OBJECTS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r_manager_to_leader_precheck_20260501_105344/010_db_pmlw_objects.tsv
- DB_COLUMNS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r_manager_to_leader_precheck_20260501_105344/020_db_pmlw_columns.tsv
- DB_FUNCTIONS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r_manager_to_leader_precheck_20260501_105344/030_db_pmlw_functions.tsv
- DB_VIEW_ROWS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r_manager_to_leader_precheck_20260501_105344/040_db_pmlw_view_row_counts.tsv
- SERVER_SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r_manager_to_leader_precheck_20260501_105344/050_server_pmlw_api_scan.txt
- CORE_PMLW_SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r_manager_to_leader_precheck_20260501_105344/060_core_pmlw_ui_scan.txt
- CORE_RUNTIME_SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r_manager_to_leader_precheck_20260501_105344/070_core_runtime_scan.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r_manager_to_leader_precheck_20260501_105344/080_node_check.txt
- NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/worker-runtime/070_MANAGER_TO_LEADER_TO_WORKER_RUNTIME_PLAN.md

## Next decision

Read the scan files and decide:

A. If existing Leader/Worker-unit API exists:
   - patch UI to call existing API.

B. If DB exists but API missing:
   - add minimal server routes for:
     - manager-major handoff to leader
     - leader-middle create
     - worker-work-unit create

C. If DB objects are incomplete:
   - stop and design/add DB tables/functions first.

## Next likely phase

AXU-R1:
- Manager大項目に「課長へ送る」ボタン
- Worker Runtime request is not created in this phase
- Existing manager-major update/status route should be reused if sufficient
