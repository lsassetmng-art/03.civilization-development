# ============================================================
# ACCESS ACCESS BUNDLE AND ACTIVATION SKELETON NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- register role-based access bundles from actual view grant matrix
- prepare governed activation request intake skeleton
- keep activation separate from raw grant apply

policy:
- additive only
- no schema drop
- no direct runtime grant apply in this step
- role bundle is upper-bound only
- effective reach still requires rank / app scope / gate / audit
