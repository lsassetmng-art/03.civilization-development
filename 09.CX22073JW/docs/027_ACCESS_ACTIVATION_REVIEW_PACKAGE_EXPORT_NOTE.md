# ============================================================
# ACCESS ACTIVATION REVIEW PACKAGE EXPORT NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- export activation review package from evaluated requests
- provide human-reviewable request summary / decision matrix / apply plan skeleton
- persist export run and exported decision items in CX22073JW

policy:
- additive only
- no schema drop
- no runtime grant apply in this step
- apply plan SQL is review skeleton only
- final runtime activation still requires governed approval and apply path
