# ============================================================
# ACCESS LEGACY RETIREMENT PLAN EXPORT NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- export a retirement plan for legacy v_access_* compatibility views
- use latest legacy cutover gate as the decision source
- generate manual retirement SQL only when latest gate is ready

policy:
- additive only
- no schema drop in this step
- no automatic retirement execution in this step
- export and manual review only
