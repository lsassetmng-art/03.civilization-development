# ============================================================
# ACCESS GRANT EXPORT AND STUB SMOKE NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- export role/domain grant skeleton SQL from actual view grant matrix
- run smoke tests against generated AI employee stub views
- register export runs and smoke runs in CX22073JW

policy:
- additive only
- no schema drop
- no runtime grant apply in this step
- exported GRANT SQL is upper-bound skeleton only
- rank / app scope / gate must still be intersected later
