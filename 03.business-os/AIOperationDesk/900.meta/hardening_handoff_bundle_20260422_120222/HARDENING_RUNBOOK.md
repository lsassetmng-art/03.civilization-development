# ============================================================
# AI OPERATION DESK HARDENING RUNBOOK
# ============================================================

status: hardening-runbook
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the recommended run order for the hardening track.

recommended_order_mock_hardened:
1. verify hardening bundle files
   - 090.scripts/390_verify_aioperationdesk_hardening_all.sh
2. run hardening precheck all
   - 090.scripts/400_run_aioperationdesk_hardening_precheck_all.sh
3. start hardened mock stack
   - 090.scripts/300_run_aioperationdesk_hardened_mock_stack.sh
4. test hardened write guard
   - 090.scripts/280_test_aioperationdesk_hardened_write_guard.sh
5. test hardened post-write flow
   - 090.scripts/320_test_aioperationdesk_hardened_post_write_flow.sh
6. stop hardened mock stack
   - 090.scripts/301_stop_aioperationdesk_hardened_mock_stack.sh

recommended_order_db_hardened:
1. verify hardening bundle files
2. run hardening precheck all
3. start hardened db stack
   - 090.scripts/302_run_aioperationdesk_hardened_db_stack.sh
4. test hardened db post-write flow
   - 090.scripts/321_test_aioperationdesk_hardened_db_post_write_flow.sh
5. inspect follow-on db state
   - 090.scripts/322_query_aioperationdesk_hardened_follow_on_state.sh
6. inspect retention review state
   - 090.scripts/370_query_aioperationdesk_retention_review_state.sh
7. run replay review candidate export
   - 090.scripts/371_run_aioperationdesk_notification_replay_review.sh
8. stop hardened db stack
   - 090.scripts/303_stop_aioperationdesk_hardened_db_stack.sh

handoff_path:
- 090.scripts/410_generate_aioperationdesk_hardening_handoff_bundle.sh
