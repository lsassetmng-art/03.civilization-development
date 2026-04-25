# ============================================================
# ACCESS DB ROLE PROVISIONING NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provision expected database roles for AI employee access bundles
- persist role provisioning batch and per-role results
- prepare role existence baseline before governed apply runtime path

policy:
- additive only
- no schema drop
- create group-style roles only
- no runtime GRANT apply in this step
- created roles are NOLOGIN / INHERIT / NOCREATEDB / NOCREATEROLE / NOSUPERUSER
