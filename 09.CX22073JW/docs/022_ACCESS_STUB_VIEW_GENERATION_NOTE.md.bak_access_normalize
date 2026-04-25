# ============================================================
# ACCESS STUB VIEW GENERATION NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- generate stub views from access_actual_view_registry
- register generation runs and per-view results
- provide runtime catalog for existing / missing AI employee views

policy:
- additive only
- no schema drop
- no raw table direct read
- only create missing views
- existing views are preserved and reported as skipped_existing
