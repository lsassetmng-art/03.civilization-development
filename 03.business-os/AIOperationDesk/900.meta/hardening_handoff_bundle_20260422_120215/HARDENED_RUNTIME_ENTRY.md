# ============================================================
# AI OPERATION DESK HARDENED RUNTIME ENTRY
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

entrypoints:
- normal stub entry:
  - 020.backend/edge/index.ts
- hardened entry:
  - 020.backend/edge/index_hardened.ts

hardening_switches:
- AIOD_HARDENING_MODE:
  - off
  - enforced
- AIOD_AUTH_MODE:
  - stub
  - header_trusted
- AIOD_PERMISSION_MODE:
  - stub
  - policy_check

current_behavior:
- hardened entry mainly guards write paths
- read paths remain available through existing read route stack
- when hardening is enforced, write paths require authenticated actor and allowed permission result

recommended_use_now:
- local hardening smoke checks
- route-level auth / permission insertion testing
- future replacement point for stronger auth / permission layers
