# ============================================================
# ACCESS ACTUAL VIEW REGISTRY AND GRANT SKELETON NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- fix actual AI employee view registry
- fix naming registry
- fix role-to-actual-view grant skeleton
- keep all of them additive and registry-based first

policy:
- additive only
- no schema drop
- cx22073jw views are AI employee only
- no direct raw table read
- grant skeleton is upper-bound only and must still be intersected with rank / app scope / gate
