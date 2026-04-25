# ============================================================
# AI OPERATION DESK PROJECT TERMINAL EXECUTION AND DECISION RUNBOOK
# ============================================================

status: terminal-execution-and-decision
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify terminal bundle
   - 090.scripts/1080_verify_aioperationdesk_project_terminal_bundle.sh
2. run final behavior proof
   - 090.scripts/1050_run_aioperationdesk_final_behavior_proof.sh
3. review terminal result
   - 090.scripts/1060_review_aioperationdesk_final_behavior_proof.sh
4. generate terminal project bundle
   - 090.scripts/1070_generate_aioperationdesk_project_terminal_bundle.sh

terminal_rule:
No further orchestration wrapper should be added after this.
