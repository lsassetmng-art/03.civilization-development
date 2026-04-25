# ============================================================
# ACCESS TRACE BUNDLE PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- export portable trace bundles for one request_code or one logical_view_name
- support investigation, handoff, and incident evidence packaging

delivered_commands:
- access_make_request_trace_bundle.sh
- access_make_logical_view_trace_bundle.sh

policy:
- additive only
- no schema drop
- helper commands only
