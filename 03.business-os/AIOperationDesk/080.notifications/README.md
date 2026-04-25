# ============================================================
# AI OPERATION DESK NOTIFICATIONS README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

events:
- review pending
- approval pending
- confirmation required
- execution failed
- retry scheduled
- completed with warning
- completed summary available

delivery:
- LINE-like bridge first
- other bridges may be added later
