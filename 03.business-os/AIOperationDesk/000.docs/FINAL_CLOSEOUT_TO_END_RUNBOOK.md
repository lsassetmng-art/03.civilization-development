# ============================================================
# AI OPERATION DESK FINAL CLOSEOUT TO END RUNBOOK
# ============================================================

status: final-closeout-to-end
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify final closeout bundle
   - 090.scripts/983_verify_aioperationdesk_final_closeout_bundle.sh
2. run final closeout to end
   - 090.scripts/980_run_aioperationdesk_final_closeout_to_end.sh
3. review final closeout result
   - 090.scripts/981_review_aioperationdesk_final_closeout_to_end.sh
4. generate terminal handoff bundle
   - 090.scripts/982_generate_aioperationdesk_final_terminal_handoff_bundle.sh

terminal_rule:
After this runbook, next work should be chosen from the final reviewed evidence,
not from creating more orchestration layers.
