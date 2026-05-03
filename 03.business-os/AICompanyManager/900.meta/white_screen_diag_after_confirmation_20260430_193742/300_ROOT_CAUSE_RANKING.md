# White screen root cause ranking

generated_at: 2026-04-30 19:37:44 +0900

## Observed counters

- CORE_NODE_CHECK_CODE=0
- SERVER_NODE_CHECK_CODE=0
- INDEX_SCRIPT_COUNT=1
- CONTEXT_CURL_CODE=0
- CONTEXT_HTTP_CODE=200
- INDEX_CURL_CODE=0
- INDEX_HTTP_CODE=200
- FORBIDDEN_CORE_COUNT=0
- CONFIRM_MARKER_COUNT=1
- ORG_UPDATE_MARKER_COUNT=1
- RENDER_COMPANY_OVERVIEW_TO_EDIT_COUNT=1
- ROOT_INNERHTML_COUNT=2
- DIRECT_POST_SAVE_COUNT=0
- VM_ERROR_COUNT=1
- ROOT_HTML_LENGTH=0
- ROOT_CLICK_LISTENER_COUNT=0
- ROOT_CHANGE_LISTENER_COUNT=0

## Candidate A: runtime JavaScript error in clean core
Risk: HIGH if VM_ERROR_COUNT > 0 or ROOT_HTML_LENGTH = 0.

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_diag_after_confirmation_20260430_193742/210_runtime_vm_harness.out

## Candidate B: ARU-ARX selected renderCompanyOverview as company update target
Risk: HIGH if renderCompanyOverview now returns renderAicmCompanyUpdateScreen.

Reason:
- renderCompanyOverview sounds like dashboard/company summary component, not company edit screen.
- If dashboard calls renderCompanyOverview, replacing it can break dashboard render path.
- This was already visible in previous report: TARGET_COMPANY_RENDERER=renderCompanyOverview.

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_diag_after_confirmation_20260430_193742/130_patch_scope_scan.txt

## Candidate C: ARY-ASB confirmation screen direct root.innerHTML replacement
Risk: MEDIUM.

Reason:
- root.innerHTML is used only after save click, so it should not cause initial white screen.
- But if renderAicmOrgUpdateConfirmation returns invalid shell or references unavailable state, it can white-screen after pressing save.

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_diag_after_confirmation_20260430_193742/140_confirmation_scope_scan.txt

## Candidate D: server unreachable / context unavailable
Risk: MEDIUM if INDEX_HTTP_CODE or CONTEXT_HTTP_CODE is not 200.

Evidence:
- CONTEXT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_diag_after_confirmation_20260430_193742/060_context.json
- CONTEXT_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_diag_after_confirmation_20260430_193742/061_context.err
- INDEX_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_diag_after_confirmation_20260430_193742/071_index.err

## Candidate E: syntax error
Risk: LOW if node --check is OK.

Evidence:
- CORE_NODE_CHECK_CODE=0

## Do not fix yet

Next should be:
1. Read VM_OUT first.
2. If VM_ERROR_COUNT > 0, patch only the exact failing function/action.
3. If VM_ERROR_COUNT = 0 and dashboard is white, inspect renderCompanyOverview replacement.
4. Prefer restoring only company renderer scope, not rolling back DB/server/API.
