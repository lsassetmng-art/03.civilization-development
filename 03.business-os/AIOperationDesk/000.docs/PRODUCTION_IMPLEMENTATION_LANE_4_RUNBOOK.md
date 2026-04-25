# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 4 RUNBOOK
# ============================================================

status: production-implementation-lane-4
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/855_verify_aioperationdesk_production_implementation_bundle_4.sh
2. run precheck
   - 090.scripts/854_run_aioperationdesk_production_implementation_precheck_4.sh
3. run provider live readiness probe
   - 090.scripts/852_run_aioperationdesk_provider_live_readiness_probe.sh
4. start strict hardened live stack
   - 090.scripts/850_run_aioperationdesk_strict_hardened_live_stack.sh
5. run strict auth + provider live proof
   - 090.scripts/853_test_aioperationdesk_strict_auth_provider_live_proof.sh
6. stop strict hardened live stack
   - 090.scripts/851_stop_aioperationdesk_strict_hardened_live_stack.sh

notes:
- lane 4 assumes secret-ready environment
- lane 4 is controlled live proof only
- lane 4 does not itself authorize broad rollout
