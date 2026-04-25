# ============================================================
# ACCESS ACTIVATION REQUEST COMPILER NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- compile activation requests from role access bundles
- auto-populate per-view decision rows
- expose request / decision summary views
- prove compiler behavior with smoke requests

policy:
- additive only
- no schema drop
- no runtime grant apply in this step
- compiler output is governance-side decision prep only
