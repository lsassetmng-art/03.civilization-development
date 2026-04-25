# ============================================================
# AI OPERATION DESK REPLAY EXECUTOR EXACT
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the replay executor skeleton for provider follow-on only.

replay_scope:
- notification_event replay candidates only
- no canonical business write replay
- no work order recreation
- no approval / review bypass

modes:
- dry_run
- live

dry_run:
- load replay candidates
- summarize candidate count
- do not send provider requests

live:
- load replay candidates
- dispatch provider requests through provider contract
- collect normalized results
- do not recreate canonical business mutation

current_phase:
- candidate selection already exists
- this bundle adds executor skeleton
- destructive or business-truth replay remains out of scope
