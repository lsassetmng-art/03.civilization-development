# White screen root cause ranking

generated_at: 2026-04-30 14:42:06 +0900

## Observed diagnostic counters

- NODE_CHECK_CODE=0
- VM_ERROR_COUNT=1
- ROOT_HTML_LENGTH=0
- DUP_FUNCTION_COUNT=0
- BROKEN_LITERAL_COUNT=0
- CSV_PROMPT_ACTION_COUNT=1
- CSV_FILE_OPEN_ACTION_COUNT=1
- CSV_IMPORT_ACTION_COUNT=1
- CHANGE_LISTENER_COUNT=2
- CLICK_LISTENER_COUNT=1
- FILE_HANDLER_COUNT=1

## Candidate A: browser runtime error in clean core
Risk: HIGH

Reason:
- node --check can pass while browser runtime still fails.
- VM harness found runtime errors. See VM_OUT.

Evidence:
- VM_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_diag_20260430_144204/210_runtime_vm_harness.out

## Candidate B: duplicated helper/function/action after repeated CSV patches
Risk: LOW

Evidence:
- FUNCTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_diag_20260430_144204/110_function_count_scan.txt
- ACTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_diag_20260430_144204/120_action_handler_scan.txt

## Candidate C: escaped newline or broken injected action fragment
Risk: LOW

Evidence:
- STATIC_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_diag_20260430_144204/100_static_scan.txt

## Candidate D: unsupported browser API path
Risk: MEDIUM

Reason:
- APM-APP introduced clipboard / Blob / URL object paths.
- If Android WebView blocks navigator.clipboard or Blob download behavior, clicking the prompt button may error.
- This should not usually cause white screen on initial load unless the function is called or global object access occurs too early.

Evidence:
- STATIC_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_diag_20260430_144204/100_static_scan.txt
- DIFF_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_diag_20260430_144204/140_apm_diff_scan.txt

## Candidate E: renderCsvImportCard output/runtime data path
Risk: MEDIUM

Reason:
- White screen appears after navigating to 部門別タスク台帳 if renderCsvImportCard throws.
- Check VM errors and render function around CSV card.

Evidence:
- CSV_SCOPE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_diag_20260430_144204/130_csv_scope_scan.txt
- VM_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_root_cause_diag_20260430_144204/210_runtime_vm_harness.out

## Do not fix yet

Next should be:
1. Read VM_OUT errors first.
2. If VM_ERROR_COUNT > 0, patch only the exact failing function/action.
3. If VM_ERROR_COUNT = 0, capture real browser console/HTML state or remove only new APM-APP browser-API paths.
