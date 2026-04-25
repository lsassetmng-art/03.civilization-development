# ============================================================
# AI OPERATION DESK LINE INTEGRATION README
# ============================================================

status: hardening-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Provider-facing integration area for LINE-like notification delivery.

current_state:
- internal bridge contract already exists on design side
- local implementation currently keeps provider mode as stub
- final provider credentials and delivery runtime are not yet wired

next_targets:
- provider credential contract
- provider request signing
- retry / backoff policy
- delivery receipt mapping
- provider error normalization
