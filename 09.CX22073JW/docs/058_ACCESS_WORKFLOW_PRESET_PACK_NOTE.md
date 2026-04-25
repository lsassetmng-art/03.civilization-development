# ============================================================
# ACCESS WORKFLOW PRESET PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide preset operator workflows for the growing access command surface
- reduce manual command selection for common scenarios

delivered_commands:
- access_run_review_flow.sh
- access_run_request_investigation_flow.sh
- access_run_handoff_flow.sh

policy:
- additive only
- no schema drop
- helper commands only
