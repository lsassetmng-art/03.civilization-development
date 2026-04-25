# ============================================================
# AI OPERATION DESK HARDENING FINAL MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

hardening_finish_sequence:
1. sh 090.scripts/390_verify_aioperationdesk_hardening_all.sh
2. sh 090.scripts/400_run_aioperationdesk_hardening_precheck_all.sh
3. optional hardened mock run:
   - sh 090.scripts/300_run_aioperationdesk_hardened_mock_stack.sh
   - sh 090.scripts/320_test_aioperationdesk_hardened_post_write_flow.sh
   - sh 090.scripts/301_stop_aioperationdesk_hardened_mock_stack.sh
4. optional hardened db run:
   - sh 090.scripts/302_run_aioperationdesk_hardened_db_stack.sh
   - sh 090.scripts/321_test_aioperationdesk_hardened_db_post_write_flow.sh
   - sh 090.scripts/351_query_aioperationdesk_provider_follow_on_state.sh
   - sh 090.scripts/371_run_aioperationdesk_notification_replay_review.sh
   - sh 090.scripts/303_stop_aioperationdesk_hardened_db_stack.sh
5. sh 090.scripts/410_generate_aioperationdesk_hardening_handoff_bundle.sh

position:
- hardening side has reached a strong follow-on completion candidate
- remaining work is production auth/provider/cleanup hardening, not base hardening skeleton generation
