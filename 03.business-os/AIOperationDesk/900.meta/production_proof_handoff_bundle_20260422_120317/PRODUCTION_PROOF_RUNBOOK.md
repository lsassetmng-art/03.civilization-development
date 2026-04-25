# ============================================================
# AI OPERATION DESK PRODUCTION PROOF RUNBOOK
# ============================================================

status: production-proof
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the next step after production-track skeleton closeout:
operational proof without jumping directly to full production packaging.

recommended_order:
1. verify production proof bundle files
   - 090.scripts/550_verify_aioperationdesk_production_proof_bundle_1.sh
2. run provider env probe
   - 090.scripts/510_run_aioperationdesk_provider_env_probe.sh
3. run header trusted auth proof
   - 090.scripts/520_run_aioperationdesk_header_auth_proof.sh
4. run replay guarded probe
   - 090.scripts/530_run_aioperationdesk_replay_executor_guarded_probe.sh
5. run cleanup guarded probe
   - 090.scripts/540_run_aioperationdesk_cleanup_executor_guarded_probe.sh
6. run production proof precheck
   - 090.scripts/560_run_aioperationdesk_production_proof_precheck.sh

rules:
- provider env probe must not dump raw secret values
- replay guarded probe is proof-oriented, not full production replay
- cleanup guarded probe must not perform destructive cleanup
- this phase is operational proof, not final release approval
