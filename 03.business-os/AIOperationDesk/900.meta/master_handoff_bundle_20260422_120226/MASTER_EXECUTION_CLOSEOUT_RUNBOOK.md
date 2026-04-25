# ============================================================
# AI OPERATION DESK MASTER EXECUTION CLOSEOUT RUNBOOK
# ============================================================

status: master-execution-closeout
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify master execution bundle
   - 090.scripts/700_verify_aioperationdesk_master_execution_bundle.sh
2. run master full execution
   - 090.scripts/670_run_aioperationdesk_master_full_execution.sh
3. collect master evidence bundle
   - 090.scripts/680_collect_aioperationdesk_master_evidence_bundle.sh
4. generate master final handoff bundle
   - 090.scripts/690_generate_aioperationdesk_master_handoff_bundle.sh

notes:
- evidence is collected from the most recent master/local/hardening/production/proof output dirs
- final handoff bundle is intended for the next execution chat or review pass
