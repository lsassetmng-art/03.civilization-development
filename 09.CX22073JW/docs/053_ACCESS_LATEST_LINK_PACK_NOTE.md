# ============================================================
# ACCESS LATEST LINK PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide fast access to the latest artifacts and reports
- maintain a latest/ shortcut area under the access workspace

delivered_commands:
- access_refresh_latest_links.sh
- access_show_latest_links.sh

policy:
- additive only
- no schema drop
- helper commands only
- symbolic links only
