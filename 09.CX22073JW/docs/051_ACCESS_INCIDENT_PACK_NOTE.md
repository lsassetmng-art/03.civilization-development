# ============================================================
# ACCESS INCIDENT PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide fast incident evidence collection for access operations
- show latest artifact locations
- produce a portable incident bundle for handoff or review

delivered_commands:
- access_latest_artifacts.sh
- access_collect_incident_bundle.sh

policy:
- additive only
- no schema drop
- helper commands only
