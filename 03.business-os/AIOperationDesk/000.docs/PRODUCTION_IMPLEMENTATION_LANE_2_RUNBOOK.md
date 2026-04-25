# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 2 RUNBOOK
# ============================================================

status: production-implementation-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/830_verify_aioperationdesk_production_implementation_bundle_2.sh
2. run precheck
   - 090.scripts/820_run_aioperationdesk_production_implementation_precheck_2.sh
3. review runtime bindings
   - 020.backend/lib/aiod_request_context.js
   - 020.backend/edge/routes/write_routes_hardened.js
   - 080.notifications/line_provider_contract.js
   - 070.jobs/aiod_replay_executor.js

next_after_lane_2:
- replace current hardened auth mode uses with strict mode where intended
- run hardened stack with strict auth and line_http env in a controlled proof pass
- move to lane 3 for real execution proof binding
