# ============================================================
# AI OPERATION DESK PRODUCTION PROOF CLOSEOUT RUNBOOK
# ============================================================

status: production-proof-closeout
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify production proof bundle files
   - 090.scripts/550_verify_aioperationdesk_production_proof_bundle_1.sh
   - 090.scripts/590_verify_aioperationdesk_production_proof_closeout_bundle.sh
2. run production proof precheck
   - 090.scripts/560_run_aioperationdesk_production_proof_precheck.sh
3. optionally run header auth proof against hardened stack
   - 090.scripts/520_run_aioperationdesk_header_auth_proof.sh
4. optionally run replay guarded probe
   - 090.scripts/530_run_aioperationdesk_replay_executor_guarded_probe.sh
5. optionally run cleanup guarded probe
   - 090.scripts/540_run_aioperationdesk_cleanup_executor_guarded_probe.sh
6. run production proof audit
   - 090.scripts/570_run_aioperationdesk_production_proof_audit.sh
7. collect proof artifacts
   - 090.scripts/575_collect_aioperationdesk_production_proof_artifacts.sh
8. generate handoff bundle
   - 090.scripts/580_generate_aioperationdesk_production_proof_handoff_bundle.sh

notes:
- this runbook closes the current proof-oriented pass
- this runbook does not authorize production release by itself
- output directories under 900.meta should be preserved as evidence
