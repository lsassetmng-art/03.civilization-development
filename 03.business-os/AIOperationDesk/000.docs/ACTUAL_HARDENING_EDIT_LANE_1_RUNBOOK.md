# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 1 RUNBOOK
# ============================================================

status: actual-hardening-edit-lane-1
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/985_verify_aioperationdesk_actual_hardening_edit_lane_1.sh
2. run precheck
   - 090.scripts/984_run_aioperationdesk_actual_hardening_edit_lane_1_precheck.sh
3. enable runtime evidence when needed:
   - export AIOD_WRITE_RUNTIME_EVIDENCE=true
4. run controlled live hardening pass or replay live probe
5. inspect:
   - 900.meta/runtime_evidence

notes:
- runtime evidence is JSON artifact output only
- this lane strengthens the current implementation path without adding another wrapper layer
