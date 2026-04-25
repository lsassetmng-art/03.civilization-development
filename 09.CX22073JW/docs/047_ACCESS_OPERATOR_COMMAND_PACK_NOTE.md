# ============================================================
# ACCESS OPERATOR COMMAND PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide daily operator commands for the access_* operating surface
- centralize latest status checks, manual confirmation, confirmed-only reverify,
  and current-state bundle export

delivered_commands:
- access_status.sh
- access_show_latest_batch.sh
- access_confirm_request.sh
- access_reverify_confirmed.sh
- access_export_current_bundle.sh

policy:
- additive only
- no schema drop
- helper commands only
