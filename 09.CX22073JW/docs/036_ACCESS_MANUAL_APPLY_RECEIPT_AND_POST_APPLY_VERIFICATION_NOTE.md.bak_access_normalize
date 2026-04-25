# ============================================================
# ACCESS MANUAL APPLY RECEIPT AND POST APPLY VERIFICATION NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- register manual apply receipt batches from latest final handoff export
- verify whether GRANT SELECT is actually present after manual apply
- keep runtime apply itself outside this step

policy:
- additive only
- no schema drop
- no runtime grant apply in this step
- verification only checks whether privileges are visible in DB
