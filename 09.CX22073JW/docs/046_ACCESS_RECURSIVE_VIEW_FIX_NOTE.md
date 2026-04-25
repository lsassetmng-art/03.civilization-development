# ============================================================
# ACCESS RECURSIVE VIEW FIX NOTE
# ============================================================

status: implementation-fix
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- repair self-referencing v_access_* views introduced by broad rename / aliasing
- rebuild receipt / pending / confirmation / reverify views from base tables
- rerun current state bundle export after view repair

policy:
- additive / repair only
- no schema drop
- rebuild views from base tables
