# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 2 RUNBOOK
# ============================================================

status: actual-hardening-edit-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/995_verify_aioperationdesk_actual_hardening_edit_lane_2.sh
2. run precheck
   - 090.scripts/994_run_aioperationdesk_actual_hardening_edit_lane_2_precheck.sh
3. run controlled live hardening with runtime evidence
   - 090.scripts/990_run_aioperationdesk_controlled_live_hardening_with_runtime_evidence.sh
4. review runtime evidence
   - 090.scripts/991_review_aioperationdesk_runtime_evidence.sh
5. generate refreshed runtime evidence handoff
   - 090.scripts/992_generate_aioperationdesk_runtime_evidence_handoff_bundle.sh

notes:
- export AIOD_WRITE_RUNTIME_EVIDENCE=true is handled by the runner
- runtime evidence files are stored under 900.meta/runtime_evidence
- this lane is intended to produce reviewable evidence for real hardening edits
