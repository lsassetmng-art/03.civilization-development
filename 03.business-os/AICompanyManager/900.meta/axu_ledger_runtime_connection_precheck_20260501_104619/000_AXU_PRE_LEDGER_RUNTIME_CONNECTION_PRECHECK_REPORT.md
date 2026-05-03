# AICompanyManager Phase AXU-PRE ledger runtime connection precheck

## Result
- FINAL_STATUS=AXU_PRE_LEDGER_RUNTIME_CONNECTION_CAPTURED_REVIEW_REQUIRED
- PASS_COUNT=18
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- server change: NO
- core change: NO
- index change: NO

## Counts
- TASK_LEDGER_COUNT=18
- PMLW_MAJOR_COUNT=1
- WORKER_RUNTIME_REQUEST_COUNT=1
- RENDER_WORKER_RUNTIME_COUNT=6
- EXECUTE_WORKER_RUNTIME_COUNT=4
- RUNTIME_STATUS_PANEL_COUNT=2
- TOKEN_LEAK_COUNT=0

## Interpretation

Next patch should not rewrite the whole task ledger screen.

Preferred maintainable approach:
1. Add a small "AI実行依頼へ送る" action to ledger/PMLW rows.
2. Build runtime request payload from existing row fields.
3. Route through the existing Worker Runtime confirmation screen.
4. Keep DB write behind confirmation.
5. Reuse existing local endpoint:
   - /api/aicm/v2/worker-runtime/request
6. Keep AIWorkerOS token server-side only.
7. Keep Runtime Status Panel display filter already added in AXT-R9-R2.

## Files
- CORE_TASK_LEDGER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_ledger_runtime_connection_precheck_20260501_104619/010_core_task_ledger_scan.txt
- CORE_PMLW_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_ledger_runtime_connection_precheck_20260501_104619/020_core_pmlw_scan.txt
- CORE_WORKER_RUNTIME_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_ledger_runtime_connection_precheck_20260501_104619/030_core_worker_runtime_scan.txt
- CORE_ACTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_ledger_runtime_connection_precheck_20260501_104619/040_core_action_scan.txt
- SERVER_RUNTIME_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_ledger_runtime_connection_precheck_20260501_104619/050_server_worker_runtime_scan.txt
- CONTEXT_SAMPLE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_ledger_runtime_connection_precheck_20260501_104619/060_context_runtime_related_keys.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_ledger_runtime_connection_precheck_20260501_104619/070_node_check.txt

## Next patch target

AXU:
- ledger/PMLW row -> runtime payload builder
- confirmation screen handoff
- execute uses existing worker-runtime/request
- status panel refresh after success

Do not create a new direct POST path if existing confirmation flow can be reused.
