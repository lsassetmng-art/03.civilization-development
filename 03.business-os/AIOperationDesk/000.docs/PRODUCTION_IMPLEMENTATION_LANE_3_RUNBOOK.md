# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 3 RUNBOOK
# ============================================================

status: production-implementation-lane-3
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/844_verify_aioperationdesk_production_implementation_bundle_3.sh
2. run precheck
   - 090.scripts/843_run_aioperationdesk_production_implementation_precheck_3.sh
3. start strict hardened mock stack
   - 090.scripts/840_run_aioperationdesk_strict_hardened_mock_stack.sh
4. run strict auth + provider dry-run proof
   - 090.scripts/842_test_aioperationdesk_strict_auth_provider_dry_run.sh
5. stop strict hardened mock stack
   - 090.scripts/841_stop_aioperationdesk_strict_hardened_mock_stack.sh

next_after_lane_3:
- switch provider http execution mode to live only in controlled env
- run strict auth + provider live proof only after endpoint/secret readiness is confirmed
