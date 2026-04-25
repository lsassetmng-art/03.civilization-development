# ============================================================
# AI OPERATION DESK RUNTIME ENV EXACT
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define runtime environment variables and their meaning for the current hardening phase.

required_in_db_mode:
- PERSONA_DATABASE_URL

required_in_all_modes:
- AIOD_PORT
- AIOD_WEB_PORT
- AIOD_DATA_MODE
- AIOD_AUTH_MODE
- AIOD_PERMISSION_MODE
- AIOD_LINE_PROVIDER_MODE

future_provider_candidates:
- AIOD_LINE_CHANNEL_SECRET
- AIOD_LINE_CHANNEL_ACCESS_TOKEN
- AIOD_NOTIFICATION_SIGNING_KEY

mode_values:
- AIOD_DATA_MODE:
  - mock
  - db_psql
- AIOD_AUTH_MODE:
  - stub
  - header_trusted
  - future_session
- AIOD_PERMISSION_MODE:
  - stub
  - policy_check
  - future_role_scope
- AIOD_LINE_PROVIDER_MODE:
  - stub
  - line_http
  - future_worker_bridge

rules:
- env values control runtime mode only
- canonical business rules still come from design and DB state
- privileged provider secrets must not be hardcoded into source files
