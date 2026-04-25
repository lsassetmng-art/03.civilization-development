# ============================================================
# ACCESS VIEW FAMILY GOVERNANCE BOOTSTRAP NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- register AI employee domains
- register AI employee roles
- register AI-only cx22073jw view families
- register role-to-view-family upper-bound policies
- register fixed global and domain rules

policy:
- additive only
- no schema drop
- cx22073jw views are AI employee only
- other apps do not consume these views
- direct raw table read is prohibited
