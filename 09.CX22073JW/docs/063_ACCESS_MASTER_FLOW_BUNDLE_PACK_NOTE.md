# ============================================================
# ACCESS MASTER FLOW BUNDLE PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide a higher-level master flow for routine access operations
- provide a master bundle that collects major artifacts and summaries

delivered_commands:
- access_run_master_flow.sh
- access_make_master_bundle.sh

policy:
- additive only
- no schema drop
- helper commands only
