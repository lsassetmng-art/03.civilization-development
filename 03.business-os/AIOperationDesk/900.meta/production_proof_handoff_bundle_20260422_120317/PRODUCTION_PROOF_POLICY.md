# ============================================================
# AI OPERATION DESK PRODUCTION PROOF POLICY
# ============================================================

status: production-proof
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the proof-phase constraints after production-track skeleton completion.

proof_targets:
- env readiness
- auth header path readiness
- provider mode readiness
- replay executor readiness
- cleanup executor guarded readiness

prohibited_in_this_phase:
- hardcoded secret output
- destructive cleanup
- canonical business rewrite replay
- ungated production rollout claim

success_signals:
- provider env presence can be checked safely
- header-trusted actor path can be validated
- replay executor can run in guarded mode
- cleanup executor can run in guarded mode
- proof reports can be collected into 900.meta
