# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 3 RUNBOOK
# ============================================================

status: actual-hardening-edit-lane-3
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/999_verify_aioperationdesk_actual_hardening_edit_lane_3.sh
2. run precheck
   - 090.scripts/998_run_aioperationdesk_actual_hardening_edit_lane_3_precheck.sh
3. run controlled live hardening with runtime evidence
   - 090.scripts/990_run_aioperationdesk_controlled_live_hardening_with_runtime_evidence.sh
4. review runtime evidence
   - 090.scripts/991_review_aioperationdesk_runtime_evidence.sh
5. generate runtime evidence digest
   - 090.scripts/996_run_aioperationdesk_runtime_evidence_digest.sh
6. generate terminal hardening handoff
   - 090.scripts/997_generate_aioperationdesk_actual_hardening_terminal_handoff.sh

finish_rule:
After this lane, next work should be direct implementation edits from evidence,
not another orchestration wrapper.
