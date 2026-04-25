# ============================================================
# ACCESS LEGACY DB BLOCKER PATCH AND GATE REFRESH NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- patch DB-side legacy compat references from v_access_* to v_access_*
- cover dependent views and functions in cx22073jw
- rerun legacy compat audit and cutover gate after patch

policy:
- additive only
- no schema drop
- no legacy compat view removal in this step
- patch only dependent DB objects, not legacy compatibility views themselves
