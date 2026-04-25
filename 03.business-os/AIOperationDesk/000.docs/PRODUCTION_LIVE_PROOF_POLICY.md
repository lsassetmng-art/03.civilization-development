# ============================================================
# AI OPERATION DESK PRODUCTION LIVE PROOF POLICY
# ============================================================

status: production-live-proof
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the boundary for controlled live provider proof.

allowed_in_live_proof:
- explicit strict auth header usage
- explicit provider line_http live mode
- bounded proof requests
- provider result normalization review

not_allowed_in_live_proof:
- raw secret output
- uncontrolled batch replay
- destructive cleanup
- rollout claim without evidence review

success_signals:
- readiness probe passes
- strict auth request succeeds only with required headers
- provider result is normalized cleanly
- logs stay secret-safe
