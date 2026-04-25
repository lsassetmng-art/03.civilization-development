# ============================================================
# ACCESS LEGACY COMPAT AUDIT NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- audit remaining legacy compatibility dependencies on v_access_* views
- inspect both DB-side references and project file references
- prepare deprecation / cutover planning for legacy compatibility views

policy:
- additive only
- no schema drop
- no destructive cutover in this step
- audit only
