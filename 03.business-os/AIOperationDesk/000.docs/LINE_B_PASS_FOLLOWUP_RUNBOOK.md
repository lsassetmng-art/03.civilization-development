# ============================================================
# AI OPERATION DESK LINE B PASS FOLLOWUP RUNBOOK
# ============================================================

status: line-b-pass-followup
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify followup bundle
   - 090.scripts/930_verify_aioperationdesk_line_b_pass_followup_bundle.sh
2. run followup precheck
   - 090.scripts/920_run_aioperationdesk_line_b_pass_followup_precheck.sh
3. review strict auth default policy
4. review provider live evidence helper
5. review replay live evidence helper

next_after_followup:
- bind strict auth default where intended
- bind provider live evidence capture into controlled live runs
- bind replay live evidence capture into controlled replay proof
