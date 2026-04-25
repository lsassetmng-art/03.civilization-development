# ============================================================
# AI OPERATION DESK AUTH PERMISSION PROVIDER EXACT
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the exact hardening contracts for auth, permission, and LINE-like provider delivery.

auth_contract:
- actor resolution happens before write-side mutation logic
- unauthenticated actor must be rejected outside stub mode
- actor identity must be attached to audit-capable flows
- review / approval decisions must carry actor identity
- auth mode switching must not change business semantics

permission_contract:
- permission evaluation happens after actor resolution
- permission evaluation must consider:
  - actor
  - supported_app_code
  - lane_type
  - work_type_code
  - risk_class
  - source_surface_type
- permission denial must be explicit
- permission result may escalate review / approval requirement
- permission result must not silently bypass gates

provider_contract:
- notification provider dispatch must be isolated from business mutation
- provider failure must not duplicate canonical business actions
- provider payload must avoid privileged raw detail by default
- provider delivery result must be normalizable into:
  - sent
  - failed
  - cancelled

current_phase:
- auth = stub skeleton
- permission = stub skeleton
- provider = stub skeleton
- exact contracts fixed here for future replacement
