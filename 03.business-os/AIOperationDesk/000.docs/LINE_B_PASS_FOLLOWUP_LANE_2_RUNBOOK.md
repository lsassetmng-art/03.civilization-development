# ============================================================
# AI OPERATION DESK LINE B PASS FOLLOWUP LANE 2 RUNBOOK
# ============================================================

status: line-b-pass-followup-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/970_verify_aioperationdesk_line_b_pass_followup_bundle_2.sh
2. run precheck
   - 090.scripts/960_run_aioperationdesk_line_b_pass_followup_precheck_2.sh
3. run controlled live hardening pass
   - 090.scripts/940_run_aioperationdesk_controlled_live_hardening_pass.sh
4. review followup evidence
   - 090.scripts/950_review_aioperationdesk_followup_evidence.sh
5. generate refreshed handoff bundle
   - 090.scripts/955_generate_aioperationdesk_followup_handoff_bundle.sh

notes:
- controlled live provider proof assumes secret-ready environment
- controlled replay live probe is bounded and explicit
- next step after this lane is evidence-based production hardening edits
