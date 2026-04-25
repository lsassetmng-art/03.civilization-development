# ============================================================
# AI OPERATION DESK PRODUCTION TRACK CLOSEOUT RUNBOOK
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify production-track bundle files
   - 090.scripts/430_verify_aioperationdesk_production_track_bundle.sh
   - 090.scripts/460_verify_aioperationdesk_production_track_bundle_2.sh
   - 090.scripts/500_verify_aioperationdesk_production_track_bundle_3.sh
2. run production-track precheck all
   - 090.scripts/480_run_aioperationdesk_production_track_precheck_all.sh
3. review provider http policy and adapter
4. review replay executor dry-run result
5. review cleanup executor dry-run result
6. generate production-track handoff bundle
   - 090.scripts/490_generate_aioperationdesk_production_track_handoff_bundle.sh

position:
- this runbook closes the current production-track packaging pass
- next work is production implementation hardening, not production-track skeleton generation
