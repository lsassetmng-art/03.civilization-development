# ============================================================
# ACCESS STORAGE CLEANUP PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide safe storage / cleanup support for the growing access workspace
- measure workspace size and artifact counts
- generate storage reports
- preview cleanup candidates before any deletion
- remove empty directories only

delivered_commands:
- access_workspace_stats.sh
- access_make_storage_report.sh
- access_cleanup_preview.sh
- access_cleanup_empty_dirs.sh

policy:
- additive only
- no schema drop
- helper commands only
- cleanup preview is non-destructive
- cleanup apply removes empty directories only
