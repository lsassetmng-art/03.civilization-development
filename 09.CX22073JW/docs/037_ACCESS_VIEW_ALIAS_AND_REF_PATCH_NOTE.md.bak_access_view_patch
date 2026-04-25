# ============================================================
# ACCESS VIEW ALIAS AND REF PATCH NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- create neutral v_access_* aliases for legacy v_access_* views
- patch project files to use v_access_* as the canonical view naming
- keep legacy v_access_* views as compatibility surface for now

policy:
- additive only
- no schema drop
- no runtime apply beyond alias view creation
- legacy views remain temporarily for compatibility
