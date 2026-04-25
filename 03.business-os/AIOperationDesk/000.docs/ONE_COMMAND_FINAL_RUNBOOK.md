# ============================================================
# AI OPERATION DESK ONE COMMAND FINAL RUNBOOK
# ============================================================

status: one-command-closeout
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Provide the final top-level one-command entry for the current project pass.

recommended_order:
1. verify one-command bundle
   - 090.scripts/740_verify_aioperationdesk_one_command_bundle.sh
2. run one-command full pass
   - 090.scripts/710_run_aioperationdesk_one_command_final.sh
3. inspect latest summary
   - 090.scripts/720_show_aioperationdesk_latest_master_summary.sh
4. generate ultimate handoff bundle
   - 090.scripts/730_generate_aioperationdesk_ultimate_handoff_bundle.sh

intent:
This runbook is the top-most wrapper.
No higher orchestration layer is intended after this in the current pass.
