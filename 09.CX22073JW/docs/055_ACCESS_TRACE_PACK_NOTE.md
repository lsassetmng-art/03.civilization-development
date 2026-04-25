# ============================================================
# ACCESS TRACE PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- trace one request_code end-to-end across receipt / confirmation / reverify
- trace one logical_view_name across latest receipt / reverify / blockers
- support operator investigation and handoff

delivered_commands:
- access_trace_request.sh
- access_trace_logical_view.sh

policy:
- additive only
- no schema drop
- helper commands only
