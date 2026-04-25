# ============================================================
# STATICART HANDOFF MANIFEST EXPORT RUNNER NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- export StaticArt fixed contract release as handoff-ready files
- generate manifest / payload contract / top-level contract / target status exports
- record export batches in CX22073JW

policy:
- additive only
- no schema drop
- no canonical ownership transfer
- export source is the fixed contract release views
