# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 2
# ============================================================

status: production-implementation-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Bind the lane 1 implementation anchors into the existing runtime path.

lane_2_targets:
- request context uses strict trusted-header auth when enabled
- hardened write flow supports strict auth switch
- provider contract prefers real http impl for line_http mode
- replay executor live path uses replay live guard
- existing additive structure is preserved

principles:
- additive only
- fail closed when strict auth is selected
- provider impl remains env-gated
- replay live remains notification-follow-on only
