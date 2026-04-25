# ============================================================
# ACCESS LEGACY FILE BLOCKER PATCH AND GATE REFRESH NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- patch latest legacy compat file blockers from v_access_* to v_access_*
- rerun legacy compat audit
- rerun legacy cutover readiness gate
- export remaining DB blockers after refresh

policy:
- additive only
- no schema drop
- no legacy compat view removal in this step
- file-side patch first, then re-audit
