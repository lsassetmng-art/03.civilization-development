# ============================================================
# ACCESS REGRESSION SMOKE PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide a safe read-only regression smoke suite for the access workspace
- bundle smoke outputs for review, handoff, and audit evidence

delivered_commands:
- access_smoke_suite.sh
- access_make_regression_bundle.sh

policy:
- additive only
- no schema drop
- read-only helper commands only
