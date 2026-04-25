# ============================================================
# AI OPERATION DESK PRODUCTION TRACK RUNBOOK
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the run and review order for the production-track entry bundle.

recommended_order:
1. verify production-track bundle files
   - 090.scripts/430_verify_aioperationdesk_production_track_bundle.sh
2. run production-track precheck
   - 090.scripts/420_run_aioperationdesk_production_track_precheck.sh
3. review secret presence policy
   - 000.docs/PRODUCTION_SECRET_ENV_POLICY.md
4. review provider http skeleton
   - 080.notifications/line_provider_http_skeleton.js
5. review cleanup executor skeleton
   - 070.jobs/aiod_cleanup_executor_stub.js

notes:
- this bundle does not activate provider http mode automatically
- this bundle does not introduce destructive cleanup
- this bundle prepares the next implementation pass only
