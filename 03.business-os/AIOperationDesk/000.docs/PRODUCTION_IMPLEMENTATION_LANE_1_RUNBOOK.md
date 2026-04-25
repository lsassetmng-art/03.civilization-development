# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 1 RUNBOOK
# ============================================================

status: production-implementation-lane-1
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/810_verify_aioperationdesk_production_implementation_bundle_1.sh
2. run precheck
   - 090.scripts/800_run_aioperationdesk_production_implementation_precheck.sh
3. review strict auth file
   - 020.backend/lib/aiod_header_auth_strict.js
4. review provider http impl files
   - 080.notifications/line_provider_http_payload_builder.js
   - 080.notifications/line_provider_http_response_normalizer.js
   - 080.notifications/line_provider_http_impl.js
5. review replay live guard
   - 070.jobs/aiod_replay_live_guard.js

next_after_lane_1:
- bind strict auth into route context
- swap provider contract from skeleton adapter to impl file
- bind replay executor live path to replay live guard
